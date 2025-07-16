import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("no order items");
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const allOrder = await Order.find({})
    .populate("user", "name email") // optional: populate user info
    .populate("orderItems.product");
  res.status(200).json(allOrder);
});

const editOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const allowedFields = [
    "orderItems",
    "shippingAddress",
    "itemsPrice",
    "taxPrice",
    "shippingPrice",
    "totalPrice",
    "isPaid",
    "isDelivered",
    "deliveredAt",
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      order[field] = req.body[field];
    }
  });
  const updatedOrder = await order.save();
  res.status(200).json(updatedOrder);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.deleteOne();
  res.status(200).json({ message: "Order deleted" });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json(orders);
});

const getSalesSummary = asyncHandler(async (req, res) => {
  const summary = await Order.aggregate([
    {
      $match: { isPaid: true }, // only paid orders
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $sort: { _id: 1 }, // ascending by date
    },
  ]);

  res.json(summary);
});

const getTotalOrders = asyncHandler(async (req, res) => {
  const summary = await Order.aggregate([
    {
      $group: {
        _id: null, // no grouping, just one total result
        totalOrders: { $sum: 1 }, // count each document (order)
      },
    },
    {
      $project: { _id: 0, totalOrders: 1 }, // remove _id from response
    },
  ]);

  res.json(summary[0] || { totalOrders: 0 });
});

const getDeliveryStatusSummary = asyncHandler(async (req, res) => {
  const summary = await Order.aggregate([
    {
      $group: {
        _id: null,
        delivered: {
          $sum: {
            $cond: [{ $eq: ["$isDelivered", true] }, 1, 0],
          },
        },
        notDelivered: {
          $sum: {
            $cond: [{ $eq: ["$isDelivered", false] }, 1, 0],
          },
        },
      },
    },
    {
      $project: { _id: 0, delivered: 1, notDelivered: 1 },
    },
  ]);

  res.json(summary[0] || { delivered: 0, notDelivered: 0 });
});

export {
  deleteOrder,
  getDeliveryStatusSummary,
  getTotalOrders,
  getSalesSummary,
  addOrderItems,
  getAllOrders,
  editOrderById,
  getOrderById,
  getMyOrders,
};
