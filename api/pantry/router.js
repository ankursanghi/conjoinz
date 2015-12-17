var express = require("express");
var Pantry = require('../../models/pantry.js');
var Order = require('../../models/order.js');
var Item = require('../../models/item.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');
var upload = multer({dest: './public/img/'});
router.use(bodyParser());
router.use(upload.array());

function RegisterPantry(req, res, next){
	var pantryDetails={}
	pantryDetails.email=req.body.email;
	pantryDetails.upc=req.body.upc;
	pantryDetails.product_name=req.body.product_name;
	pantryDetails.product_description=req.body.product_description;
	pantryDetails.brand=req.body.brand;
	pantryDetails.manufacturer=req.body.manufacturer;
	pantryDetails.product_size=req.body.product_size;
	Pantry.findOne({"email": req.body.email}, function(err, foundUser){
		var options = {
		upsert: true, 
		new: true
	};
		var item = {
		name : req.body.product_name,
		uom : req.body.product_size
	};	
		if (!foundUser){
			
			Item.findOneAndUpdate({name:pantryDetails.product_name}, item, options, function(err, itemSaved){
				
				if(err){
					console.log("error to insert on items");
				}
				Pantry.findOne({email:req.body.email,"productsArray.upc":pantryDetails.upc}, function(err, pan){
					if(pan){
						console.log("product already available");
					}else{	
						Pantry.findOneAndUpdate({email:req.body.email}, {"$push":{"productsArray" :pantryDetails}}, options,function(err, pantry){
							if (err){
								if(err instanceof mongoose.Error.ValidationError) {
									return invalid();
								}   
								return next(err);
							}   
							if(pantry){
								res.json({error: null, pantry: {email: pantry.email}});
							}
						}); 
					}
				}); 
			});
		}else{
			console.log("pantry details item name;"+pantryDetails.product_name);
			Item.findOneAndUpdate({name:pantryDetails.product_name}, item, options, function(err, itemSaved){
				//console.log("items table"+JSON.stringify(itemSaved));
				if(err){
					console.log("error to insert on items user not found part");
				}
				Pantry.findOne({email:req.body.email,"productsArray.upc":pantryDetails.upc}, function(err, pan){
					if(pan){
						console.log("product already available");
					}else{
						Pantry.findOneAndUpdate({email:req.body.email}, {"$push":{"productsArray" :pantryDetails}}, function(err, pantry){
							if (err){
								console.log("error inserting values");
							}   
							if(pantry){
								res.json({error: null, pantry: {email: pantry.email}});
							}
						}); 
					}
				});
			}); 
		}
	});
}

function viewPantry(req, res, next){
	//console.log("method calling");
	var email=req.body.email;
	Pantry.find({"email":email},function(err,pantry){
		if(err){
			res.json({error: err, pantry:null, status:false});
		}
		res.json({error: null, pantry:pantry, status:true});
	});
}



function MyPantry(req, res, next){
	
	var email=req.session.user;
	var first = req.session.name.split(" ")[0];
	var last = req.session.name.split(" ")[1];

	if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	//console.log("method calling"+req.session.user);
	Pantry.findOne({"email":email},function(err,pantry){
		if(err){
			console.log("values not avilable in database");
		}
		//console.log('pantry '+JSON.stringify(pantry));
			Order.find({"customer.name.first":first,"customer.name.last":last,"ord_status":"saved" },function(err,orders){
		if(err){
			console.log("values not avilable in orders dable");
		}
		//console.log(' order '+JSON.stringify(pantry));
		res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantry ,order:orders});
	});
});	

	
}


router.post("/pantryRegister",upload.array(), RegisterPantry);
router.get("/pantry", MyPantry);
router.post("/viewPantry", viewPantry);

module.exports = router;