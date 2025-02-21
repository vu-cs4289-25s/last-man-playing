const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profile_image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    completed_games_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',  // explicitly map this model to the 'users' table
    timestamps: true    // Sequelize will manage createdAt/updatedAt
});

module.exports = User;