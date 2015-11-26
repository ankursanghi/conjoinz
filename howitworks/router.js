var express = require("express");

var router = new express.Router();

function howitworks(req, res) {
	  res.render("howitworks/howitworks", {layout: false, name:req.session.name});
}

router.get("/howitworks", howitworks);


module.exports = router;
