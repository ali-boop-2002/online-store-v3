import express from "express";

const router = express.Router();

import {
  getTotalUsers,
  logoutUser,
  registerUser,
  updateUserProfile,
  userSignIn,
  verifyEmail,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

router.route("/").post(registerUser);

router.post("/login", userSignIn);

router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);

router.route("/profile").put(protect, updateUserProfile);

router.route("/getTotalUsers").get(protect, admin, getTotalUsers);

export default router;
