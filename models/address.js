var mongoose = require('mongoose');

var addressSchema = mongoose.Schema({
	adr_nick: {type: String},
	adr_type: {type: String},
        adr_line1: {type: String},
        adr_line2: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        zip : {type: Number},
    	phone: {type: String},
});


var Address = mongoose.model('Address', addressSchema);
module.exports=Address;

