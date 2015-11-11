var express = require("express");
var crypto = require('crypto');
var _ = require('lodash');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
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
	 // console.log('req.session here:'+JSON.stringify(req.session));
	if (req.session.isLoggedIn){
		// console.log('show the order form...');
		res.render("orders/orderform", {layout: false, name: req.session.name});
	}else{
		req.session.errmsg = 'Please login with your credentials to access order page';
		res.redirect(302, '/login');
	}
}

function placeOrder (req, res, next){
	// console.log('req.body:'+JSON.stringify(req.body));
	// console.log('req.session:'+JSON.stringify(req.session));
	var userQuery = {};
	userQuery.name = {};
	userQuery.name.first = req.session.name.split(" ")[0];
	userQuery.name.last = req.session.name.split(" ")[1];
	userQuery.email = req.session.user;
	var findUserQuery = User.findOne(userQuery);
	findUserQuery.populate('delivery_addresses').exec(function(err, usr){
		usr.delivery_addresses.forEach(function(adr){
			// console.log('adr_nick from user:'+adr.adr_nick);
			if (adr.adr_nick == req.body.address){ // if the address nick from the form is equal to one of the addresses in the user's delivery addresses
				var order = {};
				var options = {upsert: true, new: true};
				order.ord_status = 'submitted';
				order.comments = req.body.ordercomments;
				order.store = req.body.store;
				order.customer = {};
				order.customer.name = {};
				order.customer.name.first = req.session.name.split(" ")[0];
				order.customer.name.last = req.session.name.split(" ")[1];	
				order.customer.primary_phone = adr.phone;
				order.customer.address = {};
				order.customer.address.adr_type= adr.adr_type;
				order.customer.address.adr_line1= adr.adr_line1;
				order.customer.address.adr_line2= adr.adr_line2;
				order.customer.address.city= adr.city;
				order.customer.address.state= adr.state;
				order.customer.address.country = adr.country;
				order.customer.address.zip= adr.zip;
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
							var ordLine = {};
							ordLine.line_status = 'submitted';
							ordLine.comments = req.body.comments[index];
							ordLine.uom = req.body.uom[index];
							ordLine.qty = req.body.quantity[index];
							newOrder.ord_lines[index] = _.cloneDeep(ordLine);
							newOrder.ord_lines[index]['item'] = itm;
							newOrder.userEmail = req.session.user;
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
									// console.log('saved the line #'+index);
								});
							});	
						}
					});
					sendEmail(newOrder);
					res.render("orders/orderform", {layout: false, name: req.session.name, ordernumber: newOrder.ord_number});
				});
			}
		});
	});
}

function sendEmail(newOrder){
	transport.sendMail({
	 from: 'support@valetbasket.com',
	 replyTo: 'support@valetbasket.com',
	 to: newOrder.userEmail,
	 cc: 'support@valetbasket.com',
	 subject: 'Thank you for your order!',
	 template: 'email.body',
	 context: {
	      order : newOrder,
		 }
	});
	transport.close();
}
router.get("/order",showOrderForm);
router.post("/order", placeOrder);

module.exports = router;
