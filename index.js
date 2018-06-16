const express = require('express');
const passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
const app = express();
require('dotenv').config();
// Import our own files
const dbHandler = require('./lib/db-handler');

app.use(passport.initialize());

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	if ('OPTIONS' == req.method) {
		 res.send(200);
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

app.get('/', basicAuth(), function (req, res) {
	res.send("Hey there! This is the IFGF Test API endpoint. Currently, our list of supported paths are: /sermons, /care-groups");
});

app.get('/sermons', basicAuth(), function (req, res) {
	dbHandler.getSermons()
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send(err);
		});
});

app.get('/care-groups', basicAuth(), function (req, res) {
	dbHandler.getCareGroups()
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			console.log(err);
			res.status(500).send(err);
		});
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`IFGF Express API now listening on port ${port}`);
});
