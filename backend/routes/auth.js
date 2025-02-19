const express = require('express');
const router = express.Router();

const { loginUser, registerUser} = require('../controllers/authController');

// POST /auth/login
router.post("/login", loginUser);

// POST /auth/register
router.post("/register", registerUser);

module.exports = router;