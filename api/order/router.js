var hash = require('../../utils/hash.js');
var Order = require('../../models/order.js');
var Item = require('../../models/item.js');



//module.exports.sendEmail =  function(newOrder){
	function sendEmail(newOrder){
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'valetbasket@gmail.com',
        pass: '123456@vb'
    }
});
transporter.sendMail({
    from: 'valetbasket@gmail.com',
    to: newOrder.userEmail,
    subject: 'Order Details',
    template: 'email.body',
    text: 'Your order has been deliver within two hours. Thank you for your purchase.' ,
	 context: {
	      order : newOrder,
		 }
});

}
//req.body
module.exports.saveItem =  function(newOrder,itm,item,options,ordLine,index,callback){  
					      Item.findOneAndUpdate({name: itm},item, options, function(err, itemSaved){
								if (err) {
								    console.log('Error Inserting New Data');
								    if (err.name == 'ValidationError') {
									    for (field in err.errors) {
										    //console.logg(err.errors[field].messae); 
										   // callback(new Error(err.errors[field].messae),null);
									    }
								    }
								}
								console.log('itemSaved is:'+itemSaved);
								ordLine.orderItem = itemSaved._id;
								Order.findOneAndUpdate({_id: newOrder._id}, {"$push": {"ord_lines": ordLine}}, function(err, ordSaved){
									if (err) {
									    console.log('Error Inserting New Data');
									    if (err.name == 'ValidationError') {
										    for (field in err.errors) {
											    console.log(err.errors[field].message); 
											   // callback(new Error(err.errors[field].messae),null);
										    }
									    }
									}
									console.log('saved the line #'+index); 
									sendEmail(newOrder);
									callback(null,itemSaved);
								}); 
								// return itemSaved;
							});	
					

	} 