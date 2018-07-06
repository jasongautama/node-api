const Sequelize = require('sequelize');
const sequelize = require('./db-config');

const Sermon = sequelize.define('sermon', {
    SermonID: { type: Sequelize.INTEGER, primaryKey: true },
    SeriesName: Sequelize.STRING(100),
    Year: Sequelize.INTEGER,
    Title: Sequelize.STRING(100),
    Speaker: Sequelize.STRING(100),
    MediaPath: Sequelize.STRING(255),
    MediaType: Sequelize.STRING,
    Date: Sequelize.TIME
}, { tableName: 'vwSermon' });

const CareGroup = sequelize.define('care-group', {
    ID: { type: Sequelize.INTEGER, primaryKey: true },
    Name: Sequelize.STRING(255),
    ShortName: Sequelize.STRING(100),
    Description: Sequelize.TEXT,
    MainPhotoPath: Sequelize.TEXT,
    IsActive: Sequelize.BOOLEAN
}, { tableName: 'CareGroup' });

module.exports = { Sermon, CareGroup };
