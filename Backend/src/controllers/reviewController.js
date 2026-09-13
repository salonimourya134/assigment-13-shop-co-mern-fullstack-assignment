const Review = require("../models/Review.model");
const Product = require("../models/Product.model");

const { successResponse, errorResponse } = require("../utils/response");

const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return errorResponse(
        res,
        400,
        "rating and comment are required",
      );
    }

    if (rating < 1 || rating > 5) {
      return errorResponse(
        res,
        400,
        "rating must be between 1 and 5",
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(
        res,
        404,
        "Product not found",
      );
    }
    const alreadyReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReview) {
      return errorResponse(
        res,
        400,
        "you already reviewed this product",
      );
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      name: req.user.name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString(),
    });

    const reviews = await Review.find({
      product: productId,
    });

    let totalRating = 0;
    reviews.forEach((item) => {
      totalRating += item.rating;
    });

    const averageRating = totalRating / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      numReviews: reviews.length,
    });

    return successResponse(
      res,
      201,
      "Review added successfully",
      {
        review,
      },
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      500,
      "Failed to add review",
    );
  }
};

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Review.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(12);
    return successResponse(res, 200, "testimonials fetched successfully", { testimonials });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get testimonials");
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    return successResponse(
      res,
      200,
      "reviews fetched successfully",
      {
        reviews,
      },
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      500,
      "Failed to get reviews",
    );
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getTestimonials,
};
