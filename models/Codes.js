const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Codes = sequelize.define('Codes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    timestamps: true,
    tableName: 'codes',
    schema: 'public',
  });
  
  // Associação
  User.hasMany(Codes, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Codes.belongsTo(User, { foreignKey: 'userId' });
  
module.exports = Codes;
