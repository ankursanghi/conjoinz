
module.exports.sendEmail =  function(email){

	var nodemailer = require('nodemailer');
	var transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'valetbasket@gmail.com',
	        pass: '123456@vb'
	    }
	});
	transporter.sendMail({
	    from: 'valetbasket@gmail.com',
	    to: email,
	    subject: 'Order Details',
	    template: 'email.body',
	    text: 'Your order has been deliver within two hours. Thank you for your purchase.' ,
	});
}	