var express = require("express");
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var async = require('async');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');
var upload = multer({dest: './public/img/'});
var router = new express.Router();
var moment = require("moment");
router.use(bodyParser());
router.use(upload.array());


		
function savePartner(req, res, next) {
	if (!(req.connection.encrypted)){
	return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	var email = req.session.user;
		if(!(email)){
			res.render("partners/partners", {layout: false, name:req.session.name, status:true});
		}else{
		//res.render("partners/partners", {layout: false, name:req.session.name, order:orderss, email:true});
		
		console.log("test");
		var email=req.session.user;
		var first = req.session.name.split(" ")[0];
		var last = req.session.name.split(" ")[1];
		var order_status="saved";
		var address=" ";
		var store=" ";
		var comments="";
		var order_number="";
		var now = moment(new Date());
		var orderDate = now.format("YYYY MMM DD HH:mm");
		var order_number= req.body.ord_number; 
		console.log("values printed +" +order_number);
		if(order_number==" "){
			console.log("values printed ++" +order_number);
			var new_order_number;
			User.findOne({email:email}, function(err, adr){
				var order = {
					ord_status:"saved",
					ordDate: orderDate,
					comments:"",
					store :"",
					userEmail :email
					};
				order.customer = {};
				order.customer.name = {};
				order.customer.name.first = first;
				order.customer.name.last = last;					
				order.customer.primary_phone = adr.phone;
				order.customer.address = {};
				order.customer.address.adr_type= adr.adr_type;
				order.customer.address.adr_line1= adr.adr_line1;
				order.customer.address.adr_line2= adr.adr_line2;
				order.customer.address.city= adr.city;
				order.customer.address.state= adr.state;
				order.customer.address.country = adr.country;
				order.customer.address.zip= adr.zip;
				
				var pantryDetails={
					orderItem:"",
					brand:"",
					comments:""
				};
				Order.create(order, function(err, newOrder){
					new_order_number=newOrder.ord_number;
					console.log("new_order_number"+new_order_number);
					/*Order.findOneAndUpdate({"ord_number":new_order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
										if(err){
											console.log("values not avilable in orders dable");
										}
									});*/
					Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
							res.render("partners/partners", {layout: false, name:req.session.name, order:orderss, email:true});
});
					});
				});
			}

			else
			{
				var order_number= req.body.ord_number; 
				console.log("order_number"+order_number);
				/*Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
									if(err){
										console.log("values not avilable in orders dable");
									}
									
								});*/
				Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
								res.render("partners/partners", {layout: false, name:req.session.name, order:orderss, email:true});
							});
			}
		}
	  		
	}
		


//router.get("/partners", partners);
router.get("/partners",savePartner);

module.exports = router;
