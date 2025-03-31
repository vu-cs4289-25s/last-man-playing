/************************************************
 * File: backend/index.js
 ************************************************/
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const http = require('http');
const db = require('./models');

// Import your routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lobbyRoutes = require('./routes/lobbies');
const gameRoutes = require('./routes/games');

// Import the socket initializer
const { init: initSocket } = require('./socket');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/games', gameRoutes);

// Basic check route
app.get('/', (req, res) => {
  res.send('Server running!');
});

// Create HTTP server from express app
const server = http.createServer(app);

// Initialize socket.io
initSocket(server);

// Sync DB, then start server
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized! (alter: true)');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database', err);
  });