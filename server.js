// External Dependencies
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var app = express();
var urlArray = [];
var chars = '-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/create/*', function(req, res) {

	var url = req.params[0];
	var short,
		fFound = false;

	// Check whether the url is already in our lookup table
	for (var i = 0; i < urlArray.length; i++) {
		if (urlArray[i].url === url) {
			return (res.send({
				original_url: urlArray[i].url,
				short_url: req.protocol + '://' + req.hostname + '/' + urlArray[i].short
			}));
		}
	}

	// Check whether the url is valid
	var reg = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(reg);
	if (!url.match(regex)) {
		return (res.send({error: 'URL invalid'}));
	}

	// Check whether the url exists
	var check = new XMLHttpRequest();
  check.open('get', url, false);
	check.send();
  if (check.status !== 200) {
		return (res.send({error: 'This URL does not exist'}))
	}

	// Generate short url and return it
	do {
		short = chars.substr(Math.floor((Math.random() * chars.length) + 1), 1);
		short += chars.substr(Math.floor((Math.random() * chars.length) + 1), 1);
		short += chars.substr(Math.floor((Math.random() * chars.length) + 1), 1);

		fFound = true;
		for (var i = 0; i < urlArray.length; i++) {
			if (urlArray[i].short === short) {
				fFound = false
			}
		}
	} while (!fFound);

	var ret = {
		url: url,
		short: short
	};
	urlArray.push(ret);
	console.log(urlArray);
	return (res.send({
		original_url: ret.url,
		short_url: req.protocol + '://' + req.hostname + '/' + ret.short
	}));
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/*', function(req, res) {
	console.log('* App Get All');

	short = req.params[0];
	console.log(short);

	fFound = false;
	for (var i = 0; i < urlArray.length; i++) {
		if (urlArray[i].short === short) {
			fFound = true;
			res.redirect(urlArray[i].url);
		}
	}
	if (!fFound) {
		return (res.send({error: 'Invalid short URL'}));
	}

});

app.set('port', process.env.PORT || 3000);
var server = http.createServer(app);
server.listen(app.get('port'), function() {
	console.log('Server listening on port ' + app.get('port') + ' ...');
});
