const fs = require("fs");
const path = require("path");

// Load food data from JSON file
const foodDataPath = path.join(__dirname, "../data.json");
let foods = JSON.parse(fs.readFileSync(foodDataPath, "utf8"));

// Function to search food based on query
exports.searchFoods = (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json([]); // Return empty if no search query
  }

  const lowerQuery = query.toLowerCase();

  // Filter foods that start with the search query
  let filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().startsWith(lowerQuery)
  );

  // Sort results by popularity (searchCount)
  filteredFoods.sort((a, b) => b.searchCount - a.searchCount);

  res.json(filteredFoods);
};

// Function to increase search count (for popular search feature)
exports.incrementSearchCount = (foodName) => {
  let foodIndex = foods.findIndex((food) => food.name === foodName);
  if (foodIndex !== -1) {
    foods[foodIndex].searchCount += 1; // Increase count
  }

  // Save updated search counts to data.json
  fs.writeFileSync(foodDataPath, JSON.stringify(foods, null, 2));
};
