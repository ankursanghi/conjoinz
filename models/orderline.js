var mongoose = require('mongoose');

var orderLineSchema= mongoose.Schema({
	line_status: {type: String},
        comments: {type: String},
        uom: {type: String},
        orderItem: [{type: mongoose.Schema.Types.ObjectId, ref: 'item'}],
        qty: {type: Number}
});


var OrderLine= mongoose.model('OrderLine', orderLineSchema);
module.exports=OrderLine;

