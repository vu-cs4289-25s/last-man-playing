/************************************************
 * File: backend/index.js
 ************************************************/
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const http = require('http');
const db = require('./models');
const path = require('path');

// Import your routes (no auth needed for lobbies)
const authRoutes = require('./routes/auth');   // if you still want them
const userRoutes = require('./routes/user');   // if you still want them
const lobbyRoutes = require('./routes/lobbies');
const gameRoutes = require('./routes/games');

// Import the Socket.IO initializer
const { init: initSocket } = require('./socket');

// listen for server400 here?
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/games', gameRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
})

// Health check route
app.get('/', (req, res) => {
  res.send('Server running!');
});

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Sync DB, then start listening
db.sequelize.sync({alter: true})
  .then(async () => {
    console.log('Database synchronized! (alter: true)');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database', err);
  });