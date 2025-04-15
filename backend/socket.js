const { compareSync } = require("bcrypt");
const { UUID } = require("sequelize/lib/data-types");

/************************************************
 * File: backend/socket.js
 ************************************************/
let io;

// In-memory object for RPS
const rpsMoves = {};
const reactionResults = {};
const lobbies = {};

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

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-lobby", ({ lobbyId, userId, username, profilePic }) => {
      // Validate required fields
      if (!userId || !username) {
        console.log("Invalid join attempt - missing required fields:", {
          userId,
          username,
        });
        return;
      }

      console.log(`Socket ${socket.id} joining lobby ${lobbyId} with data:`, {
        userId,
        username,
        profilePic,
      });

      // Initialize lobby if it doesn't exist
      if (!lobbies[lobbyId]) {
        console.log("Creating new lobby");
        lobbies[lobbyId] = {
          players: [],
          gameStarted: false,
          creatorId: userId,
        };
      }

      // Check if player already exists in the lobby
      const playerExists = lobbies[lobbyId].players.some(
        (p) => p.userId === userId
      );

      console.log("Player exists:", playerExists);
      console.log("Current players in lobby:", lobbies[lobbyId].players);

      if (!playerExists) {
        // Add player to lobby if not already present
        const newPlayer = {
          userId,
          username,
          lives: 3,
          profilePic: profilePic || "https://placekitten.com/40/40",
        };
        console.log("Adding new player:", newPlayer);
        lobbies[lobbyId].players.push(newPlayer);
      }

      // Join the socket room
      socket.join(`lobby-${lobbyId}`);

      // Emit lobby update with creator info
      const updateData = {
        action: "join",
        players: lobbies[lobbyId].players,
        creatorId: lobbies[lobbyId].creatorId,
        message: `${username} joined the lobby`,
      };
      console.log("Emitting lobby update:", updateData);
      io.to(`lobby-${lobbyId}`).emit("lobby-update", updateData);

      console.log(
        `Lobby ${lobbyId} now has ${lobbies[lobbyId].players.length} players`
      );
      console.log(`Lobby creator is: ${lobbies[lobbyId].creatorId}`);
    });

    socket.on("start-game", ({ lobbyId }) => {
      console.log(`Attempting to start game in lobby ${lobbyId}`);

      if (!lobbies[lobbyId]) {
        console.error(`No lobby found with ID ${lobbyId}`);
        return;
      }

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
        players: lobbies[lobbyId].players,
        creatorId: lobbies[lobbyId].creatorId,
        message: "Game started!",
      });

      // Emit game-started event
      io.to(`lobby-${lobbyId}`).emit("game-started", {
        gameId: lobbyId,
        roundId: Date.now().toString(),
      });
    });

    // Chat messages
    socket.on("chat-message", (data) => {
      console.log("chat-message received:", data);
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
        `User ${userId} done with ReactionGame in lobby-${lobbyId}`,
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

      const totalPlayers = lobbies[lobbyId]?.players.length || 0;
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

    socket.on("submit-answer", ({ lobbyId, answer }) => {
      if (!lobbies[lobbyId]) return;

      const lobby = lobbies[lobbyId];
      const currentPlayer = lobby.players[lobby.currentPlayerIndex];
      const correctAnswer = lobby.question.num1 * lobby.question.num2;
      const isCorrect = parseInt(answer) === correctAnswer;

      if (isCorrect) {
        // Add points for correct answer
        currentPlayer.score = (currentPlayer.score || 0) + 10;
      } else {
        // Decrease player's life
        currentPlayer.lives--;

        // Check if player is out of lives
        if (currentPlayer.lives <= 0) {
          // Remove player from the game and record their final position
          currentPlayer.finalPosition =
            lobby.players.filter((p) => p.lives > 0).length + 1;
          // Move player to eliminated players array
          if (!lobby.eliminatedPlayers) {
            lobby.eliminatedPlayers = [];
          }
          lobby.eliminatedPlayers.push(currentPlayer);
          lobby.players = lobby.players.filter((p) => p.lives > 0);
        }
      }

      // Check if game is over (only one player left)
      if (lobby.players.length <= 1) {
        // Set the winner's final position and score
        const winner = lobby.players[0];
        winner.finalPosition = 1;
        winner.score = (winner.score || 0) + 50; // Bonus points for winning

        // Combine active and eliminated players
        const allPlayers = [
          ...lobby.players,
          ...(lobby.eliminatedPlayers || []),
        ];
        // Sort players by final position
        const sortedPlayers = allPlayers.sort(
          (a, b) => a.finalPosition - b.finalPosition
        );

        console.log("Game over - sending players:", sortedPlayers); // Add logging

        // Emit game-over event with all players
        io.to(`lobby-${lobbyId}`).emit("game-over", {
          winner: winner,
          players: sortedPlayers,
          message: "Game Over!",
        });

        // Reset the lobby state
        delete lobbies[lobbyId];
        return;
      }

      // Move to next player
      lobby.currentPlayerIndex =
        (lobby.currentPlayerIndex + 1) % lobby.players.length;
      lobby.question = generateQuestion();

      // Emit next turn event
      io.to(`lobby-${lobbyId}`).emit("next-turn", {
        players: lobby.players,
        currentPlayerIndex: lobby.currentPlayerIndex,
        question: lobby.question,
        previousAnswer: {
          correct: isCorrect,
          answer: correctAnswer,
        },
      });
    });

    socket.on("time-out", ({ lobbyId }) => {
      if (!lobbies[lobbyId]) return;

      const lobby = lobbies[lobbyId];
      const currentPlayer = lobby.players[lobby.currentPlayerIndex];

      // Decrease player's life
      currentPlayer.lives--;

      // Check if player is out of lives
      if (currentPlayer.lives <= 0) {
        // Remove player from the game and record their final position
        currentPlayer.finalPosition =
          lobby.players.filter((p) => p.lives > 0).length + 1;
        // Move player to eliminated players array
        if (!lobby.eliminatedPlayers) {
          lobby.eliminatedPlayers = [];
        }
        lobby.eliminatedPlayers.push(currentPlayer);
        lobby.players = lobby.players.filter((p) => p.lives > 0);
      }

      // Check if game is over (only one player left)
      if (lobby.players.length <= 1) {
        // Set the winner's final position and score
        const winner = lobby.players[0];
        winner.finalPosition = 1;
        winner.score = (winner.score || 0) + 50; // Bonus points for winning

        // Combine active and eliminated players
        const allPlayers = [
          ...lobby.players,
          ...(lobby.eliminatedPlayers || []),
        ];
        // Sort players by final position
        const sortedPlayers = allPlayers.sort(
          (a, b) => a.finalPosition - b.finalPosition
        );

        console.log("Game over - sending players:", sortedPlayers); // Add logging

        // Emit game-over event with all players
        io.to(`lobby-${lobbyId}`).emit("game-over", {
          winner: winner,
          players: sortedPlayers,
          message: "Game Over!",
        });

        // Reset the lobby state
        delete lobbies[lobbyId];
        return;
      }

      // Move to next player
      lobby.currentPlayerIndex =
        (lobby.currentPlayerIndex + 1) % lobby.players.length;
      lobby.question = generateQuestion();

      // Emit next turn event
      io.to(`lobby-${lobbyId}`).emit("next-turn", {
        players: lobby.players,
        currentPlayerIndex: lobby.currentPlayerIndex,
        question: lobby.question,
        previousAnswer: {
          correct: false,
          answer: lobby.question.num1 * lobby.question.num2,
        },
      });
    });

    function generateQuestion() {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      return { num1, num2 };
    }

    socket.on("check-game-status", ({ lobbyId }) => {
      console.log(`Checking game status for lobby ${lobbyId}`);
      if (lobbies[lobbyId]) {
        socket.emit("game-status", {
          gameStarted: lobbies[lobbyId].gameStarted,
          players: lobbies[lobbyId].players,
        });
      }
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
