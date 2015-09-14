var mongoose = require('mongoose');
var credentials = require('./credentials.js'); 

var connectString;

switch(process.env.NODE_ENV){ 
	case 'development':
		connectString = credentials.mongo.development.connectionString;
		break;
	case 'production':
		connectString = credentials.mongo.production.connectionString;
		break;
	default:
		throw new Error('Unknown execution environment: ' + app.get('env'));
};

var opts = {
	server : {
			 socketOptions:{keepAlive:1}
		 }
};

mongoose.connect(connectString, opts);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
	  console.log('Mongoose default connection open to ' + connectString);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
	  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
	  mongoose.connection.close(function () {
		      console.log('Mongoose default connection disconnected through app termination');
		          process.exit(0);
			    });
});

// Include my models here
module.exports.connection = mongoose.connection;
