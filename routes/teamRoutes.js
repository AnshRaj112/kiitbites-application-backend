const express = require("express");
const { getTeamMembers, addTeamMember } = require("../controllers/teamController");

const router = express.Router();

router.get("/", getTeamMembers);  // GET /team
router.post("/", addTeamMember);  // POST /team

module.exports = router; 
