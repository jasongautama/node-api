const Sequelize = require('sequelize');
const sequelize = require('../db-config');
const DbModel = require('./db-model');

class Post extends DbModel {

    constructor() {

        const tableModel = sequelize.define('post', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, field: 'ID' },
            Type: Sequelize.INTEGER,
            Title: Sequelize.STRING(255),
            Content: Sequelize.TEXT,
            ImagePath: Sequelize.STRING(500),
            PostDate: Sequelize.DATE,
            AuthorName: Sequelize.STRING(50)
            
        }, { tableName: 'Post' });

        super(tableModel);
    }
}

module.exports = Post;