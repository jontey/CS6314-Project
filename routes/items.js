var express = require('express');
var router = express.Router();
// Database
var db = require('./../db');

/*
 * GET items/
 * LIMIT 100
 */
router.get('/', function(req, res) {
    db.items.find({},
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
					items: docs,
				});
			}
	});
});

/*
 * GET items/:id
 */
router.get('/:id', function(req, res) {
    db.items.find({i_id: parseInt(req.params.id)},
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
					items: docs,
				});
			}
	});
});

/*
 * POST items/add/
 * @TODO - Check for already existing manufacturer
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("i_id");
	db.counters.findOne({name: "i_id"}).on("success", function (doc){
		db.items.insert({
						"i_id": doc.sequence_value,
						"m_id": req.body.m_id,
						"name": req.body.name,
						"model": req.body.model,
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
						items: [doc],
					});
				}
			});
		});
});

/*
 * POST items/edit/:id
 */
router.post('/edit/:id', function(req, res) {
    db.items.update({ i_id: parseInt(req.params.id) },
					{ $set:{
						"m_id": req.body.m_id,
						"name": req.body.name,
						"model": req.body.model,
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
 * POST items/search/
 */
router.post('/search/', function(req, res) {
    db.items.find({i_id: {$in: req.body.ids}},
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
					items: docs,
				});
			}
	});
});


module.exports = router;