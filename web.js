var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
var request = require('request');
var url = require('url');

var port = process.env.PORT || 8000;        // set our port
var app = express();

app.set("view engine", "jade");
app.set("views", "./views");

//Proxy
app.post('/api/*', function (req, res) {
    req.pipe(request.post("http://127.0.0.1:8080/"+req.params[0], {form:req.body})).pipe(res);
});
app.get('/api/*', function (req, res) {
    req.pipe(request("http://127.0.0.1:8080/"+req.params[0])).pipe(res);
});

app.use(cookieParser()); // read cookies (needed for auth)
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// required for passport
app.use(session({ secret: 'secret secret secret', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.get("/", function (req, res){
	res.redirect("/quotation");
});
app.get("/quotation", function (req, res){
	res.render("quotation", {title: "Quotation"});
});
app.get("/inventory", function (req, res){
	res.render("inventory", {title: "Inventory"});
});
app.get("/purchase", function (req, res){
	res.render("management", {title: "Purchase Orders"});
});
app.get("/vendor", function (req, res){
	res.render("vendor", {title: "Vendors"});
});
app.get("/brand", function (req, res){
	res.render("brand", {title: "Brands"});
});
app.get("/management", function (req, res){
	res.render("management", {title: "Management"});
});

app.use('/js', express.static(__dirname + '/views/js'));
app.use('/css', express.static(__dirname + '/views/css'));
app.use('/images', express.static(__dirname + '/views/images'));

app.listen(port);
console.log('[WEB] listening on %s', port);

module.exports = app;