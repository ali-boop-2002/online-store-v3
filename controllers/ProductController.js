import Product from "../models/productModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
const getProducts = asyncHandler(async (req, res) => {
  const product = await Product.find({});
  res.json(product);
});

const getEachProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error("No product found");
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin (if you're doing auth)
const createProduct = asyncHandler(async (req, res) => {
  const { name, image, brand, price, category, description, countInStock } =
    req.body;

  // Basic validation
  if (!name || !price || !description || !brand || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const product = new Product({
    name,
    image: Array.isArray(image) ? image : [image], // ensure it's always an array
    brand,
    price,
    category,
    description,
    countInStock,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(`Product ${req.params.id} deleted`);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.status(200).json({ message: "Product deleted" });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Whitelist of fields allowed to be updated
  const allowedFields = [
    "name",
    "price",
    "description",
    "image",
    "brand",
    "category",
    "countInStock",
  ];

  // Only update the allowed fields if they exist in req.body
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

const getTotalProduct = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0, totalProducts: 1 },
    },
  ]);
  res.json(summary[0] || { totalProducts: 0 });
});

export {
  getTotalProduct,
  getProducts,
  getEachProduct,
  createProduct,
  deleteProduct,
  updateProduct,
};
