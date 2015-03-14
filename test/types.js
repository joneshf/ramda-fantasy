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

module.exports = {

    functor: function(eq) {
        return {
            iface: correctInterface('functor'),
            id: function(obj) {
                return eq(obj, obj.map(R.identity));
            },
            compose: function(obj, f, g) {
                var x = obj.map(function(x) { return f(g(x)); });
                var y = obj.map(g).map(f);
                return eq(x, y);
            }
        };
    },

    apply: function(eq) {
        return {
            iface: correctInterface('apply'),
            compose: function(a, u, v) {
                var x = a.ap(u.ap(v));
                var y = a.map(function(f) {
                    return function(g) {
                        return function(x) {
                            return f(g(x));
                        };
                    };
                }).ap(u).ap(v);
                return eq(x, y);
            }
        };
    },

    applicative: function(eq) {
        return {
            iface: correctInterface('applicative'),
            id: function(obj, obj2) {
                return eq(obj.of(R.identity).ap(obj2), obj2);
            },
            homomorphic: function(obj, f, x) {
                return eq(obj.of(f).ap(obj.of(x)), obj.of(f(x)));
            },
            interchange: function(obj1, obj2, x) {
                var y = obj2.ap(obj1.of(x));
                var z = obj1.of(function(f) { return f(x); }).ap(obj2);
                return eq(y, z);
            }
        };
    },

    chain: function(eq) {
        return {
            iface: correctInterface('chain'),
            associative: function(obj, f, g) {
                var x = obj.chain(f).chain(g);
                var y = obj.chain(function(x) { return f(x).chain(g); });
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
