var R = require('ramda');
var assert = require('assert');
var jsv = require('jsverify');
var types = require('./types');

var Reader = require('..').Reader;

var ReaderGen = R.curry(function(a, n) {
    return Reader(a.generator(n));
});

var ReaderShow = function(r) {
    return "Reader(f)";
};

var ReaderShrink = function(r) {
    return [];
};

var ReaderArb = function(a) {
    return {
        generator: ReaderGen(a),
        show: ReaderShow,
        shrink: jsv.shrink.bless(ReaderShrink)
    };
};

describe('Reader properties', function() {

    var r = ReaderArb(jsv.fn(jsv.nat));
    var env = {Reader: ReaderArb};
    var appF = 'Reader (nat -> nat -> nat)';
    var appN = 'Reader (nat -> nat)';
    var f = 'nat -> Reader (nat -> nat)';
    var g = 'nat -> nat';

    var runner = R.curry(function(t, n) {
        return types[t](function(x, y) {
            return x.run(n) === y.run(n);
        });
    });

    it('is a Functor', function() {
        jsv.assert(jsv.forall('nat', r, g, g, function(n, r, f, g) {
            var run = runner('functor', n);
            return run.iface(r) && run.id(r) && run.compose(r, f, g);
        }));
    });

    it('is an Apply', function() {
        jsv.assert(jsv.forall('nat', r, appF, appF, appN, env,
            function(n, r, a, u, v) {
                var run = runner('apply', n);
                return run.iface(r) && run.compose(a, u, v);
            }));
    });

    it('is an Applicative', function() {
        jsv.assert(jsv.forall('nat', r, appF, appN, appN, g, 'nat', env,
            function(n, r, a, u, v, f, m) {
                var run = runner('applicative', n);
                return run.iface(r) && run.id(u, v) &&
                    run.homomorphic(u, f, m) && run.interchange(u, a, m);
            }));
    });

    it('is a Chain', function() {
        jsv.assert(jsv.forall('nat', r, f, f, env, function(n, r, f, g) {
            var run = runner('chain', n);
            return run.iface(r) && run.associative(r, f, g);
        }));
    });

    it('is a Monad', function() {
        jsv.assert(jsv.forall('nat', r, f, 'nat', env, function(n, r, f, m) {
            var run = runner('monad', n);
            return run.iface(r) && run.leftId(r, f, m) && run.rightId(r);
        }));
    });

});

describe('Reader examples', function() {
    it('should write name of options object', function() {

        var options = {name: 'header'};
        var Printer = {};
        Printer.write = function(x) {
            return '/** ' + x + ' */';
        };

        function getOptionsName(opts) {
            return Reader(function(printer) {
                return printer.write(opts.name);
            });
        }

        var nameReader = getOptionsName(options);

        assert.equal(nameReader.run(Printer), '/** header */');
    });
});
