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

module.exports = Promise;