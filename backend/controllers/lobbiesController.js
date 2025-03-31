// backend/controllers/lobbiesController.js

const db = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.getLobby = async (req, res) => {
    try {
      const { id } = req.params; // Get lobby ID from URL
      const lobby = await db.Lobby.findOne({ where: { lobby_id: id } });
      
      if (!lobby) {
        return res.status(404).json({ message: 'Lobby not found' });
      }
      
      // Retrieve all participants in the lobby
      const participants = await db.LobbyParticipants.findAll({ where: { lobby_id: id } });
      
      return res.status(200).json({ lobby, participants });
    } catch (error) {
      console.error('Error in getLobby:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
exports.getPublicLobbies = async (req, res) => {
    try {
      // Retrieve all lobbies where is_private is false
      const lobbies = await db.Lobby.findAll({ where: { is_private: false } });

      // For each lobby, calculate the player count and build the response object.
      const publicLobbies = await Promise.all(
        lobbies.map(async (lobby) => {
          const playerCount = await db.LobbyParticipants.count({ where: { lobby_id: lobby.lobby_id } });
          return {
            id: lobby.lobby_id,
            name: lobby.lobby_name,
            playerCount,
            maxPlayers: 6,
            createdAt: lobby.created_at
          };
        })
      );

      return res.status(200).json(publicLobbies);
    } catch (error) {
      console.error('Error in getPublicLobbies:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
exports.createLobby = async (req, res) => {
    try {
        console.log("req.user:", req.user); // Debug: shows token payload
        // Use the correct property from req.user
        const userId = req.user.userId; 
        const { lobby_name, is_private, password } = req.body;

        if (!lobby_name) {
            return res.status(400).json({ message: 'Lobby name is required' });
        }

        if (is_private && !password) {
            return res.status(400).json({ message: 'Password is required for private lobbies' });
        }

        const newLobby = await db.Lobby.create({
            lobby_id: uuidv4(),
            lobby_name,
            is_private: Boolean(is_private),
            password: is_private ? password : null,
            created_by: userId,
            created_at: new Date()
        }, { timestamps: false });  // Disables auto timestamps for this operation

        await db.LobbyParticipants.create({
            lobby_id: newLobby.lobby_id,
            user_id: userId,
            joined_at: new Date()
        });

        return res.status(201).json({
            message: 'Lobby created successfully',
            lobby: newLobby
        });
    } catch ( error ){
        console.error('Error in createLobby:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.joinLobby = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { lobby_id, password } = req.body;

        if (!lobby_id) {
            return res.status(400).json({ message: 'Lobby name is required' });
        }

        // Fetch the lobby
        const lobby = await db.Lobby.findOne({where: { lobby_id }});
        if (!lobby) {
            return res.status(404).json({ message: 'Lobby not found' });
        }

        // Check password
        if (lobby.is_private) {
            if (!password) {
                return res.status(401).json({ message: 'Password is required' });
            }
            if (lobby.password !== password) {
                return res.status(401).json({ message: 'Incorrect is required' });
            }
        }

        // Make sure lobby is not full
        const participantCount = await db.LobbyParticipants.count({ where: {lobby_id}});
        if (participantCount >= 6) {
            return res.status(401).json({ message: 'Lobby is full' });
        }

        // Check if user is already in lobby
        const existingParticipant = await db.LobbyParticipants.findOne({ where: { lobby_id, user_id: userId}});
        if (existingParticipant) {
            res.status(200).json({ message: 'Already in lobby' });
        }
        
        await db.LobbyParticipants.create({
            lobby_id,
            user_id: userId,
            joined_at: new Date()
        })
        
        return res.status(200).json({ message: 'Joined lobby successfully'})
    }
    catch ( error ) {
        console.error('Error in joinLobby:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.leaveLobby = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { lobby_id } = req.body;

        if (!lobby_id){
            return res.status(400).json({message: "LobbyID is required"})
        }

        const participant = await db.LobbyParticipants.findOne({
            where : {lobby_id, user_id: userId}
        });

        if (!participant){
            return res.status(400).json({message: 'You are not in this lobby'})
        }

        const lobby = db.Lobby.findOne({ where: {lobby_id} });
        if (!lobby) {
            return res.status(400).json({message: 'Lobby not found'})
        }

        // Delete the user from the lobby
        await participant.destroy();

        // If user was the party leader, make the next most recent player
        // the new party leader
        if (lobby.created_by === userId){
            const remainingParticipants = await db.LobbyParticipants.findAll({
                where: { lobby_id},
                order: ['joined_at', 'DESC']
            });

            if (remainingParticipants.length === 0){
                await lobby.destroy();
                return res.status(200).json({message: "Lobby has been closed because no participants remain"});

            } else {
                const newLeader = remainingParticipants[0];
                await lobby.update({ created_by: newLeader.user_id })
            }
        }

        return res.status(200).json({message: 'Left lobby successfully'});
    } catch ( error ){
        console.error('Error in leaveLobby:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.removePlayer = async (req, res) => {
    try {
        const requestorId = req.user.userId;
        const { lobby_id, user_id: targetUserId } = req.body;

        if (!lobby_id || !targetUserId) {
            return res.status(400).json({ message: 'lobby_id and user_id are required' });
        }

        const lobby = await db.Lobby.findOne({ where: { lobby_id }});
        if (!lobby){
            return res.status(404).json({ message: 'Lobby not found' });
        }

        if (lobby.created_by !== requestorId) {
            return res.status(403).json({message: 'Only the leader can remove users'});
        }

        const participant = await db.LobbyParticipants.findOne({
            where: {lobby_id, user_id: targetUserId}
        })
        if (!participant){
            return res.status(404).json({ message: 'User not found in this lobby' });
        }

        await participant.destroy();

        // Edge case, the leader tries to kick themselves
        if (lobby.created_by === targetUserId) {
            const remainingParticipants = await db.LobbyParticipants.findAll({
                where: { lobby_id },
                order: [['joined_at', 'DESC']]
            });

            if (remainingParticipants.length === 0) {
                await lobby.destroy();
                return res.status(200).json({ message: 'Lobby closed since no participants remain' });
            } else {
                const newLeader = remainingParticipants[0];
                await lobby.update({ created_by: newLeader.user_id });
            }
        }

        return res.status(200).json({ message: 'User removed successfully' });

    } catch ( error ) {
        console.error('Error in removeUser:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
