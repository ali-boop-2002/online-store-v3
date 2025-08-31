import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import webhookRoutes from "./routes/webhooksRoutes.js";

dotenv.config();
import connectDB from "./config/db.js";

const app = express();
app.set("trust proxy", true); // ✅ Trust Heroku or any reverse proxy

const allowedOrigins = [
  "https://regal-lollipop-48edbd.netlify.app",
  "https://online-store-v3-front-end.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const __dirname = path.resolve();
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/webhook", webhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.use("/api/product", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);

// Serve frontend if you want
app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/{*any}", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
