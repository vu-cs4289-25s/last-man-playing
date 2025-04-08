const { compareSync } = require("bcrypt");
const { UUID } = require("sequelize/lib/data-types");

/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

// In-memory object for RPS
const rpsMoves = {};
const reactionResults = {};

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

    // On "join-lobby" event
    socket.on("join-lobby", ({ lobbyId, userId, username, profilePic }) => {
      console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);

      // Ensure the lobby exists in the lobbyPlayers object
      if (!lobbyPlayers[lobbyId]) {
        lobbyPlayers[lobbyId] = [];
      }

      // Check if player already exists in the lobby
      const playerExists = lobbyPlayers[lobbyId].some(
        (player) => player.user_id === userId
      );
      if (playerExists) {
        console.log(
          `Player with user_id ${userId} already in lobby ${lobbyId}`
        );
        return; // Player already in lobby, do nothing
      }

      // Add the player to the lobby's player list
      lobbyPlayers[lobbyId].push({
        user_id: userId,
        username: username,
        profilePic: profilePic || "https://placekitten.com/40/40", // Fallback image if none provided
      });

      socket.join(`lobby-${lobbyId}`);

      // Emit the updated player list to all users in the lobby
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} joined lobby ${lobbyId}`,
        players: lobbyPlayers[lobbyId], // Send the updated list of players
        creatorId: lobbyPlayers[lobbyId][0]?.user_id, // Assuming the first player is the creator
      });
    });

    // Example: leaving a lobby
    socket.on("leave-lobby", ({ lobbyId, userId }) => {
      console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);

      // Remove the player from the lobby's player list
      if (lobbyPlayers[lobbyId]) {
        lobbyPlayers[lobbyId] = lobbyPlayers[lobbyId].filter(
          (player) => player.user_id !== userId
        );
      }

      socket.leave(`lobby-${lobbyId}`);

      // Emit the updated player list to all users in the lobby
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} left lobby ${lobbyId}`,
        players: lobbyPlayers[lobbyId], // Send the updated list of players
        creatorId: lobbyPlayers[lobbyId][0]?.user_id, // Update creatorId
      });
    });

    // Chat messages
    socket.on("chat-message", (data) => {
      console.log("chat-message received:", data); // log the full incoming payload
      const { lobbyId, username, text } = data;

      console.log(`User ${username} in lobby-${lobbyId} says: ${text}`);

      io.to(`lobby-${lobbyId}`).emit("chat-message", {
        username,
        text,
      });
    });

    // ReactionGame finish
    socket.on("reaction-finished", (data) => {
      const { lobbyId, userId, isOut, totalTimeSec, avgReactionSec } = data;
      console.log(
        "User ${userId} done with ReactionGame in lobby-${lobbyId}",
        data
      );
      if (!reactionResults[lobbyId]) {
        reactionResults[lobbyId] = {};
      }
      reactionResults[lobbyId][userId] = {
        isOut,
        totalTimeSec,
        avgReactionSec,
      };

      const totalPlayers = 6; //CHANGE???
      const doneCount = Object.keys(reactionResults[lobbyId]).length;

      io.to(`lobby-${lobbyId}`).emit("reaction-progress", {
        doneCount,
        totalPlayers,
      });

      if (doneCount >= totalPlayers) {
        const resultsArr = Object.entries(reactionResults[lobbyId]).map(
          ([uId, info]) => ({
            userId: uId,
            ...info,
          })
        );

        const successes = resultsArr.filter((r) => !r.isOut);
        const fails = resultsArr.filter((r) => r.isOut);

        successes.sort((a, b) => a.avgReactionSec - b.avgReactionSec);
        fails.sort((a, b) => b.totalTimeSec - a.totalTimeSec);

        const finalRanking = [...successes, ...fails];

        let points = 100;
        const decr = 10;
        finalRanking.forEach((p) => {
          p.pointsAwarded = points > 0 ? points : 0;
          points -= decr;
        });

        io.to(`lobby-${lobbyId}`).emit("reaction-all-done", {
          finalRanking,
          message:
            "All players done, game over. 5 second countdown to leaderboard...",
        });

        setTimeout(() => {
          io.to(`lobby-${lobbyId}`).emit("reaction-go-leaderboard");
        }, 5000);

        // delete reactionResults[lobbyId];
      }
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
