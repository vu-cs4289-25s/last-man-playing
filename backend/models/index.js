const sequelize = require("../config/database");
const User = require("./user");
const Lobby = require("./lobby");
const LobbyParticipants = require("./lobby_participants");

const db = {};
db.sequelize = sequelize;
db.User = User;
db.Lobby = Lobby;
db.LobbyParticpants = LobbyParticipants;

module.exports = db;