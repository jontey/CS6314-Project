var express = require('express');
var router = express.Router();
// Database
var db = require('./../db');

/*
 * GET manufacturers/
 * LIMIT 100
 */
router.get('/', function(req, res) {
    db.manufacturers.find({},
		{limit: 100},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					manufactuers: docs,
				});
			}
	});
});

/*
 * GET manufacturers/:id
 */
router.get('/:id', function(req, res) {
    db.manufacturers.find({m_id: parseInt(req.params.id)},
		{},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					manufactuers: docs,
				});
			}
	});
});

/*
 * POST manufacturers/add/
 * @TODO - Check for already existing manufacturer
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("m_id");
	db.counters.findOne({name: "m_id"}).on("success", function (doc){
		db.manufacturers.insert({
								"m_id": doc.sequence_value,
								"name": req.body.name,
								"address": req.body.address,
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
						manufactuers: [doc],
					});
				}
			});
		});
});

/*
 * POST manufacturers/edit/:id
 */
router.post('/edit/:id', function(req, res) {
    db.manufacturers.update({ m_id: parseInt(req.params.id) },
							{ $set:{
								"name": req.body.name,
								"address": req.body.address,
							}},
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
				result: doc,
			});
		}
	});
});

/*
 * POST manufacturers/search/
 */
router.post('/search/', function(req, res) {
    db.manufacturers.find({m_id: {$in: req.body.ids}},
		{},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					manufactuers: docs,
				});
			}
	});
});


module.exports = router;