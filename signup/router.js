var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');

var upload = multer({dest: './public/img/'});

router.use(bodyParser());
router.use(upload.array());

function signup(req, res,next) {
	res.render("signup/signup", {layout: false});
}

function createUser (req, res, next){
	console.log('req.param email:'+req.param('email'));
	crypto.randomBytes(16, function(err, bytes){
		if (err) return next(err);
		var user = {email: req.body.email};
		user.name = {}; 
		user.salt = bytes.toString('utf8');
		user.hash = hash(req.body.password, user.salt);
		user.name["first"] = req.body.firstname;
		user.name["last"] = req.body.lastname;
		User.findOne({email: req.body.email}, function(err, foundUser){
			if (foundUser){
				res.render("signup/signup", {layout: false, msg: "User already exists! Send an email to support@conjoinz.com"});
			}else{
				User.create(user, function(err, newUser){
					if (err){
						if(err instanceof mongoose.Error.ValidationError) {
							return invalid();
						}   
						return next(err);
					}   
					req.session.isLoggedIn = true;
					req.session.user = newUser.email;
					req.session.name = newUser.name["first"]+' '+newUser.name["last"];
					//res.render("orders/orderform", {layout: false});
					res.redirect(301, '/order');
				}); 
			}
		});
	}); 
}

// mobile api register
function RegisterUser(req, res, next){
	console.log('req.param email:'+req.param('email'));
	crypto.randomBytes(16, function(err, bytes){
		if (err) return next(err);
		var user = {email: req.body.email};
		user.name = {}; 
		user.salt = bytes.toString('utf8');
		user.hash = hash(req.body.password, user.salt);
		user.name["first"] = req.body.firstname;
		user.name["last"] = req.body.lastname;
		User.findOne({email: req.body.email}, function(err, foundUser){
			if (foundUser){
				err = new Error("User already exists! Send an email to support@conjoinz.com");
				res.json({error: {error: 'User already exists! Send an email to support@conjoinz.com'}, user: null, status:false});
				//res.render("signup/signup", {layout: false, msg: "User already exists! Send an email to support@conjoinz.com"});
			}else{
				User.create(user, function(err, newUser){
					if (err){
						if(err instanceof mongoose.Error.ValidationError) {
							return invalid();
						}   
						return next(err);
					}   
					req.session.isLoggedIn = true;
					req.session.user = newUser.email;
					req.session.name = newUser.name["first"]+' '+newUser.name["last"];

					res.json({error: null, user: {email: user.email, name: user.name.first + ' ' + user.name.last}, status:true});
					
				}); 
			}
		});
	}); 
}

router.post("/mobileRegister",upload.array(), RegisterUser);
router.get("/signup",signup);
router.post("/signup", upload.array(), createUser);

module.exports = router;
