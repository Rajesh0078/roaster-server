import { User } from "../models/User.mjs";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const loginCtrl = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code: otp });

    if (verificationCheck.status === "approved") {
      const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        message: "User login successfully.",
        user,
        token: newToken,
        success: true,
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Failed to verify OTP." });
  }
};

const updateProfile = async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    bio,
    password,
    isOnline,
    email,
    dob,
    gender,
    looking_for,
    interests,
    photos,
    profile_picture,
    location,
  } = req.body;

  const { token } = req.headers;

  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.isRegistered) {
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Invalid token", success: false });
        }
        user.username = username || user.username;
        user.firstname = first_name || user.firstname;
        user.lastname = last_name || user.lastname;
        user.bio = bio || user.bio;
        user.isOnline = isOnline !== undefined ? isOnline : user.isOnline;
        user.email = email || user.email;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;
        user.looking_for = looking_for || user.looking_for;
        user.interests = interests || user.interests;
        user.photos = photos || user.photos;
        user.profile_picture = profile_picture || user.profile_picture;
        user.location = location || user.location;

        await user.save();
        return res
          .status(200)
          .json({ user, message: "User Updated successfully" });
      });
    } else {
      user.username = username || user.username;
      user.firstname = first_name || user.firstname;
      user.lastname = last_name || user.lastname;
      user.bio = bio || user.bio;
      user.isOnline = isOnline !== undefined ? isOnline : user.isOnline;
      user.email = email || user.email;
      user.dob = dob || user.dob;
      user.gender = gender || user.gender;
      user.looking_for = looking_for || user.looking_for;
      user.interests = interests || user.interests;
      user.photos = photos || user.photos;
      user.profile_picture = profile_picture || user.profile_picture;
      user.location = location || user.location;
      if (profile_picture) {
        const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "1h",
        });
        user.isRegistered = true;
        await user.save();
        return res.status(200).json({
          user,
          token: newToken,
          messgae: "User Created Successfully",
          success: true,
        }); // Send updated user data with new token
      } else {
        await user.save();
        return res.json({
          user,
          messgae: "User Created Successfully",
          success: true,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export { updateProfile, loginCtrl };
