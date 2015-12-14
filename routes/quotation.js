var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require("path");
// Database
var db = require('./../db');

/*
 * GET quotation/
 * Return latest 25 quotations
 */
router.get('/', function(req, res) {
    db.quotation.find({},
		{limit: 25,
		 sort: {q_id: -1}
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
					quotations: docs,
				});
			}
	});
});

/*
 * POST quotation/
 * Search quotation with params
 */
router.post('/', function(req, res) {
	var search_opts = {};
	var TABLE_HEADERS = [
		"date",
		"quotation_number",
		"by",
		"customer",
		"manufacturer",
		"item",
		"total"
	];
	for(var i=0; i<TABLE_HEADERS.length; i++){
		if(req.body[TABLE_HEADERS[i]] != null){
			search_opts[TABLE_HEADERS[i]] = new RegExp(req.body[TABLE_HEADERS[i]], "i");
		}
	}
	console.log(search_opts);
    db.quotation.find(
		search_opts,
		{limit: 25,
		 sort: {q_id: -1}
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

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/*
 * POST quotation/add/
 * items is an array
 */
router.post('/add/', function(req, res) {
	db.getNextSequenceValue("q_id");
	db.counters.findOne({name: "q_id"}).on("success", function (doc){
		db.quotation.insert({
				"q_id": doc.sequence_value,
				"date": req.body.date,
				"quotation_number": "EA/Q/"+pad(doc.sequence_value, 4)+"/15/"+req.body.by,
				"by": req.body.by,
				"customer": req.body.customer,
				"manufacturer": req.body.manufacturer,
				"item": req.body.item,
				"total": req.body.total,
				"file": []
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
						quotations: [doc],
					});
				}
			});
	});
});

/*
 * POST quotation/edit/:id
 */
router.post('/edit/:id', function(req, res) {
    db.quotation.update({ q_id: parseInt(req.params.id) },
						{ $set:{
							"by": req.body.by,
							"customer": req.body.customer,
							"manufacturer": req.body.manufacturer,
							"item": req.body.item,
							"total": req.body.total
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
									quotations: [doc],
								});
							}
						});
});

//Upload settings
var uploads = multer({
	storage: multer.diskStorage({
			destination: './uploads/quotation/2015'
		}),
	limits: {
		files: 1
	}
});

/*
 * POST quotation/upload/:id
 */
router.post('/upload/:id', uploads.single("file"), function(req, res) {
	console.log(req.params.id, req.body, req.file);
	if(req.file){
		db.quotation.update({q_id: parseInt(req.params.id) },
							{
								$push:{
									file:{
										ext: path.extname(req.file.originalname),
										url: req.file.destination+"/"+req.file.filename,
										dest: req.file.destination,
										name: req.file.filename,
										mime: req.file.mimetype,
										size: req.file.size
									}
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
										quotations: [doc],
									});
								}
							});
	}
});

module.exports = router;