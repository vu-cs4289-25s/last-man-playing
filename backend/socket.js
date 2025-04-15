// /************************************************
//  * File: backend/socket.js
//  ************************************************/
let io;
const lobbies = {}; // This is the correct persistent object for all lobbies

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
      lobbies[lobbyId].currentPlayerIndex = 0;
      lobbies[lobbyId].question = generateQuestion();

      io.to(`lobby-${lobbyId}`).emit("game-started", {
        players: lobbies[lobbyId].players,
        currentPlayerIndex: 0,
        question: lobbies[lobbyId].question,
        message: "Game has started!",
      });

      console.log(
        `Game started in lobby ${lobbyId} with ${lobbies[lobbyId].players.length} players`
      );
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
