const Match = require("../../models/Match");
const User = require("../../models/User");

const sendSwipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reciever_id, liked } = req.body;

    const [sender, receiver] = await Promise.all([
      User.findById(userId).select("likedUsers likedBy matches"),
      User.findById(reciever_id).select("likedUsers likedBy matches"),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const existingMatch = await Match.findOne({
      $or: [
        { sender: userId, receiver: reciever_id },
        { sender: reciever_id, receiver: userId },
      ],
    });

    if (existingMatch) {
      return res.status(200).json({
        success: false,
        message: "Already Matched",
      });
    }

    const isLikedByYou = sender.likedUsers.includes(reciever_id);
    if (isLikedByYou) {
      return res.status(200).json({
        success: false,
        message: "You already likes this profile!",
      });
    }

    const isLikedByReceiver = sender.likedBy.includes(reciever_id);
    if (!isLikedByReceiver) {
      sender.likedUsers.push(reciever_id);
      receiver.likedBy.push(userId);

      await Promise.all([sender.save(), receiver.save()]);

      return res.status(200).json({
        success: true,
        message: "Swipe record success",
      });
    }

    if (liked) {
      const newMatch = await Match.create({
        sender: userId,
        receiver: reciever_id,
      });

      sender.matches.push(newMatch._id);
      receiver.matches.push(newMatch._id);

      sender.likedBy.pull(reciever_id);
      receiver.likedUsers.pull(userId);

      await Promise.all([sender.save(), receiver.save()]);

      return res.status(200).json({
        success: true,
        message: "Its a Match!",
        match: newMatch,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Swipe record success",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { sendSwipe };

// const Match = require("../../models/Match");
// const User = require("../../models/User");

// const sendSwipe = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { reciever_id, liked } = req.body;

//     // Use projection to fetch only necessary fields
//     const [sender, receiver] = await Promise.all([
//       User.findById(userId).select("likedUsers likedBy matches"),
//       User.findById(reciever_id).select("likedUsers likedBy matches"),
//     ]);

//     if (!sender || !receiver) {
//       return res.status(404).json({
//         success: false,
//         message: "user not found",
//       });
//     }

//     // Check if already matched
//     const existingMatch = await Match.findOne({
//       $or: [
//         { sender: userId, receiver: reciever_id },
//         { sender: reciever_id, receiver: userId },
//       ],
//     });

//     if (existingMatch) {
//       return res.status(200).json({
//         success: false,
//         message: "Already Matched",
//       });
//     }

//     // Check if user already liked this profile
//     const isLikedByYou = sender.likedUsers.includes(reciever_id);
//     if (isLikedByYou) {
//       return res.status(200).json({
//         success: false,
//         message: "You already liked this profile!",
//       });
//     }

//     const isLikedByReceiver = receiver.likedBy.includes(userId);

//     // Update liked users in a single save if they haven't liked each other yet
//     if (!isLikedByReceiver) {
//       sender.likedUsers.push(reciever_id);
//       receiver.likedBy.push(userId);
//     }

//     if (liked && isLikedByReceiver) {
//       const newMatch = await Match.create({
//         sender: userId,
//         receiver: reciever_id,
//       });

//       // Push match references into users' matches
//       sender.matches.push(newMatch._id);
//       receiver.matches.push(newMatch._id);

//       // Pull liked references
//       sender.likedBy.pull(reciever_id);
//       receiver.likedUsers.pull(userId);
//     }

//     // Save both users after updating their liked and match lists
//     await Promise.all([sender.save(), receiver.save()]);

//     return res.status(200).json({
//       success: true,
//       message:
//         liked && isLikedByReceiver ? "It's a Match!" : "Swipe record success",
//       match: liked && isLikedByReceiver ? newMatch : null,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// module.exports = { sendSwipe };
