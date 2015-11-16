var monk = require('monk');
var db = monk('mongodb://localhost/quotation');
var YEAR = 2015;
db.quotation = db.get('quotation_'+YEAR);
db.manufacturers = db.get('manufacturers');
db.items = db.get('items');
db.stock = db.get('stock');
db.quotation_items = db.get('quotation_items_'+YEAR);
db.users = db.get('users');
db.groups = db.get('groups');
db.customer = db.get('customers');
db.counters = db.get('counter');

db.quotation.index('q_id', {
    unique: true
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