var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var dbConn = require('./db.js');

var orderSchema= mongoose.Schema({
	ord_status: {type: String},
	ordDate: {type: String},

    	ord_number: {type: Number}, // auto sequence - don't have to assign in code
        comments: {type: String},
        ord_lines: [{
		line_status: {type: String},
		comments: {type: String},
		uom: {type: String},
		orderItem: {type: mongoose.Schema.Types.ObjectId, ref: 'item'},
		qty: {type: Number},
		
	}],

        customer: {
		name: {first: String, last: String},
		primary_phone: {type: String},
		payment_method: {type: String},
    		address:{
			adr_type: {type: String},
			adr_line1: {type: String},
			adr_line2: {type: String},
			city: {type: String},
			state: {type: String},
			country: {type: String},
			zip : {type: Number},
		}
	},
	store: {type: String},
});

autoIncrement.initialize(dbConn.connection);
orderSchema.plugin(autoIncrement.plugin, {model: 'Order', field: 'ord_number'});
var Order= mongoose.model('Order', orderSchema);
module.exports=Order;

