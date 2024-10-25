const express = require("express");
const { registerController } = require("../controllers/Auth/registerCtrl");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { profileUpdate, upload } = require("../controllers/Auth/profileUpdate");
const { verifyOtp } = require("../controllers/Auth/VerifyOtp");
const {
  loginCtrl,
  verifyLoginOtp,
  getUserProfile,
} = require("../controllers/Auth/loginCtrl");

const authRoutes = express.Router();

authRoutes.post("/register", registerController);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post(
  "/update",
  authMiddleware,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "additional_media", maxCount: 5 },
  ]),
  profileUpdate
);
authRoutes.post("/login", loginCtrl);
authRoutes.post("/login-verify", verifyLoginOtp);
authRoutes.get("/get-user", authMiddleware, getUserProfile);

module.exports = authRoutes;
