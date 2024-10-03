import { Message } from "../models/message.mjs";
import { User } from "../models/User.mjs";

// Middleware to verify JWT and extract user ID

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const userId = req.userId;
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found", success: false });
    }

    const message = new Message({
      sender: userId,
      recipient,
      content,
      seen: false,
      edited: false,
      deleted: false,
    });

    const savedMessage = await message.save();

    const ably = req.app.locals.ablyRealtime;

    ably.channels.get("chat").publish("message", savedMessage);

    // Send response
    res.status(200).json({
      message: "Message sent",
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error sending message",
      success: false,
      error: error.message,
    });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId, content } = req.body;
    const userId = req.userId;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found", success: false });
    }

    // Find the message by ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(200)
        .json({ message: "Message not found", success: false });
    }

    if (!message.sender.equals(userId)) {
      return res
        .status(200)
        .json({ message: "Unauthorized to edit this message", success: false });
    }

    // Update message content
    message.content = content;
    message.edited = true;
    message.editedAt = Date.now();

    // Save updated message
    const updatedMessage = await message.save();

    req.app.locals.ablyRealtime.channels
      .get("chat")
      .publish("message-edited", updatedMessage);

    res.status(200).json({
      message: "Message edited successfully",
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error editing message",
      success: false,
      error: error.message,
    });
  }
};

export const getChatList = async (req, res) => {
  try {
    const userId = req.userId;

    // Find chats where the user is either the sender or the recipient
    const chats = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).sort({ timestamp: -1 });

    // Format the chat list
    const chatList = chats.map((chat) => ({
      id: chat._id,
      sender: chat.sender,
      recipient: chat.recipient,
      message: chat.content,
      timestamp: chat.timestamp,
      seen: chat.seen,
      edited: chat.edited,
      deleted: chat.deleted,
    }));

    res.status(200).json({
      message: "Chat list fetched successfully",
      success: true,
      data: chatList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching chat list",
      success: false,
      error: error.message,
    });
  }
};

// controllers/messageCtrl.js

export const getMyConvo = async (req, res) => {
  try {
    const userId = req.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ timestamp: -1 })
      .exec();

    const chatList = {};

    messages.forEach((message) => {
      const otherUserId = message.sender.equals(userId)
        ? message.recipient
        : message.sender;

      if (!chatList[otherUserId]) {
        chatList[otherUserId] = {
          recipientId: otherUserId,
          username: "",
          profile_pic: null,
          lastMessage: message,
        };
      }

      // Update the last message if this one is more recent
      if (message.timestamp > chatList[otherUserId].lastMessage.timestamp) {
        chatList[otherUserId].lastMessage = message;
      }
    });

    // Fetch user profile pictures for all unique users in chatList
    const userIds = Object.keys(chatList);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "profile_picture username"
    );
    // Map user profile pictures to the chat list
    users.forEach((user) => {
      if (chatList[user._id]) {
        chatList[user._id].profile_pic = user.profile_picture;
        chatList[user._id].username = user.username;
      }
    });

    const chatListArray = Object.values(chatList);

    res.status(200).json({
      message: "Chat list fetched successfully",
      success: true,
      data: chatListArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching chat list",
      success: false,
      error: error.message,
    });
  }
};
