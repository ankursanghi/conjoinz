var config = module.exports;

var PRODUCTION = process.env.NODE_ENV === "production";
console.log(process.env.NODE_ENV)
config.express = {
	  httpPort: process.env.EXPRESS_PORT || 8008,
	  httpsPort: process.env.EXPRESS_PORT || 8009,
	    ip: "127.0.0.1"
};

config.mongodb = {
	port: process.env.MONGODB_PORT || 27017,
	host: process.env.MONGODB_HOST || "localhost"
};
if (PRODUCTION) {
	  //for example
	  config.express.ip = "0.0.0.0";
}
//config.db same deal
//config.email etc
//config.log
