var express = require("express");
var crypto = require('crypto');
var _ = require('lodash');
var async = require('async');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var moment = require("moment");
//var mailapi = require("../api/order/router.js")
var orderApi = require("../api/order/router.js");
var mailapi = require("../api/mail/router.js");
// add these to send order confirmation emails
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport'); // this is to use the Amazon SES service
var hbs = require('nodemailer-express-handlebars'); // this helps create html emails using handlebars templates
var smtp_creds = require('../smtp_credentials.js'); // these are the smtp credentials for using Amazon SES service
// TBD move this access key id and secret access key to a separate file and require it in
var transport = nodemailer.createTransport(sesTransport({
	accessKeyId: smtp_creds.accessKeyId,
        secretAccessKey: smtp_creds.secretAccessKey,
        rateLimit: 1 // do not send more than 1 messages in a second
}));
var options = {
viewEngine: {
		extname: '.hbs',
		layoutsDir: 'views/email/',
		defaultLayout : 'template',
		partialsDir : 'views/partials/'
	  },
	viewPath: 'views/email/',
	extName: '.hbs'
};
 
transport.use('compile', hbs(options));
router.use(bodyParser());

function showOrderForm(req, res,next) {
	if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	console.log('req.session here:'+JSON.stringify(req.session));
	if (req.session.isLoggedIn){
		
		var order_num = req.params.num;
		var displayOrder = {
							order_num: '',
							delivery_address: '',
							store: '',
							order_status: '',
							ord_lines: []
						}
		
		if(order_num){
			
			console.log('order_num: get details from db ' + order_num)
			var findProductDetails = Order.findOne({"ord_number":order_num}, function(err, order){
					if(err){
						console.log('error'+ err);
					}

					if(!order){
						//display no order found message
						console.log("no order found in table")
					}
					else
					{ 
						displayOrder.order_num= order.ord_number;
						displayOrder.delivery_address= order.customer.address.adr_type;
						displayOrder.store= order.store;
						displayOrder.order_status=order.ord_status;

						async.each(order.ord_lines, function(line, callback){
							Item.findOne({"_id": line.orderItem}, function(err, item){ 										
								displayOrder.ord_lines.push({									
									name: item.name,
									quantity: line.qty,
									uom: line.uom,
									brand: line.brand,
									tagitem: line.tagitem,
									comments: line.comments
								});

								callback();
							});
						},
						function(err){
							if(err){
								//show error
								return;
							}

							console.log(JSON.stringify(displayOrder));
							res.render("orders/orderform", {layout: false, name: req.session.name, order:displayOrder });
						});

					}
					
			});
		}
		else
		{
			for (var i = 0; i < 7; i++) {
				displayOrder.ord_lines.push({									
							name: '',
							quantity: '',
							uom: '',
							brand: '',
							comments: ''
						});
			}
			res.render("orders/orderform", {layout: false, name: req.session.name,  order:displayOrder});	
		}
	}else{
		req.session.errmsg = 'Please login with your credentials to access order page';
		res.redirect(302, '/login');
	}
}


function placeOrder (req, res, next){
	console.log('req.body:'+JSON.stringify(req.body));
	console.log('req.session:'+JSON.stringify(req.session));
	var first = req.session.name.split(" ")[0];
	var last = req.session.name.split(" ")[1];
	var address = req.body.address;
	var store = req.body.store;
	var comments = req.body.ordercomments;
	var email = req.session.user;
	//var submitOrder = req.body.submitord;
	var order_status = req.body.ord_status;
	var brand=req.body.brand1;
	var order_number=parseInt(req.body.order_num);	
	var now = moment(new Date());
	var orderDate = now.format("YYYY MMM DD HH:mm");

	orderApi.createOrderHeader(first, last, address, store, comments, email,order_status,orderDate, order_number, function(err, order){
	
		if (err) {
		    console.log('Error Inserting New Data');
		    if (err.name == 'ValidationError') {
			    for (field in err.errors) {
				    console.log(err.errors[field].message); 
			    }
		    }

		    return;
		}

		async.forEachOf(req.body.item, function(name, index, callback){
			var uom = req.body.uom[index];
			var comment = req.body.comments[index];
			var quantity = req.body.quantity[index];
			var itemName = name;
			var brand=req.body.brand1[index];
			var tagitem=req.body.tagitem[index];
					

			//if item name is not empty save the line item
			if(/\S/.test(itemName)){
				orderApi.createOrderItem(order._id, comment, uom, quantity, itemName, brand, tagitem, order_number,order.ord_status,  function(err, savedOrder){
					if (err) {
					    console.log('Error Inserting New Data in orderlines');
					    if (err.name == 'ValidationError') {
						    for (field in err.errors) {
							    console.log(err.errors[field].message); 
						    }
					    }
					}

					order = savedOrder;	
					callback();									
				});
			}
			else
			{
				callback();
			}	
		},function(err){
			//err is not handled
			if(order.ord_status=="submitted"){
				mailapi.sendEmail(email);
			}

			var displayOrder = {	
				order_num: '',
				delivery_address: '',
				store: '',
				ord_lines: []
			}

			for (var i = 0; i < 7; i++) {
		 		displayOrder.ord_lines.push({									
					name: '',
					quantity: '',
					uom: '',
					brand: '',
					comments: ''
				});
			}

			res.render("orders/orderform", {layout: false, name: req.session.name, ordernumber: order.ord_number, ord_status:order.ord_status,order:displayOrder});
		});
		
	});	
}


function mobileOrder(req,res,next){
console.log('adderess' +req.body.address+','+req.body.store);
	var first =req.session.name.split(" ")[0];;
	var last =req.session.name.split(" ")[1];
	var address = req.body.address;
	var store = req.body.store;
	var comments = req.body.ordercomments;
	var email =req.session.user;

orderApi.createOrderHeader(first, last, address, store, comments, email, function(err, order){
		if (err) {
		    console.log('Error Inserting New Data');
		    next(err);
			res.json({error: err, user: null});
		    if (err.name == 'ValidationError') {
			    for (field in err.errors) {
				    console.log(err.errors[field].message); 
			    }
		    }

		    return;
		}

		req.body.item.forEach(function(name, index){

			//console.log('unit of amount  *****'+req.body.uom)

			var uom = req.body.uom[index];
			var comment = req.body.comments[index];
			var quantity = req.body.quantity[index];
			var itemName = name;			

			//if item name is not empty save the line item
			if(/\S/.test(itemName)){
				orderApi.createOrderItem(order._id, comment, uom, quantity, itemName, function(err, savedOrder){
					if (err) {
					    console.log('Error Inserting New Data');
					    	next(err);
							res.json({error: err, user: null});
					    if (err.name == 'ValidationError') {
						    for (field in err.errors) {
							    console.log(err.errors[field].message); 

						    }
					    }
					}

					order = savedOrder;

					console.log('Order num: ' + order.ord_number + 'Orderid ' + order._id + 'saved the line #'+index);
				});
			}			
		});

		mailapi.sendEmail(email);
		res.json({error: null, user: {email: email, name: first + ' ' + last, ordernumber:order.ord_number}});
		
	});	

}

router.get("/order",showOrderForm);
router.get("/order/:num",showOrderForm);
router.post("/order", placeOrder);
router.post("/mobileOrder", mobileOrder);

module.exports = router;


