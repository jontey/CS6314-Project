var express = require('express');
var router = express.Router();
// Database
var db = require('./../db');

/*
 * GET vendor/
 * Return latest 25 quotations
 */
router.get('/', function(req, res) {
    db.vendors.find({},
		{limit: 25,
		 sort: {v_id: -1}
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
					vendors: docs,
				});
			}
	});
});

/*
 * POST vendor/
 * Search vendor with params
 */
router.post('/', function(req, res) {
	var search_opts = {};
	var TABLE_HEADERS = [
		"full_name",
		"short_name",
		"company_name"
	];
	for(var i=0; i<TABLE_HEADERS.length; i++){
		if(req.body[TABLE_HEADERS[i]] != null){
			search_opts[TABLE_HEADERS[i]] = new RegExp(req.body[TABLE_HEADERS[i]], "i");
		}
	}
	console.log(search_opts);
    db.vendors.find(
		search_opts,
		{limit: 25,
		 sort: {v_id: -1}
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
					vendors: docs,
				});
			}
	});
});

/*
 * GET vendor/:limit/:first
 */
router.get('/:limit/:first', function(req, res) {
    db.vendors.find({v_id: {$gt: parseInt(req.params.first)}},
		{limit: req.params.limit},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					vendors: docs,
				});
			}
	});
});

/*
 * POST vendor/add/
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("v_id");
	db.counters.findOne({name: "v_id"}).on("success", function (doc){
		db.vendors.insert({
				"v_id": doc.sequence_value,
				"name": req.body.name,
				"address": req.body.address,
				"phone": req.body.phone,
				"email": req.body.email
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
						vendors: [doc],
					});
				}
			});
	});
});

/*
 * POST vendor/edit/:id
 */
router.post('/edit/:id', function(req, res) {
    db.vendors.update({
			v_id: parseInt(req.params.id)
		},
		{ 
			$set:{
				"name": req.body.name,
				"address": req.body.address,
				"phone": req.body.phone,
				"email": req.body.email
			}
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
					vendors: [doc],
				});
			}
		}
	);
});

module.exports = router;