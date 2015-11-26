var express = require("express");
var crypto = require('crypto');
var _ = require('lodash');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();


function orderHistory(req, res,next) {
	if (req.session.isLoggedIn){
		var firstName = req.session.name.split(" ")[0];;
		var lastName = req.session.name.split(" ")[1];
		console.log('sessions ++'+ firstName+','+ lastName);
		var userQuery = {};
		userQuery.name = {
			first: firstName,
			last: lastName
		};
		if (!(req.connection.encrypted)){
			return res.redirect("https://" + req.headers.host.replace('8008','8009') + req.url);
		}
		//console.log('req.session here:'+JSON.stringify(req.session));
		if (req.session.isLoggedIn){
			//console.log('show the order historyform...');

			var findUserQuery = User.findOne(userQuery, function(err, usr){
				if(err){
					console.log('error'+ err);
				}
				//console.log('session User details:'+JSON.stringify(usr));

				Order.find({"customer.name.first":usr.name.first,"customer.name.last":usr.name.last},function(err,ord){

					if(err){
						console.log(' inside for each error'+ err);
					}else{


						res.render("orderHistory/orderHistory", {layout: false, name: req.session.name , order: ord});
					}
				});
			});


		}else{
			req.session.errmsg = 'Please login with your credentials to access order page';
			res.redirect(302, '/login');
		}
	}else{
		req.session.errmsg = 'Please login with your credentials to access order history page';
		res.redirect(302, '/login');
	}
}

router.get("/orderHistory", orderHistory);


module.exports = router;
