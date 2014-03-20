var Promise = require('bluebird/js/main/promise')();

Promise.prototype.tap = function Promise$tap(didFulfill, didReject) {
    return this._then(function(x) {
        didFulfill(x);
        return x;
    }, function(x) {
        didReject(x);
        return x;
    });
};

Promise.fcall = Promise['try']

Promise.nfcall = function Promise$_nfcall() {
    var args = Array.prototype.slice.call(arguments, 0);
    var fn = args.shift();
    return Promise.promisify(fn).apply(null, args);
}

module.exports = Promise;