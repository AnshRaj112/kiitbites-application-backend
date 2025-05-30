const express = require("express");
const router = express.Router();
const {
  getFavourites,
  getFavouritesByUni,
  toggleFavourite,
} = require("../controllers/favouritesController");

router.get("/:userId", getFavourites);
router.get("/:userId/:uniId", getFavouritesByUni);
router.patch("/:userId/:itemId/:kind", toggleFavourite);

module.exports = router;
