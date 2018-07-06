const Sequelize = require('sequelize');
const config = require('../../config.json');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PW,
    database: config.db.database,
    port: config.db.port,
    dialect: 'mysql',
    // Apply settings for all models
    define: {
        timestamps: false
    },
    // For concurrent connection pooling
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
});

module.exports = sequelize;
