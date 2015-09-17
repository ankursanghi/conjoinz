var express = require("express");
var crypto = require('crypto');
var Order = require('../models/order.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function showOrderForm(req, res,next) {
	console.log('show the order form...');
	res.render("orders/orderform", {layout: false, name: req.session.name});
}

function placeOrder (req, res, next){
	console.log('order placed');
}


router.get("/order",showOrderForm);
router.post("/order", placeOrder);

module.exports = router;
