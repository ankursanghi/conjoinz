var express = require("express");
var Pantry = require('../../models/pantry.js');
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
		if (!foundUser){
			Pantry.create(pantryDetails, function(err, pantry){
				if (err){
					if(err instanceof mongoose.Error.ValidationError) {
						return invalid();
					}   
					return next(err);
				}   
				if(pantry){
					console.log("updated Details"+pantry);
					res.json({error: null, pantry: {email: pantry.email}});
				}
			}); 
			//res.render("signup/signup", {layout: false, msg: "regsiter successfully"});
			// {"$push": {"ord_lines": ordLine}}
		}else{
			Pantry.findOneAndUpdate({email:req.body.email}, {"$push":{"productsArray" :pantryDetails}}, function(err, pantry){
				if (err){
					console.log("error inserting values");
				}   
				if(pantry){
					console.log("updated Details"+pantry);
					res.json({error: null, pantry: {email: pantry.email}});
				}
			}); 
			
			/*Pantry.create(pantryDetails, function(err, pantry){
				if (err){
					if(err instanceof mongoose.Error.ValidationError) {
						return invalid();
					}   
					return next(err);
				}   
				if(pantry){
					console.log("updated Details"+pantry);
					res.json({error: null, pantry: {email: pantry.email}});
				}
			}); */
		}
	});
}

function MyPantry(req, res, next){

if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}

  

	console.log("method calling");

	res.render("pantry/pantry", {layout: false, name:req.session.name});
	
}


router.post("/pantryRegister",upload.array(), RegisterPantry);
router.get("/pantry", MyPantry);

module.exports = router;