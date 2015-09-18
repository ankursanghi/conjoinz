var express = require("express");

var router = new express.Router();

function home(req, res) {
	  res.render("home/home", {layout: false});
}

router.get("/:search", findItems);

module.exports = router;
