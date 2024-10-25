const twilio = require("twilio");
const User = require("../../models/User");
const getOTP = require("one-time-password-generator");
const { OTP } = require("../../models/Otp");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCONT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTPExpiry = () => {
  const expiresInMinutes = 60;
  return new Date(Date.now() + expiresInMinutes * 60 * 1000);
};

const registerController = async (req, res) => {
  const { phone, hash_string } = req.body;
  try {
    const isUserExists = await User.findOne({ phone });
    if (isUserExists) {
      return res.json({
        success: false,
        message: "User already registered!",
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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { registerController };
