const User = require('../models/user');

// GET /api/user/profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user ID from the auth token (set by authMiddleware)
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: [
        'user_id',
        'username',
        'email',
        'profile_image_url',
        'completed_games_count',
        'average_rating'
      ]
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      message: 'User profile fetched successfully',
      user: user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PUT /api/user/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, profile_image_url } = req.body;
    // Validate input – here username is required
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the user fields
    user.username = username;
    user.profile_image_url = profile_image_url;
    await user.save();
    return res.json({
      message: "User profile updated successfully",
      user: user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
