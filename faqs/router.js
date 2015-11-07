var express = require("express");

var router = new express.Router();

function faqs(req, res) {
	  res.render("faqs/faqs", {layout: false});
}

router.get("/faqs", faqs);


module.exports = router;
