// models/RoundResults.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoundResults = sequelize.define('RoundResults', {
    round_result_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    round_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    score: {
        type: DataTypes.DECIMAL(10, 2),  // or integer, your call
        allowNull: false,
        defaultValue: 0
    },
    eliminated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'round_results',
    timestamps: true
});

module.exports = RoundResults;
