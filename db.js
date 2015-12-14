var monk = require('monk');
var db = monk('mongodb://127.0.0.1/quotation');
var YEAR = 2015;
db.quotation = db.get('quotation_'+YEAR);
db.inventory = db.get('inventory');
db.brands = db.get('brands');
db.vendors = db.get('vendors');
db.stock = db.get('stock');
db.users = db.get('users');
db.groups = db.get('groups');
db.customer = db.get('customers');
db.po = db.get('po');
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

db.brands.index('m_id', {
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
 
db.vendors.index('v_id', {
    unique: true
});

db.counters.find({name: "v_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "v_id",
				sequence_value: 0,
		});
	}
 });

db.inventory.index('i_id', {
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
 
db.users.index('u_id', {
    unique: true
});

db.counters.find({name: "u_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "u_id",
				sequence_value: 0,
		});
	}
});
 
db.po.index('po_id', {
    unique: true
});

db.counters.find({name: "po_id"},
	{},
	function (err, docs){
		if(err) throw err;
		if(docs.length < 1){
			db.counters.insert({
				name: "po_id",
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