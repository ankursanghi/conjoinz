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
	console.log('req.body:'+req.body);
	console.log('req.param email:'+req.param('email'));
	crypto.randomBytes(16, function(err, bytes){
		if (err) return next(err);
		var user = {_id: req.body.email};
		user.name = {}; 
		user.salt = bytes.toString('utf8');
		user.hash = hash(req.body.pwd, user.salt);
		user.name.first = req.body.firstName;
		user.name.last = req.body.lastName;
		User.findOne({_id: req.body.email}, function(err, foundUser){
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
				}); 
				req.session.isLoggedIn = true;
				req.session.user = req.body.email;
				req.session.name = req.body.firstName+' '+req.body.lastName;
				res.send('done creating user:'+req.body.email);
			}
		})
		// do a redirect to an order page here
//		res.writeHead(301, {Location: '/order'});
	}); 
}

router.get("/signup",signup);
router.post("/signup", upload.array(), createUser);

module.exports = router;
