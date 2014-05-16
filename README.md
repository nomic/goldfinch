goldfinch
=========

Extends [Bluebird](https://github.com/petkaantonov/bluebird/blob/master/API.md)


#### tap()
```js
Promise.resolve().tap(function(a) { } /*, error handler */)
```

#### fcall()
```js
Promise.fcall(function(p1) {}, p1).then()
```

#### nfcall()
```js
Promise.nfcall(function(p1, cb) { cb() }, p1).then()
```

#### promisifyValues()
```js
Promise.promisifyValues({ abc: function() {} }).abc().then()
```

#### ambidextrous()
Guess if a function takes a callback parameter, and make it optional
```js
Promise.ambidextrous(function(abc, cb) { cb() }).then();
Promise.ambidextrous(function(abc) { return abc }).then();
```
