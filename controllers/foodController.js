// // const Item = require("../models/item/Item");


// // Function to search food based on query
// exports.searchFoods = async (req, res) => {
//   const { query } = req.query;
//   if (!query) {
//     return res.json([]);
//   }

//   try {
//     const lowerQuery = query.toLowerCase();

//     const items = await Item.find({
//       name: { $regex: lowerQuery, $options: "i" }, // case-insensitive search
//     }).sort({ searchCount: -1 });

//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: "Error searching foods", error: err.message });
//   }
// };


// exports.getPopularFoods = async (req, res) => {
//   try {
//     const popularItems = await Item.find({}, "name price image searchCount")
//       .sort({ searchCount: -1 })
//       .limit(12);

//     res.status(200).json(popularItems);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching popular foods", error: err.message });
//   }
// };




// // Function to increase search count (for popular search feature)
// exports.incrementSearchCount = async (foodName) => {
//   try {
//     const item = await Item.findOne({ name: foodName });
//     if (item) {
//       item.searchCount = (item.searchCount || 0) + 1;
//       await item.save();
//     }
//   } catch (err) {
//     console.error("Error incrementing search count:", err);
//   }
// };
