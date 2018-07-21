const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');

class SermonSeries extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('sermon-series', {
            ID: { type: Sequelize.INTEGER, primaryKey: true },
            Name: Sequelize.STRING(100),
            Year: Sequelize.INTEGER(4),
            ImagePath: Sequelize.STRING(255),
            BannerImagePath: Sequelize.STRING(255)
        }, { tableName: 'SermonSeries' });

        super(tableModel);
    }

     /**
     * @param {Object} rows
     * @override 
     */
    processRows(rows) {
        for (const i in rows) {
            rows[i].ImagePath = config.s3.prefix + rows[i].ImagePath;
            rows[i].BannerImagePath = config.s3.prefix + rows[i].BannerImagePath;
        }
        return Promise.resolve(rows);
    }
}

module.exports = SermonSeries;