var R = require('ramda');

var interfaces = {
    functor:        ['map'],
    apply:          ['map', 'ap'],
    applicative:    ['map', 'ap', 'of'],
    chain:          ['map', 'ap', 'chain'],
    monad:          ['map', 'ap', 'chain', 'of']
};

function correctInterface(type) {
    return function(obj) {
        return interfaces[type].every(function(method) {
            return obj[method] && typeof obj[method] === 'function';
        });
    };
}

function identity(x) { return x; }

module.exports = {

    functor: function(eq) {
        return {
            iface: correctInterface('functor'),
            id: function(obj) {
                return eq(obj, obj.map(identity));
            },
            compose: function(obj, f, g) {
                return eq(obj.map(R.compose(f, g)), obj.map(g).map(f));
            }
        };
    },

    apply: function(eq) {
        return {
            iface: correctInterface('apply'),
            compose: function(a, u, v) {
                var curry2 = R.curryN(2);
                return eq(a.ap(u.ap(v)), a.map(curry2(R.compose)).ap(u).ap(v));
            }
        };
    },

    applicative: function(eq) {
        return {
            iface: correctInterface('applicative'),
            id: function(obj, obj2) {
                return eq(obj.of(identity).ap(obj2), obj2);
            },
            homomorphic: function(obj, f, x) {
                return eq(obj.of(f).ap(obj.of(x)), obj.of(f(x)));
            },
            interchange: function(obj1, obj2, x) {
                var ylppa = R.flip(R.apply);
                return eq(obj2.ap(obj1.of(x)), obj1.of(ylppa([x])).ap(obj2));
            }
        };
    },

    chain: function(eq) {
        return {
            iface: correctInterface('chain'),
            associative: function(obj, f, g) {
                var x = obj.chain(f).chain(g);
                var y = obj.chain(R.pipe(f, R.invoker(1, 'chain', g)));
                return eq(x, y);
            }
        };
    },

    monad: function(eq) {
        return {
            iface: correctInterface('monad'),
            leftId: function(obj, f, x) {
                return eq(obj.of(x).chain(f), f(x));
            },
            rightId: function(obj) {
                return eq(obj.chain(obj.of), obj);
            }
        };
    }
};
