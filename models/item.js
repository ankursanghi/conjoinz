var mongoose = require('mongoose');

var itemSchema= mongoose.Schema({
	baseItem: {type: String}, // this is like saying that Oreos are Cookies. Roma Tomatoes are essentially tomatoes and so on...
    	name: {type: String},
        uom: {type: String}, // unit of measure such as packs, lbs, yards etc
        category1: {type: String},
    	category2: {type: String},
    	category3: {type: String},
});


var Item = mongoose.model('Item', itemSchema);
module.exports=Item;

