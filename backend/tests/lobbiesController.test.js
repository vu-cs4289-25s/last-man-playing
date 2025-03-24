// backend/tests/lobbiesController.test.js

const { getLobby, getPublicLobbies, createLobby } = require('../controllers/lobbiesController');
const db = require('../models');
const { v4: uuidv4 } = require('uuid');

// --- Mock the database models ---
jest.mock('../models', () => ({
  Lobby: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  },
  LobbyParticipants: {
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  }
}));

describe('lobbiesController', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests for getLobby ---
  describe('getLobby', () => {
    it('should return 404 if lobby not found', async () => {
      const req = { params: { id: 'non-existent-id' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.Lobby.findOne.mockResolvedValue(null);

      await getLobby(req, res);
      
      expect(db.Lobby.findOne).toHaveBeenCalledWith({ where: { lobby_id: 'non-existent-id' } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lobby not found' });
    });

    it('should return lobby and participants if found', async () => {
      const lobbyMock = { lobby_id: 'test-id', lobby_name: 'Test Lobby' };
      const participantsMock = [{ id: 1, lobby_id: 'test-id', user_id: 'user1' }];

      const req = { params: { id: 'test-id' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.Lobby.findOne.mockResolvedValue(lobbyMock);
      db.LobbyParticipants.findAll.mockResolvedValue(participantsMock);

      await getLobby(req, res);

      expect(db.Lobby.findOne).toHaveBeenCalledWith({ where: { lobby_id: 'test-id' } });
      expect(db.LobbyParticipants.findAll).toHaveBeenCalledWith({ where: { lobby_id: 'test-id' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ lobby: lobbyMock, participants: participantsMock });
    });
  });

  // --- Tests for getPublicLobbies ---
  describe('getPublicLobbies', () => {
    it('should return an array of public lobbies', async () => {
      const lobby1 = { lobby_id: 'id1', lobby_name: 'Lobby One', created_at: '2025-03-24T11:01:52.937Z' };
      const lobby2 = { lobby_id: 'id2', lobby_name: 'Lobby Two', created_at: '2025-03-24T11:02:00.000Z' };

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.Lobby.findAll.mockResolvedValue([lobby1, lobby2]);
      // Each lobby returns a player count of 1
      db.LobbyParticipants.count.mockResolvedValue(1);

      await getPublicLobbies(req, res);

      expect(db.Lobby.findAll).toHaveBeenCalledWith({ where: { is_private: false } });
      expect(db.LobbyParticipants.count).toHaveBeenCalledTimes(2);
      
      const expectedOutput = [
        {
          id: 'id1',
          name: 'Lobby One',
          playerCount: 1,
          maxPlayers: 6,
          createdAt: '2025-03-24T11:01:52.937Z'
        },
        {
          id: 'id2',
          name: 'Lobby Two',
          playerCount: 1,
          maxPlayers: 6,
          createdAt: '2025-03-24T11:02:00.000Z'
        }
      ];
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedOutput);
    });
  });

  // --- Tests for createLobby ---
  describe('createLobby', () => {
    it('should return 400 if lobby name is missing', async () => {
      const req = {
        body: { lobby_name: '', is_private: false, password: null },
        user: { userId: 'user-123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createLobby(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lobby name is required' });
    });

    it('should create lobby successfully', async () => {
      const req = {
        body: { lobby_name: 'New Lobby', is_private: false, password: null },
        user: { userId: 'user-123' }
      };

      const lobbyCreated = {
        lobby_id: 'lobby-123',
        lobby_name: 'New Lobby',
        is_private: false,
        password: null,
        created_by: 'user-123',
        created_at: new Date().toISOString()
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.Lobby.create.mockResolvedValue(lobbyCreated);
      db.LobbyParticipants.create.mockResolvedValue({ id: 1 });

      await createLobby(req, res);

      expect(db.Lobby.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lobby_name: 'New Lobby',
          is_private: false,
          password: null,
          created_by: 'user-123'
        }),
        { timestamps: false }
      );
      expect(db.LobbyParticipants.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lobby created successfully',
        lobby: lobbyCreated
      });
    });
  });
});
