var express = require("express");

var router = new express.Router();

function underconst(req, res) {
	  res.render("ApnaBazar/ApnaBazar", {layout: false, name:req.session.name});
}

router.get("/ApnaBazar", underconst);


module.exports = router;
