const express = require("express");
const authMiddleware = require("../middlewares/AuthMiddleware");
const {
  getConversations,
  sendMessage,
  getMessages,
} = require("../controllers/Chat/chatController");

const chatRoutes = express.Router();

chatRoutes.get("/conversations", authMiddleware, getConversations);
chatRoutes.get("/messages", authMiddleware, getMessages);
chatRoutes.post("/send-message", authMiddleware, sendMessage);

module.exports = chatRoutes;
