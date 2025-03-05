// routes/lobbies.js
const express = require("express");
const router = express.Router();

let lobbies = [];
let nextLobbyId = 1;

router.get("/public", (req, res) => {
  const publicLobbies = lobbies.filter((lobby) => !lobby.private);
  res.json(publicLobbies);
});

router.post("/create", (req, res) => {
  const { name, maxPlayers, private: isPrivate } = req.body;

  if (!name || !maxPlayers) {
    return res.status(400).json({ error: "Missing required fields" });
  };

  const newLobby = {
    id: nextLobbyId++,
    name,
    maxPlayers: parseInt(maxPlayers, 10),
    private: !!isPrivate,
    playerCount: 0,
    players: [],
  };

  lobbies.push(newLobby);
  console.log("Lobby created:", newLobby);
  res.status(201).json(newLobby);
});

router.post("/join", (req, res) => {
  const { lobbyId, userId } = req.body;
  if (!lobbyId) {
    return res.status(400).json({ error: "lobbyId is required" });
  };

  const lobby = lobbies.find((lob) => lob.id === parseInt(lobbyId, 10));
  if (!lobby) {
    return res.status(404).json({ error: "Lobby not found" });
  };

  if (lobby.playerCount >= lobby.maxPlayers) {
    return res.status(403).json({ error: "Lobby is full" });
  };

  lobby.playerCount += 1;
  lobby.players.push(userId || `user${Math.floor(Math.random() * 9999)}`);
  console.log("User joined lobby:", lobby);
  res.json({ message: "Joined lobby successfully", lobby });
});

router.get("/:id", (req, res) => {
  const lobbyId = parseInt(req.params.id, 10);
  const lobby = lobbies.find((lob) => lob.id === lobbyId);
  if (!lobby) {
    return res.status(404).json({ error: "Lobby not found" });
  }
  res.json(lobby);
})

module.exports = router;
