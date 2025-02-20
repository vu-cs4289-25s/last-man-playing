const express = require('express');
const router = express.Router();

const { getUserProfile } = require('../controllers/userController');

// GET /user/profile
router.get('/profile', getUserProfile);

module.exports = router;