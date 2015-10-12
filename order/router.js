var express = require("express");
var crypto = require('crypto');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


router.use(bodyParser());

function showOrderForm(req, res,next) {
	if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
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
	console.log('req.session:'+JSON.stringify(req.session));
	var order = {};
	var options = {upsert: true, new: true};
	order.ord_status = 'submitted';
	order.comments = req.body.ordercomments;
	order.customer = {};
	order.customer.name = {};
	order.customer.name.first = req.session.name.split(" ")[0];
	order.customer.name.last = req.session.name.split(" ")[1];	
	order.customer.primary_phone = '111-111-1111';
	order.customer.address = {};
	order.customer.address.adr_type= 'home';
	order.customer.address.adr_line1= 'get line 1 from customer profile';
	order.customer.address.adr_line2= 'get line 2 from customer profile or order selection';
	order.customer.address.city= 'city from profile or selection';
	order.customer.address.state= 'state from address selection';
	order.customer.address.zip= 11111;
	Order.create(order, function(err, newOrder){
		if (err) {
		    console.log('Error Inserting New Data');
		    if (err.name == 'ValidationError') {
			    for (field in err.errors) {
				    console.log(err.errors[field].message); 
			    }
		    }
		}
		req.body.item.forEach(function(itm,index){
			if (itm != ''){
				var item = {};
				item.name = itm;
				item.uom = req.body.uom[index];	
				Item.findOneAndUpdate({name: itm},item, options, function(err, itemSaved){
					if (err) {
					    console.log('Error Inserting New Data');
					    if (err.name == 'ValidationError') {
						    for (field in err.errors) {
							    console.log(err.errors[field].message); 
						    }
					    }
					}
					console.log('itemSaved is:'+itemSaved);
					var ordLine = {};
					ordLine.line_status = 'submitted';
					ordLine.comments = req.body.comments[index];
					ordLine.uom = req.body.uom[index];
					ordLine.qty = req.body.quantity[index];
					ordLine.orderItem = itemSaved._id;
					Order.findOneAndUpdate({_id: newOrder._id}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
						if (err) {
						    console.log('Error Inserting New Data');
						    if (err.name == 'ValidationError') {
							    for (field in err.errors) {
								    console.log(err.errors[field].message); 
							    }
						    }
						}
						console.log('saved the line #'+index);
					});
				});	
			}
		});
	});
	res.send('placed for real');
}

router.get("/order",showOrderForm);
router.post("/order", placeOrder);

module.exports = router;
