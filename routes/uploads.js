var express = require('express');
var router = express.Router();
// Database
var db = require('./../db');

router.get('/quotation/:year/:filename', function (req, res){
		db.quotation.find({
			file:{
				$elemMatch:{
					name: req.params.filename
				}
			}
		},
		function (err, docs){
			if (err) {
				//Send 404
			} else {
				console.log(docs);
				var file = {};
				for(var i=0; i<docs[0].file.length; i++){
					if(docs[0].file[i].name == req.params.filename){
						file = docs[0].file[i];
					}
				}
				res.download(file.url, docs[0].q_id+file.ext);
			}
	});
	}
);

router.get('/manufacturer/:filename', function (req, res){
	db.brands.find({
			"logo.name": req.params.filename
		},
		function (err, docs){
			if (err) {
				//Send 404
			} else {
				if(docs.length < 1)
					return;
				if(docs[0].logo == null)
					return;
				var file = docs[0].logo;
				res.download(file.url, file.name);
			}
	});
	}
);

module.exports = router;