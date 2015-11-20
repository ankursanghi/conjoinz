var express = require("express");

var router = new express.Router();

function home(req, res) {
	  delete req.session.errmsg;
	  res.render("home/home", {layout: false, name:req.session.name});
}

function team(req, res) {
	  res.render("main/team");
}

router.get("/", home);
router.get("/team", team);

module.exports = router;
