'use strict';

var Promise = require('bluebird/js/main/promise')(),
    _ = require('lodash');

function getParams(fn) {
    var functionExp = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var commentsExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var argExp = /^\s*(\S+?)\s*$/;

    var fnString = fn.toString().replace(commentsExp, '');
    var match = fnString.match(functionExp);
    var params = match && match[1];

    if (!match || !params) return [];

    return _.map(params.split(','), function (param) {
        return param.match(argExp)[1];
    });
}


Promise.prototype.tap = function Promise$tap(didFulfill, didReject) {
    return this._then(didFulfill ? function(x) {
        didFulfill(x);
        return x;
    } : null, didReject ? function(x) {
        didReject(x);
        throw x;
    } : null);
};

Promise.fcall = Promise['try'];

Promise.nfcall = function Promise$_nfcall() {
    var args = Array.prototype.slice.call(arguments, 0);
    var fn = args.shift();
    return Promise.promisify(fn).apply(null, args);
};

Promise.promisifyValues = function Promise$_promisifyValues(obj) {
    return _.mapValues(obj, function(fn) {
        return Promise.promisify(_.bind(fn, obj));
    });
};


Promise.ambidextrous = function(fn) {

    // If the function takes a callback and is called without it
    // then we need to wrap it
    var params = getParams(fn);
    var cb = _.last(params);
    var argCount = params.length;

    return function() {
        var args = Array.prototype.slice.call(arguments, 0);

        var doesTakeCallback = cb && (cb === 'callback' || cb === 'cb');
        var isMissingArgument = argCount - 1 === args.length;

        // The function takes a callback, but one was not passed in
        if ( doesTakeCallback && isMissingArgument) {
            return Promise.promisify(fn).apply(null, args);
        }

        // dont wrap the function
        return fn.apply(null, args);
    };
};

Promise.untilResolved = function(fn, opts) {
    opts =_.defaults(opts || {}, {
        delay: 2,
        timeout: 100000,
        report: _.noop
    });
    return function() {
        var args = arguments;
        var boundFn = function() {
            return fn.apply(null, args);
        };
        return _untilResolved(boundFn, opts.delay, opts.timeout, opts.report, 0);
    };
};

function _untilResolved(fn, delay, timeout, report, elapsed) {
    return Promise.try(fn)
    .then(null, function(err) {
        if (elapsed > timeout) throw err;
        report('Retrying in ' + delay + ' ms');
        return Promise.delay(delay).then(function() {
            return _untilResolved(fn, delay * delay, timeout, report, delay + elapsed);
        });
    });
}

module.exports = Promise;
