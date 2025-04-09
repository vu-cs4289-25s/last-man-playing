/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

// In-memory object for RPS
const rpsMoves = {};

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
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join-lobby
    socket.on("join-lobby", ({ lobbyId }) => {
      console.log(`Socket ${socket.id} joined lobby-${lobbyId}`);
      socket.join(`lobby-${lobbyId}`);
      // If you want, broadcast a 'lobby-update' to that room
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} joined lobby-${lobbyId}`,
      });
    });

    // Leave-lobby
    socket.on("leave-lobby", ({ lobbyId }) => {
      console.log(`Socket ${socket.id} left lobby-${lobbyId}`);
      socket.leave(`lobby-${lobbyId}`);
      // If you want, broadcast a 'lobby-update' to that room
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} left lobby-${lobbyId}`,
      });
    });

    // Chat messages
    socket.on("chat-message", ({ lobbyId, userId, text }) => {
      console.log(`User ${userId} in lobby-${lobbyId} says: ${text}`);
      io.to(`lobby-${lobbyId}`).emit("chat-message", { userId, text });
    });

    // RPS moves
    socket.on("rps-move", ({ lobbyId, userId, move }) => {
      console.log(`User ${userId} in lobby-${lobbyId} played ${move}`);
      if (!rpsMoves[lobbyId]) {
        rpsMoves[lobbyId] = {};
      }
      rpsMoves[lobbyId][userId] = move;

      const userIds = Object.keys(rpsMoves[lobbyId]);
      if (userIds.length < 2) {
        return; // Wait for second player
      }

      // Compare first two players
      const [player1Id, player2Id] = userIds;
      const p1Move = rpsMoves[lobbyId][player1Id];
      const p2Move = rpsMoves[lobbyId][player2Id];

      const p1Result = computeRPSWinner(p1Move, p2Move);
      const p2Result = computeRPSWinner(p2Move, p1Move);

      let winner = "tie";
      if (p1Result === "user" && p2Result === "opponent") {
        winner = player1Id;
      } else if (p1Result === "opponent" && p2Result === "user") {
        winner = player2Id;
      }

      // Broadcast the result
      io.to(`lobby-${lobbyId}`).emit("rps-result", {
        player1Id,
        player1Move: p1Move,
        player2Id,
        player2Move: p2Move,
        winner,
      });

      // Clear moves for next round
      rpsMoves[lobbyId] = {};
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
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
