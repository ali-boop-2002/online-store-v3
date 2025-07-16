import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";

const createReview = asyncHandler(async (req, res) => {
  const { review, rating, product } = req.body;

  // Validate input
  if (!review || !product || rating === undefined || rating === null) {
    res.status(400);
    throw new Error("Please enter valid data");
  }

  // Validate rating is a number
  if (typeof rating !== "number" || isNaN(rating)) {
    res.status(400);
    throw new Error("Rating must be a valid number");
  }

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Optionally prevent duplicate reviews
  // const alreadyReviewed = await Review.findOne({ user: req.user._id, product });
  // if (alreadyReviewed) {
  //   res.status(400);
  //   throw new Error("You have already reviewed this product");
  // }

  // Save new review
  const newReview = new Review({ user: req.user._id, review, rating, product });
  const savedReview = await newReview.save();

  // Update product review stats
  const allProductReviews = await Review.find({ product });
  productExists.numReviews = allProductReviews.length;
  productExists.rating =
    allProductReviews.reduce((acc, item) => acc + item.rating, 0) /
    allProductReviews.length;

  await productExists.save();

  res.status(201).json(savedReview);
});

const getReview = asyncHandler(async (req, res) => {
  const allReviews = await Review.find({})
    .populate("user", "name")
    .populate("product", "name");
  res.status(200).json(allReviews);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "name"
  );

  res.status(200).json(reviews);
});

export { createReview, getReview, getProductReviews };
