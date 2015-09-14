var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	        _id: {type: String, lowercase: true, trim: true},
            name: {first: String, last: String},
            salt: {type: String, required: true},
            hash: {type: String, required: true},
    	    sex: {type: String},
            email: {type: String},
    	   activation_code : {type: String},
	   password_reset_code: {type: String},
	   password_reset_time: {type: Number},

});


var User = mongoose.model('User', userSchema);
module.exports=User;

