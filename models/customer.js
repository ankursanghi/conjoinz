var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
        name: {first: String, last: String},
    	primary_phone: {type: String},
    	payment_method: {type: String},
	adr_type: {type: String},
	adr_line1: {type: String},
	adr_line2: {type: String},
	city: {type: String},
	state: {type: String},
	zip : {type: Number},
});


var Customer = mongoose.model('Customer', customerSchema);
module.exports=Customer;

