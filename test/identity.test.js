var R = require('ramda');
var assert = require('assert');
var jsv = require('jsverify');
var types = require('./types');

var Identity = require('..').Identity;

var IdentityGen = R.curry(function(a, n) {
    return Identity(a.generator(n));
});

var IdentityShow = R.curry(function(a, i) {
    return "Identity(" + a.show(i.get()) + ")";
});

var IdentityShrink = R.curry(function(a, i) {
    return a.shrink(i.get()).map(Identity);
});

var IdentityArb = function(a) {
    return {
        generator: IdentityGen(a),
        show: IdentityShow(a),
        shrink: IdentityShrink(a)
    }
}

describe('Identity', function() {
    var i = IdentityArb(jsv.nat);
    var env = {Identity: IdentityArb};
    var appF = 'Identity (nat -> nat)';
    var appN = 'Identity nat';

    it('has an arbitrary', function() {
        var arb = jsv.forall(i, function(i) {
            return i instanceof Identity;
        });

        jsv.assert(arb);
    });

    it('is a Functor', function() {
        var fTest = types.functor;

        jsv.assert(jsv.forall(i, fTest.iface));
        jsv.assert(jsv.forall(i, fTest.id));
        jsv.assert(jsv.forall(i, 'nat -> nat', 'nat -> nat', fTest.compose));
    });

    it('is an Apply', function() {
        var aTest = types.apply;

        jsv.assert(jsv.forall(i, aTest.iface));
        jsv.assert(jsv.forall(appF, appF, appN, env, aTest.compose));
    });

    it('is an Applicative', function() {
        var aTest = types.applicative;

        jsv.assert(jsv.forall(i, aTest.iface));
        jsv.assert(jsv.forall(appN, appN, env, aTest.id));
        jsv.assert(jsv.forall(appN, 'nat -> nat', 'nat', env, aTest.homomorphic));
        jsv.assert(jsv.forall(appN, appF, 'nat', env, aTest.interchange));
    });

    it('is a Chain', function() {
        var cTest = types.chain;
        var f = 'nat -> Identity nat'

        jsv.assert(jsv.forall(i, cTest.iface));
        jsv.assert(jsv.forall(i, f, f, env, cTest.associative));
    });

    it('is a Monad', function() {
        var mTest = types.monad;

        jsv.assert(jsv.forall(i, mTest.iface));
    });
});

describe('Identity example', function() {

    it('returns wrapped value', function() {
        var identNumber = Identity(4);
        assert.equal(identNumber.get(), 4);

        var identArray = Identity([1, 2, 3, 4]);
        assert.deepEqual(identArray.get(), [1, 2, 3, 4]);
    });

});
