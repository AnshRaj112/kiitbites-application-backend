const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Cluster_Accounts } = require("../config/db");
//const { Cluster_Item } = require("../config/db");
const Account = Cluster_Accounts.model("User");
//const Item = Cluster_Item.model("Item");

// Create a food provider account (foodcourt, cafe, canteen, guesthouse)
exports.createFoodcourt = async (req, res) => {
  try {
    const { email, phone, password, location, type } = req.body;

    // Validate type
    const allowedTypes = ["foodcourt", "cafe", "canteen", "guesthouse"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Must be one of: ${allowedTypes.join(", ")}`,
      });
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Account with this email or phone already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create food provider account
    const foodProvider = new Account({
      type, // foodcourt | cafe | canteen | guesthouse
      email,
      phone,
      password: hashedPassword,
      isVerified: true,
      location,
      inventory: [],
    });

    await foodProvider.save();

    res.status(201).json({
      message: `${type} account created successfully`,
      account: {
        id: foodProvider._id,
        email: foodProvider.email,
        type: foodProvider.type,
        location: foodProvider.location,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating food provider account",
      error: err.message,
    });
  }
};
