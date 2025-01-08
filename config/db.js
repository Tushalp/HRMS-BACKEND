const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,   
  process.env.DB_USER,   
  process.env.DB_PASS,   
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,   
    port: process.env.PORT, 
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
