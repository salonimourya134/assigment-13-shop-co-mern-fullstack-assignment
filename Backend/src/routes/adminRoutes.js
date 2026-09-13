const express = require("express");
const router = express.Router();
const { getDashboard, getAllOrders, getOrderById, getAllUsers, updateUser, deleteUser, updateOrderStatus} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
router.get(
  "/dashboard",authMiddleware,adminMiddleware,getDashboard);
router.get("/orders",authMiddleware, adminMiddleware,getAllOrders)
router.get("/users",authMiddleware, adminMiddleware,getAllUsers)
router.put("/users/:id",authMiddleware, adminMiddleware,updateUser)
router.delete("/users/:id",authMiddleware, adminMiddleware,deleteUser)
router.get("/orders/:id",authMiddleware,adminMiddleware,getOrderById);
router.put("/orders/:id/status",authMiddleware,adminMiddleware,updateOrderStatus)
module.exports = router;
