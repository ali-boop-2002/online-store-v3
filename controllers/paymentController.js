import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const orderData = req.body;
    console.log(orderData.orderId);
    if (
      !orderData ||
      !Array.isArray(orderData.orderItems) ||
      !orderData.shippingAddress ||
      !orderData.shippingPrice
    ) {
      return res.status(400).json({ message: "Invalid order data" });
    }
    const amountInCents = Math.round(orderData.totalPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Online Store",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success/${orderData.orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        orderId: orderData.orderId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
};
