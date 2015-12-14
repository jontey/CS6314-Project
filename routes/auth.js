var jwt = require('jwt-simple');
var crypto = require('crypto');
// Database
var db = require('./../db');

var auth = {
	login: function(req, res) {
		var username = req.body.username || '';
		var password = req.body.password || '';
		if (username == '' || password == '') {
			res.status(401);
			res.json({
				"status": 401,
				"message": "Invalid credentials"
			});
			return;
		}
		// Fire a query to your DB and check if the credentials are valid
		auth.validate(username, password, function(dbUserObj){
			if (!dbUserObj) { // If authentication fails, we send a 401 back
				res.status(401);
				res.json({
					"status": 401,
					"message": "Invalid credentials"
				});
				return;
			}
			if (dbUserObj) {
				// If authentication is success, we will generate a token
				// and dispatch it to the client
				res.json(genToken(dbUserObj));
			}
		});
	},
	validate: function(username, password, cb) {
		db.users.findOne({
			user: username
		}, function (err, doc){
			if(err) {
				throw err;
			} else {
				if(doc == null){
					cb(false);
					return;
				}
				var salt = new Buffer(doc.salt);
				var passwordHash = encodePassword(password, salt);
				if(authenticate(passwordHash.toString("hex"), doc.password)){
					cb(doc);
				} else {
					cb(false);
				}
			}
		});
	},
	validateUser: function(username, cb) {
		db.users.findOne({
			user: username
		}, function (err, doc){
			if(err) {
				throw err;
			} else {
				cb(doc);
			}
		});
	}
}

// private method
function genToken(user) {
	var expires = expiresIn(7); // 7 days
	var token = jwt.encode({
			exp: expires
		}, 
		require('../config/secret')()
	);
	return {
		ok: true,
		token: token,
		expires: expires,
		name: user.name,
		user: user.user,
		initials: user.initials,
		group: user.group
	};
}
function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}
function encodePassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 512, "sha512");
}
function authenticate(inputPassword, passwordHash) {
    return inputPassword == passwordHash;
}

module.exports = auth;