// var express = require("express");
// var crypto = require('crypto');

var express = require("express");
var bodyParser = require('body-parser');
//var router = new express.Router();
var hash = require('../../utils/hash.js');
var User = require('../../models/user.js');


//router.use(bodyParser());
module.exports.findUser =  function(email, passwd, callback){
		User.findOne({email: email}, function(err, user){
			if(err){
				console.log('error in data retrieval:'+err);
				callback(err, null);
			}   
			if(!user){
				callback(new Error('User id or password incorrect', null));
			}else{
				var salt=user.salt;
				var checkHash = hash(passwd, user.salt);
				if(checkHash == user.hash){
					callback(null, user);
				}
				else
				{
					callback(new Error('User id or password incorrect', null));
				}
			}
		});
	
}


