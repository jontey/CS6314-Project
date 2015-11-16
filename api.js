//var config = require('./config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('cookie-session');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;        // set our port

// Database
var db = require('./db');

var routes = require('./routes/quotation');
var app = express();

//Session cookies
var sessOptions = {
    maxAge: 52 * 7 * 24 * 60 * 60 * 1000,
    secret: "secret secret secret",
    resave: false,
    saveUninitialized: false
};
app.use(session(sessOptions));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/quotation', routes);

app.listen(port);
console.log('[API] listening on %s', port);

module.exports = app;