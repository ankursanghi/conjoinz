var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var multer = require('multer');


function faqs(req, res,next) {
	res.render("faqs/faqs", {layout: false});
}


router.get("/faqs",faqs);


module.exports = router;
