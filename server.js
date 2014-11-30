'use strict';

var debug = require('debug')('strio:server');
var app = require('./app');
app.listen(process.env.PORT, function () {
    debug('Express server listening on port %s', process.env.PORT);
});