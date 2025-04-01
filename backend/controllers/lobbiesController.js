/************************************************
 * File: backend/controllers/lobbiesController.js
 ************************************************/
const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket'); // if you want to broadcast from here

exports.getPublicLobbies = async (req, res) => {
  try {
    // Return all non-private lobbies
    const lobbies = await db.Lobby.findAll({ where: { is_private: false } });

    // Build response with participant count
    const publicLobbies = await Promise.all(
      lobbies.map(async (lobby) => {
        const playerCount = await db.LobbyParticipants.count({
          where: { lobby_id: lobby.lobby_id }
        });
        return {
          id: lobby.lobby_id,
          name: lobby.lobby_name,
          playerCount,
          maxPlayers: 6,
          createdAt: lobby.created_at
        };
      })
    );

    res.status(200).json(publicLobbies);
  } catch (error) {
    console.error('Error in getPublicLobbies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// CREATE a new lobby
exports.createLobby = async (req, res) => {
    try {
      const {
        lobby_name,
        is_private = false,
        password = null,
        user_id
      } = req.body;
  
      // Simple fallback if no user_id is provided
      const creatorId = user_id || uuidv4();
  
      if (!lobby_name) {
        return res.status(400).json({ message: 'Lobby name is required' });
      }
  
      // 1) Ensure user with creatorId actually exists in the DB
      let existingUser = await db.User.findOne({ where: { user_id: creatorId } });
      if (!existingUser) {
        // Create a placeholder user with the needed fields
        existingUser = await db.User.create({
          user_id: creatorId,
          username: 'Guest-' + creatorId.slice(0, 8),
          email: `guest-${creatorId.slice(0, 8)}@example.com`,
          password_hash: 'somePlaceholderHash'
        });
      }
  
      // 2) Create the Lobby
      const newLobbyId = uuidv4();
      const newLobby = await db.Lobby.create({
        lobby_id: newLobbyId,
        lobby_name,
        is_private: Boolean(is_private),
        password: is_private ? password : null,
        created_by: creatorId,  // references the user you just ensured
        created_at: new Date()
      }, { timestamps: false });
  
      // 3) Add the creator to LobbyParticipants
      await db.LobbyParticipants.create({
        lobby_id: newLobbyId,
        user_id: creatorId,
        joined_at: new Date()
      });
  
      // 4) Return success
      return res.status(201).json({
        message: 'Lobby created successfully',
        lobby: newLobby
      });
    } catch (error) {
      console.error('Error in createLobby:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
// File: backend/controllers/lobbiesController.js

// JOIN a lobby
exports.joinLobby = async (req, res) => {
    try {
      const { lobby_id, password = null, user_id } = req.body;
      if (!lobby_id) {
        return res.status(400).json({ message: 'lobby_id is required' });
      }
  
      // 1) Use provided user_id or generate one
      const joinerId = user_id || uuidv4();
  
      // 2) Find the lobby
      const lobby = await db.Lobby.findOne({ where: { lobby_id } });
      if (!lobby) {
        return res.status(404).json({ message: 'Lobby not found' });
      }
  
      // 3) If the lobby is private, check password
      if (lobby.is_private) {
        if (!password) {
          return res.status(401).json({ message: 'Password is required for private lobbies' });
        }
        if (lobby.password !== password) {
          return res.status(401).json({ message: 'Incorrect password' });
        }
      }
  
      // 4) Check if lobby is full
      const participantCount = await db.LobbyParticipants.count({ where: { lobby_id } });
      if (participantCount >= 6) {
        return res.status(401).json({ message: 'Lobby is full' });
      }
  
      // 5) Check if user is already in the lobby
      const existingParticipant = await db.LobbyParticipants.findOne({
        where: { lobby_id, user_id: joinerId }
      });
      if (existingParticipant) {
        return res.status(200).json({ message: 'Already in lobby' });
      }
  
      // 6) Ensure user with joinerId actually exists in the DB
      let existingUser = await db.User.findOne({ where: { user_id: joinerId } });
      if (!existingUser) {
        // Create a placeholder user with the required fields
        existingUser = await db.User.create({
          user_id: joinerId,
          username: 'Guest-' + joinerId.slice(0, 8),
          email: `guest-${joinerId.slice(0, 8)}@example.com`,
          password_hash: 'somePlaceholderHash'
        });
      }
  
      // 7) Add user to lobby participants
      await db.LobbyParticipants.create({
        lobby_id,
        user_id: joinerId,
        joined_at: new Date()
      });
  
      return res.status(200).json({ message: 'Joined lobby successfully', userId: joinerId });
    } catch (error) {
      console.error('Error in joinLobby:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Leave a lobby
exports.leaveLobby = async (req, res) => {
  try {
    const { lobby_id, user_id } = req.body;
    if (!lobby_id || !user_id) {
      return res.status(400).json({ message: 'lobby_id and user_id are required' });
    }

    const participant = await db.LobbyParticipants.findOne({ where: { lobby_id, user_id } });
    if (!participant) {
      return res.status(400).json({ message: 'You are not in this lobby' });
    }

    const lobby = await db.Lobby.findOne({ where: { lobby_id } });
    if (!lobby) {
      return res.status(400).json({ message: 'Lobby not found' });
    }

    // Remove the user
    await participant.destroy();

    // If user was the leader, promote next participant or destroy the lobby
    if (lobby.created_by === user_id) {
      const remaining = await db.LobbyParticipants.findAll({
        where: { lobby_id },
        order: [['joined_at', 'DESC']]
      });

      if (remaining.length === 0) {
        await lobby.destroy();
        return res.status(200).json({ message: 'Lobby closed (no participants remain)' });
      } else {
        const newLeader = remaining[0];
        await lobby.update({ created_by: newLeader.user_id });
      }
    }

    // Optionally broadcast
    // getIO().to(`lobby-${lobby_id}`).emit('lobby-update', { user_id, action: 'left' });

    return res.status(200).json({ message: 'Left lobby successfully' });
  } catch (error) {
    console.error('Error in leaveLobby:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a player (optional; still no auth)
exports.removePlayer = async (req, res) => {
  try {
    const { lobby_id, requestor_id, target_user_id } = req.body;
    if (!lobby_id || !requestor_id || !target_user_id) {
      return res.status(400).json({ message: 'lobby_id, requestor_id, and target_user_id are required' });
    }

    const lobby = await db.Lobby.findOne({ where: { lobby_id } });
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Only the lobby leader can remove a player
    if (lobby.created_by !== requestor_id) {
      return res.status(403).json({ message: 'Only the lobby leader can remove players' });
    }

    const participant = await db.LobbyParticipants.findOne({
      where: { lobby_id, user_id: target_user_id }
    });
    if (!participant) {
      return res.status(404).json({ message: 'User not found in this lobby' });
    }

    await participant.destroy();

    // If the leader removed themselves, choose a new leader or destroy the lobby
    if (lobby.created_by === target_user_id) {
      const remaining = await db.LobbyParticipants.findAll({
        where: { lobby_id },
        order: [['joined_at', 'DESC']]
      });

      if (remaining.length === 0) {
        await lobby.destroy();
        return res.status(200).json({ message: 'Lobby closed (no participants remain)' });
      } else {
        const newLeader = remaining[0];
        await lobby.update({ created_by: newLeader.user_id });
      }
    }

    // Optionally broadcast
    // getIO().to(`lobby-${lobby_id}`).emit('lobby-update', { removed: target_user_id });

    return res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error in removeUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// (Optional) GET /api/lobbies/:id
exports.getLobby = async (req, res) => {
  try {
    const { id } = req.params;
    const lobby = await db.Lobby.findOne({ where: { lobby_id: id } });
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    const participants = await db.LobbyParticipants.findAll({ where: { lobby_id: id } });
    return res.status(200).json({ lobby, participants });
  } catch (error) {
    console.error('Error in getLobby:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};