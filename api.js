//var config = require('./config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;        // set our port

// Database
var db = require('./db');

var quotation = require('./routes/quotation');
var manufacturers = require('./routes/manufacturers');
var items = require('./routes/items');
var app = express();

app.use(cookieParser()); // read cookies (needed for auth)
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// required for passport
app.use(session({ secret: 'secret secret secret', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(express.static(path.join(__dirname, 'public')));

app.use('/quotation', quotation);
app.use('/manufacturers', manufacturers);
app.use('/items', items);

app.listen(port);
console.log('[API] listening on %s', port);

module.exports = app;