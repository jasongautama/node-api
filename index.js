const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
const app = express();
require('dotenv').config();
// Import our own files
const config = require('./config.json');
const DbHandler = require('./src/db/db-handler');
const apiVersion = config.apiVersion;

app.use(bodyParser.json());
app.use(passport.initialize());

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

passport.use(new Strategy(

	/**
	 * This is the Authentication logic.
	 * When calling the cb(), note the following:
	 * 1st Param: Error message
	 * 2nd Param: User object or false to have users retry
	 */
	function (username, password, cb) {
		// console.log("Auth attempt: " + username + " | " + password);
		// Admin auth
		if (username == process.env.BASIC_USER && password == process.env.BASIC_PW) {
			cb(null, { access: "admin" });
		}
		else {
			cb("Authentication failed", false);
		}

		// db.users.findByUsername(username, function (err, user) {
		// 	if (err) { return cb(err); }
		// 	if (!user) { return cb(null, false); }
		// 	if (user.password != password) { return cb(null, false); }
		// 	return cb(null, user);
		// });
	})
);

const basicAuth = () => {
	return passport.authenticate('basic', { session: false })
};

app.get(`/${apiVersion}`, basicAuth(), function (req, res) {
	res.send("Hey there! This is the IFGF Seattle API endpoint. Currently, our list of supported paths are: /sermons, /care-groups, /posts, /sermon-series");
});

app.all(`/${apiVersion}/*`, basicAuth(), function (req, res) {
	dbHandler = new DbHandler(req);
	dbHandler.routeRequest(res)
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			// console.log(err);
			res.status(err.code).send(err.message);
		});
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`IFGF Seattle API now listening on port ${port}`);
});
