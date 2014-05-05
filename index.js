var Promise = require('bluebird/js/main/promise')();
var _ = require('lodash');

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

/* not tested...
Promise.ambidextrous = function(fn) {
  
    // If the function takes a callback, we need to wrap it
    var params = getParams(fn);
    var cb = _.last(params);
    var argCount = params.length;

    return function() {
        var args = Array.prototype.slice.call(arguments, 0);

        // we need to wrap this function
        if (cb && (cb === 'callback' || cb === 'cb') && argCount - 1 === args) {

            Promise.promisify(fn).apply(null, args);
        }

        // dont wrap the function
        return fn.apply(null, args);
    };
};
*/

module.exports = Promise;
