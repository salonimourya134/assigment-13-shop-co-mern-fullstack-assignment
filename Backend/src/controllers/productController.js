const Product = require("../models/Product.model");
const { successResponse, errorResponse } = require("../utils/response");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, stock, size, dressStyle, sort, page = 1, limit = 9 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 9));
    const query = {};
    const cleanSearch = String(search || "").trim();
    if (cleanSearch) query.name = { $regex: escapeRegex(cleanSearch), $options: "i" };
    if (category) query.category = category;
    if (dressStyle) query.dressStyle = { $regex: `^${escapeRegex(String(dressStyle).trim())}$`, $options: "i" };
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (Number.isFinite(min) || Number.isFinite(max)) {
      query.price = {};
      if (Number.isFinite(min)) query.price.$gte = Math.max(0, min);
      if (Number.isFinite(max)) query.price.$lte = Math.max(0, max);
      if (query.price.$gte !== undefined && query.price.$lte !== undefined && query.price.$gte > query.price.$lte) return successResponse(res, 200, "Products fetched successfully", { products: [], page: pageNumber, limit: limitNumber, total: 0, totalPages: 0 });
    }
    if (stock === "instock") query.quantity = { $gt: 0 };
    if (stock === "outofstock") query.quantity = 0;
    if (size) query[`sizes.${size}`] = { $gt: 0 };
    const sortData = sort === "low" ? { price: 1 } : sort === "high" ? { price: -1 } : sort === "new" ? { createdAt: -1 } : { name: 1 };
    const skip = (pageNumber - 1) * limitNumber;
    const products = await Product.find(query).populate("category", "name").sort(sortData).skip(skip).limit(limitNumber);
    const total = await Product.countDocuments(query);
    return successResponse(res, 200, "Products fetched successfully", { products, page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) });
  } catch (error) {
    return errorResponse(res, 500, "Failed to get products");
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category", "name");
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }
    return successResponse(res, 200, "Product fetched successfully", {
      product,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to get product");
  }
};
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      dressStyle,
      category,
      rating,
      sizes,
    } = req.body;

    const slug = createSlug(name);

    let parsedSizes = sizes;

    if (typeof sizes === "string") {
      parsedSizes = JSON.parse(sizes);
    }

    const images = req.files?.length
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : Array.isArray(req.body.images)
        ? req.body.images
        : [];

    const product = new Product({
      user: req.user.id,
      name,
      slug,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      dressStyle: dressStyle || "Casual",
      category,
      images,
      rating: rating ? Number(rating) : undefined,
      sizes: parsedSizes,
    });

    await product.save();
    return successResponse(res, 201, "Product created successfully", {
      product,
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["name", "description", "price", "oldPrice", "dressStyle", "category", "rating", "sizes"];
    const updateData = {};
    for (const field of allowedFields) if (req.body[field] !== undefined) updateData[field] = req.body[field];
    if (typeof updateData.sizes === "string") updateData.sizes = JSON.parse(updateData.sizes);
    if (updateData.name) updateData.slug = createSlug(updateData.name);
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.oldPrice !== undefined) updateData.oldPrice = Number(updateData.oldPrice);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (req.files?.length) updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
    if (!Object.keys(updateData).length) return errorResponse(res, 400, "no valid fields to update");
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 404, "product not found");
    Object.assign(product, updateData);
    await product.save();
    await product.populate("category", "name");
    return successResponse(res, 200, "product updated successfully", { product });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }
    return successResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete product");
  }
};
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    }).populate("category", "name");
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    return successResponse(
      res,
      200,
      "Product fetched successfully",
      {
        product,
      },
    );
  } catch (error) {
    console.log(error);

    return errorResponse(
      res,
      500,
      "Failed to get product",
    );
  }
};

module.exports = {
  getProducts,
  getProductById,
    getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,

};
