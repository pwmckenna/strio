'use strict';

var express = require('express');
var app = express();
var routes = require('./routes');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', routes.get);
app.post('/', routes.post);
app.delete('/', routes.del);

module.exports = app;