const { OTP } = require("../../models/Otp");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find the OTP record for the given phone
    const otpRecord = await OTP.findOne({ phone })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpRecord) {
      return res.json({
        success: false,
        message: "OTP record not found. Please register again.",
      });
    }

    // Check if the OTP is valid and not expired
    if (otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    // OTP is valid, create the user
    const newUser = await User.create({ phone });

    // Optionally generate an auth token
    const authToken = generateAuthToken(newUser._id);

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    const userResponse = newUser.toObject();

    return res.json({
      success: true,
      message: "User registered successfully!",
      token: authToken,
      user: userResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  verifyOtp,
};
