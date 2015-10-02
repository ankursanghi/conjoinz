var express = require("express");
var User = require('../models/user.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function profile(req, res,next) {
	if (req.session.isLoggedIn){
		res.render("profile/profile", {layout: false});
	}else{
		req.session.errmsg = 'Please login with your credentials to access profile page';
		res.redirect(302, '/login');
	}
}

function updateProfile(req, res, next){
	res.send('still To be developed...');
}

router.get("/profile",profile);
router.post("/profile", updateProfile);

module.exports = router;
