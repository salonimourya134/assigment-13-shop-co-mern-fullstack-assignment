const express = require("express");
const {
  addReview,
  getProductReviews,
  getTestimonials,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/testimonials", getTestimonials);

router.post("/:productId", authMiddleware, addReview);
router.get("/:productId", getProductReviews);

module.exports = router;
