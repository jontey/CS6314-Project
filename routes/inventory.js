var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require("path");
// Database
var db = require('./../db');

/*
 * POST inventory/
 * Search inventory with params
 */
router.post('/', function(req, res) {
	var search_opts = {};
	var TABLE_HEADERS = [
		"i_id",
		"p_id",
		"p_date",
		"brand",
		"name",
		"branch",
		"serial",
		"landed_cost",
		"retail",
		"status",
		"notes"
	];

	for(var i=0; i<TABLE_HEADERS.length; i++){
		if(req.body[TABLE_HEADERS[i]] != null){
			search_opts[TABLE_HEADERS[i]] = new RegExp(req.body[TABLE_HEADERS[i]], "i");
		}
	}
	console.log(search_opts);
    db.inventory.find(
		search_opts,
		{limit: 25,
		 sort: {i_id: -1}
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
					items: docs,
				});
			}
	});
});
/*
 * POST inventory/add/
 * items is an array
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("i_id");
	db.counters.findOne({name: "i_id"}).on("success", function (doc){
		db.inventory.insert({
				"i_id": doc.sequence_value,
				"p_id": req.body.p_id,
				"p_date": req.body.p_date,
				"brand": req.body.brand,
				"name": req.body.name,
				"branch": req.body.branch,
				"serial": req.body.serial,
				"unit_cost": req.body.unit_cost,
				"delivery": req.body.delivery,
				"tax_cost": req.body.tax_cost,
				"markup": req.body.markup,
				"status": req.body.status,
				"notes": req.body.notes
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
 * POST inventory/edit/:id
 */
router.post('/edit/:id', function(req, res) {
	var save_table = [
		"p_id",
		"p_date",
		"brand",
		"name",
		"branch",
		"serial",
		"unit_cost",
		"delivery",
		"tax_cost",
		"markup",
		"status",
		"notes"
	];
	var set_opts = {};
	for(var i=0; i<save_table.length; i++){
		if(req.body[save_table[i]] != null){
			set_opts[save_table[i]] = req.body[save_table[i]];
		}
	}
    db.inventory.update({ i_id: parseInt(req.params.id) },
						{ $set: set_opts},
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
									items: [doc],
								});
							}
						});
});


module.exports = router;