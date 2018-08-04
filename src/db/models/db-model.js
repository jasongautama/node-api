const Sequelize = require('sequelize');
const sequelize = require('../db-config');

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
                    return this.model.create(args);
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
                    return entity.update(args);
                })
                .then(res => {
                    console.log('Model updated to: ', this.model);
                    return resolve(res);
                })
                .catch(err => {
                    console.log('DbModel > Update error: ', err);
                    reject('Unable to update model data: ', err);
                });
        });
    }

    /**
     * Process rows after a get()
     * @TODO: rows can be singular object or an array of objects.. Maybe define a class for Results?
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
