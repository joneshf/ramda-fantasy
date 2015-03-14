var R = require('ramda');
var assert = require('assert');
var jsv = require('jsverify');
var types = require('./types');

var Maybe = require('..').Maybe;

var MaybeGen = R.curry(function(a, n) {
    return n % 2 == 0 ? Maybe.Just(a.generator(n)) : Maybe.Nothing();
});

var MaybeShow = R.curry(function(a, m) {
    if (m instanceof Maybe.Just) {
        return "Just(" + a.show(m.value) + ")";
    } else {
        return "Nothing";
    }
});

var MaybeShrink = R.curry(function(a, m) {
    if (m instanceof Maybe.Just) {
        return [Maybe.Nothing()].concat(a.shrink(m.value).map(Maybe.Just));
    } else {
        return [];
    }
});

var MaybeArb = function(a) {
    return {
        generator: MaybeGen(a),
        show: MaybeShow(a),
        shrink: jsv.shrink.bless(MaybeShrink(a))
    };
};

describe('Maybe', function() {
    var m = MaybeArb(jsv.nat);
    var env = {Maybe: MaybeArb};
    var appF = 'Maybe (nat -> nat)';
    var appN = 'Maybe nat';
    var f = 'nat -> Maybe nat';
    var g = 'nat -> nat';

    it('has an arbitrary', function() {
        var arb = jsv.forall(m, function(m) {
            return m instanceof Maybe;
        });

        jsv.assert(arb);
    });

    it('is a Functor', function() {
        var fTest = types.functor(R.eqDeep);

        jsv.assert(jsv.forall(m, fTest.iface));
        jsv.assert(jsv.forall(m, fTest.id));
        jsv.assert(jsv.forall(m, g, g, fTest.compose));
    });

    it('is an Apply', function() {
        var aTest = types.apply(R.eqDeep);

        jsv.assert(jsv.forall(m, aTest.iface));
        jsv.assert(jsv.forall(appF, appF, appN, env, aTest.compose));
    });

    it('is an Applicative', function() {
        var aTest = types.applicative(R.eqDeep);

        jsv.assert(jsv.forall(m, aTest.iface));
        jsv.assert(jsv.forall(appN, appN, env, aTest.id));
        jsv.assert(jsv.forall(appN, g, 'nat', env, aTest.homomorphic));
        jsv.assert(jsv.forall(appN, appF, 'nat', env, aTest.interchange));
    });

    it('is a Chain', function() {
        var cTest = types.chain(R.eqDeep);

        jsv.assert(jsv.forall(m, cTest.iface));
        jsv.assert(jsv.forall(m, f, f, env, cTest.associative));
    });

    it('is a Monad', function() {
        var mTest = types.monad(R.eqDeep);

        jsv.assert(jsv.forall(m, mTest.iface));
        jsv.assert(jsv.forall(m, f, 'nat', env, mTest.leftId));
        jsv.assert(jsv.forall(m, mTest.rightId));
    });

});
