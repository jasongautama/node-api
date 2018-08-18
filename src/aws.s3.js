const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('../config.json');

const modelFieldIndex = {
    'SermonSeries': {
        'ImageFile': 'images/sermon-series/',
        'BannerImageFile': 'images/sermon-series/'
    }
}

class S3Handler {

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: config.s3.region
        });
    }

    /**
     * Used by CMS to save file into S3
     * 1. Parse file obj (blob) and convert to buffer
     * @return {string}
     */
    saveModelFile(model, field, data, acl = 'private') {
        const s3Path = this._getS3PathForField(model, field);
        const fileObj = data[0];
        const dataString = fileObj.src;
        console.log(dataString.substr(0, 100));
        const fileType = dataString.substr(dataString.indexOf('image/'), dataString.indexOf(';') - 5);
        const fileBuffer = Buffer.from(dataString.split(',')[1], 'base64');
        // To make file name unique, add model info
        let fileName = `${model}-${field}-` + fileObj.title;

        const key = s3Path + fileName;

        const params = {
            Bucket: config.s3.bucket,
            Key: key,
            ACL: acl,
            ContentType: fileType,
            Body: fileBuffer
        };
        // console.log(params);
        // And upload the file
        return new Promise((resolve, reject) => {
            this.s3.putObject(params, (err) => {
                if (err) {
                    console.log('Error uploading file:', err);
                    return reject(err);
                }
                console.log(`A file has been uploaded to Amazon S3: ${s3Path}${fileName}`);
                return resolve(key);
            });
        });
    }

    /**
     * 
     * @param {string} model 
     * @param {string} field 
     */
    _getS3PathForField(model, field) {
        if (!modelFieldIndex.hasOwnProperty(model) || !modelFieldIndex[model].hasOwnProperty(field)) {
            throw new Error(`S3 Path for ${model} > ${field} has not been configured yet.`);
        }
        return modelFieldIndex[model][field];
    }
}

module.exports = S3Handler;