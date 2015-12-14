var fs = require('fs');
var https = require('https');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var compress = require('compression');
 
var url = require('url');

var port = process.env.PORT || 8000;        // set our port
var app = express();

app.set("view engine", "jade");
app.set("views", "./views");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//Proxy
app.post('/api/login', function (req, res) {
    req.pipe(request.post("https://127.0.0.1:8080/login", {form:req.body})).pipe(res);
});
app.post('/api/*', function (req, res) {
    req.pipe(request.post("https://127.0.0.1:8080/api/v1/"+req.params[0], {form:req.body})).pipe(res);
});
app.get('/api/*', function (req, res) {
    req.pipe(request("https://127.0.0.1:8080/api/v1/"+req.params[0])).pipe(res);
});

app.use(compress()); 
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function (req, res){
	res.redirect("/quotation");
});
app.get("/login", function (req, res){
	res.render("login", {title: "Login"});
});
app.get("/quotation", function (req, res){
	res.render("quotation", {title: "Quotation"});
});
app.get("/inventory", function (req, res){
	res.render("inventory", {title: "Inventory"});
});
app.get("/purchase", function (req, res){
	res.render("purchase", {title: "Purchase Orders"});
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

// app.listen(port);
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.cert', 'utf8');

var credentials = {key: privateKey, cert: certificate};
server = https.createServer(credentials, app);
server.listen(port);
console.log('[WEB] listening on %s', port);

module.exports = app;