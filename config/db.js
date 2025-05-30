const mongoose = require("mongoose");
require("dotenv").config(); // Load .env

const Cluster_User = mongoose.createConnection(process.env.MONGO_URI_USER);
const Cluster_Order = mongoose.createConnection(process.env.MONGO_URI_ORDER);
const Cluster_Item = mongoose.createConnection(process.env.MONGO_URI_ITEM);
const Cluster_Inventory = mongoose.createConnection(process.env.MONGO_URI_INVENTORY);
const Cluster_Accounts = mongoose.createConnection(process.env.MONGO_URI_ACCOUNT);
const Cluster_Cache_Analytics = mongoose.createConnection(process.env.MONGO_URI_CACHE);

module.exports = {
  Cluster_User,
  Cluster_Order,
  Cluster_Item,
  Cluster_Inventory,
  Cluster_Accounts,
  Cluster_Cache_Analytics,
};
