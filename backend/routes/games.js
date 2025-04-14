// TODO - add authMiddleware to these functions

const express = require('express');
const router = express.Router();

const {
    startGame,
    submitScore,
    finalizeRound,
    getGameStatus,
    getRoundScores
} = require("../controllers/gamesController");

// POST /games/start
router.post('/start', startGame);

// POST /games/:gameId/round/:roundId/submitScore
router.post('/:gameId/round/:roundId/submitScore', submitScore);

// POST /games/:gameId/round/:roundId/finalize
router.post('/:gameId/round/:roundId/finalize', finalizeRound);

// GET /games/:gameId/status
router.get('/:gameId/getGameStatus', getGameStatus);

// GET /games/:gameId/round/:roundId/scores
router.get('/:gameId/round/:roundId/scores', getRoundScores);

module.exports = router;
