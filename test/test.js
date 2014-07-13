'use strict';

var chai = require('chai');
var expect = chai.expect;
var Promise = require('../index.js');
var _ = require('lodash');

describe('Goldfinch', function () {
    it('taps', function () {
        return Promise.resolve('a').tap(function (a) {
            return expect(a).to.equal('a');
        }).then(function (a) {
            expect(a).to.equal('a');
            throw new Error('catch me');
        }).tap(function() {
            expect('This should').to.equal('not happen');
        }, function(err) {
            expect(err.message).to.equal('catch me');
        }).then(function() {
            expect('This should').to.equal('not happen');
        }, function(err) {
            expect(err.message).to.equal('catch me');
            throw new Error('catch me');
        }).tap(function() {
            expect('This should').to.equal('not happen');
        }).then(null, _.noop);
    });

    it('fcalls', function () {
        return Promise.fcall(function (b) {
            expect(b).to.equal('b');
            return b;
        }, 'b').then(function(b) {
            expect(b).to.equal('b');
        });
    });

    it('nfcalls', function () {
        return Promise.nfcall(function (a, cb) {
            expect(a).to.equal('a');
            cb(null, a);
        }, 'a').then(function (a) {
            expect(a).to.equal('a');
        });
    });

    it('nfcalls - error', function () {
        return Promise.nfcall(function (cb) {
            cb(new Error('expected'));
        }).then(function () {
            throw new Error('Expected error');
        }, function (err) {
            expect(err.message).to.equal('expected');
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
            expect(val).to.equal(6);
        }, function() {
            throw new Error('Unexpected error');
        }).then(function() {
            return obj.bad(5).then(function() {
                throw new Error('Expected error');
            }, function(err) {
                expect(err.message).to.equal('oops');
            });
        });

    });

    it('ambidextrousifies functions', function() {

        function nodeFunction(a, b, c, callback) {
            callback(null, a + b +c);
        }

        function nodeFunctionCb(a, b, cb) {
            cb(null, a + b);
        }

        function regularFn(a, b, c) {
            return a + b + c;
        }

        expect(Promise.ambidextrous(regularFn)('a', 'b', 'c')).to.equal('abc');

        Promise.ambidextrous(nodeFunction)('a', 'b', 'c', function(err, abc) {
            expect(err).to.equal(null);
            expect(abc).to.equal('abc');
            return Promise.ambidextrous(nodeFunction)('a', 'b', 'c').then(function(abc) {
                expect(abc).to.equal('abc');
            }).then(function() {
                return Promise.ambidextrous(nodeFunctionCb)('a', 'b', function(err, abc) {
                    expect(err).to.equal(null);
                    expect(abc).to.equal('ab');

                    return Promise.ambidextrous(nodeFunctionCb)('a', 'b').then(function(abc) {
                        expect(abc).to.equal('ab');
                    });

                });
            });
        });
    });

    describe('#untilResolved', function () {

        it('retries on thrown errors', function(done) {
            var retries = 0;
            Promise.untilResolved(function() {
                if (retries === 1) return done();
                retries += 1;
                throw Error('error');
            })();
        });

        it('retries on rejected promises', function(done) {
            var retries = 0;
            Promise.untilResolved(function() {
                if (retries === 1) return done();
                retries += 1;
                return Promise.reject();
            })();
        });

        it('calls report on retries', function() {
            var retries = 0;
            var reports = 0;
            return Promise.untilResolved(function() {
                if (retries === 1) return;
                retries += 1;
                return Promise.reject();
            }, {
                report : function(msg) {
                    expect(msg).to.be.a('string');
                    reports += 1;
                }
            })()
            .then(function() {
                expect(retries).to.equal(1);
                expect(reports).to.equal(1);
            });
        });

        it('gives up after timeout', function() {
            var start = Date.now();
            return Promise.untilResolved(function() {
                return Promise.reject(new Error());
            }, {
                timeout: 50
            })()
            .then(null, function() {
                expect(Date.now() - start).to.be.lt(100);
            });
        });

        it('passes args through', function() {
            return Promise.all([
                Promise.untilResolved(function(a, b) {
                    expect(a).to.equal('aVal');
                    expect(b).to.equal('bVal');
                })('aVal', 'bVal'),
                // Conveniently, you can use it with spread or then:
                Promise.resolve(['aVal', 'bVal'])
                .spread( Promise.untilResolved(function(a, b) {
                    expect(a).to.equal('aVal');
                    expect(b).to.equal('bVal');
                    return [a,b];
                }))
                .then( Promise.untilResolved(function(arr) {
                    expect(arr).to.eql(['aVal', 'bVal']);
                }))
            ]);

        });

    });

});
