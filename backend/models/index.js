const sequelize = require("../config/database");

const User = require("./user");
const Lobby = require("./lobby");
const LobbyParticipants = require("./lobby_participants");
const Games = require("./games");
const Rounds = require("./rounds");
const RoundResults = require("./round_results");

const db = {};
db.sequelize = sequelize;

db.User = User;
db.Lobby = Lobby;
db.LobbyParticipants = LobbyParticipants;
db.Games = Games
db.Rounds = Rounds
db.RoundResults = RoundResults

// Database Relations

db.User.hasMany(db.Lobby, { foreignKey: 'created_by' });
db.Lobby.belongsTo(db.User, { foreignKey: 'created_by' });

db.User.hasMany(db.LobbyParticipants, { foreignKey: 'user_id' });
db.LobbyParticipants.belongsTo(db.User, { foreignKey: 'user_id' });

db.Lobby.hasMany(db.LobbyParticipants, { foreignKey: 'lobby_id' });
db.LobbyParticipants.belongsTo(db.Lobby, { foreignKey: 'lobby_id' });

db.Lobby.hasMany(db.Games, { foreignKey: 'lobby_id' });
db.Games.belongsTo(db.Lobby, { foreignKey: 'lobby_id' });

db.Games.hasMany(db.Rounds, { foreignKey: 'game_id' });
db.Rounds.belongsTo(db.Games, { foreignKey: 'game_id' });

db.Rounds.hasMany(db.RoundResults, { foreignKey: 'round_id' });
db.RoundResults.belongsTo(db.Rounds, { foreignKey: 'round_id' });

db.User.hasMany(db.RoundResults, { foreignKey: 'user_id' });
db.RoundResults.belongsTo(db.User, { foreignKey: 'user_id' });

module.exports = db;
