const sequelize = require('./db-config');
const models = require('./db-models');
const config = require('../config.json');

const { Sermon, CareGroup } = models;

const dbHandler = {

    getSermonsTest: () => {
        return new Promise((resolve, reject) => {
            const sermons = [{
                SermonID: 1,
                SeriesName: "Together Forward",
                Year: 2018,
                Title: "To Kill a Mockingbird",
                Speaker: "Ps. Irwan Ngadisastra",
                MediaPath: "/sermons/together-forward/test123.mp3",
                MediaType: "audio",
                Date: "2018-01-01"
            }];
            return resolve(sermons);

            // Sermon.create(params)
            //     .then(sermon => {
            //         console.log(sermon);
            //         return resolve(sermon);
            //     })
            //     .catch(err => {
            //         reject('Unable to retrieve Sermons: ' + err);
            //     });
        });
    },

    getCareGroupsTest: () => {
        return new Promise((resolve, reject) => {
            const cg = [{
                ID: 1,
                Name: "Young Professionals",
                ShortName: "YP",
                Description: "Our care group is where young professionals can grow and have fun.",
                MainPhotoPath: "http://via.placeholder.com/300x300.png",
                IsActive: true
            }];
            return resolve(cg);

            // Sermon.create(params)
            //     .then(sermon => {
            //         console.log(sermon);
            //         return resolve(sermon);
            //     })
            //     .catch(err => {
            //         reject('Unable to retrieve Sermons: ' + err);
            //     });
        });
    },

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