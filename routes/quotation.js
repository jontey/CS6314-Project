var express = require('express');
var router = express.Router();
// Database
var db = require('./../db');

/*
 * GET quotation/
 * Return latest 25 quotations
 */
router.get('/', function(req, res) {
    db.quotation.find({},
		{limit: 25},
		function (err, docs){
			if (err) {
				res.send({
					ok: false,
					errMsg: err,
				});
			} else {
				res.send({
					ok: true,
					quotations: docs,
				});
			}
	});
});

/*
 * GET quotation/:limit/:first
 */
router.get('/:limit/:first', function(req, res) {
    db.quotation.find({q_id: {$gt: parseInt(req.params.first)}},
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
					quotations: docs,
				});
			}
	});
});

/*
 * POST quotation/add/
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("q_id");
	db.counters.findOne({name: "q_id"}).on("success", function (doc){
		db.quotation.insert({
							"q_id": doc.sequence_value,
							"date": new Date(),
							"u_id": req.body.u_id,
							"c_id": req.body.c_id,
							"total": req.body.total,
							"version": req.body.version,
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
						quotation: [doc],
					});
				}
			});
	});
});

/*
 * POST quotation/edit/:id
 */
router.post('/edit/:id', function(req, res) {
	console.log(req.params.id, req.body.u_id, req.body.c_id);
    db.quotation.update({ q_id: parseInt(req.params.id) },
						{ $set:{
							u_id: req.body.u_id,
							c_id: req.body.c_id,
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
									result: [doc],
								});
							}
						});
});


module.exports = router;