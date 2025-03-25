const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Games = sequelize.define("Games", {
    game_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    lobby_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    current_round: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: "games",
    timestamps: true,
})

module.exports = Games;