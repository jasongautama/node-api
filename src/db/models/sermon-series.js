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
            StartMonthYear: Sequelize.VIRTUAL
        }, { tableName: 'SermonSeries' });

        super(tableModel);
    }

     /**
     * @param {Object} result
     * @override 
     */
    processRows(result) {
        // For singular results, just modify parameter
        if (typeof result === 'object') {
            // Add prefix to image paths
            result.ImagePath = result.ImagePath ? config.s3.prefix + result.ImagePath : '';
            result.BannerImagePath = result.BannerImagePath ? config.s3.prefix + result.BannerImagePath : '';
            // Add a Month/Year string for nicer display
            var date = moment(`${result.Year}-${result.StartMonth}-01`);
            result.StartMonthYear = date.format('MMMM YYYY'); 
            return Promise.resolve(result);
        }
        for (const i in result) {
            // Add prefix to image paths
            result[i].ImagePath = result[i].ImagePath ? config.s3.prefix + result[i].ImagePath : '';
            result[i].BannerImagePath = result[i].BannerImagePath ? config.s3.prefix + result[i].BannerImagePath : '';
            // Add a Month/Year string for nicer display
            var date = moment(`${result[i].Year}-${result[i].StartMonth}-01`);
            result[i].StartMonthYear = date.format('MMMM YYYY'); 
        }
        return Promise.resolve(result);
    }
}

module.exports = SermonSeries;