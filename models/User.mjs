import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    password: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, default: "" },
    profile_picture: { type: String, default: "" },
    looking_for: { type: String },
    interests: { type: [String], default: [] },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    photos: { type: [String], default: [] },
    isRegistered: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema);
