"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = agent;
function agent(opts) {
    var _a, _b;
    if (opts === void 0) opts = {};
    var target = null;
    var path = null;
    var index = null;
    var navMapChangedEvent = null;
    return {
        id: "agent",
        require: ["pos", "tile"],
        agentSpeed: (_a = opts.speed) !== null && _a !== void 0 ? _a : 100,
        allowDiagonals: (_b = opts.allowDiagonals) !== null && _b !== void 0
            ? _b
            : true,
        getDistanceToTarget: function() {
            return target ? this.pos.dist(target) : 0;
        },
        getNextLocation: function() {
            return path && index ? path[index] : null;
        },
        getPath: function() {
            return path ? path.slice() : null;
        },
        getTarget: function() {
            return target;
        },
        isNavigationFinished: function() {
            return path ? index === null : true;
        },
        isTargetReachable: function() {
            return path !== null;
        },
        isTargetReached: function() {
            return target ? this.pos.eq(target) : true;
        },
        setTarget: function(p) {
            var _this = this;
            target = p;
            path = this.getLevel().getPath(this.pos, target, {
                allowDiagonals: this.allowDiagonals,
            });
            index = path ? 0 : null;
            if (path && index !== null) {
                if (!navMapChangedEvent) {
                    navMapChangedEvent = this.getLevel()
                        .onNavigationMapChanged(function() {
                            if (target && path && index !== null) {
                                path = _this.getLevel().getPath(
                                    _this.pos,
                                    target,
                                    {
                                        allowDiagonals: _this.allowDiagonals,
                                    },
                                );
                                if (path) {
                                    index = 0;
                                    _this.trigger(
                                        "navigationNext",
                                        _this,
                                        path[index],
                                    );
                                }
                                else {
                                    index = null;
                                    _this.trigger("navigationEnded", _this);
                                }
                            }
                        });
                    this.onDestroy(function() {
                        return navMapChangedEvent === null
                                || navMapChangedEvent === void 0
                            ? void 0
                            : navMapChangedEvent.cancel();
                    });
                }
                this.trigger("navigationStarted", this);
                this.trigger("navigationNext", this, path[index]);
            }
            else {
                this.trigger("navigationEnded", this);
            }
        },
        update: function() {
            if (target && path && index !== null) {
                if (this.pos.sdist(path[index]) < 2) {
                    if (index === path.length - 1) {
                        this.pos = target.clone();
                        index = null;
                        this.trigger("navigationEnded", this);
                        this.trigger("targetReached", this);
                        return;
                    }
                    else {
                        index++;
                        this.trigger("navigationNext", this, path[index]);
                    }
                }
                this.moveTo(path[index], this.agentSpeed);
            }
        },
        onNavigationStarted: function(cb) {
            return this.on("navigationStarted", cb);
        },
        onNavigationNext: function(cb) {
            return this.on("navigationNext", cb);
        },
        onNavigationEnded: function(cb) {
            return this.on("navigationEnded", cb);
        },
        onTargetReached: function(cb) {
            return this.on("targetReached", cb);
        },
        inspect: function() {
            return "agent: " + JSON.stringify({
                target: JSON.stringify(target),
                path: JSON.stringify(path),
            });
        },
    };
}
