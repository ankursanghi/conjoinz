#!/usr/bin/env node
var app = require("./index");
var config = require("./config");

//Use whichever logging system you prefer.
var logger = require('./utils/logger');

//Note that there's not much logic in this file.
//The server should be mostly "glue" code to set things up and
//then start listening
app.listen(config.express.port, config.express.ip, function (error) {
	  if (error) {
		      logger.error("Unable to listen for connections", error);
		          process.exit(10);
			    }
	    logger.info("express is listening on http://" +
		        config.express.ip + ":" + config.express.port);
});
