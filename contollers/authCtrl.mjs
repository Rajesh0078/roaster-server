import { User } from "../models/User.mjs";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const updateProfile = async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    bio,
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
        .status(200)
        .json({ message: "User not found", success: false });
    }

    if (user.isRegistered) {
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Invalid token", success: false });
        }
        user.firstname = first_name || user.firstname;
        user.lastname = last_name || user.lastname;
        user.bio = bio || user.bio;
        user.isOnline = isOnline !== undefined ? isOnline : user.isOnline;
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
      const isUserNameExists = username
        ? await User.findOne({ username })
        : null;
      const isEmailExists = email ? await User.findOne({ email }) : null;
      if (isUserNameExists) {
        return res
          .status(200)
          .json({ message: "Username already exists", success: false });
      }
      if (isEmailExists) {
        return res
          .status(200)
          .json({ message: "Email already exists", success: false });
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
      return res.json({
        user,
        messgae: "User Created Successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const imageUpload = async (req, res) => {
  try {
    const { phone } = req.body;
    const profilePicture = req.files["profile_picture"];
    const photos = req.files["photos"];

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }

    // Construct base URL for uploaded images
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    // Prepare image URLs
    const imageUrls = {
      profile_picture: null,
      photos: [],
    };

    // Only proceed to upload if the user is found
    if (profilePicture && profilePicture.length > 0) {
      imageUrls.profile_picture = `${baseUrl}${profilePicture[0].filename}`;
    }

    if (photos && photos.length > 0) {
      imageUrls.photos = photos.map((file) => `${baseUrl}${file.filename}`);
    }

    // Update user's profile with new image URLs
    if (imageUrls.profile_picture) {
      user.profile_picture = imageUrls.profile_picture;
    }

    // Append new photos to existing array
    user.photos = user.photos.concat(imageUrls.photos);

    // Save the updated user document
    await user.save();
    if (user.isRegistered) {
      return res.status(200).json({
        message: "Images uploaded successfully",
        user,
        success: true,
      });
    }
    const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "10d",
    });
    user.isRegistered = true;
    await user.save();
    return res.status(200).json({
      user,
      token: newToken,
      messgae: "User Created Successfully",
      success: true,
    });

    // Return the updated user data in response
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({
      message: "Error uploading images",
      error: error.message,
      success: false,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "user retrieved succefully", success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export { updateProfile, imageUpload, getMyProfile };
