const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");

exports.createGuestUser = async () => {
  const randomSuffix = Math.random().toString(36).substr(2, 8);
  const guestUsername = `Guest_${randomSuffix}`;

  // Create guest user and store it in the DB
  const newGuest = await User.create({
    user_id: uuidv4(),
    username: guestUsername,
    email: `guest_${randomSuffix}@example.com`,
    password_hash: "guest_account",
    profile_image_url: null, // could be something funny
  });

  return {
    user_id: newGuest.user_id,
    username: newGuest.username,
    email: newGuest.email,
  };
};
// const User = require("../models/user");
// const { v4: uuidv4 } = require("uuid");

// exports.createGuestUser = async () => {
//   try {
//     let guestUsername;
//     let isUnique = false;

//     // Generate a unique guest username
//     while (!isUnique) {
//       const randomSuffix = Math.random().toString(36).substr(2, 8);
//       guestUsername = `Guest_${randomSuffix}`;

//       // Check if username already exists
//       const existingUser = await User.findOne({
//         where: { username: guestUsername },
//       });
//       if (!existingUser) {
//         isUnique = true;
//       }
//     }

//     // Create guest user with proper guest fields
//     const newGuest = await User.create({
//       user_id: uuidv4(),
//       username: guestUsername,
//       email: null, // Guests don't need email
//       password_hash: null, // Guests don't need password
//       is_guest: true, // Mark as guest
//       profile_image_url: null,
//       completed_games_count: 0,
//       average_rating: 0.0,
//     });

//     return {
//       userId: newGuest.user_id, // Consistent naming (userId instead of user_id)
//       username: newGuest.username,
//     };
//   } catch (error) {
//     console.error("Error creating guest user:", error);
//     throw new Error("Failed to create guest user");
//   }
// };
