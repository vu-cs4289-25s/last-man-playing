// TODO - add authMiddleware to these functions

const express = require('express');
const router = express.Router();

const {
    startGame,
    submitScore,
    finalizeRound,
    getGameStatus
} = require("../controllers/gamesController");

// POST /games/start
router.post('/start', startGame);

// POST /games/:gameId/round/:roundId/submitScore
router.post('/:gameId/round/:roundId/submitScore', submitScore);

// POST /games/:gameId/round/:roundId/finalize
router.post('/:gameId/round/:roundId/finalize', finalizeRound);

// GET /games/:gameId/status
router.get('/:gameId/submitScore', getGameStatus);

module.exports = router;
