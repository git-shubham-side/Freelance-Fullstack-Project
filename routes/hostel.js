const express = require("express");

const { optionalAuth, requireAuth } = require("../middleware/auth");
const {
  renderHostelPage,
  createReview,
} = require("../controllers/hostelController");

const router = express.Router();

router.get("/b2", optionalAuth, renderHostelPage);
router.post("/b2/reviews", requireAuth, createReview);

module.exports = router;
