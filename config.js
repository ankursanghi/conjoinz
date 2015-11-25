var config = module.exports;
var PRODUCTION = process.env.NODE_ENV === "production";

config.express = {
	  httpPort: process.env.EXPRESS_PORT || 8008,
	  httpsPort: process.env.EXPRESS_PORT || 8009,
	    ip: "127.0.0.1"
};

config.mongodb = {
	port: process.env.MONGODB_PORT || 27017,
	host: process.env.MONGODB_HOST || "localhost"
};
config.cert = {
	privateKey: 'https/serverkey.pem',
	certificate: 'https/servercert.pem',
};

if (PRODUCTION) {
	  //for example
	  config.express.ip = "0.0.0.0";
	  config.cert.privateKey = 'https/private-key.pem';
	  config.cert.certificate = 'https/314cd74c21bd955f.crt';
}
//config.db same deal
//config.email etc
//config.log
