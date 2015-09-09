var express = require("express");

var fs = require('fs');
var util = require('util');
var app = express();
var hbs = require('express-handlebars');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var layouts = require('handlebars-layouts');
var async = require('async');
var handlebars = hbs.create({ defaultLayout:'meetsites_new',
				helpers : {
				}
		  });
//console.log('hbs is:'+util.inspect(hbs.ExpressHandlebars,false, null));
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
app.set("views", __dirname);
app.use(express.static(__dirname + '/public'));

//See the README about ordering of middleware
//Load the routes ("controllers" -ish)
app.use(require("app/site/router"));
app.use("/api", require("app/customers/router"));
app.use("/api", require("app/users/router"));
// Repeat the above line for additional model areas ("deals", "vehicles", etc)

//FINALLY, use any error handlers
app.use(require("app/errors/notFound"));

// Export the app instance for unit testing via supertest
module.exports = app;

