const User = require("../models/user.model");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

const { calculateDeliveryDate } = require("../utils/delivery");

const allowedSizes = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const coupons = {
  SAVE10: 10,
  SAVE20: 20,
  SAVE30: 30,
};

const restoreStock = async (
  productId,
  quantity,
  size = "",
) => {
  const update = {
    $inc: {},
  };

  if (size) {
    update.$inc[`sizes.${size}`] = quantity;
  } else {
    update.$inc.quantity = quantity;
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    update,
    { new: true },
  );

  if (!product) {
    return;
  }

  const stock = size
    ? Number(product.sizes?.[size] || 0)
    : Number(product.quantity || 0);

  product.status =
    stock <= 0 ? "Out of Stock" : "In Stock";

  await product.save();
};

const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      payment = {},
    } = req.body;

    const user = await User.findById(req.user.id).select(
      "name phone address addresses",
    );

    if (!user) {
      return errorResponse(
        res,
        404,
        "user not found",
      );
    }

    const defaultAddress =
      user.addresses?.find(
        (item) => item.isDefault,
      ) || user.addresses?.[0];

    const address =
      typeof shippingAddress === "string"
        ? { address: shippingAddress }
        : shippingAddress || defaultAddress;

    const shipping = {
      name: address?.name || user.name || "",
      phone: address?.phone || user.phone || "",
      address:
        address?.address ||
        user.address ||
        "",
      city: address?.city || "",
      pincode: address?.pincode || "",
      locality: address?.locality || "",
      state: address?.state || "",
      landmark: address?.landmark || "",
      alternatePhone:
        address?.alternatePhone || "",
      type:
        address?.type === "Work"
          ? "Work"
          : "Home",
      country: address?.country || "India",
    };

    const paymentMethod =
      payment.method || "cod";
    const allowedPaymentMethods = ["cod","card","upi",];

    if (
      !allowedPaymentMethods.includes(
        paymentMethod,
      )
    ) {
      return errorResponse(
        res,
        400,
        "invalid payment method",
      );
    }
    const requiredFields = [
      "name",
      "phone",
      "address",
      "city",
      "pincode",
    ];
    const missingField = requiredFields.find(
      (field) =>
        !String(shipping[field] || "").trim(),
    );
    if (missingField) {
      return errorResponse(
        res,
        400,
        `${missingField} is required`,
      );
    }
    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(
        res,
        400,
        "cart is empty",
      );
    }

    const coupon = String(
      cart.coupon || "",
    )
      .trim()
      .toUpperCase();

    if (coupon && !coupons[coupon]) {
      return errorResponse(
        res,
        400,
        "invalid coupon",
      );
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product =
        await Product.findById(
          item.product,
        );

      if (!product) {
        return errorResponse(
          res,
          404,
          "product not found",
        );
      }
      if (
        item.size &&
        !allowedSizes.includes(item.size)
      ) {
        return errorResponse(
          res,
          400,
          `invalid size for ${product.name}`,
        );
      }

      const stock = item.size
        ? Number(
            product.sizes?.[item.size] || 0,
          )
        : Number(product.quantity || 0);

      if (stock < item.quantity) {
        return errorResponse(
          res,
          400,
          `not enough stock for ${product.name}`,
        );
      }

      const itemTotal =
        product.price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image:
          item.selectedImage ||
          product.images?.[0] ||
          "",
        selectedImage:
          item.selectedImage || product.images?.[0] || "",quantity: item.quantity,price: product.price,size: item.size || ""});
    }

    let discount = 0;

    if (coupon) {
      discount =
        subtotal *
        (coupons[coupon] / 100);
    }

    const deliveryFee =
      subtotal > 0 ? 15 : 0;

    const total =
      subtotal -
      discount +
      deliveryFee;

    const updatedProducts = [];

    for (const item of cart.items) {
      const query = {
        _id: item.product,
      };

      const update = {
        $inc: {},
      };

      if (item.size) {
        query[`sizes.${item.size}`] = {
          $gte: item.quantity,
        };

        update.$inc[
          `sizes.${item.size}`
        ] = -item.quantity;
      } else {
        query.quantity = {
          $gte: item.quantity,
        };

        update.$inc.quantity =
          -item.quantity;
      }

      const product =
        await Product.findOneAndUpdate(
          query,
          update,
          { new: true },
        );

      if (!product) {
        for (const item of updatedProducts) {
          await restoreStock(
            item.id,
            item.quantity,
            item.size,
          );
        }

        return errorResponse(
          res,
          400,
          "not enough stock",
        );
      }

      const stock = item.size
        ? Number(
            product.sizes?.[item.size] || 0,
          )
        : Number(product.quantity || 0);

      product.status =
        stock <= 0
          ? "Out of Stock"
          : "In Stock";

      await product.save();

      updatedProducts.push({
        id: item.product,
        quantity: item.quantity,
        size: item.size || "",
      });
    }

    const estimatedDelivery =
      calculateDeliveryDate(
        shipping.pincode,
      );

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      coupon,
      discount,
      deliveryFee,
      total,
      estimatedDelivery,
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      shippingAddress: shipping,
    });

    try {
      await order.save();
    } catch (error) {
      for (const item of updatedProducts) {
        await restoreStock(
          item.id,
          item.quantity,
          item.size,
        );
      }

      throw error;
    }

    cart.items = [];
    cart.coupon = "";
    cart.discountPercent = 0;

    await cart.save();

    return successResponse(
      res,
      201,
      "order created successfully",
      {
        order,
      },
    );
  } catch (error) {
    console.log(
      "CREATE ORDER ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to create order",
    );
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate(
        "items.product",
        "name price images",
      )
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      200,
      "orders fetched successfully",
      { orders },
    );
  } catch (error) {
    console.log(
      "GET MY ORDERS ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to get orders",
    );
  }
};

