const mongoose = require("mongoose");
const { Cluster_User } = require("../../config/db");

const CollegeSchema = new mongoose.Schema({
  image: { type: String, required: true },
  uniID: { type: mongoose.Schema.Types.ObjectId, ref: "Uni" },
});

module.exports = Cluster_User.model("College", CollegeSchema);
