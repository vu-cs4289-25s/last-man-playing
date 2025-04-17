const { compareSync } = require("bcrypt");
const { UUID } = require("sequelize/lib/data-types");
const { Server } = require("socket.io");
const db = require("./models");
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

    // Join-lobby
    socket.on("join-lobby", ({ lobbyId }) => {
      socket.join(`lobby-${lobbyId}`);
      console.log(`Socket ${socket.id} joined lobby-${lobbyId}`);
      // If you want, broadcast a 'lobby-update' to that room
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} joined lobby-${lobbyId}`,
      });
    });

    // Leave-lobby
    socket.on("leave-lobby", ({ lobbyId }) => {
      socket.leave(`lobby-${lobbyId}`);
      console.log(`Socket ${socket.id} left lobby-${lobbyId}`);
      // If you want, broadcast a 'lobby-update' to that room
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        msg: `Socket ${socket.id} left lobby-${lobbyId}`,
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
    socket.on("reaction-finished", async (data) => {
      const { lobbyId, userId, isOut, totalTimeSec, avgReactionSec, username } =
        data;
      console.log(
        "User ${userId} done with ReactionGame in lobby-${lobbyId}",
        data
      );
      if (!reactionResults[lobbyId]) {
        reactionResults[lobbyId] = {};
      }
      reactionResults[lobbyId][userId] = {
        username,
        isOut,
        totalTimeSec,
        avgReactionSec,
      };

      const lobby = await db.Lobby.findOne({ where: { lobby_id: lobbyId } });
      const totalPlayers = lobby ? lobby.num_players : 6;
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
        }); // kept to show players leaderboard before they move to next round

        setTimeout(() => {
          io.to(`lobby-${lobbyId}`).emit("round-finalized");
        }, 2000); // 2 second delay before sending round finalized

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
      // check if this is not adding score properly
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
