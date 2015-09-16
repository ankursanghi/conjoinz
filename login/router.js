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
	function invalid (){ 
		res.render('login/login', {layout:false, invalid: true});
	}   
	console.log("email:"+email);
	if (!(email && passwd)) return invalid();
	User.findOne({_id: email}, function(err, user){
		if(err){
			return invalid();
		}   
		if(!user){
			return invalid();
		}else{
			salt=user.salt;
			checkHash = hash(passwd, user.salt);
			if(checkHash == user.hash){
				console.log("checkHash: "+checkHash);
				console.log("use.hash: "+user.hash);
				req.session.isLoggedIn = true;
				req.session.user = email;
				req.session.name = user.name.first+' '+user.name.last;
				res.writeHead(301, {Location: '/order'});
			}
		}
	});
}

router.get("/login",signup);
router.post("/login", loginUser);

module.exports = router;
