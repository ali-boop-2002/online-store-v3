import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  getProductReviews,
  getReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").get(protect, getReview);

router.route("/write-review").post(protect, createReview);

router.get("/product-review/:productId", getProductReviews);

export default router;
