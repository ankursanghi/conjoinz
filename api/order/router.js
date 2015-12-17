var hash = require('../../utils/hash.js');
var Order = require('../../models/order.js');
var Item = require('../../models/item.js');
var User = require('../../models/user.js');
var _ = require('lodash');

module.exports.createOrderHeader = function(firstName, lastName, addressName, store, comments, email, saveOrder, orderDate, order_number, callback){
	var userQuery = {};
	userQuery =  {
		email: email,
	};

	var findUserQuery = User.findOne(userQuery);
	findUserQuery.populate('delivery_addresses').exec(function(err, usr){
		if(err){
			return callback(err, null);
		}
		
		usr.delivery_addresses.forEach(function(adr){
			if ((adr.adr_nick == addressName)){ // if the address nick from the form is equal to one of the addresses in the user's delivery addresses
				var order = {
					ord_status: saveOrder,
					ordDate: orderDate,
					comments: comments,
					store :store,
					userEmail :email
				};
				
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

				if(saveOrder=="submitted"){
					if(order_number){
						Order.findOneAndUpdate({"ord_number":order_number},order, function( err, newOrder){
							console.log("order status +++"+newOrder.ord_status);
							return callback(err, newOrder);	
						});
					}else{
						Order.create(order, function(err, newOrder){
						return callback(err, newOrder);
						});
					}
				}else{
					Order.findOneAndUpdate({"ord_number":order_number}, order, function( err, newOrder){
						console.log("order_number"+order_number);
						if(newOrder){
							console.log("new order"+order_number);
							return callback(err, newOrder);
							
						}else {
							Order.create(order, function(err, newOrder){

								console.log("not a new order"+order_number);
								return callback(err, newOrder);
							});
						}
					});
				}
			}else{
						return callback(new Error("User address is not found", null));
					}

		});
	});
}
//req.body
module.exports.createOrderItem =  function(orderId, comment, uom, quantity, itemName, brand, tagitem, order_number, ord_status, callback){  	
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

		console.log("brand name"+brand);
		//What happens when Item save fails?
		console.log('itemSaved is:' + itemSaved);
        var ordLine = {};
		ordLine.line_status = 'submitted';
		ordLine.comments = comment;
		ordLine.uom = uom;
		ordLine.qty = quantity;
		ordLine.item = itemName;
		ordLine.brand=brand;
		ordLine.tagitem=tagitem;
		ordLine.orderItem = itemSaved._id;
		//console.log("order_number in update order"+order_number);
		
if(ord_status=='saved'){
	
		if(order_number){
				Order.findOne({"ord_number":order_number}, function( err, saveOrder){
				console.log('update order '+JSON.stringify(saveOrder));
				Order.findOneAndUpdate({_id: orderId}, {"$unset": {"ord_lines": ordLine}}, function(err, ordSaved){
					if(ordSaved){
						Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
							return callback(err, ordSaved);
						});	
					}
				});
			});
		}else{
			Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
			return callback(err, ordSaved);
			});
		}
}else if(ord_status=='submitted'){


	if(order_number){
				Order.findOne({"ord_number":order_number}, function( err, saveOrder){
				//console.log('update order '+JSON.stringify(saveOrder));
				Order.findOneAndUpdate({_id: orderId}, {"$unset": {"ord_lines": ordLine}}, function(err, ordSaved){
					if(ordSaved){
						Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
							return callback(err, ordSaved);
						});	
					}
				});
			});
		}else{
			Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
			return callback(err, ordSaved);
			});
		}
}else{
	Order.findOneAndUpdate({_id: orderId}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
		return callback(err, ordSaved);
	});
}
		});
}
 
