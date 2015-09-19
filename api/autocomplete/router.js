var express = require("express");
var Item = require('../../models/item.js');

var router = new express.Router();

function findItems(req, res, next) {
	Item.find({$or:[{'baseItem':{ $regex: new RegExp("^" + req.query.q.toLowerCase(), "i") } } ,
		        {'name': { $regex: new RegExp("^" + req.query.q.toLowerCase(), "i") }}
		       ]},
		function(err, docs){
			if (err) next(err);
			res.json(docs);
	});
}

function addItems(req, res, next){
	var itemArray = [
		{ name : "tomatoes", uom : "lbs", baseItem : "produce" },
		{ name : "potatoes", uom : "lbs", baseItem : "produce" },
		{ name : "green beans", uom : "lbs", baseItem : "produce" },
		{ name : "eggs", uom : "pieces", baseItem : "produce" },
		{ name : "milk", uom : "gallons", baseItem : "produce" }
	];
	itemArray.forEach(function(item){
		Item.create(item, function(err, doc){
			if (err) return next(err);
			console.log('added item:'+item.name);	
		});
	});
}

router.get("/", findItems);
router.get("/onetime", addItems);

module.exports = router;
