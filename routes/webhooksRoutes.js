// routes/webhookRoutes.js
import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeController.js";

const router = express.Router();

// 🔥 Create a raw-body specific router instance
const rawRouter = express.Router({
  // This disables body parsing for this route entirely
});

rawRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

export default rawRouter;
