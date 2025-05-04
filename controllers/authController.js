const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../utils/logger");
const sendOtpQueue = require("../queues/sendOtpQueue.js"); // NEW: BullMQ Queue

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const calculateDelay = (attempts) => {
  const base = 30; // seconds
  return Math.pow(2, attempts - 1) * base * 1000;
};

// === 1. Signup ===
exports.signup = async (req, res) => {
  try {
    logger.info("Signup Request Received", req.body);
    const { fullName, email, phone, password, gender } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      logger.info("User already exists", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ fullName, email, phone, password: hashedPassword, gender });
    await newUser.save();
    logger.info("User saved to DB", email);

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setTokenCookie(res, token);

    const otp = generateOtp();
    await new Otp({ email, otp }).save();

    await sendOtpQueue.add("sendOtp", { email, otp }); // Queued
    logger.info("OTP queued for sending", email);

    res.status(201).json({ message: "User registered, OTP sent" });
  } catch (error) {
    logger.error("Signup Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 2. Verify OTP ===
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await Otp.deleteOne({ email });

    logger.info("OTP verified", email);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    logger.error("OTP Verification Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 3. Login ===
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) return res.status(400).json({ message: "User not found" });

    // Throttle failed login attempts
    const now = Date.now();
    const last = user.lastLoginAttempt ? new Date(user.lastLoginAttempt).getTime() : 0;
    const delay = calculateDelay(user.loginAttempts || 0);

    if (now - last < delay) {
      const waitTime = Math.ceil((delay - (now - last)) / 1000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${waitTime}s.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      user.lastLoginAttempt = new Date();
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      await new Otp({ email: user.email, otp }).save();
      await sendOtpQueue.add("sendOtp", { email: user.email, otp });

      return res.status(400).json({
        message: "User not verified. OTP sent.",
        redirectTo: `/otpverification?email=${user.email}&from=login`,
      });
    }

    user.loginAttempts = 0;
    user.lastLoginAttempt = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setTokenCookie(res, token);
    res.json({ message: "Login successful", token });
  } catch (error) {
    logger.error("Login Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 4. Forgot Password ===
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOtp();
    await new Otp({ email: user.email, otp }).save();
    await sendOtpQueue.add("sendOtp", { email: user.email, otp });

    logger.info("OTP queued for password reset", user.email);
    res.json({ message: "OTP sent for password reset", email: user.email });
  } catch (error) {
    logger.error("Forgot Password Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 5. Reset Password ===
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    logger.info("Password reset", email);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Reset Password Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 6. Google Login / Signup / Logout ===
exports.googleAuth = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User does not exist, sign up first" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Google login successful", token });
  } catch (error) {
    logger.error("Google Login Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.googleSignup = async (req, res) => {
  try {
    const { email, googleId, fullName } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ fullName, email, phone: "", password: "", gender: "", googleId, isVerified: true });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Google signup successful", token });
  } catch (error) {
    logger.error("Google Signup Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 7. Logout ===
exports.logout = (req, res) => {
  logger.info("User Logged Out", req.user?.userId || "Unknown");
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// === 8. JWT Token Verification ===
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// === 9. Refresh Token ===
exports.refreshToken = (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed", token: newToken });
  } catch {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// === 10. Session Check ===
exports.checkSession = (req, res) => {
  if (req.user) return res.json({ message: "Session active", user: req.user });
  res.status(401).json({ message: "Session expired" });
};

// === 11. Get User Profile ===
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("fullName email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    logger.error("Get User Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
