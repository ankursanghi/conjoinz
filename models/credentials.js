module.exports = {
	cookieSecret: 'your cookie secret goes here',
	mongo: {
		development: {
				     connectionString: 'mongodb://192.168.56.1/valetbasket',
			     },
		production: {
				     connectionString: 'mongodb://52.26.240.30/valetbasket',
			    },
	},
};
