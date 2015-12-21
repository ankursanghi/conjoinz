var express = require("express");
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var PartnerProduct=require('../models/partnerProducts.js');
var async = require('async');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');
var upload = multer({dest: './public/img/'});
var router = new express.Router();
var moment = require("moment");
router.use(bodyParser());
router.use(upload.array()); 


		
function partnerUserPage(req, res, next) {
	if (!(req.connection.encrypted)){
	return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	var email = req.session.user;
	if(!(email)){

		
					
		PartnerProduct.findOne(function(err,products){
			if(err){
				console.log("values not avilable in orders dable");
			}
		console.log("values of product"+JSON.stringify(products));
		res.render("partners/partners", {layout: false, name:req.session.name ,products:products,status:true});
		
		});
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
			
			/*Order.findOneAndUpdate({"ord_number":order_number},{"$push": {"ord_lines": pantryDetails}}, function(err,orders){
								if(err){
									console.log("values not avilable in orders dable");
								}
								
							});*/
			Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orderss){
				if(err){
					console.log("values not avilable in orders dable");
				}

				PartnerProduct.findOne(function(err,products){
					if(err){
						console.log("values not avilable in orders dable");
					}
 					console.log("PartnerProduct ***"+products);

					res.render("partners/partners", {layout: false, name:req.session.name, products:products,order:orderss, email:true});
				});
			});
		}
	}
}

function partnersLogin(req,res,next){
	var email = req.body.email;
	var passwd = req.body.password;
	var salt;
	var checkHash;
	function invalid (msg){ 
		res.render('login/login', {layout:false, invalid: true, message: msg});
	}   
	console.log(" partner Email email:"+email);
	console.log(" partner Email password:"+passwd);

	/*if (!(email && passwd)) return invalid();
	PartnerDetails.findOne({email: email}, function(err, user){
		if(err){
			console.log('error in data retrieval:'+err);
			return invalid(err);
		}   
		if(!user){
			return invalid('We are so happy to have you, but could not find a login! Please make one through Register link');
		}else{
			salt=user.salt;
			checkHash = hash(passwd, user.salt);
			if(checkHash == user.hash){
				// console.log("checkHash: "+checkHash);
				// console.log("use.hash: "+user.hash);
				req.session.reload(function(err){
					console.log('setting my session variables here...');
					req.session.touch();
					req.session.isLoggedIn = true;
					req.session.user = email;
					req.session.name = user.name.first+' '+user.name.last;
					res.redirect(302, 'partner/partner');
				});
			}else{
				console.log('password does not match for user:'+user.name.first+' '+user.name.last);
				return invalid('You seem to have entered an incorrect password. Retry or use Reset Password link');
			}
		}
	});*/
res.render("partnerUpload/partnerUpload", {layout: false, name:req.session.name, partners:true});
}

