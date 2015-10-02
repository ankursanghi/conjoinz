var express = require("express");
var crypto = require('crypto');
var Order = require('../models/order.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function showOrderForm(req, res,next) {
	if (req.session.isLoggedIn){
		console.log('show the order form...');
		res.render("orders/orderform", {layout: false, name: req.session.name});
	}else{
		req.session.errmsg = 'Please login with your credentials to access order page';
		res.redirect(302, '/login');
	}
}

function placeOrder (req, res, next){
	console.log('req.body:'+JSON.stringify(req.body));
	console.log('order placed');
	res.send('order placed');
}


router.get("/order",showOrderForm);
router.post("/order", placeOrder);

module.exports = router;
