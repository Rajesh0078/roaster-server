const twilio = require("twilio");
const User = require("../../models/User");
const getOTP = require("one-time-password-generator");
const jwt = require("jsonwebtoken");
const { OTP } = require("../../models/Otp");
const { getUserWithCompleteData } = require("../../utils/getUserData");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCONT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTPExpiry = () => {
  const expiresInMinutes = 60;
  return new Date(Date.now() + expiresInMinutes * 60 * 1000);
};

const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const loginCtrl = async (req, res) => {
  const { phone, hash_string } = req.body;
  try {
    const isUserExists = await User.findOne({ phone });
    if (!isUserExists) {
      res.json({
        success: false,
        message: "User not found!",
      });
    }
    const otp = getOTP(6);
    try {
      await client.messages.create({
        body: `Welcome to Roaster! ${otp} is your verification code \n ${hash_string}`,
        from: "+17162294257",
        to: phone,
      });
    } catch (twilioError) {
      console.log(twilioError);
      return res.json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }
    const newOtp = await OTP.create({
      phone: phone,
      otp: otp,
      expiresAt: generateOTPExpiry(),
    });

    const otpResponse = newOtp.toObject();
    delete otpResponse.otp;
    delete otpResponse.expiresAt;

    return res.json({
      success: true,
      message: "OTP sent successfully.",
      data: otpResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyLoginOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find the OTP record for the given phone
    const otpRecord = await OTP.findOne({ phone })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();

    if (!otpRecord) {
      return res.json({
        success: false,
        message: "OTP record not found",
      });
    }

    // Check if the OTP is valid and not expired
    if (
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < Date.now() ||
      otpRecord.verified
    ) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    // OTP is valid, create the user
    const user = await User.findOne({ phone });

    // Optionally generate an auth token
    const authToken = generateAuthToken(user._id);

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    const userResponse = await getUserWithCompleteData(user._id);

    req.app.get("io").emit("user-login", user._id);

    return res.json({
      success: true,
      message: "User login successfully!",
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

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from params or auth token
    const user = await getUserWithCompleteData(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.app.get("io").emit("user-login", userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { loginCtrl, verifyLoginOtp, getUserProfile };
