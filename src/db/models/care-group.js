const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');

class CareGroup extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('care-group', {
            ID: { type: Sequelize.INTEGER, primaryKey: true },
            Name: Sequelize.STRING(255),
            ShortName: Sequelize.STRING(100),
            Description: Sequelize.TEXT,
            MainPhotoPath: Sequelize.TEXT,
            IsActive: Sequelize.BOOLEAN
        }, { tableName: 'CareGroup' });

        super(tableModel);
    }
}

module.exports = CareGroup;
