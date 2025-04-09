// /************************************************
//  * File: backend/socket.js
//  ************************************************/
// let io;

// function init(server) {
//   const { Server } = require('socket.io');

//   io = new Server(server, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   // Socket connection
//   io.on('connection', (socket) => {
//     console.log('New client connected:', socket.id);

//     // On "join-lobby" event
//     socket.on('join-lobby', ({ lobbyId }) => {
//       console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
//       socket.join(`lobby-${lobbyId}`);
//       io.to(`lobby-${lobbyId}`).emit('lobby-update', {
//         msg: `Socket ${socket.id} joined lobby ${lobbyId}`,
//       });
//     });

//     // Example: leaving a lobby
//     socket.on('leave-lobby', ({ lobbyId }) => {
//       console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);
//       socket.leave(`lobby-${lobbyId}`);
//       io.to(`lobby-${lobbyId}`).emit('lobby-update', {
//         msg: `Socket ${socket.id} left lobby ${lobbyId}`,
//       });
//     });

//     //Example: Chat messages (added)
//     socket.on('chat-message', async ({ lobbyId, userId, text }) => {
//       console.log(`User ${userId} sent a chat in lobby ${lobbyId}: ${text}`);
//       // await db.ChatMessages.create({
//       //   lobby_id: lobbyId,
//       //   user_id: userId,
//       //   text,
//       //   created_at: new Date(),
//       // });
//       io.to(`lobby-${lobbyId}`).emit("chat-message", {
//         userId,
//         text,
//       });
//     });

//     // Example: RPS
//     // socket.on('rps-move', ({ lobbyId, userId, move }) => {
//     //   io.to(`lobby-${lobbyId}`).emit('rps-move-made', {
//     //     userId,
//     //     move,
//     //   });
//     // });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected:', socket.id);
//     });
//   });

//   return io;
// }

// function getIO() {
//   if (!io) {
//     throw new Error("Socket.io not initialized! Call init(server) first.");
//   }
//   return io;
// }

// module.exports = { init, getIO };

// /************************************************
//  * File: backend/socket.js
//  ************************************************/
// let io;

// function init(server) {
//   const { Server } = require('socket.io');

//   io = new Server(server, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   // Socket connection
//   io.on('connection', (socket) => {
//     console.log('New client connected:', socket.id);

//     // On "join-lobby" event
//     socket.on('join-lobby', ({ lobbyId }) => {
//       socket.join(`lobby-${lobbyId}`);
//       console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
//       io.to(`lobby-${lobbyId}`).emit('lobby-update', {
//         msg: `Socket ${socket.id} joined lobby ${lobbyId}`,
//       });
//     });

//     // Example: leaving a lobby
//     socket.on('leave-lobby', ({ lobbyId }) => {
//       console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);
//       socket.leave(`lobby-${lobbyId}`);
//       io.to(`lobby-${lobbyId}`).emit('lobby-update', {
//         msg: `Socket ${socket.id} left lobby ${lobbyId}`,
//       });
//     });

//     //Example: Chat messages (added)
//     socket.on('chat-message', async ({ lobbyId, userId, text }) => {
//       // await db.ChatMessages.create({
//       //   lobby_id: lobbyId,
//       //   user_id: userId,
//       //   text,
//       //   created_at: new Date(),
//       // });
//       io.to(`lobby-${lobbyId}`).emit("chat-message", {
//         userId,
//         text,
//       });
//       console.log(`User ${userId} sent a chat in lobby ${lobbyId}: ${text}`);

//     });

//     // Example: RPS
//     // socket.on('rps-move', ({ lobbyId, userId, move }) => {
//     //   io.to(`lobby-${lobbyId}`).emit('rps-move-made', {
//     //     userId,
//     //     move,
//     //   });
//     // });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected:', socket.id);
//     });
//   });

//   return io;
// }

// function getIO() {
//   if (!io) {
//     throw new Error("Socket.io not initialized! Call init(server) first.");
//   }
//   return io;
// }

// module.exports = { init, getIO };

let io;

// In-memory object: { lobbyId: { userId: "rock"/"paper"/"scissors" } }

// Helper to compute a single round’s winner

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
      socket.join(`lobby-${lobbyId}`);
      console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);
    });

    // Example: leaving a lobby
    socket.on('leave-lobby', ({ lobbyId }) => {
      console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);
      socket.leave(`lobby-${lobbyId}`);
    });

    //Example: Chat messages (added)
    socket.on('chat-message', async ({ lobbyId, userId, text }) => {
      console.log(`User ${userId} in lobby-${lobbyId} says: ${text}`);
      // Broadcast to everyone in the same lobby
      io.to(`lobby-${lobbyId}`).emit("chat-message", { userId, text });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Example: RPS
    // socket.on('rps-move', ({ lobbyId, userId, move }) => {
    //   io.to(`lobby-${lobbyId}`).emit('rps-move-made', {
    //     userId,
    //     move,
    //   });
    // });



  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call init(server) first.");
  }
  return io;
}

module.exports = { init, getIO };