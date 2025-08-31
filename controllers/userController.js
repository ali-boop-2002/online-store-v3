import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import generateVerificationToken from "../utils/generateVerificationToken.js";
import sendVerificationEmail from "../nodemailer/nodemailer.js";
import crypto from "crypto";

// User sign in
const userSignIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error("Please verify your email first.");
  }

  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateToken(res, user._id);
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (password !== passwordConfirm) {
    res.status(400);
    throw new Error("Passwords do not match");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const { token, hashedToken } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    verifyToken: hashedToken,
    verifyTokenExpires: Date.now() + 3600000,
  });
  await sendVerificationEmail(email, token);
  res.status(201).json({ message: "Check your email to verify your account" });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verifyToken: hashedToken,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();

  res.redirect("http://localhost:5173/verified-success");
});

// @desc   Update user profile
// @route  GET /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updateUser = await user.save();
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// logout user/ clear cookie
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

const getTotalUsers = asyncHandler(async (req, res) => {
  const totalUser = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0, totalUsers: 1 },
    },
  ]);
  res.json(totalUser[0] || { totalUsers: 0 });
});

export {
  registerUser,
  userSignIn,
  logoutUser,
  verifyEmail,
  updateUserProfile,
  getTotalUsers,
};
