import express from "express";
import { User } from "../models/User.mjs";
import dotenv from "dotenv";
import twilio from "twilio";
import otpGen from "otp-generator";
import { OTP } from "../models/Otp.mjs";

dotenv.config();
const resgisterRouter = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
resgisterRouter.post("/register-otp", async (req, res) => {
  const { phone, hash } = req.body;

  try {
    // Check if the user already exists with the given phone number
    const isUserExists = await User.findOne({ phone });
    if (isUserExists) {
      return res.status(200).json({
        success: false,
        message: "User already exists with this phone number!",
      });
    }

    // Generate a 6-digit OTP
    const otpCode = otpGen.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Set OTP expiry time (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Check if an unverified OTP already exists for the phone number
    const existingOtp = await OTP.findOne({ phone, verified: false });
    if (existingOtp) {
      return res.status(200).json({
        message: "OTP already sent. Please wait.",
      });
    }

    // Save OTP to the database
    const otp = new OTP({
      otpCode,
      phone, // Save phone number instead of email
      expiresAt,
    });
    await otp.save();

    // Send OTP via SMS using Twilio
    try {
      const msg = `${otpCode} is your OTP code for Flirty account!\n${hash}`;
      await client.messages.create({
        body: msg,
        from: "+17162294257", // Twilio phone number
        to: phone,
      });

      // Send success response if SMS is sent successfully
      res.status(200).json({
        success: true,
        message: "OTP sent successfully!",
      });
    } catch (smsError) {
      // Handle SMS sending failure
      console.log("SMS sending failed:", smsError);

      // Remove the OTP from the database since the SMS failed
      await OTP.deleteOne({ phone, otpCode });

      res.status(200).json({
        success: false,
        message: "Failed to send OTP via SMS. Please try again later.",
        error: smsError.message,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to process OTP request.",
      error: error.message,
    });
  }
});

resgisterRouter.post("/register-verify-otp", async (req, res) => {
  const { phone, otpCode } = req.body;

  try {
    // Find the OTP for the given phone number
    const otpRecord = await OTP.findOne({ phone, otpCode });

    // Check if the OTP exists
    if (!otpRecord) {
      return res.status(200).json({
        success: false,
        message: "Invalid OTP or phone number.",
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(200).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check if OTP has already been verified
    if (otpRecord.verified) {
      return res.status(200).json({
        success: false,
        message: "OTP has already been verified.",
      });
    }

    // OTP is valid, create a new user with the provided phone number
    const newUser = new User({ phone });
    await newUser.save();

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "OTP verified successfully! User created.",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
});

export default resgisterRouter;
