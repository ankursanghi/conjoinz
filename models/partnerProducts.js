var mongoose = require('mongoose');

var PartnerProductSchema = mongoose.Schema({
			email:{type: String},
           
            productsArray: [{
			upc: {type: String},
			product_name: {type: String},
			brand: {type: String},
			product_size: {type: String},
			extentedPrize:{type: String},
			promotions:{type:String},
			MSRP:{type: String}
	}],
});


var PartnerProduct = mongoose.model('PartnerProduct', PartnerProductSchema);
module.exports=PartnerProduct;