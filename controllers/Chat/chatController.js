const Chat = require("../../models/Chat");
const Match = require("../../models/Match");

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Match.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "username profile_picture isOnline")
      .populate("receiver", "username profile_picture isOnline")
      .exec();

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        // Find the last message between the two users
        const lastMessage = await Chat.findOne({
          matchId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          ...conversation.toObject(),
          lastMessage,
        };
      })
    );
    return res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: conversationsWithLastMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId, content } = req.body;

    const match = await Match.findOne({
      _id: conversationId,
    });

    if (!match) {
      return res.status(200).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    const receiverId =
      match.sender.toString() === userId ? match.receiver : match.sender;

    const newMessage = new Chat({
      matchId: match._id,
      senderId: userId,
      receiverId: receiverId,
      message: content,
    });

    // Save the message
    await newMessage.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    return res.status(200).json({
      success: true,
      message: "Message retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { getConversations, sendMessage, getMessages };
