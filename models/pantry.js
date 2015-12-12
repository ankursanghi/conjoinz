var mongoose = require('mongoose');

var PantrySchema = mongoose.Schema({
			email:{type: String},
           
            productsArray: [{
			upc: {type: String},
			product_name: {type: String},
			product_description:{type: String},
			brand: {type: String},
			manufacturer: {type: String},
			product_size: {type: String}
	}],
});


var Pantry = mongoose.model('Pantry', PantrySchema);
module.exports=Pantry;