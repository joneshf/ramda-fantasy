var R = require('ramda');
var assert = require('assert');
var jsv = require('jsverify');
var types = require('./types');

var Either = require('..').Either;

var EitherGen = R.curry(function(a, b, n) {
    if (n % 2 == 0) {
        return Either.Left(a.generator(n));
    } else {
        return Either.Right(b.generator(n));
    }
});

var EitherShow = R.curry(function(a, b, m) {
    if (m.isLeft()) {
        return "Left(" + a.show(m.value) + ")";
    } else {
        return "Right(" + b.show(m.value) + ")";
    }
});

var EitherShrink = R.curry(function(a, b, m) {
    if (m.isLeft()) {
        return a.shrink(m.value).map(Either.Left);
    } else {
        return b.shrink(m.value).map(Either.Right);
    }
});

var EitherArb = function(a, b) {
    return {
        generator: EitherGen(a, b),
        show: EitherShow(a, b),
        shrink: jsv.shrink.bless(EitherShrink(a, b))
    };
};

describe('Either', function() {
    var e = EitherArb(jsv.string, jsv.nat);
    var env = {Either: EitherArb};
    var appF = 'Either string (nat -> nat)';
    var appN = 'Either string nat';
    var f = 'nat -> Either string nat';
    var g = 'nat -> nat';

    it('has an arbitrary', function() {
        var arb = jsv.forall(e, function(e) {
            return e instanceof Either;
        });

        jsv.assert(arb);
    });

    it('is a Functor', function() {
        var fTest = types.functor(R.eqDeep);

        jsv.assert(jsv.forall(e, fTest.iface));
        jsv.assert(jsv.forall(e, fTest.id));
        jsv.assert(jsv.forall(e, g, g, fTest.compose));
    });

    it('is an Apply', function() {
        var aTest = types.apply(R.eqDeep);

        jsv.assert(jsv.forall(e, aTest.iface));
        jsv.assert(jsv.forall(appF, appF, appN, env, aTest.compose));
    });

    it('is an Applicative', function() {
        var aTest = types.applicative(R.eqDeep);

        jsv.assert(jsv.forall(e, aTest.iface));
        jsv.assert(jsv.forall(appN, appN, env, aTest.id));
        jsv.assert(jsv.forall(appN, g, 'nat', env, aTest.homomorphic));
        jsv.assert(jsv.forall(appN, appF, 'nat', env, aTest.interchange));
    });

    it('is a Chain', function() {
        var cTest = types.chain(R.eqDeep);

        jsv.assert(jsv.forall(e, cTest.iface));
        jsv.assert(jsv.forall(e, f, f, env, cTest.associative));
    });

    it('is a Monad', function() {
        var mTest = types.monad(R.eqDeep);

        jsv.assert(jsv.forall(e, mTest.iface));
        jsv.assert(jsv.forall(e, f, 'nat', env, mTest.leftId));
        jsv.assert(jsv.forall(e, mTest.rightId));
    });

});
