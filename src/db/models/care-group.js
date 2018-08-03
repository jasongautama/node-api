const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');

class CareGroup extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('care-group', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            Name: Sequelize.STRING(255),
            ShortName: Sequelize.STRING(100),
            Description: Sequelize.TEXT,
            MainPhotoPath: Sequelize.TEXT,
            IsActive: Sequelize.BOOLEAN
        }, { tableName: 'CareGroup' });

        super(tableModel);
    }

    /**
     * @param {Object|array} result
     * @override 
     */
    processRows(result) {
        // For singular results, just modify parameter
        if (typeof result === 'object') {
            result.MainPhotoPath = config.s3.prefix + result.MainPhotoPath;
            return Promise.resolve(result);
        }
        // If there is multiple rows, loop and modify
        for (const i in result) {
            result[i].MainPhotoPath = config.s3.prefix + result[i].MainPhotoPath;
        }
        return Promise.resolve(result);
    }
}

module.exports = CareGroup;
