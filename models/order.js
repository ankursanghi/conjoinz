var mongoose = require('mongoose');

var orderSchema= mongoose.Schema({
	ord_status: {type: String},
        deliver_to: {type: mongoose.Schema.Types.ObjectId, ref: 'address'},
        comments: {type: String},
        ord_lines: [{type: mongoose.Schema.Types.ObjectId, ref: 'orderline'}],
        ord_customer: {type: mongoose.Schema.Types.ObjectId, ref: 'customer'},
});


var Order= mongoose.model('Order', orderSchema);
module.exports=Order;

