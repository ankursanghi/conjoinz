// var express = require("express");
// var crypto = require('crypto');
var hash = require('../../utils/hash.js');
var User = require('../../models/user.js');

module.exports.findUser =  function(email, passwd, callback){
		User.findOne({email: email}, function(err, user){
			if(err){
				console.log('error in data retrieval:'+err);
				callback(err, null);
			}   
			if(!user){
				callback(new Error('We are so happy to have you, but could not find a login! Please make one through Register link', null));
			}else{
				var salt=user.salt;
				var checkHash = hash(passwd, user.salt);
				if(checkHash == user.hash){
					callback(null, user);
				}
				else
				{
					callback(new Error('We are so happy to have you, but could not find a login! Please make one through Register link', null));
				}
			}
		});
	
}