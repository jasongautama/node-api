const sequelize = require('./db-config');
const models = require('./db-models');
const config = require('../config.json');

const { Sermon, CareGroup } = models;

const dbHandler = {
    
    getSermons: () => {
        return new Promise((resolve, reject) => {
            sequelize.authenticate()
                .then(() => {
                    return Sermon.findAll();
                })
                .then(rows => {
                    return resolve(rows);
                })
                .catch(err => {
                    reject('Unable to retrieve Sermons: ' + err);
                });
        });
    },

    getCareGroups: () => {
        return new Promise((resolve, reject) => {
            sequelize.authenticate()
                .then(() => {
                    return CareGroup.findAll();
                })
                .then(rows => {
                    for (const i in rows) {
                        const item = rows[i];
                        if (item['MainPhotoPath']) {
                            rows[i]['MainPhotoPath'] = config.s3.prefix + item['MainPhotoPath'];
                        }
                    }
                    return resolve(rows);
                })
                .catch(err => {
                    reject('Unable to retrieve Care Groups: ' + err);
                });
        });
    },
    
    get: (viewOrTable) => { 
        return new Promise((resolve, reject) => {
            sequelize.authenticate()
                .then(() => {
                    console.log('Connection has been established successfully.');
                    const param = { type: Sequelize.QueryTypes.SELECT };
                    return sequelize.query(`SELECT * FROM ${viewOrTable}`, param);
                })
                .then(rows => {
                    return resolve(rows);
                })
                .catch(err => {
                    reject('Unable to connect to the database: ' + err);
                });
        });
    }

};

module.exports = dbHandler;