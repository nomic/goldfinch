var assert = require('assert');
var Promise = require('../index.js');

describe('Goldfinch', function () {
    it('Taps', function () {
        return Promise.resolve('a').tap(function (a) {
            return assert.equal(a, 'a');
        }).then(function (a) {
            return assert.equal(a, 'a');
        });
    });

    it('fcalls', function () {
        return Promise.fcall(function (b) {
            assert.equal(b, 'b');
            return b;
        }, 'b').then(function(b) {
            assert.equal(b, 'b');
        });
    });

    it('nfcalls', function () {
        return Promise.nfcall(function (a, cb) {
            assert.equal(a, 'a');
            cb(null, a);
        }, 'a').then(function (a) {
            assert.equal(a, 'a');
        });
    });

    it('nfcalls - error', function () {
        return Promise.nfcall(function (cb) {
            cb(new Error('expected'));
        }).then(function (nul) {
            throw new Error('Expected error');
        }, function (err) {
            assert.equal(err.message, 'expected');
        });
    });

    it('promisifyValues', function () {
        var obj = Promise.promisifyValues({
            good: function(value, cb) {
                cb(null, value+1);
            },
            bad: function(value, cb) {
                cb('oops');
            }
        });

        return obj.good(5).then(function(val) {
            assert.equal(val, 6);
        }, function(err) {
            throw new Error('Unexpected error');
        }).then(function() {
            return obj.bad(5).then(function(val) {
                throw new Error('Expected error');
            }, function(err) {
                assert.equal(err.message, 'oops');
            });
        });

    });

});
