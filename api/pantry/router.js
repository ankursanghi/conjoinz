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
				
				console.log("items table"+JSON.stringify(itemSaved));
				
				Pantry.create(pantryDetails, function(err, pantry){
					if (err){
						if(err instanceof mongoose.Error.ValidationError) {
							return invalid();
						}   
						return next(err);
					}   
					if(pantry){
						//console.log("updated Details"+pantry);
						res.json({error: null, pantry: {email: pantry.email}});
					}
				}); 
			});
			//res.render("signup/signup", {layout: false, msg: "regsiter successfully"});
			// {"$push": {"ord_lines": ordLine}}
		}else{
			console.log("pantry details item name;"+pantryDetails.product_name);
			Item.findOneAndUpdate({name:pantryDetails.product_name}, item, options, function(err, itemSaved){
				console.log("items table"+JSON.stringify(itemSaved));
				if(err){
					console.log("error to insert on items user not found part");
				}
				Pantry.findOneAndUpdate({email:req.body.email}, {"$push":{"productsArray" :pantryDetails}}, function(err, pantry){
					if (err){
						console.log("error inserting values");
					}   
					if(pantry){
						//console.log("updated Details"+pantry);
						res.json({error: null, pantry: {email: pantry.email}});
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
		/*pantry.productsArray.push({
			upc:pantry.upc ,
			product_name:pantry.product_name,
			product_description:pantry.product_description,
			brand: pantry.brand,
			manufacturer:pantry.manufacturer,
			product_size: pantry.product_size
		});*/
			//console.log('pantry '+JSON.stringify(pantry));
			Order.find({"customer.name":{first:first,last:last}},function(err,orders){
		if(err){
			console.log("values not avilable in orders dable");
		}
		//console.log(' order '+JSON.stringify(pantry));
		console.log('pantry '+JSON.stringify(pantry.productsArray));
		res.render("pantry/pantry", {layout: false, name:req.session.name , pantry:pantry ,order:orders});
	});
});	

	
}


router.post("/pantryRegister",upload.array(), RegisterPantry);
router.get("/pantry", MyPantry);
router.post("/viewPantry", viewPantry);

module.exports = router;