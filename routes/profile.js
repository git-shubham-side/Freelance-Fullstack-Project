const express = require("express");

const { requireAuth } = require("../middleware/auth");
const {
  renderProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/profile", requireAuth, renderProfile);
router.post("/profile", requireAuth, updateProfile);

module.exports = router;
