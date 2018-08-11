const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');
const moment = require('moment');

class SermonSeries extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('sermon-series', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            Name: Sequelize.STRING(100),
            Year: Sequelize.INTEGER(4),
            StartMonth: Sequelize.TINYINT(),
            ImagePath: Sequelize.STRING(255),
            BannerImagePath: Sequelize.STRING(255),
            // Custom Columns
            ImageFullPath: Sequelize.VIRTUAL,
            BannerImageFullPath: Sequelize.VIRTUAL,
            StartMonthYear: Sequelize.VIRTUAL,
            NameWithMonthYear: Sequelize.VIRTUAL,
        }, { tableName: 'SermonSeries' });

        super(tableModel);
    }

     /**
     * @param {Object} result
     * @override 
     */
    processRows(result) {
        for (const i in result) {
            // Add prefix to image paths
            result[i].ImageFullPath = result[i].ImagePath ? config.s3.prefix + result[i].ImagePath : null;
            result[i].BannerImageFullPath = result[i].BannerImagePath ? config.s3.prefix + result[i].BannerImagePath : null;
            // Add a Month/Year string for nicer display
            const startMonth = result[i].StartMonth < 10 ? '0' + result[i].StartMonth : result[i].StartMonth;
            var date = moment(`${result[i].Year}-${startMonth}-01`);
            result[i].StartMonthYear = date.format('MMMM YYYY');
            result[i].NameWithMonthYear = result[i].Name + ` (${result[i].StartMonthYear})`;
        }
        return Promise.resolve(result);
    }
}

module.exports = SermonSeries;