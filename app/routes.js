'use strict';

var q = require('q');
var assert = require('assert');
var request = require('request');
var debug = require('debug')('strio:routes');

var HEROKU_API_ENDPOINT = 'https://api.heroku.com';
var HEROKU_API_HEADERS = {
    Accept: 'application/vnd.heroku+json; version=3',
    Authorization: 'Bearer ' + process.env.HEROKU_API_KEY
};

var get = function (req, res) {
    q.resolve().then(function () {
        var defer = q.defer();
        request({
            method: 'GET',
            uri: HEROKU_API_ENDPOINT + '/apps',
            headers: HEROKU_API_HEADERS,
            json: true
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            assert(res.status === 200, 'expect http status code 200');
            return body;
        });
    }).then(function (body) {
        debug('get', body);
        res.status(200).json(body);
    }).fail(function (err) {
        debug('get', err);
        res.send(500, err);
    });
};

var post = function (req, res) {
    q.resolve().then(function () {
        debug('post %o %o', req.body, req.params);
        assert(req.body.hasOwnProperty('bucket'), 'missing required param - bucket');
    }).then(function () {
        var defer = q.defer();
        request({
            method: 'POST',
            uri: HEROKU_API_ENDPOINT + '/apps',
            headers: HEROKU_API_HEADERS,
            json: true
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            assert(res.status === 200, 'expect http status code 200');
            debug('post apps %o', body);
            return body;
        });
    }).then(function (body) {
        var defer = q.defer();
        request({
            method: 'PATCH',
            uri: HEROKU_API_ENDPOINT + '/apps/' + body.id + '/config-vars',
            headers: HEROKU_API_HEADERS,
            json: {
                S3_BUCKET: req.body.bucket
            }
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            assert(res.status === 200, 'expect http status code 200');
            debug('patch app %o', body);
        }).thenResolve(body);
    }).then(function (body) {
        var defer = q.defer();
        request({
            method: 'GET',
            uri: HEROKU_API_ENDPOINT + '/apps/' + body.id,
            headers: HEROKU_API_HEADERS,
            json: true
        }, defer.makeNodeResolver());
        return defer.promise.spread(function (res, body) {
            assert(res.status === 200, 'expect http status code 200');
            debug('get app %o', body);
            return body;
        });
    }).then(function (body) {
        debug('post', body);
        res.status(200).json(body);
    }).fail(function (err) {
        debug('post', err);
        res.send(500, err);
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
            assert(res.status === 200, 'expect http status code 200');
            debug('del app %o', body);
            return body;
        });
    }).then(function (body) {
        debug('delete', body);
        res.status(200).json(body);
    }).fail(function (err) {
        debug('del', err);
        res.send(500, err);
    });
};

module.exports = {
    get: get,
    post: post,
    del: del
};