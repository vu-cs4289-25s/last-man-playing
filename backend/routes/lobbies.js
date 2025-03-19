const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    getLobby,
    getPublicLobbies,
    createLobby,
    joinLobby,
    leaveLobby,
    removePlayer
 } = require("../controllers/lobbiesController");

// GET /lobbies/:id
router.get('/:id', getLobby);

// GET /lobbies/public
router.get('/public', getPublicLobbies);

// POST /lobbies/create
router.post('/createLobby', authMiddleware, createLobby);

// POST /lobbies/join
router.post('/joinLobby', authMiddleware, joinLobby);

// POST /lobbies/leave
router.post('/leaveLobby', leaveLobby);

// POST /lobbies/remove
router.post('/removePlayer', removePlayer);

module.exports = router;
