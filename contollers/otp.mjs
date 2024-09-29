import express from "express";
import { User } from "../models/User.mjs";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();
const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

router.post("/register-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    let user = await User.findOne({ phone });

    if (user) {
      return res.status(200).json({
        success: false,
        message: "User already registered with this phone number.",
      });
    }
    try {
      await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({ to: phone, channel: "sms" });

      return res
        .status(200)
        .json({ message: "OTP sent successfully!", success: true });
    } catch (otpError) {
      console.error("Error sending OTP:", otpError);
      return res
        .status(500)
        .json({ message: "Failed to send OTP.", success: false });
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", success: false });
  }
});

router.post("/login-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(200).send({
        success: false,
        message: "User not found!",
      });
    }
    try {
      await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({ to: phone, channel: "sms" });

      return res
        .status(200)
        .json({ message: "OTP sent successfully!", success: true });
    } catch (otpError) {
      console.error("Error sending OTP:", otpError);
      return res
        .status(200)
        .json({ message: "Failed to send OTP.", success: false });
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", success: false });
  }
});

// Verify OTP and Register User
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code: otp });

    if (verificationCheck.status === "approved") {
      let user = await User.findOne({ phone });

      if (!user) {
        user = new User({ phone });
        await user.save();
      }
      return res.status(200).json({
        message: "User registered successfully.",
        user,
        success: true,
      });
    } else {
      return res.status(200).json({ message: "Invalid OTP", success: false });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Failed to verify OTP." });
  }
});

export default router;
