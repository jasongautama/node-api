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
     * @param {Object} rows
     * @override 
     */
    processRows(rows) {
        for (const i in rows) {
            rows[i].MainPhotoPath = config.s3.prefix + rows[i].MainPhotoPath;
        }
        return Promise.resolve(rows);
    }
}

module.exports = CareGroup;
