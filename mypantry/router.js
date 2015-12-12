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
var moment = require("moment");
router.use(bodyParser());
router.use(upload.array());

function savePantry(req, res, next){
	if (!(req.connection.encrypted)){
	return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}

	var first = req.session.name.split(" ")[0];
	var last = req.session.name.split(" ")[1];
	var pantryDetails={
		orderItem:"",
		brand:"",
		comments:""
	};

	var status = req.body.deleteitem;
	
	if(status=="delete"){
		if (req.body.upc instanceof Array){
			req.body.upc.forEach(function (upc, Index){
				var upc=req.body.upc[Index];
				Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantry){
					if(err){
						console.log("values not avilable in database");
					}
					//console.log('pantry '+JSON.stringify(pantry));
					Pantry.find({email:req.session.user},function(err,pantryDetails){
						if(err){
							console.log("values not avilable in database");
						}
					//	console.log('pantryDetails  in db ****'+JSON.stringify(pantryDetails));

						Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
							if(err){
								console.log("values not avilable in orders dable");
							}
							//console.log('orderss '+JSON.stringify(orderss));
							res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails , order:orderss, status:true});
						});
						//res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails , value:true});
					});
				});
			});
		}
		else{
			var upc=req.body.upc;
			Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantriees){
				if(err){
					console.log("values not avilable in database");
				}
			});
			Pantry.findOne({email:req.session.user},function(err,pantryDetails){
				if(err){
					console.log("values not avilable in database");
				}
				Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
					if(err){
						console.log("values not avilable in orders dable");
					}
					//console.log('orderss  page ***'+JSON.stringify(orderss));
					res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantryDetails, order:orderss, status:true});
				});
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
					// added the new values in db
					new_order_number=newOrder.ord_number;
					if (req.body.upc instanceof Array){
						async.forEachOf(req.body.upc, function (upc, Index){
							var upc=req.body.upc[Index];
							//console.log(" avilable in database  ***" +req.session.user + "," +Index);
							Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
								if(err){
									console.log("values not avilable in database");
								}
									//console.log(" avilable in database #" +pantry.productsArray[Index].product_name);
								Item.findOne({"name": pantry.productsArray[Index].product_name}, function(err, item){ 	
									pantryDetails.orderItem=item._id;
									pantryDetails.brand=pantry.productsArray[Index].brand;
									pantryDetails.comments=pantry.productsArray[Index].product_description;
									//console.log('after item pantry '+JSON.stringify(pantryDetails));
									Order.findOneAndUpdate({"ord_number":new_order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
										if(err){
											console.log("values not avilable in orders dable");
										}
										Pantry.findOne({"email":email},function(err,pantries){
											if(err){
												console.log("values not avilable in database");
											}
											Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
												if(err){
													console.log("values not avilable in orders dable");
												}
												res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantries ,order:orderss, value:true});
											});
										});
									});
								});
							});
						});
					}else{

						var order_number= req.body.ord_number; 
						var upc=req.body.upc;
						//console.log(" avilable in database test ***" +req.session.user );
						Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
							if(err){
								console.log("values not avilable in database");
							}
							//console.log(" avilable in database #" +pantry.productsArray[0].product_name);
							Item.findOne({"name": pantry.productsArray[0].product_name}, function(err, item){ 	
								pantryDetails.orderItem=item._id;
								pantryDetails.brand=pantry.productsArray[0].brand;
								pantryDetails.comments=pantry.productsArray[0].product_description;
								//console.log('after item pantry '+JSON.stringify(pantryDetails));
								Order.findOneAndUpdate({"ord_number":new_order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
									if(err){
										console.log("values not avilable in orders dable");
									}
									Pantry.findOne({"email":email},function(err,pantries){
										if(err){
											console.log("values not avilable in database");
										}
										//console.log('pantry '+JSON.stringify(pantry));
										Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
											if(err){
												console.log("values not avilable in orders dable");
											}
											res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantries ,order:orderss,value:true});
										});
									});
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
						//console.log(" avilable in database  ***" +req.session.user + "," +Index);
						Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
							if(err){
								console.log("values not avilable in database");
							}
							//console.log(" avilable in database #" +pantry.productsArray[Index].product_name);
							Item.findOne({"name": pantry.productsArray[Index].product_name}, function(err, item){ 	
								pantryDetails.orderItem=item._id;
								pantryDetails.brand=pantry.productsArray[Index].brand;
								pantryDetails.comments=pantry.productsArray[Index].product_description;
								//console.log('after item pantry '+JSON.stringify(pantryDetails));
								Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
									if(err){
										console.log("values not avilable in orders dable");
									}
									Pantry.findOne({"email":email},function(err,pantries){
										if(err){
											console.log("values not avilable in database");
										}
										Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
											if(err){
												console.log("values not avilable in orders dable");
											}
											res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantries ,order:orderss, value:true});
										});
									});
								});
								

							});
						});
					});
				//end with order number array
				}else{ 
					//start with order number witout array
					var order_number= req.body.ord_number; 
					var upc=req.body.upc;
					//console.log(" avilable in database test ***" +req.session.user );
					Pantry.findOne({"productsArray.upc":upc,"email":req.session.user},function(err,pantry){
						if(err){
							console.log("values not avilable in database");
						}
						//console.log(" avilable in database #" +pantry.productsArray[0].product_name);
						Item.findOne({"name": pantry.productsArray[0].product_name}, function(err, item){ 	
							pantryDetails.orderItem=item._id;
							pantryDetails.brand=pantry.productsArray[0].brand;
							pantryDetails.comments=pantry.productsArray[0].product_description;
							//console.log('after item pantry '+JSON.stringify(pantryDetails));
							Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
								if(err){
									console.log("values not avilable in orders dable");
								}
								Pantry.findOne({"email":email},function(err,pantries){
									if(err){
										console.log("values not avilable in database");
									}
									//console.log('pantry '+JSON.stringify(pantry));
									Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
										if(err){
											console.log("values not avilable in orders dable");
										}
										res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantries ,order:orderss,value:true});
									});
								});
							});
						});
					});
//end with order number array
				}


		}
	}
}

router.post("/addtoOrder",savePantry);

module.exports = router;
