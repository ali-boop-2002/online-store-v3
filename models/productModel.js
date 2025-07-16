import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
    },
    brand: {
      type: String,
      required: true,
      default: "Unknown",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      default: "Essentials",
    },
    description: {
      type: String,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
