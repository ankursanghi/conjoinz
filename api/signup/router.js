var express = require("express");
var crypto = require('crypto');
var User = require('../../models/user.js');
var hash = require('../../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');

module.exports.saveUser =  function(user,req,callback){

	User.findOne({email: req.body.email}, function(err, foundUser){
			if (foundUser){
				res.render("signup/signup", {layout: false, msg: "User already exists! Send an email to support@conjoinz.com"});
			}else{
				User.create(user, function(err, newUser){
					if (err){
						if(err instanceof mongoose.Error.ValidationError) {
							//return invalid();
							callback(err,null);
						}   
						return next(err);
					}   
					console.log("new user added:"+JSON.stringify(newUser));
					req.session.isLoggedIn = true;
					req.session.user = req.body.email;
					req.session.name = req.body.firstName+' '+req.body.lastName;
					console.log('session of the User'+req.session.name  )
					callback(null,save);
					//res.render("orders/orderform", {layout: false});
					
				}); 
			} 
		});
}