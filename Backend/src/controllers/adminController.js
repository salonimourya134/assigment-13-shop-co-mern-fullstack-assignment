const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const User = require("../models/user.model");
const Order = require("../models/Order.model");
const { successResponse, errorResponse } = require("../utils/response");

const getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const outOfStock = await Product.countDocuments({ quantity: 0 });
    const lowStock = await Product.countDocuments({
      quantity: { $gt: 0, $lte: 5 },
    });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const lowStockProducts = await Product.find({
      quantity: { $gt: 0, $lte: 5 },
    })
      .populate("category", "name")
      .sort({ quantity: 1 })
      .limit(5)
      .select("name images price quantity category");

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    return successResponse(res, 200, "dashboard data fetched successfully", {
      totalProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      totalRevenue,
      outOfStock,
      lowStock,
      lowStockProducts,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get dashboard data");
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "orders fetched successfully", {
      orders,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get orders");
  }
};
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name price images");
    if (!order) {
      return errorResponse(res, 404, "order not found");
    }
    return successResponse(res, 200, "order fetched successfully", {
      order,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get order");
  }
}
;const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return successResponse(res, 200, "users fetched successfully", { users });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get users");
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, role, status } = req.body;
    const user = await User.findById(id);
    if (!user) return errorResponse(res, 404, "user not found");
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (role !== undefined) {
      if (!["customer", "admin"].includes(role)) return errorResponse(res, 400, "invalid role");
      user.role = role;
    }
    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) return errorResponse(res, 400, "invalid status");
      user.status = status;
    }
    await user.save();
    const safeUser = await User.findById(id).select("-password");
    return successResponse(res, 200, "user updated successfully", { user: safeUser });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 400, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return errorResponse(res, 400, "you cannot delete your own account");
    const user = await User.findByIdAndDelete(id);
    if (!user) return errorResponse(res, 404, "user not found");
    return successResponse(res, 200, "user deleted successfully");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to delete user");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatus.includes(status)) {
      return errorResponse(res, 400, "invalid order status");
    }
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!order) {
      return errorResponse(res, 404, "order not found");
    }
    return successResponse(res, 200, "order status updated successfully", {
      order,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to update order status");
  }
};
module.exports = {
  getDashboard,
  getAllOrders,
  getOrderById,
  getAllUsers,
  updateUser,
  deleteUser,
  updateOrderStatus,
};
