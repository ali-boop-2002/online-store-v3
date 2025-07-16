import express from "express";
// import upload from "../middleware/uploadMiddleware.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getEachProduct,
  getProducts,
  getTotalProduct,
  updateProduct,
} from "../controllers/ProductController.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);

router.get("/get-total-products", protect, admin, getTotalProduct);
router
  .route("/:id")
  .get(getEachProduct)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

// router.post("/", protect, admin, upload.single("image"), (req, res) => {
//   res.send({ url: req.file.path });
// });

export default router;
