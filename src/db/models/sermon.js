const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');

class Sermon extends DbModel {

    constructor() {
        // Define the table model
        const tableModel = sequelize.define('sermon', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            SeriesID: Sequelize.INTEGER,
            Title: Sequelize.STRING(100),
            Speaker: Sequelize.STRING(100),
            Type: Sequelize.INTEGER,
            FileName: Sequelize.STRING(100),
            MediaPath: Sequelize.STRING(255),
            ThumbnailPath: Sequelize.STRING(255),
            Date: Sequelize.TIME
        }, { tableName: 'Sermon' });

        const viewModel = sequelize.define('sermon-view', {
            id: { type: Sequelize.INTEGER, primaryKey: true, field: 'ID' },
            SeriesID: Sequelize.INTEGER,
            SeriesName: Sequelize.STRING(100),
            SeriesYear: Sequelize.CHAR(4),
            Year: Sequelize.INTEGER,
            Title: Sequelize.STRING(100),
            Speaker: Sequelize.STRING(100),
            FileName: Sequelize.STRING(100),
            MediaPath: Sequelize.STRING(255),
            MediaFullPath: Sequelize.STRING(255),
            Type: Sequelize.INTEGER,
            MediaType: Sequelize.STRING,
            Date: Sequelize.TIME,
            // Custom Columns
            MediaUrl: Sequelize.VIRTUAL,
            SeriesNameYear: Sequelize.VIRTUAL
        }, { tableName: 'vwSermon' });

        super(tableModel, viewModel);
    }

    /**
     * @param {Object|array} result
     * @override 
     */
    processRows(result) {
        for (const i in result) {
            result[i].MediaUrl = config.s3.prefix + result[i].MediaFullPath;
            result[i].SeriesNameYear = result[i].SeriesName + ` (${result[i].SeriesYear})`;
        }
        return Promise.resolve(result);
    }
    
    /**
     * Add validation logic before update/create
     * @override
     */
    validateArgs(args) {
        return new Promise((resolve, reject) => {
            this.getValidationData()
                .then(data => {
                    const err = this._validateFields(args, data);
                    if (err) {
                        console.log(err);
                        return resolve(err);
                    }
                    return resolve();
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    /**
     * Get a list of SermonSeries and MediaType records for validation
     */
    getValidationData() {
        return new Promise((resolve, reject) => {
            const data = {
                sermonSeries: [],
                mediaTypes: []
            };
        
            sequelize.query(`SELECT * FROM SermonSeries`)
                .then(res => {
                    data.sermonSeries = res;
                    return sequelize.query('SELECT * FROM MediaType');
                })
                .then(res => {
                    data.mediaTypes = res;
                    return resolve(data);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }

    /**
     * Validate special fields that we need to check
     * @param {Object} args 
     * @param {Object} data 
     */
    _validateFields(args, data) {
        let isValid = true;
        for (const field in args) {
            // Validate SeriesID
            if (field === 'SeriesID') {
                isValid = false;
                for (let row of data.sermonSeries) {
                    row = row[0];
                    if (args[field] === row.ID) {
                        isValid = true;
                    }
                }
                if (!isValid) {
                    return 'Series ID does not exist.';
                }
            }
            // Media Type
            else if (field === 'Type') {
                isValid = false;
                for (let row of data.mediaTypes) {
                    row = row[0];
                    if (args[field] === row.ID) {
                        isValid = true;
                    }
                }
                if (!isValid) {
                    return 'Invalid Media Type.';
                }
            }
        }
        return null;
    }
}

module.exports = Sermon;
