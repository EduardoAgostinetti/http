const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const UserStatus = sequelize.define('UserStatus', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    lastOnline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'user_status',
    schema: 'public',
});

User.hasOne(UserStatus, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserStatus.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserStatus;
