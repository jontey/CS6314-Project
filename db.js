var monk = require('monk');
var db = monk('mongodb://127.0.0.1/quotation');
var YEAR = 2015;
db.quotation = db.get('quotation_'+YEAR);
db.manufacturers = db.get('manufacturers');
db.items = db.get('items');
db.stock = db.get('stock');
db.users = db.get('users');
db.groups = db.get('groups');
db.customer = db.get('customers');
db.counters = db.get('counter');

db.quotation.index('q_id', {
    unique: true
});

db.counters.find({name: "q_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "q_id",
				sequence_value: 0,
		});
	}
 });

db.manufacturers.index('m_id', {
    unique: true
});

db.counters.find({name: "m_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "m_id",
				sequence_value: 0,
		});
	}
 });

db.items.index('i_id', {
    unique: true
});

db.counters.find({name: "i_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "i_id",
				sequence_value: 0,
		});
	}
 });

db.getNextSequenceValue = function (sequenceName, cb){
	db.counters.findAndModify({
      query:{name: sequenceName },
      update: {"$inc":{sequence_value:1}},
      "options": { "new": true, "upsert": true }
	} ,function(err,doc) {
        if (err) throw err;
        return doc.sequence_value;
      });
}

module.exports = db;