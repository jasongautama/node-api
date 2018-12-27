const AWS = require('aws-sdk');
const config = require('../config.json');
const SiteSetting = require('./db/models/site-settings');

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
        var messageData = `Sender name: ${req.body.name || "Anonymous"} <br>Email: 
        ${req.body.email || "NOT PROVIDED"}<br>Phone number: ${req.body.phone || "NOT PROVIDED"}<br>
        Prayer Request:<br>${req.body.prayerRequest}`;

        var params = {
            Destination: {
                // Set below
                ToAddresses: []
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
            // Set destination e-mail
            const settings = new SiteSetting();
            
            settings.getValue('PrayerRequestEmail')
                .then(emailDestination => {
                    // Set the e-mail destination
                    params.Destination.ToAddresses.push(emailDestination);
                    this.ses.sendEmail(params, function (err, data) {
                        if (err) {
                            console.log(`SES Error:`, err);
                            return reject({
                                code: 500, 
                                message: 'A server error occured and we could not process your request.'
                            });
                        }
                        return resolve();
                    });
                })
                .catch(err => {
                    console.log(`Prayer Request e-mail error: `, err);
                    return reject({
                        code: 500, 
                        message: 'A server error occured and we could not process your request.'
                    });
                });
        });
    }

};

module.exports = SES;
