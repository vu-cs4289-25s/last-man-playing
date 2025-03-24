// models/Rounds.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rounds = sequelize.define('Rounds', {
    round_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    game_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    round_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'rounds',
    timestamps: true
});

module.exports = Rounds;
