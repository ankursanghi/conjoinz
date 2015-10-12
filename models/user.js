var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
            name: {first: String, last: String},
    	    type: {type: String},
            salt: {type: String, required: true},
            hash: {type: String, required: true},
    	    sex: {type: String},
            email: {type: String},
    	    delivery_addresses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Address'}],
    	   activation_code : {type: String},
	   password_reset_code: {type: String},
	   password_reset_time: {type: Number},

});


var User = mongoose.model('User', userSchema);
module.exports=User;

