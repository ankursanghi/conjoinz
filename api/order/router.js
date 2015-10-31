var hash = require('../../utils/hash.js');
var Order = require('../../models/order.js');
var Item = require('../../models/item.js');
var User = require('../../models/user.js');
var _ = require('lodash');

module.exports.createOrderHeader = function(firstName, lastName, addressName, store, comments, email, callback){
	var userQuery = {};
	userQuery.name = {
		first: firstName,
		last: lastName
	};

	var findUserQuery = User.findOne(userQuery);
	findUserQuery.populate('delivery_addresses').exec(function(err, usr){
		if(err){
			return callback(err, null);
		}

		usr.delivery_addresses.forEach(function(adr){
			if ((adr.adr_nick == addressName)){ // if the address nick from the form is equal to one of the addresses in the user's delivery addresses
				var order = {};				
				order.ord_status = 'submitted';
				order.comments = comments;
				order.store = store;
				order.userEmail = email;

				order.customer = {};
				order.customer.name = {};
				order.customer.name.first = firstName;
				order.customer.name.last = lastName;					
				order.customer.primary_phone = adr.phone;

				order.customer.address = {};
				order.customer.address.adr_type= adr.adr_type;
				order.customer.address.adr_line1= adr.adr_line1;
				order.customer.address.adr_line2= adr.adr_line2;
				order.customer.address.city= adr.city;
				order.customer.address.state= adr.state;
				order.customer.address.country = adr.country;
				order.customer.address.zip= adr.zip;

				Order.create(order, function(err, newOrder){
					return callback(err, newOrder);
				});
			}
			else{
				return callback(new Error("User address is not found", null));
			}
		});
	});
}
//req.body
module.exports.createOrderItem =  function(orderId, comment, uom, quantity, itemName, callback){  	
	var options = {
		upsert: true, 
		new: true
	};

	var item = {
		name : itemName,
		uom : uom
	};	
					
	Item.findOneAndUpdate({name: item.name }, item, options, function(err, itemSaved){
		if (err) {
		    console.log('Error Inserting New Data');
		    if (err.name == 'ValidationError') {
			    for (field in err.errors) {
				    console.log(err.errors[field].message); 
			    }
		    }
		}
		//What happens when Item save fails?
		console.log('itemSaved is:' + itemSaved);

		var ordLine = {};
		ordLine.line_status = 'submitted';
		ordLine.comments = comment;
		ordLine.uom = uom;
		ordLine.qty = quantity;
		ordLine.item = itemName;
		//order.userEmail = email;
		ordLine.orderItem = itemSaved._id;
		//order.ord_lines.push(_.cloneDeep(ordLine));

		Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
			return callback(err, ordSaved);
		});
	});
}
