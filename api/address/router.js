var express = require("express");
var Address = require('../../models/address.js');
var User = require('../../models/user.js');

var router = new express.Router();

function findAddresses(req, res, next) {

	var userQuery = {};
	userQuery.name = {};
	userQuery.name.first = req.session.name.split(" ")[0];
	userQuery.name.last = req.session.name.split(" ")[1];
	var addresses = [];
	var queryAddress ={};
	User.findOne(userQuery).populate('delivery_addresses').exec(function(err, usr){
		if (err) {
			console.log('Error Inserting New Data');
			if (err.name == 'ValidationError') {
				for (field in err.errors) {
					console.log(err.errors[field].message); 
				}
			}
		}
		usr.delivery_addresses.forEach(function(adr){
			addresses.push(adr);
			if (adr.adr_nick == req.query.adrnick){
				queryAddress = adr;
			}
		});
		if (!(req.query.adrnick)){
			res.json(addresses); // return all addresses for the user if no query has been sent
		}else{
			res.json(queryAddress); // return only the details of one address if a query field has been sent on req
		}
	});
}


router.get("/", findAddresses);

module.exports = router;
