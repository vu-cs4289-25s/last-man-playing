/********************************************
 * index.js (Updated with Socket.IO Setup)
 ********************************************/
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const http = require('http');         // (1) Required for Socket.IO
const { Server } = require('socket.io'); // (2) Import the Socket.IO server class

const app = express();
const PORT = process.env.PORT || 4000;

const db = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Server running!');
});


// LOBBY LOGIC (existing code)

let lobbies = [];
let nextLobbyId = 1;

// GET public lobbies
app.get('/lobbies/public', (req, res) => {
  const publicLobbies = lobbies.filter((lobby) => !lobby.private);
  res.json(publicLobbies);
});

app.post('/lobbies/create', (req, res) => {
  const { name, maxPlayers, private: isPrivate } = req.body;
  if (!name || !maxPlayers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newLobby = {
    id: nextLobbyId++,
    name,
    maxPlayers: parseInt(maxPlayers, 10),
    private: !!isPrivate,
    playerCount: 0,
    players: []
  };
  
  lobbies.push(newLobby);
  console.log('Lobby created:', newLobby);
  res.status(201).json(newLobby);
});

app.post('/lobbies/join', (req, res) => {
  const { lobbyId, userId } = req.body;
  if (!lobbyId) {
    return res.status(400).json({ error: 'lobbyId is required' });
  }
  
  const lobby = lobbies.find((lob) => lob.id === parseInt(lobbyId, 10));
  if (!lobby) {
    return res.status(404).json({ error: 'Lobby not found' });
  }
  
  if (lobby.playerCount >= lobby.maxPlayers) {
    return res.status(403).json({ error: 'Lobby is full' });
  }
  
  lobby.playerCount += 1;
  lobby.players.push(userId || `user${Math.floor(Math.random() * 9999)}`);
  
  console.log('User joined lobby:', lobby);
  res.json({ message: 'Joined lobby successfully', lobby });
});

app.get('/lobbies/:id', (req, res) => {
  const lobbyId = parseInt(req.params.id, 10);
  const lobby = lobbies.find((lob) => lob.id === lobbyId);
  if (!lobby) {
    return res.status(404).json({ error: 'Lobby not found' });
  }
  res.json(lobby);
});

// 1) Create an HTTP Server from app
const server = http.createServer(app);


// 2) Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: '*', // or specify your frontend's origin if needed
    methods: ['GET', 'POST']
  }
});


// 3) Add Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Example: You can listen for a "join-lobby" event from a user
  socket.on('join-lobby', (lobbyId) => {
    console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
    // They join a "room" identified by the lobbyId
    socket.join(`lobby-${lobbyId}`);

    // You could broadcast an update to all users in this lobby
    io.to(`lobby-${lobbyId}`).emit('lobby-update', {
      msg: `User ${socket.id} joined lobby ${lobbyId}`
    });
  });

  // Example: Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


// 4) Sync DB and start server with server.listen()
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized! (alter: true)');
    // Instead of app.listen(...), we now do server.listen(...)
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Host:', process.env.SUPABASE_DB_HOST);
    console.log('Port:', process.env.SUPABASE_DB_PORT);
    console.log('Error syncing database', err);
  });