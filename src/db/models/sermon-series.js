const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');
const moment = require('moment');

class SermonSeries extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('sermon-series', {
            ID: { type: Sequelize.INTEGER, primaryKey: true },
            Name: Sequelize.STRING(100),
            Year: Sequelize.INTEGER(4),
            StartMonth: Sequelize.TINYINT(),
            ImagePath: Sequelize.STRING(255),
            BannerImagePath: Sequelize.STRING(255),
            // Custom Columns
            StartMonthYear: Sequelize.VIRTUAL
        }, { tableName: 'SermonSeries' });

        super(tableModel);
    }

     /**
     * @param {Object} rows
     * @override 
     */
    processRows(rows) {
        for (const i in rows) {
            // Add prefix to image paths
            rows[i].ImagePath = rows[i].ImagePath ? config.s3.prefix + rows[i].ImagePath : '';
            rows[i].BannerImagePath = rows[i].BannerImagePath ? config.s3.prefix + rows[i].BannerImagePath : '';
            // Add a Month/Year string for nicer display
            var date = moment(`${rows[i].Year}-${rows[i].StartMonth}-01`);
            rows[i].StartMonthYear = date.format('MMMM YYYY'); 
        }
        return Promise.resolve(rows);
    }
}

module.exports = SermonSeries;