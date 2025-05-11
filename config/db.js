const { Sequelize } = require('sequelize');

// Configuração da conexão com o banco de dados PostgreSQL
const sequelize = new Sequelize('sogoj', 'rjnhxf', '#Proibido10', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL successfully!');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
    }
})();

module.exports = sequelize;
