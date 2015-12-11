var express = require("express");
var Pantry = require('../models/pantry.js');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');
var upload = multer({dest: './public/img/'});
router.use(bodyParser());
router.use(upload.array());

function savePantry(req, res, next){
	var status = req.body.deleteitem;
	console.log(status);
	var upc=req.body.upc;
	console.log(upc);
	if(status=="delete"){
		if (req.body.upc instanceof Array){
			req.body.upc.forEach(function (upc, Index){
				var upc=req.body.upc[Index];
				Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantry){
					if(err){
						console.log("values not avilable in database");
					}
					console.log('pantry '+JSON.stringify(pantry));
				});
			});
		}
		else
		{
			var upc=req.body.upc;
			Pantry.update({email:req.session.user},{$pull:{productsArray:{upc:upc}}}, { multi: true},function(err,pantry){
				if(err){
					console.log("values not avilable in database");
				}
				console.log('pantry '+JSON.stringify(pantry));
			});
		}
	}
	else{
		var email=req.session.user;
		var first = req.session.name.split(" ")[0];
		var last = req.session.name.split(" ")[1];
		var pantryDetails={
			orderItem:"",
			brand:"",
			comments:""
		};


		if (!(req.connection.encrypted)){
			return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
		}

		if (req.body.upc instanceof Array){
			var order_number= req.body.ord_number; 
			req.body.upc.forEach(function (upc, Index){
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
								Order.find({"customer.name":{first:first,last:last}},function(err,orderss){
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
					Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
						if(err){
							console.log("values not avilable in orders dable");
						}
						Pantry.findOne({"email":email},function(err,pantries){
							if(err){
								console.log("values not avilable in database");
							}
							//console.log('pantry '+JSON.stringify(pantry));
							Order.find({"customer.name":{first:first,last:last}},function(err,orderss){
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
	}
}

router.post("/addtoOrder",savePantry);

module.exports = router;
