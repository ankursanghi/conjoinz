var express = require("express");

var router = new express.Router();

function about(req, res) {
	  res.render("about/about", {layout: false});
}

router.get("/about", about);


module.exports = router;
