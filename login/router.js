var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function signup(req, res,next) {
	res.render("login/login", {layout: false});
}

function loginUser (req, res, next){
	var email = req.body.email;
	var passwd = req.body.password;
	var salt;
	var checkHash;
	function invalid (msg){ 
		res.render('login/login', {layout:false, invalid: true, message: msg});
	}   
	console.log("email:"+email);
	if (!(email && passwd)) return invalid();
	User.findOne({email: email}, function(err, user){
		if(err){
			console.log('error in data retrieval:'+err);
			return invalid(err);
		}   
		if(!user){
			return invalid('Are you sure you have an id with us? Please make one through Register link');
		}else{
			salt=user.salt;
			checkHash = hash(passwd, user.salt);
			if(checkHash == user.hash){
				console.log("checkHash: "+checkHash);
				console.log("use.hash: "+user.hash);
				req.session.isLoggedIn = true;
				req.session.user = email;
				req.session.name = user.name.first+' '+user.name.last;
				res.redirect(301, '/order');
			}
		}
	});
}

router.get("/login",signup);
router.post("/login", loginUser);

module.exports = router;
