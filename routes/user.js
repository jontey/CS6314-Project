var express = require('express');
var router = express.Router();
var crypto = require('crypto');
// Database
var db = require('./../db');

/*
 * POST quotation/
 * Search quotation with params
 */
router.post('/', function(req, res) {
	var search_opts = {};
	var TABLE__USER_HEADERS = [
		"No",
		"User",
		"Initials",
		"Group",
		"Name"
	];
	for(var i=0; i<TABLE__USER_HEADERS.length; i++){
		if(req.body[TABLE__USER_HEADERS[i]] != null){
			search_opts[TABLE__USER_HEADERS[i]] = new RegExp(req.body[TABLE__USER_HEADERS[i]], "i");
		}
	}
	console.log(search_opts);
    db.users.find(
		search_opts,
		{
			limit: 25,
			sort: {u_id: -1},
			fields: {
				password: 0,
				salt: 0
			}
		},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					users: docs,
				});
			}
	});
});

/*
 * POST user/add/
 */
router.post('/add/', function(req, res) {
	var salt = generateSalt();
	var password = encodePassword(req.body.password, salt);
	
	db.getNextSequenceValue("u_id");
	db.counters.findOne({name: "u_id"}).on("success", function (doc){
		db.users.insert({
			"u_id": doc.sequence_value,
			"user": req.body.user,
			"initials": req.body.initials,
			"group": req.body.group,
			"name": req.body.name,
			"salt": salt.toString("hex"),
			"password": password.toString("hex")
		},
		function (err, doc) {
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					users: [doc],
				});
			}
		});
	});
});

/*
 * POST user/edit/:id
 */
router.post('/edit/:id', function(req, res) {
	var update_set = {
		"user": req.body.user,
		"initials": req.body.initials,
		"group": req.body.group,
		"name": req.body.name
	};
	if(req.body.password != null){
		var salt = generateSalt();
		var password = encodePassword(req.body.password, salt);
		update_set.password = password.toString("hex");
		update_set.salt = salt.toString("hex");
	}
	
	db.users.update({
		u_id: parseInt(req.params.id)
	},
	{
		$set: update_set
	},
	function (err, doc){
		if(err) {
			console.log(err);
			res.send({
				ok: false,
				errMsg: err
			});
		} else {
			res.send({
				ok: true,
				users: [doc],
			});
		}
	});
});

//Private functions
function generateSalt() {
    return crypto.randomBytes(256).toString("hex");
}

function encodePassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 512, "sha512");
}

function authenticate(inputPassword, passwordHash) {
    return inputPassword == passwordHash;
}

module.exports = router;