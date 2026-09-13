const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const { successResponse, errorResponse } = require("../utils/response");

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
const getCartForUser = (userId) =>
  Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price images quantity sizes status",
  );

const addToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      color = "",
      size = "",
      selectedImage = "",
    } = req.body;

    const qty = Number(quantity);
    if (!productId) {
      return errorResponse(res, 400, "productId is required");
    }

    if (!Number.isInteger(qty) || qty < 1) {
      return errorResponse(res, 400, "quantity must be at least 1");
    }

   if (!size) {
  return errorResponse(res, 400, "size is required");
}

if (!allowedSizes.includes(size)) {
  return errorResponse(res, 400, "invalid size");
}
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, "product not found");
    }
 const availableStock = Number(product.sizes?.[size] || 0);
    if (availableStock < qty) {
      return errorResponse(res, 400, "not enough stock");
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const item = cart.items.find(
      (cartItem) =>
        cartItem.product.toString() === productId &&
        cartItem.color === color &&
        cartItem.size === size &&
        (cartItem.selectedImage || product.images?.[0] || "") ===
          (selectedImage || product.images?.[0] || ""),
    );

    if (item) {
      const newQuantity = item.quantity + qty;

      if (newQuantity > availableStock) {
        return errorResponse(res, 400, "not enough stock");
      }

      item.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        images: product.images,
        selectedImage: selectedImage || product.images?.[0] || "",
        price: product.price,
        quantity: qty,
        color,
        size,
      });
    }

    await cart.save();

    const updatedCart = await getCartForUser(req.user.id);
    return successResponse(res, 200, "product added to cart", {
      cart: updatedCart,
    });
  } catch (error) {
    console.log("ADD CART ERROR:", error);
    return errorResponse(res, 500, "failed to add product to cart");
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await getCartForUser(req.user.id);
    if (!cart) {
      return successResponse(res, 200, "cart fetched successfully", {
        cart: {
          user: req.user.id,
          items: [],
          coupon: "",
          discountPercent: 0,
        },
      });
    }

    return successResponse(res, 200, "cart fetched successfully", {
      cart,
    });
  } catch (error) {
    console.log("cart error:", error);
    return errorResponse(res, 500, "failed to get cart");
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const qty = Number(req.body.quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return errorResponse(res, 400, "quantity must be at least 1");
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "cart not found");
    }
    let item = cart.items.id(cartItemId);
    if (!item) {
      return errorResponse(res, 404, "product not found in cart");
    }
    const product = await Product.findById(item.product);
    if (!product) {
      return errorResponse(res, 404, "product not found");
    }
if (!item.size) {
  return errorResponse(res, 400, "size is required");
}
 const availableStock = Number(product.sizes?.[item.size] || 0);
    if (qty > availableStock) {
      return errorResponse(res, 400, "not enough stock");
    }

    item.quantity = qty;
    await cart.save();
    const updatedCart = await getCartForUser(req.user.id);
    return successResponse(res, 200, "cart updated successfully", {
      cart: updatedCart,
    });
  } catch (error) {
    console.log("UPDATE CART ERROR:", error);
    return errorResponse(res, 500, "failed to update cart");
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "cart not found");
    }
const itemById = cart.items.id(cartItemId);
   if (!itemById) {
  return errorResponse(res, 404, "cart item not found");
}

itemById.deleteOne();

    await cart.save();
    const updatedCart = await getCartForUser(req.user.id);

    return successResponse(res, 200, "product removed from cart", {
      cart: updatedCart,
    });
  } catch (error) {
    console.log("REMOVE CART ERROR:", error);
    return errorResponse(res, 500, "failed to remove product from cart");
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return successResponse(res, 200, "cart cleared successfully", {
        cart: {
          user: req.user.id,
          items: [],
          coupon: "",
          discountPercent: 0,
        },
      });
    }

    cart.items = [];
    cart.coupon = "";
    cart.discountPercent = 0;
    await cart.save();
    return successResponse(res, 200, "cart cleared successfully", {
      cart,
    });
  } catch (error) {
    console.log("CLEAR CART ERROR:", error);
    return errorResponse(res, 500, "failed to clear cart");
  }
};

const applyCoupon = async (req, res) => {
  try {
    const couponCode = String(req.body.coupon || "")
      .trim()
      .toUpperCase();

    if (!couponCode) {
      return errorResponse(res, 400, "coupon is required");
    }

    const discount = coupons[couponCode];
    if (!discount) {
      return errorResponse(res, 400, "invalid coupon");
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "cart not found");
    }

    if (cart.items.length === 0) {
      return errorResponse(res, 400, "cart is empty");
    }

    cart.coupon = couponCode;
    cart.discountPercent = discount;
    await cart.save();
    const updatedCart = await getCartForUser(req.user.id);

    return successResponse(res, 200, "coupon applied successfully", {
      cart: updatedCart,
    });
  } catch (error) {
    console.log("APPLY COUPON ERROR:", error);
    return errorResponse(res, 500, "failed to apply coupon");
  }
};

const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "cart not found");
    }

    cart.coupon = "";
    cart.discountPercent = 0;
    await cart.save();
    const updatedCart = await getCartForUser(req.user.id);
    return successResponse(res, 200, "coupon removed successfully", {
      cart: updatedCart,
    });
  } catch (error) {
    console.log("REMOVE COUPON ERROR:", error);
    return errorResponse(res, 500, "failed to remove coupon");
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
};
