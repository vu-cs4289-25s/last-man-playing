/************************************************
 * File: backend/routes/lobbies.js
 ************************************************/
const express = require('express');
const router = express.Router();
const lobbiesController = require('../controllers/lobbiesController');

// Anyone can fetch public lobbies or create/join/leave for now
router.get('/public', lobbiesController.getPublicLobbies);

// Create a new lobby
router.post('/create', lobbiesController.createLobby);

// Join a lobby
router.post('/join', lobbiesController.joinLobby);

// Leave a lobby
router.post('/leave', lobbiesController.leaveLobby);

// Remove a player
router.post('/remove', lobbiesController.removePlayer);

// Get a specific lobby by ID
router.get('/:id', lobbiesController.getLobby);

module.exports = router;