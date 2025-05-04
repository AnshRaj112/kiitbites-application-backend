const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  github: { type: String, required: true },
  linkedin: { type: String, required: true },
});

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
