var express = require("express");

var router = new express.Router();

function underconst(req, res) {
	  res.render("underconstruction/underconstruction", {layout: false, name:req.session.name});
}

router.get("/underconstruction", underconst);


module.exports = router;
