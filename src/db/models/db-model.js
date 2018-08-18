const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const S3Handler = require('../../aws.s3');

/**
 * Base class for our Database Models
 * @abstract
 */
class DbModel {

    /**
     * 
     * @param {Sequelize.Model} model - Model defined using sequelize.define() method
     * @param {Sequelize.Model} viewModel - Model for GET defined using sequelize.define() method
     */
    constructor(model, viewModel = null) {
        /**
         * @var {Sequelize.Model}
         */
        this.model = model;
        /**
         * OPTIONAL view model to return on GET only
         * @var {Sequelize.Model}
         */
        this.viewModel = viewModel;
    }

    /**
     * Retrives data with the filters passed in
     * @param {string|int} entityKey - The ID of the model
     * @oaram {{}} filters - Object containing various parameter filters
     */
    get(entityKey, filters = {}) {
        return new Promise((resolve, reject) => {
            sequelize.authenticate()
                .then(() => {
                    // Default to regular model
                    let model = this.model;
                    if (this.viewModel !== null) {
                        model = this.viewModel;
                    }
                    // Check if entity 'ID' is specified for query.
                    if (entityKey) {
                        filters.id = entityKey;
                    }
                    return model.findAll({
                        where: filters
                    });
                })
                .then(result => {
                    return this.processRows(result);
                })
                .then(rows => {
                    const result = entityKey ? rows[0] : rows;
                    return resolve(result);
                })
                .catch(err => {
                    return reject('Unable to retrieve model data: ' + err);
                });
        });
    }

    /**
     * Creates a record
     * @param {Object} args 
     */
    create(args) {
        return new Promise((resolve, reject) => {
            this.validateArgs(args)
                .then(() => {
                    return this._saveFiles(args);
                })
                .then((newArgs) => {
                    return this.model.create(newArgs);
                })
                .then(res => {
                    return resolve(res);
                })
                .catch(err => {
                    return reject('Unable to create model: ', err);
                });
        });
    }

    /**
     * Updates a record
     * @param {int|string} entityKey
     * @param {Object} args
     */
    update(entityKey, args) {
        return new Promise((resolve, reject) => {
            // Variable to store the entity found after find()
            let entity;
            // Find the model with the matching PK
            this.model.find({ where: { ID: entityKey } })
                .then(result => {
                    if (!result) {
                        return reject({
                            code: 404,
                            message: `Entity not found with identifier: ${entityKey}`
                        });
                    }
                    entity = result;
                    return this.validateArgs(args);
                })
                .then((validateErr) => {
                    // If we get an error during validation, return it
                    if (validateErr) {
                        return reject({
                            code: 400,
                            message: validateErr
                        });
                    }
                    return this._saveFiles(args);
                })
                .then((newArgs) => {
                    return entity.update(newArgs);
                })
                .then(res => {
                    console.log('Model update successful.');
                    return resolve(res);
                })
                .catch(err => {
                    console.log('DbModel > Update error: ', err);
                    reject('Unable to update model data: ', err);
                });
        });
    }

    /**
     * Saves any files that are included in the UPDATE/WRITE body
     * @param {object} args 
     */
    _saveFiles(args) {
        return new Promise((resolve, reject) => {
            const s3 = new S3Handler();

            let chain = Promise.resolve();

            let i = 1;
            for (const field in args) {
                // If last 4 characters is "File"
                if (field.substr(field.length - 4).includes('File')) {
                    const fileData = args[field];
                    chain = chain.then(_ => new Promise(res => {
                        console.log(`Uploading file #${i}...`, fileData[0].title);
                        i++;
                        return s3.saveModelFile(this.constructor.name, field, fileData, 'public-read')
                            .then(s3Key => {
                                console.log(`${field} saved at ${s3Key}`);
                                // Add path to the Path field and remove the File field
                                args[field.replace('File', 'Path')] = s3Key;
                                delete args[field];
                                res();
                            })
                            .catch(err => {
                                return reject(`File saving failed! ${err}`);
                            })
                        }
                    ));
                }
            }

            chain.then(() => {
                return resolve(args);
            })
            .catch(err => {
                console.log('DbModel > _saveFiles error: ', err);
                return reject(err);
            })
        });
    }

    /**
     * Process rows after a get()
     * @param {Object} rows 
     * @return {Promise}
     */
    processRows(rows) {
        return Promise.resolve(rows);
    }

    /**
     * Validate arguments before Update/Create ops
     * @param {Object} args 
     * @return {Promise}
     */
    validateArgs(args) {
        return Promise.resolve();
    }

};

module.exports = DbModel;
