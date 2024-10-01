import express from "express";
import {
  getMyProfile,
  imageUpload,
  updateProfile,
} from "../contollers/authCtrl.mjs";
import multer from "multer";
import path from "path";

const authRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

authRouter.post("/update", updateProfile);
authRouter.get("/me", getMyProfile);
authRouter.get("/all-users", getMyProfile);
authRouter.post(
  "/upload-images",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "photos", maxCount: 10 },
  ]),
  imageUpload
);

export default authRouter;
