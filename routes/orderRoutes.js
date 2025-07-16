import express from "express";
import {
  addOrderItems,
  deleteOrder,
  editOrderById,
  getAllOrders,
  getDeliveryStatusSummary,
  getMyOrders,
  getOrderById,
  getSalesSummary,
  getTotalOrders,
} from "../controllers/orderController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getAllOrders);

router.get("/myorders", protect, getMyOrders);

router
  .route("/editOrder/:id")
  .put(protect, admin, editOrderById)
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

router
  .get("/sales-summary", protect, admin, getSalesSummary)
  .get("/summary/total-orders", protect, admin, getTotalOrders)
  .get("/get-delivery-stats", protect, admin, getDeliveryStatusSummary);

export default router;
