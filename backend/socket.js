/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

function init(server) {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket connection
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // On "join-lobby" event
    socket.on('join-lobby', ({ lobbyId }) => {
      console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
      socket.join(`lobby-${lobbyId}`);
      io.to(`lobby-${lobbyId}`).emit('lobby-update', {
        msg: `Socket ${socket.id} joined lobby ${lobbyId}`,
      });
    });

    // Example: leaving a lobby
    socket.on('leave-lobby', ({ lobbyId }) => {
      console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);
      socket.leave(`lobby-${lobbyId}`);
      io.to(`lobby-${lobbyId}`).emit('lobby-update', {
        msg: `Socket ${socket.id} left lobby ${lobbyId}`,
      });
    });

    // Example: RPS
    socket.on('rps-move', ({ lobbyId, userId, move }) => {
      io.to(`lobby-${lobbyId}`).emit('rps-move-made', {
        userId,
        move,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call init(server) first.");
  }
  return io;
}

module.exports = { init, getIO };