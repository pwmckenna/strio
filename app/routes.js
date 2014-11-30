'use strict';

var q = require('q');
var assert = require('assert');
var request = require('request');
var debug = require('debug')('strio:routes');

var HEROKU_API_ENDPOINT = 'https://api.heroku.com';
var HEROKU_API_HEADERS = {
    Authorization: 'Bearer ' + process.env.HEROKU_API_KEY
};

var post = function (req, res) {
    q.resolve().then(function () {
        assert(req.params.hasOwnProperty('bucket'), 'missing required param - bucket');
    }).then(function () {
        var defer = q.defer();
        request({
            method: 'POST',
            uri: HEROKU_API_ENDPOINT + '/apps',
            headers: HEROKU_API_HEADERS,
            json: true
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            debug('created app - %s', body.id);
            return body.id;
        });
    }).then(function (id) {
        var defer = q.defer();
        request({
            method: 'POST',
            uri: HEROKU_API_ENDPOINT + '/apps/' + id + '/config-vars',
            headers: HEROKU_API_HEADERS,
            json: {
                S3_BUCKET: req.params.bucket
            }
        }, defer.makeNodeResolver());
        return defer.promise;
    }).then(function () {
        res.send(200);
    }).fail(function () {
        res.send(500);
    });
};

var del = function (req, res) {
    q.resolve().then(function (id) {
        var defer = q.defer();
        request({
            method: 'DELETE',
            uri: HEROKU_API_ENDPOINT + '/apps/' + id,
            headers: HEROKU_API_HEADERS,
            json: true
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            debug('deleted app - %o', body);
        });
    }).then(function () {
        res.send(200);
    }).fail(function () {
        res.send(500);
    });
};

module.exports = {
    post: post,
    del: del
};