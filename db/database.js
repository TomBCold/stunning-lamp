require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_PROJECT_USERNAME,
    password: process.env.DB_PROJECT_PASSWORD,
    database: process.env.DB_PROJECT_DATABASE,
    host: process.env.DB_PROJECT_HOST,
    dialect: 'mysql',
    timezone: '+06:00'
  },
  test: {
    username: process.env.DB_PROJECT_USERNAME,
    password: process.env.DB_PROJECT_PASSWORD,
    database: process.env.DB_PROJECT_DATABASE,
    host: process.env.DB_PROJECT_HOST,
    dialect: 'mysql',
    timezone: '+06:00'
  },
  production: {
    username: process.env.DB_PROJECT_USERNAME,
    password: process.env.DB_PROJECT_PASSWORD,
    database: process.env.DB_PROJECT_DATABASE,
    host: process.env.DB_PROJECT_HOST,
    dialect: 'mysql',
    timezone: '+06:00'
  }
};
