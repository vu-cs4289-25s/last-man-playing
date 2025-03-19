const db = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.getLobby = async (req, res) => {

}

exports.getPublicLobbies = async (req, res) => {

}

exports.createLobby = async (req, res) => {
    try {
        const userId = req.user.user_id;
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
        });

        await db.LobbyParticpants.create({
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
}

exports.joinLobby = async (req, res) => {
    try {
        const userId = req.user.user_id;
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
        const participantCount = await db.LobbyParticpants.count({ where: {lobby_id}});
        if (participantCount >= 6) {
            return res.status(401).json({ message: 'Lobby is full' });
        }

        // Check if user is already in lobby
        const existingParticipant = await db.LobbyParticpants.findOne({ where: { lobby_id, user_id: userId}});
        if (existingParticipant) {
            res.status(200).json({ message: 'Already in lobby' });
        }
        
        await db.LobbyParticpants.create({
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

}

exports.removePlayer = async (req, res) => {

}
