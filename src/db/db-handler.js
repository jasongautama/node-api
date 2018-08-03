const config = require('../../config.json');

const DbModel = require('./models/db-model');
const CareGroup = require('./models/care-group');
const Sermon = require('./models/sermon');
const SermonSeries = require('./models/sermon-series');
const Post = require('./models/post');

const Models = {
    'CareGroups': 'care-groups',
    'Sermons': 'sermons',
    'SermonSeries': 'sermon-series',
    'Posts': 'posts'
};

const ErrorCodes = {
    'INVALID': 400,
    'NOT_FOUND': 404,
    'SERVER_ERROR': 500
};

/**
 * Handler for our database requests
 */
class DbHandler {

    /**
     * @param {IncomingMessage} req - The Express Request object
     */
    constructor(req) {
        let urlParts = this._splitRequestUrl(req.url, true, false);

        /**
         * Store off full request
         * @type {IncomingMessage}
         */
        this.expressRequest = req;

        /**
         * GET, POST, PUT, DELETE, etc.
         */
        this.method = req.method;

        /**
         * The request body, normally used for PUT and POST.
         */
        this.body = req.body;

        /**
         * Name of module (https://api.ifgfseattle.org/{Version}/{Module}/)
         * @type {string}
         */
        this.module = urlParts.module;

        /**
         * Name of submodule (https://api.ifgfseattle.org/{Version}/{Module}/{OptionalSubmodule}/)
         * @type {string|null}
         */
        this.entityKey = urlParts.submodule;
       }

    /**
     * Routes DB requests to its appropriate function based on the path and method we received
     * @param {IncomingResponse} expressResponse - The Express Response object
     */
    routeRequest(expressResponse) {
        return new Promise((resolve, reject) => {
            let model = null;
    
            // Determine the model to use based on the request path
            switch (this.module) {
                case Models.CareGroups:
                    model = new CareGroup();
                    break;
                
                case Models.Sermons:
                    model = new Sermon();
                    break;
                
                case Models.SermonSeries:
                    model = new SermonSeries();
                    break;
                
                case Models.Posts:
                    model = new Post();
                    break;
                    
                default:
                    return reject({
                        code: ErrorCodes.INVALID,
                        message: `Invalid request ${this.expressRequest.url}`
                    });
            }

            // Once we have the model, execute any requested operations
            return this.execute(model)
                .then(res => {
                    if (this.method === 'GET') {
                        const ct = Array.isArray(res) ? res.length : 1;
                        expressResponse.set({
                            'X-Total-Count': ct,
                            'Content-Range': `${this.module} 1-${ct}/${ct}`,
                            'Content-Type': 'application/json'
                        });
                    }
                    resolve(res);
                })
                .catch(err => {
                    console.log(`API ${this.method} request error: `, err);
                    return reject({
                        code: err.code || ErrorCodes.SERVER_ERROR,
                        message: err.message || `An error occured in our server.`
                    });
                });
        });
    }

    /**
     * Executes DbModel functions based on the method on the request
     * @param {DbModel} model 
     */
    execute(model) {
        // Handle GET requests
        if (this.method === 'GET') {
            return model.get(this.entityKey);
        }
        // Handle PUT/Update requests
        else if (this.method === 'PUT') {
            return model.update(this.entityKey, this.body);
        }
        // Handle POST/Create requests
        else if (this.method === 'POST') {
            return model.create(this.body);
        }
    }

    /**
     * Splits a URL in form of '/{ApiModule}/{Path...}
     * 
     * @param {string} url
     * @param {boolean=} hasSubmodules - If set to true the {Submodule} portion of the query string is included/required
     * @param {boolean=} hasOptions - If set to true the {Options} portion of the query string is included/required
     * @returns {{module: string|null, submodule: string|null, options: string|null, path: string}}
     * @private
     */
    _splitRequestUrl(url, hasSubmodules = false, hasOptions = false) {
        // Git rid of first slash if present
        url = url.indexOf('/') === 0 ? url.substr(1) : url;
        // Get rid of query string parameters
        const qsIndex = url.indexOf('?');
        const queryString = qsIndex >= 0 ? url.substr(qsIndex + 1) : '';
        if (qsIndex >= 0) {
            url = url.substr(0, qsIndex);
        }
        // Split into constituent parts
        let urlParts = url.split('/');
        // The version is the first item: remove it from the array
        const version = urlParts.splice(0, 1)[0];
        return {
            version,
            module: urlParts.splice(0, 1)[0],
            submodule: hasSubmodules ? urlParts.splice(0, 1)[0] : null, // Splice off next block as submodule
            options: hasOptions ? urlParts.splice(0, 1)[0] : null, // Splice off next block as options
            path: urlParts.join('/'), // Note that we've spliced off the submodule and options above
            queryString: queryString // Preserve query string
        };
    }

}

module.exports = DbHandler;
