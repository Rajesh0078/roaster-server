const User = require("../models/User");

/**
 * Fetches a user by ID and populates likedUsers, likedBy, and matches with full user details.
 *
 * @param {String} userId - The ID of the user to fetch.
 * @param {Object} populateOptions - The population options to control which fields to populate.
 * @returns {Object} - Populated user data.
 */
const getUserWithCompleteData = async (userId, populateOptions = {}) => {
  try {
    const {
      likedUsers = true,
      likedBy = true,
      matches = true,
    } = populateOptions;

    // Start querying the user by ID with optional population of fields
    const query = User.findById(userId)
      .populate(
        likedUsers
          ? { path: "likedUsers", select: "username profile_picture isOnline" }
          : {}
      )
      .populate(
        likedBy
          ? { path: "likedBy", select: "username profile_picture isOnline" }
          : {}
      )
      .populate(
        matches
          ? {
              path: "matches",
              model: "Match",
              populate: [
                { path: "sender", select: "username profile_picture isOnline" },
                {
                  path: "receiver",
                  select: "username profile_picture isOnline",
                },
              ],
            }
          : {}
      );

    // Execute the query to retrieve the user
    const user = await query.exec();

    // If no user is found, throw an error
    if (!user) {
      throw new Error("User not found");
    }

    // Map matches to include only relevant user data
    const matchesData = user.matches.map((match) => {
      const matchedUser =
        match.sender._id.toString() === userId ? match.receiver : match.sender;
      return {
        id: match._id,
        userId: matchedUser._id,
        username: matchedUser.username,
        profile_picture: matchedUser.profile_picture,
        isOnline: matchedUser.isOnline,
      };
    });

    // Return the user data with matches included
    return { ...user._doc, matches: matchesData };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Unable to fetch user data");
  }
};

module.exports = { getUserWithCompleteData };
