const Category = require("../models/Category.model");
const Product = require("../models/Product.model");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to get categories",
    });
  }
};

const getCategoryData = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    res
      .status(200)
      .json({ message: "Fetched all category details", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server not working", status: 500 });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const oldCategory = await Category.findOne({ name });

    if (oldCategory) {
      return res.status(400).json({
        success: false,
        message: "category already exists",
      });
    }
    const category = await Category.create({
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to create category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ success: false, message: "category already exists" });
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: "category cannot be deleted while products exist" });
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
module.exports = {
  getCategories,
  getCategoryData,
  createCategory,
  updateCategory,
  deleteCategory,
};
