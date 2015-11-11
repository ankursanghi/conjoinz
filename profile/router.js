var express = require("express");
var Address = require('../models/address.js');
var User = require('../models/user.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var async = require('async');

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
//	console.log('req.body:'+JSON.stringify(req.body));
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
	// console.log('query adr_nick is:'+query.adr_nick);
	var userQuery = {};
	userQuery.name = {};
	userQuery.name.first = req.session.name.split(" ")[0];
	userQuery.name.last = req.session.name.split(" ")[1];
	userQuery.email = req.session.user;
	var user = {};
	// query.adr_nick = req.body.adrnick || req.body.address; // req.body.address is the selection from the dropdown
	query.adr_nick = req.body.address; // req.body.address is the selection from the dropdown
	updateAddress = false;
	// async waterfall here
	async.waterfall([
			// function 1: checks whether it is an update or a new address creation.
		function(callback){
			var udpateAddress = false;
			if (req.body.address != '9new9') {
				updateAddress = true;
				return callback(null, updateAddress);
			}else{
				// check if the new nick selected is the same as one of the nicks saved on this profile
				var findUserQuery = User.findOne(userQuery);
				findUserQuery.populate('delivery_addresses').exec(function(err, usr){
					var found = false;
					usr.delivery_addresses.forEach(function(adr){
						// if (adr.adr_nick == address.adr_nick && adr.adr_line1 == address.adr_line1 && adr.city == address.city && adr.zip == address.zip){
						// console.log('adr_nick from user:'+adr.adr_nick);
						if (adr.adr_nick == req.body.adrnick){ // if the address nick from the form is equal to one of the addresses in the user's delivery addresses
							found = true;
							var err = new Error('nickUsed');
							console.log('error returned about the same nick...');
							return callback(err, null);
						}
					});
					if (!(found)) return callback(null, updateAddress);
				});
			}
		},
		function (updateAddress, callback){
			// console.log('determined update address:'+updateAddress);
			if (updateAddress){
				//find id of the delivery address that has a matching nick on this user	
				// update that address with the details
				User.findOne(userQuery).populate('delivery_addresses').exec(function(err, user){
					// console.log('user found in profile page logic:'+JSON.stringify(user));
					user.delivery_addresses.forEach(function(element){
						if (element.adr_nick == req.body.address){
							// console.log('error condition about nick met');
							query._id = element._id;
							Address.findOneAndUpdate(query, address, options, function(err, addrSaved){
								if (err) {
								    console.log('Error Inserting New Data');
								    console.log('error as-is:'+JSON.stringify(err));
								    if (err.name == 'ValidationError') {
									    for (field in err.errors) {
										    console.log(err.errors[field].message); 
									    }
								    }
								    return callback(err, null, null);
								}
								return callback(null, updateAddress, addrSaved);
							});
						}
					});
				});
			}else{
				// here we know we have to save a new Address
				var newAddress = new Address(address);
				newAddress.save(function(err, addrSaved){
					if (err){
						return callback(err, null, null);
					}else{
						User.findOneAndUpdate(userQuery, {"$push":{"delivery_addresses": addrSaved._id}}, options, function(err, userUpdated){
							if (err) {
							    console.log('Error Inserting New Data');
							    if (err.name == 'ValidationError') {
								    for (field in err.errors) {
									    console.log(err.errors[field].message); 
								    }
							    }
							    return callback(err, null, null);
							}
							console.log("User updated with new address");
						});	
						return callback(null, updateAddress, addrSaved);
					}
				});
			}
		},
		function(updated, addr, callback){
			callback(null, addr.adr_nick);	
		}
		], function(err, result){
			var found = false;
			if (err) console.log('error received: '+JSON.stringify(err));
			if (err && err.message == 'nickUsed'){
				found = true;
			}
			res.render("profile/profile", {layout: false, error:found, saved: result, name: req.session.name});
		});
}

router.get("/profile",profile);
router.post("/profile", updateProfile);

module.exports = router;