const getOrderById = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const order =
      await Order.findOne({
        _id: id,
        user: req.user.id,
      }).populate(
        "items.product",
        "name price images",
      );

    if (!order) {
      return errorResponse(
        res,
        404,
        "order not found",
      );
    }

    return successResponse(
      res,
      200,
      "order fetched successfully",
      { order },
    );
  } catch (error) {
    console.log(
      "GET ORDER ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to get order",
    );
  }
};

const updateOrderStatus = async (
  req,
  res,
) => {
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
      return errorResponse(
        res,
        400,
        "invalid order status",
      );
    }

    const order =
      await Order.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!order) {
      return errorResponse(
        res,
        404,
        "order not found",
      );
    }

    return successResponse(
      res,
      200,
      "order status updated successfully",
      { order },
    );
  } catch (error) {
    console.log(
      "UPDATE ORDER STATUS ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to update order status",
    );
  }
};

const cancelOrder = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const order =
      await Order.findById(id);

    if (!order) {
      return errorResponse(
        res,
        404,
        "order not found",
      );
    }

    if (
      order.user.toString() !==
      req.user.id
    ) {
      return errorResponse(
        res,
        403,
        "you can cancel only your own order",
      );
    }

    if (order.status !== "pending") {
      return errorResponse(
        res,
        400,
        "only pending order can be cancelled",
      );
    }

    for (const item of order.items) {
      await restoreStock(
        item.product,
        item.quantity,
        item.size || "",
      );
    }

    order.status = "cancelled";

    await order.save();

    return successResponse(
      res,
      200,
      "order cancelled successfully",
      { order },
    );
  } catch (error) {
    console.log(
      "CANCEL ORDER ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to cancel order",
    );
  }
};

const getAllOrders = async (
  req,
  res,
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email",
        )
        .populate(
          "items.product",
          "name price images",
        )
        .sort({ createdAt: -1 });

    return successResponse(
      res,
      200,
      "all orders fetched successfully",
      { orders },
    );
  } catch (error) {
    console.log(
      "GET ALL ORDERS ERROR:",
      error,
    );

    return errorResponse(
      res,
      500,
      "failed to get all orders",
    );
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
