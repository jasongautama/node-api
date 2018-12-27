const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
const app = express();
var morgan = require('morgan');
require('dotenv').config();
// Import our own files
const config = require('./config.json');
const DbHandler = require('./src/db/db-handler');
const SES = require('./src/aws.ses');

const apiVersion = config.apiVersion;

// Configure body parser and size limit
app.use(bodyParser.json({limit: '75mb'}));
app.use(bodyParser.urlencoded({limit: '75mb', extended: true}));

// Configure Morgan logger
// Massage IP address log
morgan.token('remote-addr', (req, res) => {
	// If IPv4, strip out IPv6 prefix
	let ip = req.hasOwnProperty('ip') ? req.ip : req.connection.remoteAddress;
	return ip.replace('::ffff:', '');
});
app.use(morgan(':method :url :status :response-time ms - :res[content-length] bytes | :remote-addr - :remote-user'));

// Define access controls
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', "GET, OPTIONS, PUT, POST");
	res.header('Access-Control-Allow-Headers', "Authorization, Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Content-Range, Access-Control-Request-Method Access-Control-Request-Headers, X-Total-Count");
	res.header('Access-Control-Expose-Headers', "Content-Range, X-Total-Count");
	if ('OPTIONS' == req.method) {
		 res.sendStatus(200);
	 } else {
		 next();
	 }
});

// Initialize Passport
app.use(passport.initialize());
passport.use(new Strategy(
	function(username, password, cb) {
		// console.log("Auth attempt: " + username + " | " + password);
		// Admin auth
		if (username == process.env.BASIC_USER && password == process.env.BASIC_PW) {
			// 1: Error message, 2: User object, or FALSE for a re-try
			cb(null, { access: "admin" });
		}
		else {
			cb("Authentication failed", false);
		}
	})
);

const basicAuth = () => {
	return passport.authenticate('basic', { session: false })
};


/*****************************************
 **********  ROUTING *********************
 *****************************************/

app.get(`/${apiVersion}`, basicAuth(), function (req, res) {
	res.send("Hey there! This is the IFGF Seattle API endpoint. Currently, our list of supported paths are: /sermons, /care-groups, /posts, /sermon-series");
});

app.post(`/${apiVersion}/prayer-request`, basicAuth(), function (req, res) {
	const ses = new SES();
	ses.prayerRequest(req)
		.then(result => {
			res.status(200).send("e-mail sent");
		})
		.catch(err => {
			// console.log(err);
			res.status(err.code || 500).send(err.message || err);
		});
});

app.all(`/${apiVersion}/*`, basicAuth(), function (req, res) {
	dbHandler = new DbHandler(req);
	dbHandler.routeRequest(res)
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			// console.log(err);
			res.status(err.code || 500).send(err.message || err);
		});
});

// Start Express listener
const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`IFGF Seattle API now listening on port ${port}`);
});
