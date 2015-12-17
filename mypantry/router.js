var express = require("express");
var Pantry = require('../models/pantry.js');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var async = require('async');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');
var upload = multer({dest: './public/img/'});
var orderApi = require("../api/order/router.js");
var pantryApi = require("../api/pantry/router.js");
var moment = require("moment");
router.use(bodyParser());
router.use(upload.array());

function savePantry(req, res, next){
	if (!(req.connection.encrypted)){
	return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	var emptyOrderItem = req.body.ord_number;
	var status = req.body.deleteitem;
	var upcstatus = req.body.upc;
	var first = req.session.name.split(" ")[0];
	var last = req.session.name.split(" ")[1];
	var pantryDetails={
		orderItem:"",
		brand:"",
		comments:""
	};
	if(emptyOrderItem == "empty" && status != "delete"){
		Pantry.findOne({email:req.session.user},function(err,pantryDetails){
						if(err){
							console.log("values not avilable in database");
						}
						Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
							res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails ,order:orderss, emptyOrderItem:true});
							});
		});
		
	}
	
	console.log("upcstatus"+upcstatus);
	if(!(upcstatus)){
		Pantry.findOne({email:req.session.user},function(err,pantryDetails){
						if(err){
							console.log("values not avilable in database");
						}
						Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
		//console.log("upcstatus###",+upcstatus);
					if(status=="delete")
					{
						res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails ,order:orderss, upcstatus:true});
					}
					else
					{
						var addItem = status;
						res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails ,order:orderss,addItem:true});
					}
		});
		});

	}else
	{
	//console.log("upcstatus####"+upcstatus);
	if(status=="delete"){
		if (req.body.upc instanceof Array){
			req.body.upc.forEach(function (upc, Index){
				var email = req.session.user;
				var upc = req.body.upc[Index];
				Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantry){
					if(err){
						console.log("values not avilable in database");
					}
				});
			});
		}
		else{
			var upc=req.body.upc;
			var email = req.session.user;
			Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantriees){
				if(err){
					console.log("values not avilable in database");
				}
			});
		}
		//delete option ending
	}
	else{
		//add to pantry start 
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
					if (req.body.upc instanceof Array){
						async.forEachOf(req.body.upc, function (upc, Index){
							var upc=req.body.upc[Index];
							Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
								if(err){
									console.log("values not avilable in database");
								}	
								Item.findOne({"name": pantry.productsArray[Index].product_name}, function(err, item){ 	
									pantryDetails.orderItem=item._id;
									pantryDetails.brand=pantry.productsArray[Index].brand;
									pantryDetails.comments=pantry.productsArray[Index].product_description;
									Order.findOneAndUpdate({"ord_number":new_order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
										if(err){
											console.log("values not avilable in orders dable");
										}
									});
								});
							});
						});
					}else{

						var order_number= req.body.ord_number; 
						var upc=req.body.upc;
						Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
							if(err){
								console.log("values not avilable in database");
							}
							Item.findOne({"name": pantry.productsArray[0].product_name}, function(err, item){ 	
								pantryDetails.orderItem=item._id;
								pantryDetails.brand=pantry.productsArray[0].brand;
								pantryDetails.comments=pantry.productsArray[0].product_description;
								Order.findOneAndUpdate({"ord_number":new_order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
									if(err){
										console.log("values not avilable in orders dable");
									}
									
								});
							});
						});
					}
						//end of added without order number
				});
			});
		}else{
				//start of with order number array
				if (req.body.upc instanceof Array){
					var order_number= req.body.ord_number; 
					async.forEachOf(req.body.upc, function (upc, Index){
					var upc=req.body.upc[Index];
						Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
							if(err){
								console.log("values not avilable in database");
							}
							Item.findOne({"name": pantry.productsArray[Index].product_name}, function(err, item){ 	
								pantryDetails.orderItem=item._id;
								pantryDetails.brand=pantry.productsArray[Index].brand;
								pantryDetails.comments=pantry.productsArray[Index].product_description;
								Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
									if(err){
										console.log("values not avilable in orders dable");
									}
									
								});
								

							});
						});
					});
				//end with order number array
				}else{ 
					//start with order number witout array
					var order_number= req.body.ord_number; 
					var upc=req.body.upc;
					Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
						if(err){
							console.log("values not avilable in database");
						}
						Item.findOne({"name": pantry.productsArray[0].product_name}, function(err, item){ 	
							pantryDetails.orderItem=item._id;
							pantryDetails.brand=pantry.productsArray[0].brand;
							pantryDetails.comments=pantry.productsArray[0].product_description;
							Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
								if(err){
									console.log("values not avilable in orders dable");
								}
								
							});
						});
					});
//end with order number array
				}

		}



	}

	Pantry.findOne({email:req.session.user},function(err,pantryDetails){
						if(err){
							console.log("values not avilable in database");
						}
						Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
						if(status=="delete"){
							res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails , order:orderss, status:true});
						}
						else
						{
							res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails ,order:orderss, value:true});
						}
						});
					});
	}
}
router.post("/addtoOrder",savePantry);

module.exports = router;
