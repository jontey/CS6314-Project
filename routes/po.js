var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require("path");
// Database
var db = require('./../db');

/*
 * POST po/
 * Search po with params
 */
router.post('/', function(req, res) {
	var search_opts = {};
	var TABLE_HEADERS = [
		"p_id",
		"p_date",
		"vendor",
		"total",
		"currency",
		"conversion",
		"cost",
		"delivery",
		"retail",
		"edit"
	];
	for(var i=0; i<TABLE_HEADERS.length; i++){
		if(req.body[TABLE_HEADERS[i]] != null){
			search_opts[TABLE_HEADERS[i]] = new RegExp(req.body[TABLE_HEADERS[i]], "i");
		}
	}
	console.log(search_opts);
    db.po.find(
		search_opts,
		{limit: 25,
		 sort: {po_id: -1}
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
					pos: docs,
				});
			}
	});
});

/*
 * POST po/add/
 * items is an array
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("po_id");
	console.log(req.body);
	db.counters.findOne({name: "po_id"}).on("success", function (doc){
		db.po.insert({
				"po_id": doc.sequence_value,
				"p_id": req.body.p_id,
				"p_date": req.body.p_date,
				"vendor": req.body.vendor,
				"currency": req.body.currency,
				"conversion": req.body.conversion
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
						pos: [doc],
					});
				}
			});
	});
});

/*
 * POST po/edit/:id
 */
router.post('/edit/:id', function(req, res) {
	var edit_opts = {};
	var TABLE_HEADERS = [
		"p_id",
		"p_date",
		"vendor",
		"total",
		"currency",
		"conversion",
		"cost",
		"delivery",
		"retail",
		"edit"
	];
	for(var i=0; i<TABLE_HEADERS.length; i++){
		if(req.body[TABLE_HEADERS[i]] != null){
			edit_opts[TABLE_HEADERS[i]] = req.body[TABLE_HEADERS[i]];
		}
	}
    db.po.update({ po_id: parseInt(req.params.id) },
		{ $set: edit_opts},
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
					pos: [doc],
				});
			}
		});
});

router.post('/update', function(req,res){
	db.inventory.find({
		p_id: req.body.p_id
	},
	{
		
	},function (err, docs){
		var cost = 0;
		var delivery = 0;
		var tax_cost = 0;
		var retail = 0;
		for(var i=0; i<docs.length; i++){
			cost += parseFloat(docs[i].unit_cost)+parseFloat(docs[i].tax_cost);
			delivery += parseFloat(docs[i].delivery);
			tax_cost += parseFloat(docs[i].tax_cost);
			retail += (parseFloat(docs[i].unit_cost)+parseFloat(docs[i].delivery)+parseFloat(docs[i].tax_cost))*(parseFloat(docs[i].markup)/100+1);
		}
		db.po.update(
			{ 
				p_id: req.body.p_id
			},
			{
				$set: {
					total: ""+docs.length,
					cost: ""+cost,
					delivery: ""+delivery,
					retail: ""+retail
				}
			},
			function (err, doc){
				if(err) {
					res.send({
						ok: false,
						errMsg: err
					});
				} else {
					res.send({
						ok: true,
						pos: [doc],
					});
				}
			}
		);
	});
});

module.exports = router;