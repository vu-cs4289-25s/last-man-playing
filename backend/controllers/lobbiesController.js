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
    const { lobby_name, is_private = false, password = null, user_id } = req.body;
    
    // Require a user_id for lobby creation (since the creator must be logged in)
    if (!user_id) {
      return res.status(401).json({ message: 'User must be logged in to create a lobby' });
    }
    const creatorId = user_id;

    if (!lobby_name) {
      return res.status(400).json({ message: 'Lobby name is required' });
    }

    // Verify that the user exists (do not auto-create for logged-in users)
    const existingUser = await db.User.findOne({ where: { user_id: creatorId } });
    if (!existingUser) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // Create the Lobby
    const newLobbyId = uuidv4();
    const newLobby = await db.Lobby.create({
      lobby_id: newLobbyId,
      lobby_name,
      is_private: Boolean(is_private),
      password: is_private ? password : null,
      created_by: creatorId,
      created_at: new Date()
    }, { timestamps: false });

    // Add the creator to LobbyParticipants
    await db.LobbyParticipants.create({
      lobby_id: newLobbyId,
      user_id: creatorId,
      joined_at: new Date()
    });

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
exports.joinLobby = async (req, res) => {
  try {
    const { lobby_id, password = null, user_id } = req.body;
    if (!lobby_id) {
      return res.status(400).json({ message: 'lobby_id is required' });
    }

    // Require a user_id for authenticated users
    if (!user_id) {
      return res.status(401).json({ message: 'User must be logged in to join a lobby' });
    }
    const joinerId = user_id; // Use the provided user_id directly

    // Find the lobby
    const lobby = await db.Lobby.findOne({ where: { lobby_id } });
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check private lobby password if needed
    if (lobby.is_private) {
      if (!password) {
        return res.status(401).json({ message: 'Password is required for private lobbies' });
      }
      if (lobby.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    // Check if the lobby is full
    const participantCount = await db.LobbyParticipants.count({ where: { lobby_id } });
    if (participantCount >= 6) {
      return res.status(401).json({ message: 'Lobby is full' });
    }

    // Check if user is already in the lobby
    const existingParticipant = await db.LobbyParticipants.findOne({
      where: { lobby_id, user_id: joinerId }
    });
    if (existingParticipant) {
      return res.status(200).json({ message: 'Already in lobby' });
    }

    // Now, verify that the user actually exists in the DB.
    const existingUser = await db.User.findOne({ where: { user_id: joinerId } });
    if (!existingUser) {
      // For logged-in users, not finding the user means something's wrong.
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // Add user to lobby participants
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