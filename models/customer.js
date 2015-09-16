var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
            name: {first: String, last: String},
    	    primary_address: {type: mongoose.Schema.Types.ObjectId, ref: 'address'},
    	    primary_phone: {type: String},
    	    payment_method: {type: String},
});


var Customer = mongoose.model('Customer', customerSchema);
module.exports=Customer;

