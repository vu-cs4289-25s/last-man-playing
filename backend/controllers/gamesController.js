const db = require("../models");
const {v4: uuidv4 } = require("uuid");
const { io } = require("../index");

exports.startGame = async (req, res) => {
    try {
        const userId =  req.user.userId;
        const { lobby_id } = req.body;

        const lobby = await db.Lobby.findOne({where: {lobby_id}});
        if(!lobby) {
            return res.status(404).json({ message: 'Lobby not found' });
        }
        if (lobby.created_by !== userId){
            return res.status(403).json({message: 'Only the leader can start the game'});
        }

        // Check participant count is greater than 2
        const participantCount = await db.LobbyParticipants.count({where: {lobby_id}});
        if (participantCount < 2) {
            return res.status(400).json({ message: 'You need at least 2 players to start the game'});
        }

        // Create the game
        // TODO - FIGURE OUT HOW GAME TYPES ARE DETERMINED
        const newGame = await db.Games.create({
            game_id: uuidv4(),
            lobby_id,
            game_type: 'dummy value', // come back to this
            current_round: 1,
            is_active: true
        });

        // Create the first round
        const newRound = await db.Rounds.create({
            round_id: uuidv4(),
            game_id: newGame.game_id,
            round_number: 1,
            started_at: new Date(),
        });

        io.to(`lobby-${lobby_id}`).emit('game-started', {
            gameId: newGame.game_id,
            lobbyId: lobby_id,
            round: newRound
        })

        // Respond
        return res.status(201).json({
            message: 'Game started successfully',
            game: newGame,
            round: newRound
        });
    } catch (error){
        console.error('Error in startGame:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.submitScore = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {gameId, roundId} = req.params;
        const { score } = req.body;

        // Validate game and round
        const game = await db.Games.findOne({ where: { game_id: gameId } });
        if (!game || !game.is_active){
            return res.status(400).json({ message: 'Game not found or is inactive'});
        }

        const round = await db.Rounds.findOne({ where: { round_id: roundId, game_id: gameId } });
        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        // Check if round is already over
        if (round.ended_at){
            return res.status(400).json({ message: "This round has already ended" });
        }

        // Check if an entry exists already
        let roundResult = await db.RoundResults.findOne({
            where: { round_id: roundId, user_id: userId }
        });

        if (!roundResult) {
            roundResult = await db.RoundResults.create({
                round_result_id: uuidv4(),
                round_id: roundId,
                user_id: userId,
                score,
                eliminated: false,
            });
        } else {
            await roundResult.update({ score });
        }

        return res.status(200).json({
            message: 'Score submitted successfully',
            roundResult
        });
    } catch (error) {
        console.error('Error in submitScore:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.finalizeRound = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { gameId, roundId } = req.params;

        // Check if user is lobby leader
        const game = db.Games.findOne({ where: { game_id: gameId }})
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const lobby = db.Lobby.findOne({ where: { lobby_id: game.lobby_id }})
        if (!lobby) {
            return res.status(404).json({ message: 'Lobby not found' });
        }

        if (lobby.created_by !== userId){
            return res.status(403).json({message: 'Only the leader can start the game'});
        }

        // Retrieve round and results
        const round = await db.Rounds.findOne({ where: { round_id: roundId }});
        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        const roundResults = await db.RoundResults.findAll({ where: { round_id: roundId }});
        if (roundResults.length === 0) {
            return res.status(400).json ({ message: 'No scores found for this round' });
        }

        // Find the minimum score
        let minimumScore = null;
        let loserId = null

        roundResults.forEach(rr => {
            if (minimumScore === null || rr.score < minimumScore) {
                minimumScore = rr.score;
                loserId = rr.user_id;
            }
        })

        // Mark loser as eliminated and end round
        await db.RoundResults.update(
            { eliminated: true },
            { where: {round_id: roundId, user_id: loserId }},
        )

        await round.update({ ended_at: new Date() });

        // Check how many players are still in the game
        const totalParticipants = await db.LobbyParticipants.count({ where: { lobby_id: game.lobby_id } });

        const allRoundIds = await db.Rounds.findAll({
            where: { game_id: gameId },
            attributes: ['round_id']
        })
        const roundIdList = allRoundIds.map(r => r.round_id);

        const eliminatedResults = await db.RoundResults.findAll({
            where: {
                round_id: roundIdList,
                eliminated: true,
            }
        });

        const eliminatedUserIds = new Set(eliminatedResults.map(r => r.user_id));
        const remainingPlayers = totalParticipants - eliminatedUserIds.size;

        if (remainingPlayers <= 1) {
            await game.update({ is_active: false });
            return res.status(200).json({
                message: 'Game ended',
                loserId,
                remainingPlayers
            });
        }

        // TODO - Finalize how next games are chosen and sent to the frontend
        const nextRoundNumber = round.round_number + 1;
        const newRound = await db.Rounds.create({
            round_id: uuidv4(),
            game_id: gameId,
            round_number: nextRoundNumber,
            started_at: new Date()
        })

        return res.status(200).json({
            message: 'Round finalized, next round started',
            eliminatedPlayer: loserId,
            nextRound: newRound
        });
    } catch (error){
        console.error('Error in finalizeRound:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getGameStatus = async (req, res) => {

}
