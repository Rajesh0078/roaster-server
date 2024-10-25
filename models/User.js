const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    path: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    username: { type: String, unique: true, default: null },
    email: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },
    dob: { type: Date, default: null },
    interests: { type: [String], default: null },
    bio: { type: String, default: null },
    profile_picture: {
      type: String,
      default: null,
    },
    education: { type: String, default: null },
    zodiac: {
      type: String,
      enum: [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
      ],
      default: null,
    },
    drinking: {
      type: String,
      enum: ["Yes", "No", "Occasionally"],
      default: null,
    },
    smoking: {
      type: String,
      enum: ["Yes", "No", "Occasionally"],
      default: null,
    },
    passion: { type: String, default: null },
    looking_for: {
      type: String,
      enum: [
        "Friendship",
        "Dating",
        "Serious Relationship",
        "Networking",
        "Prefer not to say",
        "Other",
      ],
      default: null,
    },
    languages_known: { type: String, default: null },
    height: { type: String, default: null },
    additional_media: { type: [mediaSchema], default: null },

    location: {
      longitude: { type: Number, default: null },
      latitude: { type: Number, default: null },
    },
    likedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ],
    likedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ],
    matches: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
    ],
    isOnline: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
