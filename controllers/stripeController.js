import Stripe from "stripe";
import Order from "../models/orderModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = asyncHandler(async (req, res) => {
  console.log("✅ Webhook received");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    const order = await Order.findById(orderId);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: session.id,
        status: session.payment_status,
        email_address: session.customer_email,
      };

      await order.save();
      console.log("✅ Order marked as paid");
    } else {
      console.warn("⚠️ Order not found");
    }
  }

  res.status(200).send("Webhook received");
});
