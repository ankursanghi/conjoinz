#!/usr/bin/env node
var httpsApp = require("./index").httpsServer;
var httpApp = require("./index").httpServer;
var config = require("./config");

//Use whichever logging system you prefer.
var logger = require('./utils/logger');

//Note that there's not much logic in this file.
//The server should be mostly "glue" code to set things up and
//then start listening
console.log('config.express:'+config.express.httpPort);
httpApp.listen(config.express.httpPort, config.express.ip, function (error) {
	  if (error) {
		      logger.error("Unable to listen for connections", error);
		          process.exit(10);
			    }
	    logger.info("express is listening on http://" +
		        config.express.ip + ":" + config.express.httpPort);
});

httpsApp.listen(config.express.httpsPort, config.express.ip, function (error) {
	  if (error) {
		      logger.error("Unable to listen for connections", error);
		          process.exit(10);
			    }
	    logger.info("express is listening on http://" +
		        config.express.ip + ":" + config.express.httpsPort);
});
