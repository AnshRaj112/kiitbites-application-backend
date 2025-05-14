require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const contactRoute = require("./routes/contactRoute");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

app.use(express.json());  // ✅ Parses incoming JSON data
app.use(express.urlencoded({ extended: true }));  // ✅ Parses form data

// ✅ Load environment variables
const EXPOWEB_URL = process.env.EXPO_PUBLIC_BACKEND_URL_WEB || "http://localhost:8081";
const EXPOAPP_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "exp://10.5.6.113:8081";
const PORT = process.env.PORT || 5002;

// ✅ Fix CORS issues: Use a single instance with more flexible origin handling
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        EXPOWEB_URL,
        EXPOAPP_URL,
        'http://localhost:8081',
        'http://192.168.1.5:8081',
        'exp://192.168.1.5:8081',
        'exp://localhost:8081'
      ];
      
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// ✅ Ensure MONGO_URL exists

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api", foodRoutes);
app.use("/contact", contactRoute);
app.use("/team", teamRoutes);

// ✅ Global error handling
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Redirect HTTP to HTTPS in Production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}, allowing frontend of web application from ${EXPOWEB_URL}, allowing frontend of application from ${EXPOAPP_URL}`)
);