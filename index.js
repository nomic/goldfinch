var Promise = require('bluebird/js/main/promise')();
var _ = require('lodash');

Promise.prototype.tap = function Promise$tap(didFulfill, didReject) {
    return this._then(function(x) {
        didFulfill(x);
        return x;
    }, function(x) {
        didReject(x);
        return x;
    });
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

module.exports = Promise;
