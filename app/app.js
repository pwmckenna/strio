'use strict';

var express = require('express');
var app = express();
var routes = require('./routes');

app.post('/', routes.post);
app.del('/', routes.del);

module.exports = app;