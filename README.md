# conjoinz

## Application structure

### App structure is based on this StackOverflow [article](http://stackoverflow.com/questions/5778245/expressjs-how-to-structure-an-application) by Peter Lyons. 
**Main path**
- server.js is the file that is called like this: nodemon -e js,handlebars server.js
- server.js file requires in index.js, which is the main app.
- This main app has multiple routes: Home, SignUp, Login, Orders
- For each of the routes, the convention is that the router.js file will provide the Controller like functionality
- The common utility functions are all stored in utility directory and required in server. It contains a call to the [winston](https://github.com/winstonjs/winston) logger.
