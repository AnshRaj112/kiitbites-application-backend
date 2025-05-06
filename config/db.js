const mongoose = require('mongoose');
require('dotenv').config(); // Load .env

const Cluster_User = mongoose.createConnection(process.env.MONGO_URI_USER, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cluster_Order = mongoose.createConnection(process.env.MONGO_URI_ORDER, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cluster_Item = mongoose.createConnection(process.env.MONGO_URI_ITEM, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cluster_Inventory = mongoose.createConnection(process.env.MONGO_URI_INVENTORY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cluster_FoodCourt = mongoose.createConnection(process.env.MONGO_URI_FOODCOURT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Cluster_Cache_Analytics = mongoose.createConnection(process.env.MONGO_URI_CACHE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  Cluster_User,
  Cluster_Order,
  Cluster_Item,
  Cluster_Inventory,
  Cluster_FoodCourt,
  Cluster_Cache_Analytics,
};
