const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');
const config = require('../../../config.json');

class Post extends DbModel {

    constructor() {

        const tableModel = sequelize.define('post', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            Type: Sequelize.INTEGER,
            Title: Sequelize.STRING(255),
            Content: Sequelize.TEXT,
            ImagePath: Sequelize.STRING(500),
            PostDate: Sequelize.DATE,
            AuthorName: Sequelize.STRING(50),
            // Custom
            ImageFullPath: Sequelize.VIRTUAL
        }, { tableName: 'Post' });

        super(tableModel);
    }

    /**
     * @param {Object|array} result
     * @override 
     */
    processRows(result) {
        for (const i in result) {
            result[i].ImageFullPath = result[i].ImagePath ? config.s3.prefix + result[i].ImagePath : null;
        }
        return Promise.resolve(result);
    }
}

module.exports = Post;