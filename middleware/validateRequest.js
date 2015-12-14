var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;
 
module.exports = function(req, res, next) {
	// When performing a cross domain request, you will recieve
	// a preflighted request first. This is to check if our the app
	// is safe. 

	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

	if (token || key) {
		try {
			var decoded = jwt.decode(token, require('../config/secret.js')());

			if (decoded.exp <= Date.now()) {
				res.status(400);
				res.json({
					"status": 400,
					"message": "Token Expired"
				});
				return;
			}

			// Authorize the user to see if he can access our resources
			validateUser(key, function(dbUser){
				if (dbUser) {
					if ((req.url.indexOf('user') >= 0 && dbUser.group == 'Administrator')
						|| (req.url.indexOf('user') < 0)) {
						console.log(dbUser.user+" accessed "+req.url);
						next(); // To move to next middleware
					} else {
						res.status(403);
						res.json({
							"status": 403,
							"message": "Not Authorized"
						});
					}
				} else {
					// No user with this name exists, respond back with a 401
					res.status(401);
					res.json({
						"status": 401,
						"message": "Invalid User"
					});
				}
			});
		} catch (err) {
			res.status(420);
			res.json({
				"status": 420,
				"message": "Not logged in",
				"error": err
			});
		}
	} else {
		res.status(401);
		res.json({
			"status": 401,
			"message": "Invalid Token or Key"
		});
		return;
	}
};