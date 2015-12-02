var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require("path");
// Database
var db = require('./../db');

/*
 * GET brand/
 * Return latest 25 quotations
 */
router.get('/', function(req, res) {
    db.brands.find({},
		{limit: 25,
		 sort: {m_id: -1}
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
					brands: docs,
				});
			}
	});
});

/*
 * POST brand/
 * Search brand with params
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
    db.brands.find(
		search_opts,
		{limit: 25,
		 sort: {m_id: -1}
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
					brands: docs,
				});
			}
	});
});

/*
 * GET brand/:limit/:first
 */
router.get('/:limit/:first', function(req, res) {
    db.brands.find({m_id: {$gt: parseInt(req.params.first)}},
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
					brands: docs,
				});
			}
	});
});

//Upload settings
var uploads = multer({
	storage: multer.diskStorage({
		destination: './uploads/manufacturer',
		filename: function(req, file, cb){
			cb(null, file.originalname);
		}
	}),
	limits: {
		files: 1
	}
});

/*
 * POST brand/add/
 */
router.post('/add/', uploads.single("logo"), function(req, res) {
	console.log(req.params.id, req.body, req.file);
	db.getNextSequenceValue("m_id");
	db.counters.findOne({name: "m_id"}).on("success", function (doc){
		var insert = {
			"m_id": doc.sequence_value,
			"full_name": req.body.full_name,
			"short_name": req.body.short_name,
			"company_name": req.body.company_name,
			"items": 0
		};
		if(req.file !== null){
			insert.logo = {
				name: req.file.filename,
				url: req.file.destination+"/"+req.file.filename,
				mime: req.file.mimetype,
				size: req.file.size
			};
		} else {
			insert.logo = {};
		}
		console.log(insert);
		db.brands.insert(insert,
			function (err, doc) {
				if (err) {
					res.send({
						ok: false,
						errMsg: err,
					});
				} else {
					res.send({
						ok: true,
						brands: [doc],
					});
				}
			});
	});
});

/*
 * POST brand/edit/:id
 */
router.post('/edit/:id', function(req, res) {
    db.brands.update({
			m_id: parseInt(req.params.id)
		},
		{ 
			$set:{
				"full_name": req.body.full_name,
				"short_name": req.body.short_name,
				"company_name": req.body.company_name
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
					brands: [doc],
				});
			}
		}
	);
});

/*
 * POST quotation/upload/:id
 */
router.post('/upload/:id', uploads.single("logo"), function(req, res) {
	if(req.file){
		db.brands.update({
				m_id: parseInt(req.params.id)
			},
			{
				$set:{
					logo : {
						name: req.file.filename,
						url: req.file.destination+"/"+req.file.filename,
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
						brands: [doc],
					});
				}
			});
	}
});



module.exports = router;