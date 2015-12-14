//var config = require('./config');
var fs = require('fs');
var express = require('express');
var https = require('https');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var router = express.Router();

var port = process.env.PORT || 8080;        // set our port

//HTTPS config
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.cert', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Database
var db = require('./db');

//Routes
var quotation = require('./routes/quotation');
var brands = require('./routes/brands');
var vendors = require('./routes/vendors');
var inventory = require('./routes/inventory');
var po = require('./routes/po');
var uploads = require('./routes/uploads');
var user = require('./routes/user');
var auth = require('./routes/auth');
var app = express();

app.set("trust proxy", 1);
// app.use(cookieParser()); // read cookies (needed for auth)
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Middleware for authentication
app.post('/api/v1/*', [require('./middleware/validateRequest')]);

app.post('/login', auth.login);
app.use('/api/v1/quotation', quotation);
app.use('/api/v1/brand', brands);
app.use('/api/v1/vendor', vendors);
app.use('/api/v1/inventory', inventory);
app.use('/api/v1/po', po);
app.use('/api/v1/uploads', uploads);
app.use('/api/v1/user', user);

// If no route is matched by now, it must be a 404
// app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
// });

// app.listen(port);
server = https.createServer(credentials, app);
server.listen(port);
console.log('[API] listening on %s', port);

module.exports = app;