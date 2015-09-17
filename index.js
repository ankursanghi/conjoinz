var express = require("express");

var fs = require('fs');
var util = require('util');
var app = express();
var hbs = require('express-handlebars');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var layouts = require('handlebars-layouts');
var async = require('async');
var db = require('./models/db.js');
var credentials = require('./models/credentials.js'); 
// use cookie parser for cookie secret
app.use(require('cookie-parser')(credentials.cookieSecret));
// use the express session as the memory store. Using persistent db is a better way. This is just to learn the topic
// app.use(require('express-session')());
app.use(session({
	            store: new MongoStore({ mongooseConnection: db.connection}),
	            secret:credentials.cookieSecret,
	            cookie: { maxAge: new Date(Date.now() + 360000)},
	            resave:false,
	            saveUninitialized:true

}));

var handlebars = hbs.create({ defaultLayout:'main',
				helpers : {
				}
		  });
// ------------------------ loading partials here explicity with handlebars -----------------------
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
	var matches = /^([^.]+).handlebars$/.exec(filename);
	  if (!matches) {
		      return;
		        }
	  var name = matches[1];
	  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
	  handlebars.handlebars.registerPartial(name, template);
});
// This generates an object containing the layout helpers and registers them with handlebars
layouts.register(handlebars.handlebars);
// ------------------------------------- loading partials end ------------------------------------
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set("views", __dirname+'/views');
app.use(express.static(__dirname + '/public'));

//See the README about ordering of middleware
//Load the routes ("controllers" -ish)
app.use(require("./home/router.js"));
app.use(require("./signup/router"));
app.use(require("./pwdreset/router"));
app.use(require("./login/router"));
app.use(require("./order/router"));
// app.use("/api/autocomplete", require('./api/autocomplete/router'));
//app.use("/api/customer", require("api/customer/router"));
// Repeat the above line for additional model areas ("deals", "vehicles", etc)

//FINALLY, use any error handlers
// app.use(require("app/errors/notFound"));

// Export the app instance for unit testing via supertest
module.exports = app;

