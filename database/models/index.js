const Sequelize = require('sequelize');

const dbConfig = {
    host: 'localhost',
    dialect: 'sqlite',
    storage: process.env.SQLITE_URI
}

const sequelize = new Sequelize(process.env.SQLITE_URI, null, null, dbConfig);

const db = {}

const modelUser = sequelize.import('../models/User.js');
db[modelUser.name] = modelUser;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;