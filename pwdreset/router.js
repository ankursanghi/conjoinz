var express = require("express");
var crypto = require('crypto');
var User = require('../models/user.js');
var hash = require('../utils/hash.js');
var bodyParser = require('body-parser');
var router = new express.Router();
var _ = require('lodash');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var activator = require('activator');
// TBD move this access key id and secret access key to a separate file and require it in
var transport = nodemailer.createTransport(sesTransport({
	accessKeyId: "AKIAI5RLQ24VNM2ZQBMQ",
        secretAccessKey: "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",
        rateLimit: 1 // do not send more than 1 messages in a second
}));

router.use(bodyParser());

function forgotpwd (req, res,next) {
	res.render("pwdreset/pwdreset", {layout: false});
}

var userModel = {
	_find: function (login,cb) {
		       var found = {};
		       if (!login) {
			       cb("nologin");
		       } else {
				User.findOne({_id: login}, function(err, foundUser){
					if (err) cb(null,err);
					found.id = foundUser._id;
					found.email = foundUser.id;
					found.activation_code = foundUser.activation_code;
					found.password_reset_code = foundUser.password_reset_code;
					found.password_reset_time = foundUser.password_reset_time;
				       cb(null,_.cloneDeep(found));
				});
		       }
	       },
	find: function() {
		      this._find.apply(this,arguments);
	      },
	save: function (id,data,cb) {
		      if (id){
			    var query = {"_id": id};
			    var saveThisData = {};
			    if (data.password){
				crypto.randomBytes(16, function(err, bytes){
					saveThisData.salt = bytes.toString('utf8');
					saveThisData.hash = hash(data.password, saveThisData.salt);
					saveThisData.password_reset_code = data.password_reset_code;
					saveThisData.password_reset_time = data.password_reset_time;
					User.findOneAndUpdate(query, saveThisData, function(err, doc){
						if (err) { cb(err); 
						}else{ 
							console.log('saved the new password to db...');
							cb(null); }
					}); 
				});
			      } else {
					saveThisData.password_reset_code = data.password_reset_code;
					saveThisData.password_reset_time = data.password_reset_time;
					User.findOneAndUpdate(query, saveThisData, function(err, doc){
						if (err) { cb(err); 
						}else{ cb(null); }
					}); 
			      } 
		      }else {
			      cb(404);
		      }
	      }
}; 

activator.init({user:userModel,transport:transport,from: 'ankur.sanghi@gmail.com', templates: __dirname});

router.get("/passwordreset",forgotpwd);
router.post("/passwordreset", activator.createPasswordReset);
router.get("/resetpassword", function(req,res,next){
	res.render('pwdreset/newpassword', {code: req.query.code, email: req.query.email, layout: false});
});
router.post("/resetpassword",activator.completePasswordResetNext, function(req,res,next){
	res.render('orders/orderform', {layout:false});
});

module.exports = router;

// new module activator
// new amazon service ses - option to use plain smtp
// new router method use - put
// new way of creating an object
// email template
