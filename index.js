var express = require("express");

var fs = require('fs');
var util = require('util');
var app = express();
var hbs = require('express-handlebars');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var layouts = require('handlebars-layouts');
var async = require('async');
var https = require('https');
var http = require('http');
var db = require('./models/db.js');
var credentials = require('./models/credentials.js'); 

 var privateKey  = fs.readFileSync('https/serverkey.pem', 'utf8');
 var certificate = fs.readFileSync('https/servercert.pem', 'utf8');
//var privateKey  = fs.readFileSync('https/private-key.pem', 'utf8');
// var certificate = fs.readFileSync('https/314cd74c21bd955f.crt', 'utf8');

var httpscredentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(httpscredentials, app);
var httpServer = http.createServer(app);
// use cookie parser for cookie secret
app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// use the express session as the memory store. Using persistent db is a better way. This is just to learn the topic
// app.use(require('express-session')());
app.use(session({
	            store: new MongoStore({ mongooseConnection: db.connection}),
	            secret:credentials.cookieSecret,
		    key: 'just.checking.if.this.works',
		//		cookie: { maxAge: new Date(Date.now() + 3600000)},
	            cookie: { maxAge: 1800000}, // set the cookie time out to be 30 minutes, after which the login is required again
	            resave:false,
	            saveUninitialized:true

}));

var handlebars = hbs.create({ defaultLayout:'main',
				helpers : {
					if_eq : function(a, b, opts) {
					    if (a == b) {
					        return opts.fn(this);
					    } else {
					        return opts.inverse(this);
					    }
					}
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
app.use(require("./home/router"));
app.use(require("./signup/router"));
app.use(require("./pwdreset/router"));
app.use(require("./login/router"));
app.use(require("./order/router"));
app.use(require("./profile/router"));
app.use(require("./faqs/router"));
app.use(require("./about/router"));
app.use(require("./howitworks/router"));
app.use(require("./orderHistory/router"));
app.use("/api/autocomplete", require('./api/autocomplete/router'));
app.use("/api/getaddrs", require('./api/address/router'));
//app.use("/api/customer", require("api/customer/router"));
// Repeat the above line for additional model areas ("deals", "vehicles", etc)

//FINALLY, use any error handlers
// app.use(require("app/errors/notFound"));

// Export the app instance for unit testing via supertest
module.exports.httpServer = httpServer;
module.exports.httpsServer = httpsServer;