function partnerUpload(req,res,next){
	var PartnerProducts={}
	PartnerProducts.email=/*req.body.email*/'apnabazar@gmail.com';
	
	
	PartnerProduct.findOne({"email":PartnerProducts.email}, function(err, foundUser){
		var options ={
			upsert: true, 
			new: true
		};

		var item ={
			name : req.body.product_name,
			uom : req.body.product_size
		};	

		if (!foundUser){
			
			Item.findOneAndUpdate({name:PartnerProducts.product_name}, item, options, function(err, itemSaved){
				
				if(err){
					console.log("error to insert on items");
				}
				if (req.body.product_name instanceof Array){
					PartnerProducts.email='apnabazar@gmail.com';
					async.forEachOf(req.body.product_name, function(name, index, callback){
						console.log("req.body.product_name[not found user]"+req.body.product_name[index]+" "+index);
						PartnerProducts.product_name=req.body.product_name[index];
						PartnerProducts.brand=req.body.brand[index];
						PartnerProducts.product_size=req.body.product_size[index];
						PartnerProducts.extentedPrize=req.body.extentedPrize[index];
						PartnerProducts.promotions=req.body.promotions[index];
						PartnerProducts.MSRP=req.body.MSRP[index];
						PartnerProduct.findOneAndUpdate({email:PartnerProducts.email}, {"$push":{"productsArray" :PartnerProducts}}, options,function(err, partnersPro){
							if (err){
								if(err instanceof mongoose.Error.ValidationError) {
									return invalid();
								}   
								return next(err);
							}   
							if(partnersPro){
								//res.json({error: null, pantry: {email: pantry.email}});
								console.log("value inserted");
							}
						});
					});
				}
				else
				{
					PartnerProducts.email='apnabazar@gmail.com';
					PartnerProducts.product_name=name;
					PartnerProducts.brand=req.body.brand;
					PartnerProducts.product_size=req.body.product_size;
					PartnerProducts.extentedPrize=req.body.extentedPrize;
					PartnerProducts.promotions=req.body.promotions;
					PartnerProducts.MSRP=req.body.MSRP;
					PartnerProduct.findOneAndUpdate({email:PartnerProducts.email}, {"$push":{"productsArray" :PartnerProducts}}, options,function(err, partnersPro){
							if (err){
								if(err instanceof mongoose.Error.ValidationError) {
									return invalid();
								}   
								return next(err);
							}   
							if(partnersPro){
								//res.json({error: null, pantry: {email: pantry.email}});
								console.log("value inserted without array");
							}
					});
				}		 
			});
		}else{
			//console.log("pantry details item name;"+pantryDetails.product_name);
			Item.findOneAndUpdate({name:PartnerProducts.product_name}, item, options, function(err, itemSaved){
				console.log("items table"+JSON.stringify(itemSaved));
				if(err){
					console.log("error to insert on items user not found part");
				}
				
				if (req.body.product_name instanceof Array){

					async.forEachOf(req.body.product_name, function(name,index, callback){
						
						console.log("req.body.product_name[index]"+req.body.product_name[index]+" "+index);
						PartnerProducts.product_name=req.body.product_name[index];
						PartnerProducts.brand=req.body.brand[index];
						PartnerProducts.product_size=req.body.product_size[index];
						PartnerProducts.extentedPrize=req.body.extentedPrize[index];
						PartnerProducts.promotions=req.body.promotions[index];
						PartnerProducts.MSRP=req.body.MSRP[index];
						PartnerProduct.findOneAndUpdate({email:PartnerProducts.email}, {"$push":{"productsArray" :PartnerProducts}}, options,function(err, partnersPro){
							if (err){
								if(err instanceof mongoose.Error.ValidationError) {
									return invalid();
								}   
								return next(err);
							}   
							if(partnersPro){
								//res.json({error: null, pantry: {email: pantry.email}});
								console.log("value inserted");
							}
						});
					});
				}
				else
				{
					//PartnerProducts.upc=req.body.upc;
					PartnerProducts.product_name=req.body.product_name;
					PartnerProducts.brand=req.body.brand;
					PartnerProducts.product_size=req.body.product_size;
					PartnerProducts.extentedPrize=req.body.extentedPrize;
					PartnerProducts.promotions=req.body.promotions;
					PartnerProducts.MSRP=req.body.MSRP;
					PartnerProduct.findOneAndUpdate({email:PartnerProducts.email}, {"$push":{"productsArray" :PartnerProducts}}, options,function(err, partnersPro){
							if (err){
								if(err instanceof mongoose.Error.ValidationError) {
									return invalid();
								}   
								return next(err);
							}   
							if(partnersPro){
								//res.json({error: null, pantry: {email: pantry.email}});
								console.log("value inserted without array");
							}
					});
				}
			}); 

		}
	});

}

function EditPartnerPage(req,res,next){

	PartnerProduct.findOne(function(err,products){
		if(err){
			console.log("values not avilable in orders dable");
		}
			
		res.render("partnersProduct/partnersProduct", {layout: false, name:req.session.name, products:products, email:true});
	});

}


router.get("/partners", partnerUserPage);
router.get("/EditPartnerPage",  EditPartnerPage);
router.get("/partnerlogin", partnersLogin);
router.post("/partnerUpload",partnerUpload);
module.exports = router;
