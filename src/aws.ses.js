const AWS = require('aws-sdk');
const config = require('../config.json');

class SES {

    constructor() {
        /**
         * @var {AWS.SES}
         */
        this.ses = new AWS.SES({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: config.s3.region
        });
    }

    /**
     * 
     * @param {IncomingMessage} req - The Express Request object
     */
    prayerRequest(req) {
        for (const i in req.body) {
            if (req.body[i] === null) {
                req.body[i] = '';
            }
        } 
        var emailSubject = "You have received a prayer request!";
        var messageData = `Sender name: ${req.body.name} <br>Email: 
        ${req.body.email}<br>Phone number: ${req.body.phone}<br>
        Prayer Request:<br>${req.body.prayerRequest}`;

        var params = {
            Destination: {
                ToAddresses: [
                    config.prayerRequest.recipient
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: messageData
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: messageData
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: emailSubject
                }
            },
            
            Source: config.prayerRequest.source
        };

        return new Promise((resolve, reject) => {
            this.ses.sendEmail(params, function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

}

module.exports = SES;
