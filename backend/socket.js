/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

// In-memory object: { lobbyId: { userId: "rock"/"paper"/"scissors" } }
const rpsMoves = {};

// Helper to compute a single round’s winner
function computeRPSWinner(userMove, opponentMove) {
  if (userMove === opponentMove) return "tie";
  if (
    (userMove === "rock" && opponentMove === "scissors") ||
    (userMove === "paper" && opponentMove === "rock") ||
    (userMove === "scissors" && opponentMove === "paper")
  ) {
    return "user";
  }
  return "opponent";
}

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

    // -------------------------------------------
    // ROCK-PAPER-SCISSORS EVENT
    // -------------------------------------------
    socket.on('rps-move', ({ lobbyId, userId, move }) => {
      // 1) Record the user's move
      if (!rpsMoves[lobbyId]) {
        rpsMoves[lobbyId] = {};
      }
      rpsMoves[lobbyId][userId] = move; // e.g. 'rock'

      // 2) Check how many players have moves in this lobby
      const userIds = Object.keys(rpsMoves[lobbyId]);
      if (userIds.length < 2) {
        // We need at least 2 players. Wait for the second one.
        return;
      }

      // For simplicity: pick the first two distinct users in this lobby
      const [player1Id, player2Id] = userIds;
      const player1Move = rpsMoves[lobbyId][player1Id];
      const player2Move = rpsMoves[lobbyId][player2Id];

      // 3) Compute each player's result
      const p1Result = computeRPSWinner(player1Move, player2Move); // "user"|"opponent"|"tie"
      const p2Result = computeRPSWinner(player2Move, player1Move); // reverse

      // For clarity, map "user" -> that user is the winner, "opponent" -> that user lost
      let winner = "tie";
      if (p1Result === "user" && p2Result === "opponent") {
        winner = player1Id; // The actual userId who won
      } else if (p1Result === "opponent" && p2Result === "user") {
        winner = player2Id;
      }

      // 4) Broadcast the result to the entire lobby
      // Everyone in `lobby-<lobbyId>` will get 'rps-result'
      io.to(`lobby-${lobbyId}`).emit('rps-result', {
        player1Id,
        player1Move,
        player2Id,
        player2Move,
        winner, // either player1Id, player2Id, or "tie"
      });

      // 5) Clear out the moves (optional) if you want fresh moves each round
      rpsMoves[lobbyId] = {};
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