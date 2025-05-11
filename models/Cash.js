const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Cash = sequelize.define('Cash', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  type: { // 'IN' ou 'OUT' (entrada ou saída)
    type: DataTypes.ENUM('IN', 'OUT'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT, 
    allowNull: false,
  },
  cash: {
    type: DataTypes.FLOAT, 
    allowNull: false,
  },
  currency: { // Ex: 'BRL', 'USD', 'EUR'...
    type: DataTypes.STRING(3),
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'cash',
  schema: 'public',
});

// Associação
User.hasMany(Cash, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cash.belongsTo(User, { foreignKey: 'userId' });

module.exports = Cash;
