const User = require("../../models/User");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const profileUpdate = async (req, res) => {
  const userId = req.user.userId;
  const {
    username,
    email,
    gender,
    dob,
    interests,
    longitude,
    latitude,
    looking_for,
    bio,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.json({
          success: false,
          message: "Email is already in use.",
        });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.bio = bio || user.bio;
    user.looking_for = looking_for || user.looking_for;
    user.interests = interests || user.interests;
    const locationUpdated =
      longitude &&
      latitude &&
      (user.location.longitude !== longitude ||
        user.location.latitude !== latitude);

    if (locationUpdated) {
      user.isCompleted = true;
    }

    user.location = {
      longitude: longitude || user.location.longitude,
      latitude: latitude || user.location.latitude,
    };

    if (req.files.profile_picture) {
      const profilePicturePath = req.files.profile_picture[0].path;
      const baseUrl = `${req.protocol}://${req.get("host")}/`;
      user.profile_picture = baseUrl + profilePicturePath.replace(/\\/g, "/");
    }

    let media = [];

    if (req.files && req.files.additional_media) {
      const baseUrl = `${req.protocol}://${req.get("host")}/`;
      req.files.additional_media.forEach((file) => {
        media.push({
          id: new mongoose.Types.ObjectId().toString(),
          path: `${baseUrl}${file.path.replace(/\\/g, "/")}`,
        });
      });
    }

    user.additional_media = media;

    await user.save();

    const updatedUser = user.toObject();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
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
  upload,
  profileUpdate,
};
