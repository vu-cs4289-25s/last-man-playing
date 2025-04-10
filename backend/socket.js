// /************************************************
//  * File: backend/socket.js
//  ************************************************/
// let io;
// const lobbyPlayers = {}; // Object to keep track of players in each lobby

// function init(server) {
//   const { Server } = require("socket.io");

//   io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   // Socket connection
//   io.on("connection", (socket) => {
//     console.log("New client connected:", socket.id);

//     // On "join-lobby" event
//     socket.on("join-lobby", ({ lobbyId, userId, username, profilePic }) => {
//       console.log(`Socket ${socket.id} is joining lobby ${lobbyId}`);

//       // Ensure the lobby exists in the lobbyPlayers object
//       if (!lobbyPlayers[lobbyId]) {
//         lobbyPlayers[lobbyId] = [];
//       }

//       // Check if player already exists in the lobby
//       const playerExists = lobbyPlayers[lobbyId].some(
//         (player) => player.user_id === userId
//       );
//       if (playerExists) {
//         console.log(
//           `Player with user_id ${userId} already in lobby ${lobbyId}`
//         );
//         return; // Player already in lobby, do nothing
//       }

//       // Add the player to the lobby's player list
//       lobbyPlayers[lobbyId].push({
//         user_id: userId,
//         username: username,
//         profilePic: profilePic || "https://placekitten.com/40/40", // Fallback image if none provided
//       });

//       socket.join(`lobby-${lobbyId}`);

//       // Emit the updated player list to all users in the lobby
//       io.to(`lobby-${lobbyId}`).emit("lobby-update", {
//         msg: `Socket ${socket.id} joined lobby ${lobbyId}`,
//         players: lobbyPlayers[lobbyId], // Send the updated list of players
//         creatorId: lobbyPlayers[lobbyId][0]?.user_id, // Assuming the first player is the creator
//       });
//     });

//     // Example: leaving a lobby
//     socket.on("leave-lobby", ({ lobbyId, userId }) => {
//       console.log(`Socket ${socket.id} leaving lobby ${lobbyId}`);

//       // Remove the player from the lobby's player list
//       if (lobbyPlayers[lobbyId]) {
//         lobbyPlayers[lobbyId] = lobbyPlayers[lobbyId].filter(
//           (player) => player.user_id !== userId
//         );
//       }

//       socket.leave(`lobby-${lobbyId}`);

//       // Emit the updated player list to all users in the lobby
//       io.to(`lobby-${lobbyId}`).emit("lobby-update", {
//         msg: `Socket ${socket.id} left lobby ${lobbyId}`,
//         players: lobbyPlayers[lobbyId], // Send the updated list of players
//         creatorId: lobbyPlayers[lobbyId][0]?.user_id, // Update creatorId
//       });
//     });

//     // Example: RPS
//     socket.on("rps-move", ({ lobbyId, userId, move }) => {
//       io.to(`lobby-${lobbyId}`).emit("rps-move-made", {
//         userId,
//         move,
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("Client disconnected:", socket.id);
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
const lobbies = {}; // Object to keep track of different lobbies

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

      // Emit game-started event to all players in the lobby
      io.to(`lobby-${lobbyId}`).emit("game-started", {
        players: gamePlayers,
        message: "Game has started!",
      });

      console.log(
        `Game started in lobby ${lobbyId} with ${gamePlayers.length} players`
      );
    });

    // Handle player disconnect
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
