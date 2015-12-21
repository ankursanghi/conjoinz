var express = require("express");
var router = new express.Router();

function partners(req, res) {
	
	  		res.render("login/partnerlogin", {layout: false, name:req.session.name});
}
function partnersLogin(req, res) {
	
	  		
}

router.get("/partnerlogin", partners);
router.post("/partnerlogin", partnersLogin);
module.exports = router;