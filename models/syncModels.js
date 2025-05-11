const sequelize = require('../config/db');
const User = require('./User');
const Codes = require('./Codes');
const Cash = require('./Cash');
const Friendship = require('./Friendship');
const UserStatus = require('./UserStatus');

(async () => {
  try {
    await sequelize.sync({alter: true });
    console.log('Synchronized tables!');
  } catch (error) {
    console.error('Erro ao sincronizar as tabelas:', error);
  }
})();
