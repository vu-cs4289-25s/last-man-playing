const gamesController = require('../controllers/gamesController');
const db = require('../models');
const { io } = require('../index');
const ALL_GAMES = require('../config/allGames');

jest.mock('../models', () => ({
    Lobby: {
        findOne: jest.fn()
    },
    LobbyParticipants: {
        count: jest.fn()
    },
    Games: {
        create: jest.fn(),
        findOne: jest.fn(),
    },
    Rounds: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
    },
    RoundResults: {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findAll: jest.fn(),
    }
}));

jest.mock('../index', () => ({
    io: {
        to: jest.fn(() => ({
           emit: jest.fn()
        }))
    }
}));

jest.mock('../config/allGames', () => (['miniGame1', 'miniGame2']));

describe('gamesController', () => {

    describe('startGame', () => {
        let req, res;
        beforeEach(() => {
            req = {
                user: { userId: 'user123' },
                body: { lobby_id: 'lobby-1'}
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
        })
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return 404 if lobby not found', async () => {
            db.Lobby.findOne.mockResolvedValue(null);

            await gamesController.startGame(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Lobby not found' });
        });

        it('should return 403 if user is not the lobby leader', async () => {
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'other-user' });

            await gamesController.startGame(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Only the leader can start the game' });
        });

        it('should return 400 if participant count is less than 2', async () => {
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'user123' });
            db.LobbyParticipants.count.mockResolvedValue(1);

            await gamesController.startGame(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'You need at least 2 players to start the game' });
        })

        it('should start a game successfully', async () => {
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'user123' });
            db.LobbyParticipants.count.mockResolvedValue(3);

            const fakeGame = { game_id: 'game-1', lobby_id: 'lobby-1', current_round: 1, is_active: true };
            db.Games.create.mockResolvedValue(fakeGame);

            const fakeRound = { round_id: 'round-1', game_id: 'game-1', round_number: 1,
                round_game_type: 'miniGame1', started_at: new Date() };
            db.Rounds.create.mockResolvedValue(fakeRound);

            await gamesController.startGame(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Game started successfully',
                game: fakeGame,
                round: fakeRound,
                miniGame: expect.any(String)
            });
            expect(io.to).toHaveBeenCalledWith('lobby-lobby-1');
        });
    });

    describe('submitScore', () => {
        let req, res;
        beforeEach(() => {
            req = {
                user: { userId: 'user123' },
                params: { gameId: 'game-1', roundId: 'round-1'},
                body: { score: 50 }
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        })

        it('should return 400 if game is not found or inactive', async () => {
            db.Games.findOne.mockResolvedValue(null);
            await gamesController.submitScore(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game not found or is inactive'});
        })

        it('should return 404 if round is not found', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', is_active: true });
            db.Rounds.findOne.mockResolvedValue(null);

            await gamesController.submitScore(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Round not found' });
        })

        it('should return 400 if round has already ended', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', is_active: true });
            db.Rounds.findOne.mockResolvedValue({ round_id: 'round-1', game_id: 'game-1', ended_at: new Date() });

            await gamesController.submitScore(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'This round has already ended' });
        })

        it('should create a new round result if one does not exist', async () => {
            db.Games.findOne.mockResolvedValue({ game_id : 'game-1', is_active: true });
            db.Rounds.findOne.mockResolvedValue({ round_id: 'round-1', game_id: 'game-1', ended_at: null });
            db.RoundResults.findOne.mockResolvedValue(null);

            const fakeRoundResult = { round_result_id: 'result-1', round_id: 'round-1',
                user_id: 'user123', score: 50, eliminated: false };
            db.RoundResults.create.mockResolvedValue(fakeRoundResult);

            await gamesController.submitScore(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Score submitted successfully',
                roundResult: fakeRoundResult });
        })

        it('should update an existing round result if it exists', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', is_active: true });
            db.Rounds.findOne.mockResolvedValue({ round_id: 'round-1', game_id: 'game-1', ended_at: null });

            const existingRoundResult = {
                round_result_id: 'result-1',
                round_id: 'round-1',
                user_id: 'user123',
                score: 30,
                eliminated: false,
                update: jest.fn()
            };
            db.RoundResults.findOne.mockResolvedValue(existingRoundResult);

            await gamesController.submitScore(req, res);
            expect(existingRoundResult.update).toHaveBeenCalledWith({ score: 50 });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('finalizeRound', () => {
        let req, res;
        beforeEach(() => {
            req = {
                user: { userId: 'user123' },
                params: { gameId: 'game-1', roundId: 'round-1' }
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return 404 if game is not found', async () => {
            db.Games.findOne.mockResolvedValue(null);
            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game not found' });
        });

        it('should return 404 if lobby is not found', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', lobby_id: 'lobby-1' });
            db.Lobby.findOne.mockResolvedValue(null);
            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Lobby not found' });
        });

        it('should return 403 if user is not the lobby leader', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', lobby_id: 'lobby-1' });
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'other-user' });
            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Only the leader can finalize the game' });
        });

        it('should return 404 if round is not found', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', lobby_id: 'lobby-1' });
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'user123' });
            db.Rounds.findOne.mockResolvedValue(null);
            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Round not found' });
        });

        it('should return 400 if no scores found for the round', async () => {
            db.Games.findOne.mockResolvedValue({ game_id: 'game-1', lobby_id: 'lobby-1' });
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'user123' });
            db.Rounds.findOne.mockResolvedValue({ round_id: 'round-1' });
            db.RoundResults.findAll.mockResolvedValue([]);

            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'No scores found for this round' });
        });

        it('should finalize the round and start a new round if players remain', async () => {
            // Setup game, lobby, and round
            const fakeGame = { game_id: 'game-1', lobby_id: 'lobby-1', is_active: true, update: jest.fn() };
            db.Games.findOne.mockResolvedValue(fakeGame);
            db.Lobby.findOne.mockResolvedValue({ lobby_id: 'lobby-1', created_by: 'user123' });
            const fakeRound = { round_id: 'round-1', round_number: 1, update: jest.fn() };
            db.Rounds.findOne.mockResolvedValue(fakeRound);

            db.RoundResults.findAll
                .mockResolvedValueOnce([
                    { user_id: 'user123', score: 50 },
                    { user_id: 'user456', score: 30 }
                ])
                .mockResolvedValueOnce([{ user_id: 'user456', eliminated: true }]);

            // Setup for used rounds to determine available mini-games
            db.Rounds.findAll.mockResolvedValue([{ round_game_type: 'miniGame1' }]);

            // Create a new round for next round
            const fakeNextRound = { round_id: 'round-2', round_number: 2, round_game_type: 'miniGame2' };
            db.Rounds.create.mockResolvedValue(fakeNextRound);

            await gamesController.finalizeRound(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Round finalized, next round started',
                eliminatedPlayer: 'user456',
                nextRound: fakeNextRound
            });
        });
    });

    describe('getGameStatus', () => {
        let req, res;
        beforeEach(() => {
            req = { params: { gameId: 'game-1' } };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return 404 if game is not found', async () => {
            db.Games.findOne.mockResolvedValue(null);
            await gamesController.getGameStatus(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game not found' });
        });

        it('should return game status with game and rounds', async () => {
            const fakeGame = { game_id: 'game-1' };
            const fakeRounds = [{ round_id: 'round-1' }];
            db.Games.findOne.mockResolvedValue(fakeGame);
            db.Rounds.findAll.mockResolvedValue(fakeRounds);

            await gamesController.getGameStatus(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ games: fakeGame, rounds: fakeRounds });
        });
    });
})