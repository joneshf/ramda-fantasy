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

    it('has an arbitrary', function() {
        var arb = jsv.forall(e, function(e) {
            return e instanceof Either;
        });

        jsv.assert(arb);
    });

    it('is a Functor', function() {
        var fTest = types.functor;

        jsv.assert(jsv.forall(e, fTest.iface));
        jsv.assert(jsv.forall(e, fTest.id));
        jsv.assert(jsv.forall(e, 'nat -> nat', 'nat -> nat', fTest.compose));
    });

    it('is an Apply', function() {
        var aTest = types.apply;

        jsv.assert(jsv.forall(e, aTest.iface));
        jsv.assert(jsv.forall(appF, appF, appN, env, aTest.compose));
    });

    it('is an Applicative', function() {
        var aTest = types.applicative;

        jsv.assert(jsv.forall(e, aTest.iface));
        jsv.assert(jsv.forall(appN, appN, env, aTest.id));
        jsv.assert(jsv.forall(appN, 'nat -> nat', 'nat', env, aTest.homomorphic));
        jsv.assert(jsv.forall(appN, appF, 'nat', env, aTest.interchange));
    });

    it('is a Chain', function() {
        var cTest = types.chain;
        var f = 'nat -> Either string nat'

        jsv.assert(jsv.forall(e, cTest.iface));
        jsv.assert(jsv.forall(e, f, f, env, cTest.associative));
    });

    it('is a Monad', function() {
        var mTest = types.monad;

        jsv.assert(jsv.forall(e, mTest.iface));
    });

    // var e = Either('original left', 1);

    // function mult(a) {
    //     return function(b) { return a * b; };
    // }

    // function add(a) {
    //     return function(b) { return a + b; };
    // }

    // it('is a Functor', function() {
    //     var fTest = types.functor;
    //     assert.equal(true, fTest.iface(e));
    //     assert.equal(true, fTest.id(e));
    //     assert.equal(true, fTest.compose(e, mult(2), add(3)));
    // });

    // it('is an Apply', function() {
    //     var aTest = types.apply;
    //     var appA = Either('apply test fn a', mult(10));
    //     var appU = Either('apply test fn u', add(5));
    //     var appV = Either('apply test value v', 10);

    //     assert.equal(true, aTest.iface(appA));
    //     assert.equal(true, aTest.compose(appA, appU, appV));
    // });

    // it('is an Applicative', function() {
    //     var aTest = types.applicative;
    //     var app1 = Either('app1', 101);
    //     var app2 = Either('app2', -123);
    //     var appF = Either('appF', mult(3));

    //     assert.equal(true, aTest.iface(app1));
    //     assert.equal(true, aTest.id(app1, app2));
    //     assert.equal(true, aTest.homomorphic(app1, add(3), 46));
    //     assert.equal(true, aTest.interchange(app1, appF, 17));
    // });

    // it('is a Chain', function() {
    //     var cTest = types.chain;
    //     var f1 = function(x) {return Either('f1', (3 * x));};
    //     var f2 = function(x) {return Either('f2', (5 + x));};

    //     assert.equal(true, cTest.iface(e));
    //     assert.equal(true, cTest.associative(e, f1, f2));
    // });

    // it('is a Monad', function() {
    //     var mTest = types.monad;
    //     assert.equal(true, mTest.iface(e));
    // });
});
