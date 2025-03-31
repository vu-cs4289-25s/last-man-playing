/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*', // or specify your frontend's origin if needed
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
  });

  // This is where you set up your real-time events
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // When front-end calls socket.emit('join-lobby', { lobbyId })
    socket.on('join-lobby', ({ lobbyId }) => {
      console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
      socket.join(`lobby-${lobbyId}`);
      // Example broadcast to that lobby’s room
      io.to(`lobby-${lobbyId}`).emit('lobby-update', {
        msg: `User ${socket.id} joined lobby ${lobbyId}`
      });
    });

    socket.on('leave-lobby', ({ lobbyId }) => {
      console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);
      socket.leave(`lobby-${lobbyId}`);
      io.to(`lobby-${lobbyId}`).emit('lobby-update', {
        msg: `User ${socket.id} left lobby ${lobbyId}`
      });
    });

    // Example RPS event
    socket.on('rps-move', ({ lobbyId, userId, move }) => {
      // Broadcast the move to everyone in the same room
      io.to(`lobby-${lobbyId}`).emit('rps-move-made', {
        userId,
        move
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