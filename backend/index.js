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
const lobbyRoutes = require('./routes/lobbies');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lobbies', lobbyRoutes)

app.get('/', (req, res) => {
  res.send('Server running!');
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