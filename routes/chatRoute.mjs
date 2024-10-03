import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import {
  editMessage,
  getChatList,
  getMyConvo,
  sendMessage,
} from "../contollers/messageCtrl.mjs";

export const chatRouter = express.Router();

dotenv.config();
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided", success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Failed to authenticate token", success: false });
    }
    req.userId = decoded.userId;
    next();
  });
};

chatRouter.post("/send", verifyToken, sendMessage);
chatRouter.put("/edit", verifyToken, editMessage);
chatRouter.get("/get-chat-list", verifyToken, getChatList);
chatRouter.get("/get-my-convo", verifyToken, getMyConvo);
