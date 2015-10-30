var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var saveUsers = require("../api/signup/router.js")
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');

var upload = multer({dest: './public/img/'});

router.use(bodyParser());
router.use(upload.array());

function invalid (msg){ 
		res.render('login/login', {layout:false, invalid: true, message: msg});
	}

function signup(req, res,next) {
	res.render("signup/signup", {layout: false});
}

function createUser (req, res, next){
	console.log('req.body:'+JSON.stringify(req.body));
	console.log('req.param email:'+req.param('email'));
	crypto.randomBytes(16, function(err, bytes){
		if (err) return next(err);
		var user = {email: req.body.email};
		user.name = {}; 
		user.salt = bytes.toString('utf8');
		user.hash = hash(req.body.pwd, user.salt);
		user.name["first"] = req.body.firstname;
		user.name["last"] = req.body.lastname;
		saveUsers.saveUser(user,req,function(err,save){
			if(err){
				invalid('User already exists! Send an email to support@conjoinz.com');
			}else{
				res.render("orders/login", {layout: false});
			}


		});
		/*User.findOne({email: req.body.email}, function(err, foundUser){
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
					console.log("new user added:"+JSON.stringify(newUser));
					req.session.isLoggedIn = true;
					req.session.user = req.body.email;
					req.session.name = req.body.firstName+' '+req.body.lastName;
					//res.render("orders/orderform", {layout: false});
					res.redirect(301, '/order');
				}); 
			}
		});*/

	res.redirect(301, '/login');
	}); 
}

router.get("/signup",signup);
router.post("/signup", upload.array(), createUser);

module.exports = router;
