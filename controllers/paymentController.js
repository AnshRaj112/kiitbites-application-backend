const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/order/Payment"); // adjust path as needed
const Account = require("../models/account/Account");
const Item = require("../models/item/Item");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Utility: Check if cart has any produce item
async function hasProduceItems(cart) {
  const itemIds = cart.map((c) => c.itemId);
  const items = await Item.find({ _id: { $in: itemIds } });
  return items.some((item) => item.type === "produce");
}

exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await Account.findById(userId).populate("cart.itemId");
    if (!user) return res.status(404).json({ error: "User not found" });

    const produceExists = await hasProduceItems(user.cart);

    const cartTotal = user.cart.reduce((acc, curr) => {
      const price = curr.itemId?.price || 0;
      return acc + price * curr.quantity;
    }, 0);

    const amountInPaise = cartTotal * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      payMode: produceExists ? "pay_now" : "pay_on_dine_in",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment creation failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const payment = new Payment({
      orderId: null, // attach actual order ID if applicable
      userId,
      amount: req.body.amount / 100,
      status: "paid",
      paymentMethod: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await payment.save();

    // Optionally update user's cart/orders
    await Account.findByIdAndUpdate(userId, {
      $push: { pastOrders: payment._id },
      $set: { cart: [] },
    });

    res
      .status(200)
      .json({
        message: "Payment verified successfully",
        paymentId: payment._id,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};
