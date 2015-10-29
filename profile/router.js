var express = require("express");
var Address = require('../models/address.js');
var User = require('../models/user.js');
var bodyParser = require('body-parser');
var router = new express.Router();

router.use(bodyParser());

function profile(req, res,next) {
	if (!(req.connection.encrypted)){
		return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
	}
	if (req.session.isLoggedIn){
		res.render("profile/profile", {layout: false, name:req.session.name});
	}else{
		req.session.errmsg = 'Please login with your credentials to access profile page';
		res.redirect(302, '/login');
	}
}

function updateProfile(req, res, next){
	// options for upsert queries
	var options = {upsert: true, new: true};
	console.log('req.body:'+JSON.stringify(req.body));
	var address = {};
	address.adr_type = 'Primary';	
	address.adr_nick = req.body.adrnick || req.body.address; // this is done so that when there is an update, the address field is the one that contains the nick
	address.adr_line1 = req.body.billing['address'][0];
	address.adr_line2 = req.body.billing['address'][1];
	address.city = req.body.billing.city;
	address.state = req.body.billing.state;
	address.country= req.body.billing.country;
	address.zip = req.body.billing.zipcode;
	address.phone = req.body.billing.phone;
	//build details for querying the address collection
	var query = {};
//	query.adr_type = 'Primary';
//	query.adr_line1 = req.body.billing['address'][0];
//	query.adr_line2 = req.body.billing['address'][1];
//	query.city = req.body.billing.city;
//	query.state = req.body.billing.state;
//	query.zip = req.body.billing.zipcode;
	query.adr_nick = req.body.adrnick || req.body.address; // req.body.address is the selection from the dropdown
	console.log('query adr_nick is:'+query.adr_nick);
	var userQuery = {};
	userQuery.name = {}; console.log('req.session.name: ' +JSON	.stringify(req.session))
	userQuery.name.first = req.session.name.split(" ")[0];
	userQuery.name.last = req.session.name.split(" ")[1];
	var user = {};
	//find one and update makes sure that if there is a change in the address you could save it.
	Address.findOneAndUpdate(query,address,options,function(err, addrSaved){
		if (err) {
		    console.log('Error Inserting New Data');
		    console.log('error as-is:'+JSON.stringify(err));
		    if (err.name == 'ValidationError') {
			    for (field in err.errors) {
				    console.log(err.errors[field].message); 
			    }
		    }
		}
		console.log('saved the line #'+addrSaved);
		var findUserQuery = User.findOne(userQuery);
		findUserQuery.populate('delivery_addresses').exec(function(err, usr){
			var found = false;
			usr.delivery_addresses.forEach(function(adr){
				// if (adr.adr_nick == address.adr_nick && adr.adr_line1 == address.adr_line1 && adr.city == address.city && adr.zip == address.zip){
				console.log('adr_nick from user:'+adr.adr_nick);
				if (adr.adr_nick == address.adr_nick){ // if the address nick from the form is equal to one of the addresses in the user's delivery addresses
					found = true;
				}
			});
			if (!found){
				User.findOneAndUpdate(userQuery, {"$push":{"delivery_addresses": addrSaved._id}}, options, function(err, userUpdated){
					if (err) {
					    console.log('Error Inserting New Data');
					    if (err.name == 'ValidationError') {
						    for (field in err.errors) {
							    console.log(err.errors[field].message); 
						    }
					    }
					}
					console.log("User updated with new address");
				});	
			}
		});
		res.render("profile/profile", {layout: false, saved: addrSaved.adr_nick, name: req.session.name});
	});	
}

router.get("/profile",profile);
router.post("/profile", updateProfile);

module.exports = router;
