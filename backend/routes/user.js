const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// GET /api/user/profile
router.get('/profile', authMiddleware, getUserProfile);

// PUT /api/user/profile
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
