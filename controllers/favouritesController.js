const User = require("../models/account/User");
const Retail = require("../models/item/Retail");
const Produce = require("../models/item/Produce");

exports.toggleFavourite = async (req, res) => {
  try {
    const { userId, itemId, kind } = req.params;

    if (!["Retail", "Produce"].includes(kind)) {
      return res.status(400).json({ error: "Invalid kind." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const index = user.favourites.findIndex(
      (fav) => fav.itemId.toString() === itemId && fav.kind === kind
    );

    if (index > -1) {
      user.favourites.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: "Favourite removed." });
    } else {
      const ItemModel = kind === "Retail" ? Retail : Produce;
      const item = await ItemModel.findById(itemId);
      if (!item) return res.status(404).json({ error: "Item not found." });

      user.favourites.push({ itemId, kind });
      await user.save();
      return res.status(200).json({ message: "Favourite added." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get all favourite items
exports.getFavourites = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found." });

    const favourites = await Promise.all(
      user.favourites.map(async (fav) => {
        const Model = fav.kind === "Retail" ? Retail : Produce;
        const item = await Model.findById(fav.itemId).lean();
        return item ? { ...item, kind: fav.kind } : null;
      })
    );

    res.status(200).json({ favourites: favourites.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get favourite items filtered by uniId
exports.getFavouritesByUni = async (req, res) => {
  try {
    const { userId, uniId } = req.params;

    if (!uniId) {
      return res.status(400).json({ error: "Missing 'uniId' in path." });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found." });

    const filteredFavourites = await Promise.all(
      user.favourites.map(async (fav) => {
        const Model = fav.kind === "Retail" ? Retail : Produce;
        const item = await Model.findOne({ _id: fav.itemId, uniId }).lean();
        return item ? { ...item, kind: fav.kind } : null;
      })
    );

    res.status(200).json({
      favourites: filteredFavourites.filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
