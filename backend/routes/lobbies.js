const express = require('express');
const router = express.Router();

const {getLobby, getPublicLobbies, createLobby, joinLobby} = require("../controllers/lobbiesController");

// GET /lobbies/:id
router.get('/:id', getLobby);

// GET /lobbies/public
router.get('/public', getPublicLobbies);

// POST /lobbies/create
router.post('/create', createLobby);

// POST /lobbies/join
router.post('/create', joinLobby);


module.exports = router;