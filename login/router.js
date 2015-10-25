var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function login(req, res,next) {
	if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	if (!(req.session.errmsg)){
		req.session.regenerate(function(err){
			console.log('regenerating a session here...');
			if (err) next; 
			res.render("login/login", {layout: false});
		});
	}else{
		res.render("login/login", {layout: false, invalid: true, message: req.session.errmsg});
	}
}

function logout(req, res, next){
	delete req.session.user;
	delete req.session.name;
	req.session.isLoggedIn = false;
	delete req.session.isLoggedIn;
	delete req.session.errmsg;
	req.session.destroy();
	res.render('home/home', {layout:false});

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
			return invalid('We are so happy to have you, but could not find a login! Please make one through Register link');
		}else{
			salt=user.salt;
			checkHash = hash(passwd, user.salt);
			if(checkHash == user.hash){
				// console.log("checkHash: "+checkHash);
				// console.log("use.hash: "+user.hash);
				req.session.reload(function(err){
					console.log('setting my session variables here...');
					req.session.touch();
					req.session.isLoggedIn = true;
					req.session.user = email;
					req.session.name = user.name.first+' '+user.name.last;
					res.redirect(302, '/order');
				});
			}
		}
	});
}

router.get("/login",login);
router.post("/login", loginUser);

router.get("/logout", logout);
module.exports = router;
