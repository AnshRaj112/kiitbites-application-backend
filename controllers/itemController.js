const Item = require("../models/item/Item");

// Create new item
exports.createItem = async (req, res) => {
  try {
    // Destructure the fields including the image
    const { name, type, unit, price, image } = req.body;

    // Create a new Item object
    const newItem = new Item({
      name,
      type,
      unit,
      price,
      image, // Add image field to the item
    });

    // Save the new item to the database
    await newItem.save();

    // Respond with the created item
    res.status(201).json(newItem);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating item", error: err.message });
  }
};

// Get all items
exports.getItems = async (req, res) => {
  try {
    // Fetch all items from the database
    const items = await Item.find();

    // Respond with the list of items
    res.status(200).json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching items", error: err.message });
  }
};
