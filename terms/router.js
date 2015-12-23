var express = require("express");

var router = new express.Router();

function terms(req, res) {
	  res.render("terms/terms", {layout: false, name:req.session.name});
}

router.get("/terms", terms);


module.exports = router;
