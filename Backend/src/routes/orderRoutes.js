const express = require("express");
const router = express.Router();

const { createOrder,getMyOrders,getOrderById ,  updateOrderStatus,  cancelOrder,  getAllOrders,} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")
router.post("/", authMiddleware, createOrder);
router.get('/myorders',authMiddleware,getMyOrders)
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);
router.put(
  "/:id/cancel",
  authMiddleware,
  cancelOrder
);
router.get('/:id',authMiddleware,getOrderById)
module.exports = router;
