const express = require("express");

const { addToCart, getCart ,updateCart,removeFromCart,clearCart,applyCoupon,removeCoupon,} = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.post("/coupon", authMiddleware, applyCoupon);

router.delete("/coupon", authMiddleware, removeCoupon);
router.put("/:cartItemId", authMiddleware, updateCart);
router.delete("/:cartItemId", authMiddleware, removeFromCart);
router.delete("/", authMiddleware, clearCart);
module.exports = router;
