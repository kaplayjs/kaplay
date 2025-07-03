"use strict";
// add an event to a tag
var __spreadArray = (this && this.__spreadArray) || function(to, from, pack) {
    if (pack || arguments.length === 2) {
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) {
                    ar = Array.prototype.slice.call(from, 0, i);
                }
                ar[i] = from[i];
            }
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onClick =
    exports.onUntag =
    exports.onTag =
    exports.onUnuse =
    exports.onUse =
    exports.onDestroy =
    exports.onAdd =
    exports.onDraw =
    exports.onUpdate =
    exports.onFixedUpdate =
    exports.trigger =
        void 0;
exports.on = on;
exports.onCollide = onCollide;
exports.onCollideUpdate = onCollideUpdate;
exports.onCollideEnd = onCollideEnd;
exports.forAllCurrentAndFuture = forAllCurrentAndFuture;
exports.onHover = onHover;
exports.onHoverUpdate = onHoverUpdate;
exports.onHoverEnd = onHoverEnd;
exports.onLoading = onLoading;
exports.onResize = onResize;
exports.onError = onError;
exports.onLoad = onLoad;
exports.onLoadError = onLoadError;
var asset_1 = require("../assets/asset");
var shared_1 = require("../shared");
var overload_1 = require("../utils/overload");
var events_1 = require("./events");
function on(event, tag, cb) {
    var paused = false;
    var obj2Handler = new Map();
    var handleNew = function(obj) {
        var ec = obj.on(event, function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            cb.apply(void 0, __spreadArray([obj], args, false));
        });
        ec.paused = paused;
        if (obj2Handler.has(obj)) {
            obj2Handler.get(obj).cancel();
        }
        obj2Handler.set(obj, ec);
    };
    var ecOnTag = shared_1._k.game.events.on("tag", function(obj, newTag) {
        if (newTag === tag) {
            handleNew(obj);
        }
    });
    var ecOnUntag = shared_1._k.game.events.on("untag", function(obj, oldTag) {
        if (oldTag === tag) {
            var ec = obj2Handler.get(obj);
            ec.cancel();
            obj2Handler.delete(obj);
        }
    });
    shared_1._k.game.root.get(tag, { recursive: true }).forEach(handleNew);
    return {
        get paused() {
            return paused;
        },
        set paused(p) {
            paused = p;
            obj2Handler.forEach(function(ec) {
                return ec.paused = p;
            });
        },
        cancel: function() {
            obj2Handler.forEach(function(ec) {
                return ec.cancel();
            });
            obj2Handler.clear();
            ecOnTag.cancel();
            ecOnUntag.cancel();
        },
    };
}
var trigger = function(event, tag) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    for (
        var _a = 0, _b = shared_1._k.game.root.children;
        _a < _b.length;
        _a++
    ) {
        var obj = _b[_a];
        if (obj.is(tag)) {
            obj.trigger(event, args);
        }
    }
};
exports.trigger = trigger;
exports.onFixedUpdate = (0, overload_1.overload2)(function(action) {
    var obj = shared_1._k.game.root.add([{ fixedUpdate: action }]);
    return {
        get paused() {
            return obj.paused;
        },
        set paused(p) {
            obj.paused = p;
        },
        cancel: function() {
            return obj.destroy();
        },
    };
}, function(tag, action) {
    return on("fixedUpdate", tag, action);
});
exports.onUpdate = (0, overload_1.overload2)(function(action) {
    var obj = shared_1._k.game.root.add([{ update: action }]);
    return {
        get paused() {
            return obj.paused;
        },
        set paused(p) {
            obj.paused = p;
        },
        cancel: function() {
            return obj.destroy();
        },
    };
}, function(tag, action) {
    return on("update", tag, action);
});
exports.onDraw = (0, overload_1.overload2)(function(action) {
    var obj = shared_1._k.game.root.add([{ draw: action }]);
    return {
        get paused() {
            return obj.hidden;
        },
        set paused(p) {
            obj.hidden = p;
        },
        cancel: function() {
            return obj.destroy();
        },
    };
}, function(tag, action) {
    return on("draw", tag, action);
});
exports.onAdd = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("add", action);
}, function(tag, action) {
    return on("add", tag, action);
});
exports.onDestroy = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("destroy", action);
}, function(tag, action) {
    return on("destroy", tag, action);
});
exports.onUse = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("use", action);
}, function(tag, action) {
    return on("use", tag, action);
});
exports.onUnuse = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("unuse", action);
}, function(tag, action) {
    return on("unuse", tag, action);
});
exports.onTag = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("tag", action);
}, function(tag, action) {
    return on("tag", tag, action);
});
exports.onUntag = (0, overload_1.overload2)(function(action) {
    return shared_1._k.game.events.on("untag", action);
}, function(tag, action) {
    return on("untag", tag, action);
});
// add an event that runs with objs with t1 collides with objs with t2
function onCollide(t1, t2, f) {
    return on("collide", t1, function(a, b, col) {
        return b.is(t2) && f(a, b, col);
    });
}
function onCollideUpdate(t1, t2, f) {
    return on("collideUpdate", t1, function(a, b, col) {
        return b.is(t2) && f(a, b, col);
    });
}
function onCollideEnd(t1, t2, f) {
    return on("collideEnd", t1, function(a, b, col) {
        return b.is(t2) && f(a, b, col);
    });
}
function forAllCurrentAndFuture(t, action) {
    shared_1._k.game.root.get(t, { recursive: true }).forEach(action);
    (0, exports.onAdd)(t, action);
    (0, exports.onTag)(function(obj, tag) {
        if (tag === t) {
            action(obj);
        }
    });
}
exports.onClick = (0, overload_1.overload2)(function(action) {
    return shared_1._k.app.onMousePress(action);
}, function(tag, action) {
    var events = [];
    forAllCurrentAndFuture(tag, function(obj) {
        if (!obj.area) {
            throw new Error(
                "onClick() requires the object to have area() component",
            );
        }
        events.push(obj.onClick(function() {
            return action(obj);
        }));
    });
    return events_1.KEventController.join(events);
});
// add an event that runs once when objs with tag t is hovered
function onHover(t, action) {
    var events = [];
    forAllCurrentAndFuture(t, function(obj) {
        if (!obj.area) {
            throw new Error(
                "onHover() requires the object to have area() component",
            );
        }
        events.push(obj.onHover(function() {
            return action(obj);
        }));
    });
    return events_1.KEventController.join(events);
}
// add an event that runs once when objs with tag t is hovered
function onHoverUpdate(t, action) {
    var events = [];
    forAllCurrentAndFuture(t, function(obj) {
        if (!obj.area) {
            throw new Error(
                "onHoverUpdate() requires the object to have area() component",
            );
        }
        events.push(obj.onHoverUpdate(function() {
            return action(obj);
        }));
    });
    return events_1.KEventController.join(events);
}
// add an event that runs once when objs with tag t is unhovered
function onHoverEnd(t, action) {
    var events = [];
    forAllCurrentAndFuture(t, function(obj) {
        if (!obj.area) {
            throw new Error(
                "onHoverEnd() requires the object to have area() component",
            );
        }
        events.push(obj.onHoverEnd(function() {
            return action(obj);
        }));
    });
    return events_1.KEventController.join(events);
}
function onLoading(action) {
    return shared_1._k.game.events.on("loading", action);
}
function onResize(action) {
    return shared_1._k.app.onResize(action);
}
function onError(action) {
    return shared_1._k.game.events.on("error", action);
}
function onLoad(cb) {
    if (shared_1._k.assets.loaded) {
        cb();
    }
    else {
        return shared_1._k.game.events.on("load", cb);
    }
}
function onLoadError(cb) {
    if (shared_1._k.assets.loaded) {
        (0, asset_1.getFailedAssets)().forEach(function(asset) {
            return cb.apply(void 0, asset);
        });
    }
    else {
        return shared_1._k.game.events.on("loadError", cb);
    }
}
