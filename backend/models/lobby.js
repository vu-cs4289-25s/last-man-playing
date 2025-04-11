// 

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lobby = sequelize.define('Lobby', {
    lobby_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    lobby_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        default_value: DataTypes.NOW,
    },
    // add for number of players max?
    num_players: {
        type: DataTypes.INTEGER,
        default_value: 2,
    }
    
},{
    tableName: 'lobby',
    timestamps: true
})

module.exports = Lobby;
