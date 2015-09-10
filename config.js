var config = module.exports;
var PRODUCTION = process.env.NODE_ENV === "production";

config.express = {
	  port: process.env.EXPRESS_PORT || 8008,
	    ip: "127.0.0.1"
};

config.mongodb = {
	port: process.env.MONGODB_PORT || 27017,
	host: process.env.MONGODB_HOST || "localhost"
};
if (PRODUCTION) {
	  //for example
	  config.express.ip = "127.0.0.1";
}
//config.db same deal
//config.email etc
//config.log
