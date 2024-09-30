import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otpCode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

// Automatically delete documents after `expiresAt` time
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model("OTP", otpSchema);
