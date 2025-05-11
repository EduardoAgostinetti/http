const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
    tableName: 'friendships',
    schema: 'public',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'friendId'],
        }
    ],
});
Friendship.belongsTo(User, { as: 'Requester', foreignKey: 'userId' });
Friendship.belongsTo(User, { as: 'Receiver', foreignKey: 'friendId' });

module.exports = Friendship;
