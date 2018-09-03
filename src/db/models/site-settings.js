const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');

class SiteSetting extends DbModel {

    constructor() {

        const tableModel = sequelize.define('site-setting', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            SettingName: Sequelize.STRING(50),
            SettingValue: Sequelize.STRING(1000)
        }, { tableName: 'SiteSetting' });

        super(tableModel);
    }

    getValue(key) {
        return new Promise((resolve, reject) => {
            this.model.find({ where: { "SettingName": key } })
                .then(res => {
                    return resolve(res.SettingValue);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}

module.exports = SiteSetting;