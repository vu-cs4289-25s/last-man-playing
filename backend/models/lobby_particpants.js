const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LobbyParticipants = sequelize.define("LobbyParticipants", {
    lobby_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},{
    tableName: 'lobby_participants',
    timestamps: false,
    indexes: {
        unique: true,
        fields: ['lobby_id', 'user_id'],
    }
});

module.exports = LobbyParticipants;
