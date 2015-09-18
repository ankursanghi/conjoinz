var mongoose = require('mongoose');

var addressSchema = mongoose.Schema({
	adr_type: {type: String},
        adr_line1: {type: String},
        adr_line2: {type: String},
        city: {type: String},
        state: {type: String},
        zip : {type: Number},
});


var Address = mongoose.model('Address', addressSchema);
module.exports=Address;
