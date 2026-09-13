const User = require("../models/user.model");
const Product = require("../models/Product.model");
const { successResponse, errorResponse } = require("../utils/response");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("wishlist", "name price images rating oldPrice");
    if (!user) return errorResponse(res, 404, "user not found");

    return successResponse(res, 200, "profile fetched successfully", { user });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to get profile");
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "user not found");

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();

    const defaultAddress = user.addresses.find((item) => item.isDefault) || user.addresses[0];
    if (defaultAddress) {
      if (name !== undefined) defaultAddress.name = user.name;
      if (phone !== undefined) defaultAddress.phone = user.phone;
      if (address !== undefined && String(address).trim()) defaultAddress.address = user.address;
    }

    await user.save();
    const safeUser = await User.findById(user._id).select("-password").populate("wishlist", "name price images rating oldPrice");
    return successResponse(res, 200, "profile updated successfully", { user: safeUser });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses name phone address");
    if (!user) return errorResponse(res, 404, "user not found");

    return successResponse(res, 200, "addresses fetched successfully", { addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to get addresses");
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "user not found");

    const data = { ...req.body };
    const required = ["name", "phone", "address", "city", "state", "pincode"];
    const missing = required.find((key) => !String(data[key] || "").trim());
    if (missing) return errorResponse(res, 400, `${missing} is required`);

    data.name = String(data.name).trim();
    data.phone = String(data.phone).trim();
    data.address = String(data.address).trim();
    data.city = String(data.city).trim();
    data.state = String(data.state).trim();
    data.pincode = String(data.pincode).trim();
    data.locality = String(data.locality || "").trim();
    data.landmark = String(data.landmark || "").trim();
    data.alternatePhone = String(data.alternatePhone || "").trim();
    data.type = data.type === "Work" ? "Work" : "Home";

    if (user.addresses.length === 0) data.isDefault = true;
    if (data.isDefault) user.addresses.forEach((item) => { item.isDefault = false; });

    user.addresses.push(data);
    await user.save();
    const address = user.addresses[user.addresses.length - 1];
    if (address.isDefault) user.address = address.address;

    await user.save();
    return successResponse(res, 201, "address saved successfully", { address });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "user not found");
    const address = user.addresses.id(req.params.id);
    if (!address) return errorResponse(res, 404, "address not found");

    Object.keys(req.body).forEach((key) => {
      if (key !== "_id" && key !== "isDefault") address[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    });

    if (req.body.isDefault === true) {
      user.addresses.forEach((item) => { item.isDefault = item._id.toString() === address._id.toString(); });
    }

    await user.save();
    if (address.isDefault) user.address = address.address;
    await user.save();
    return successResponse(res, 200, "address updated successfully", { address });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "user not found");
    const address = user.addresses.id(req.params.id);
    if (!address) return errorResponse(res, 404, "address not found");
    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    const nextDefault = user.addresses.find((item) => item.isDefault);
    user.address = nextDefault?.address || "";
    await user.save();

    return successResponse(res, 200, "address removed successfully", { addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to remove address");
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 404, "user not found");
    const address = user.addresses.id(req.params.id);
    if (!address) return errorResponse(res, 404, "address not found");

    user.addresses.forEach((item) => { item.isDefault = item._id.toString() === address._id.toString(); });
    user.address = address.address;
    await user.save();

    return successResponse(res, 200, "default address updated successfully", { address });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to set default address");
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist", "name price images rating oldPrice");
    if (!user) return errorResponse(res, 404, "user not found");
    return successResponse(res, 200, "wishlist fetched successfully", { wishlist: user.wishlist || [] });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to get wishlist");
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);
    if (!user) return errorResponse(res, 404, "user not found");
    if (!product) return errorResponse(res, 404, "product not found");

    const exists = user.wishlist.some((id) => id.toString() === product._id.toString());
    if (exists) user.wishlist = user.wishlist.filter((id) => id.toString() !== product._id.toString());
    else user.wishlist.push(product._id);

    await user.save();
    return successResponse(res, 200, exists ? "removed from wishlist" : "added to wishlist", {
      added: !exists,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to update wishlist");
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWishlist,
  toggleWishlist,
};
