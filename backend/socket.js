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
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Initialize lobbies object to store active lobbies
  const lobbies = {};

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-lobby", ({ lobbyId, userId, username, profilePic }) => {
      console.log(`Socket ${socket.id} joining lobby ${lobbyId}`);

      // Initialize lobby if it doesn't exist
      if (!lobbies[lobbyId]) {
        lobbies[lobbyId] = {
          players: [],
          gameStarted: false,
          creatorId: userId, // Set the first player as creator
        };
      }

      // Add player to lobby if not already present
      const playerExists = lobbies[lobbyId].players.some(
        (p) => p.userId === userId
      );
      if (!playerExists) {
        lobbies[lobbyId].players.push({
          userId,
          username: username || `Player ${lobbies[lobbyId].players.length + 1}`,
          lives: 3,
          profilePic: profilePic,
        });
      }

      // Join the socket room
      socket.join(`lobby-${lobbyId}`);

      // Emit lobby update with creator info
      io.to(`lobby-${lobbyId}`).emit("lobby-update", {
        action: "join",
        players: lobbies[lobbyId].players,
        creatorId: lobbies[lobbyId].creatorId,
        message: `${username || userId} joined the lobby`,
      });

      console.log(
        `Lobby ${lobbyId} now has ${lobbies[lobbyId].players.length} players`
      );
      console.log(`Lobby creator is: ${lobbies[lobbyId].creatorId}`);
    });

    // Handle starting the game
    socket.on("start-game", ({ lobbyId }) => {
      console.log(`Attempting to start game in lobby ${lobbyId}`);

      if (!lobbies[lobbyId]) {
        console.error(`No lobby found with ID ${lobbyId}`);
        return;
      }

      // Set game as started
      lobbies[lobbyId].gameStarted = true;

      // Initialize players with lives
      const gamePlayers = lobbies[lobbyId].players.map((player) => ({
        ...player,
        lives: 3,
      }));

      // Update the lobby's players
      lobbies[lobbyId].players = gamePlayers;

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
