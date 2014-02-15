var assert = require('assert');
var Promise = require('../index.js');

describe('Goldfinch', function() {
    it('Taps', function() {
        return Promise.resolve('a').tap(function(){
            return 0;
        }).then(function(a) {
            return assert.equal(a, 'a');
        });
    });
});