"use strict";
// The E of ECS
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
exports.GameObjRawPrototype = exports.KeepFlags = void 0;
exports.attachAppToGameObjRaw = attachAppToGameObjRaw;
var general_1 = require("../../constants/general");
var errors_1 = require("../../core/errors");
var events_1 = require("../../events/events");
var globalEvents_1 = require("../../events/globalEvents");
var drawMasked_1 = require("../../gfx/draw/drawMasked");
var drawPicture_1 = require("../../gfx/draw/drawPicture");
var drawSubstracted_1 = require("../../gfx/draw/drawSubstracted");
var FrameBuffer_1 = require("../../gfx/FrameBuffer");
var stack_1 = require("../../gfx/stack");
var math_1 = require("../../math/math");
var various_1 = require("../../math/various");
var shared_1 = require("../../shared");
var make_1 = require("./make");
var utils_1 = require("./utils");
var KeepFlags;
(function(KeepFlags) {
    KeepFlags[KeepFlags["Pos"] = 1] = "Pos";
    KeepFlags[KeepFlags["Angle"] = 2] = "Angle";
    KeepFlags[KeepFlags["Scale"] = 4] = "Scale";
    KeepFlags[KeepFlags["All"] = 7] = "All";
})(KeepFlags || (exports.KeepFlags = KeepFlags = {}));
exports.GameObjRawPrototype = {
    // This chain of `as any`, is because we never should use this object
    // directly, it's only a prototype. These properties WILL be defined
    // (by our factory function `make`) when we create a new game object.
    _paused: null,
    _anonymousCompStates: null,
    _cleanups: null,
    _compsIds: null,
    _compStates: null,
    _events: null,
    _fixedUpdateEvents: null,
    _inputEvents: null,
    _onCurCompCleanup: null,
    _parent: null,
    _tags: null,
    _updateEvents: null,
    _drawEvents: null,
    _drawLayerIndex: null,
    children: null,
    hidden: null,
    id: null,
    transform: null,
    target: null,
    // #region Setters and Getters
    set parent(p) {
        // We assume this will never be ran in root
        // so this is GameObj
        if (this._parent === p) {
            return;
        }
        var index = this._parent
            ? this._parent.children.indexOf(this)
            : -1;
        if (index !== -1) {
            this._parent.children.splice(index, 1);
        }
        this._parent = p;
        if (p) {
            p.children.push(this);
        }
    },
    set paused(paused) {
        if (this._paused === paused) {
            return;
        }
        this._paused = paused;
        for (var _i = 0, _a = this._inputEvents; _i < _a.length; _i++) {
            var e = _a[_i];
            e.paused = paused;
        }
    },
    get paused() {
        return this._paused;
    },
    get parent() {
        return this._parent;
    },
    get tags() {
        return Array.from(this._tags);
    },
    // #enedregion
    // #region Object
    setParent: function(p, opt) {
        var _a;
        if (this._parent === p) {
            return;
        }
        var oldTransform = (_a = this._parent) === null || _a === void 0
            ? void 0
            : _a.transform;
        var newTransform = p.transform;
        if ((opt.keep & KeepFlags.Pos) && this.pos !== undefined) {
            oldTransform.transformPointV(this.pos, this.pos);
            newTransform.inverse.transformPointV(this.pos, this.pos);
        }
        if ((opt.keep & KeepFlags.Angle) && this.angle !== undefined) {
            this.angle += newTransform.getRotation()
                - oldTransform.getRotation();
        }
        if ((opt.keep & KeepFlags.Scale) && this.scale !== undefined) {
            this.scale = this.scale.scale(
                oldTransform.getScale().invScale(newTransform.getScale()),
            );
        }
        this.parent = p;
    },
    add: function(a) {
        var obj = (0, make_1.make)(a);
        if (obj.parent) {
            throw new Error("Cannot add a game obj that already has a parent.");
        }
        obj.parent = this;
        (0, various_1.calcTransform)(obj, obj.transform);
        try {
            obj.trigger("add", obj);
        } catch (e) {
            (0, errors_1.handleErr)(e);
        }
        shared_1._k.game.events.trigger("add", obj);
        return obj;
    },
    readd: function(obj) {
        var idx = this.children.indexOf(obj);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            this.children.push(obj);
        }
        return obj;
    },
    remove: function(obj) {
        obj.parent = null;
        var trigger = function(o) {
            o.trigger("destroy");
            shared_1._k.game.events.trigger("destroy", o);
            o.children.forEach(function(child) {
                return trigger(child);
            });
        };
        trigger(obj);
    },
    removeAll: function(tag) {
        var _this = this;
        if (tag) {
            this.get(tag).forEach(function(obj) {
                return _this.remove(obj);
            });
        }
        else {
            for (
                var _i = 0, _a = __spreadArray([], this.children, true);
                _i < _a.length;
                _i++
            ) {
                var child = _a[_i];
                this.remove(child);
            }
        }
    },
    destroy: function() {
        if (this.parent) {
            this.parent.remove(this);
        }
    },
    exists: function() {
        return this.parent !== null;
    },
    isAncestorOf: function(obj) {
        if (!obj.parent) {
            return false;
        }
        return obj.parent === this || this.isAncestorOf(obj.parent);
    },
    // #endregion
    // #region Get & Query
    get: function(t, opts) {
        var _this = this;
        if (opts === void 0) opts = {};
        var compIdAreTags = shared_1._k.globalOpt.tagsAsComponents;
        var checkTagsOrComps = function(child, t) {
            if (opts.only === "comps") {
                return child.has(t);
            }
            else if (opts.only === "tags") {
                return child.is(t);
            }
            else {
                return child.is(t) || child.has(t);
            }
        };
        var list = opts.recursive
            ? this.children.flatMap(function recurse(child) {
                return __spreadArray(
                    [child],
                    child.children.flatMap(recurse),
                    true,
                );
            })
            : this.children;
        list = list.filter(function(child) {
            return t ? checkTagsOrComps(child, t) : true;
        });
        if (opts.liveUpdate) {
            var isChild_1 = function(obj) {
                return opts.recursive
                    ? _this.isAncestorOf(obj)
                    : obj.parent === _this;
            };
            var events_2 = [];
            // TODO: clean up when obj destroyed
            events_2.push((0, globalEvents_1.onAdd)(function(obj) {
                if (isChild_1(obj) && checkTagsOrComps(obj, t)) {
                    list.push(obj);
                }
            }));
            events_2.push((0, globalEvents_1.onDestroy)(function(obj) {
                if (checkTagsOrComps(obj, t)) {
                    var idx = list.findIndex(function(o) {
                        return o.id === obj.id;
                    });
                    if (idx !== -1) {
                        list.splice(idx, 1);
                    }
                }
            }));
            // If tags are components, we need to use these callbacks, whether watching tags or components
            // If tags are not components, we only need to use these callbacks if this query looks at components
            if (compIdAreTags || opts.only !== "tags") {
                events_2.push((0, globalEvents_1.onUse)(function(obj, id) {
                    if (isChild_1(obj) && checkTagsOrComps(obj, t)) {
                        var idx = list.findIndex(function(o) {
                            return o.id === obj.id;
                        });
                        if (idx == -1) {
                            list.push(obj);
                        }
                    }
                }));
                events_2.push((0, globalEvents_1.onUnuse)(function(obj, id) {
                    if (isChild_1(obj) && !checkTagsOrComps(obj, t)) {
                        var idx = list.findIndex(function(o) {
                            return o.id === obj.id;
                        });
                        if (idx !== -1) {
                            list.splice(idx, 1);
                        }
                    }
                }));
            }
            // If tags are components, we don't need to use these callbacks
            // If tags are not components, we only need to use these callbacks if this query looks at tags
            if (!compIdAreTags && opts.only !== "comps") {
                events_2.push((0, globalEvents_1.onTag)(function(obj, tag) {
                    if (isChild_1(obj) && checkTagsOrComps(obj, t)) {
                        var idx = list.findIndex(function(o) {
                            return o.id === obj.id;
                        });
                        if (idx == -1) {
                            list.push(obj);
                        }
                    }
                }));
                events_2.push((0, globalEvents_1.onUntag)(function(obj, tag) {
                    if (isChild_1(obj) && !checkTagsOrComps(obj, t)) {
                        var idx = list.findIndex(function(o) {
                            return o.id === obj.id;
                        });
                        if (idx !== -1) {
                            list.splice(idx, 1);
                        }
                    }
                }));
            }
            this.onDestroy(function() {
                for (
                    var _i = 0, events_3 = events_2;
                    _i < events_3.length;
                    _i++
                ) {
                    var ev = events_3[_i];
                    ev.cancel();
                }
            });
        }
        return list;
    },
    query: function(opt) {
        var _this = this;
        var hierarchy = opt.hierarchy || "children";
        var include = opt.include;
        var exclude = opt.exclude;
        var list = [];
        switch (hierarchy) {
            case "children":
                list = this.children;
                break;
            case "siblings":
                list = this.parent
                    ? this.parent.children.filter(function(o) {
                        return o !== _this;
                    })
                    : [];
                break;
            case "ancestors":
                var parent_1 = this.parent;
                while (parent_1) {
                    list.push(parent_1);
                    parent_1 = parent_1.parent;
                }
                break;
            case "descendants":
                list = this.children.flatMap(function recurse(child) {
                    return __spreadArray(
                        [
                            child,
                        ],
                        child.children.flatMap(recurse),
                        true,
                    );
                });
                break;
        }
        if (include) {
            var includeOp = opt.includeOp || "and";
            if (includeOp === "and" || !Array.isArray(opt.include)) {
                // Accept if all match
                list = list.filter(function(o) {
                    return o.is(include);
                });
            }
            else { // includeOp == "or"
                // Accept if some match
                list = list.filter(function(o) {
                    return opt.include.some(function(t) {
                        return o.is(t);
                    });
                });
            }
        }
        if (exclude) {
            var excludeOp = opt.includeOp || "and";
            if (excludeOp === "and" || !Array.isArray(opt.include)) {
                // Reject if all match
                list = list.filter(function(o) {
                    return !o.is(exclude);
                });
            }
            else { // includeOp == "or"
                // Reject if some match
                list = list.filter(function(o) {
                    return !opt.exclude.some(function(t) {
                        return o.is(t);
                    });
                });
            }
        }
        if (opt.visible === true) {
            list = list.filter(function(o) {
                return o.visible;
            });
        }
        if (opt.distance) {
            if (!this.pos) {
                throw Error(
                    "Can't do a distance query from an object without pos",
                );
            }
            var distanceOp = opt.distanceOp || "near";
            var sdist_1 = opt.distance * opt.distance;
            if (distanceOp === "near") {
                list = list.filter(function(o) {
                    return o.pos && _this.pos.sdist(o.pos) <= sdist_1;
                });
            }
            else { // distanceOp === "far"
                list = list.filter(function(o) {
                    return o.pos && _this.pos.sdist(o.pos) > sdist_1;
                });
            }
        }
        if (opt.name) {
            list = list.filter(function(o) {
                return o.name === opt.name;
            });
        }
        return list;
    },
    // #endregion
    // #region Lifecycle
    update: function() {
        var _a;
        if (this.paused) {
            return;
        }
        this._updateEvents.trigger();
        this._drawLayerIndex = (_a = this.layerIndex) !== null && _a !== void 0
            ? _a
            : (this.parent
                ? this.parent._drawLayerIndex
                : shared_1._k.game.defaultLayerIndex);
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].update();
        }
    },
    fixedUpdate: function() {
        if (this.paused) {
            return;
        }
        this._fixedUpdateEvents.trigger();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].fixedUpdate();
        }
    },
    draw: function() {
        this.drawTree();
    },
    drawTree: function() {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _l;
        if (this.hidden) {
            return;
        }
        var objects = new Array();
        (0, stack_1.pushTransform)();
        if (this.pos) {
            (0, stack_1.multTranslateV)(this.pos);
        }
        if (this.angle) {
            (0, stack_1.multRotate)(this.angle);
        }
        if (this.scale) {
            (0, stack_1.multScaleV)(this.scale);
        }
        if (!this.transform) {
            this.transform = new math_1.Mat23();
        }
        (0, stack_1.storeMatrix)(this.transform);
        // For each child call collect
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].hidden) {
                continue;
            }
            this.children[i].collectAndTransform(objects);
        }
        (0, stack_1.popTransform)();
        // Sort objects on layer, then z
        objects.sort(function(o1, o2) {
            var _a, _b;
            var l1 = o1._drawLayerIndex;
            var l2 = o2._drawLayerIndex;
            return (l1 - l2)
                || ((_a = o1.z) !== null && _a !== void 0 ? _a : 0)
                    - ((_b = o2.z) !== null && _b !== void 0 ? _b : 0);
        });
        // If this subtree is masking, the root is drawn into the mask, then the children are drawn
        if (this.mask) {
            var maskFunc = {
                intersect: drawMasked_1.drawMasked,
                subtract: drawSubstracted_1.drawSubtracted,
            }[this.mask];
            if (!maskFunc) {
                throw new Error(
                    "Invalid mask func: \"".concat(this.mask, "\""),
                );
            }
            maskFunc(function() {
                // Draw children masked
                var f = shared_1._k.gfx.fixed;
                // We push once, then update the current transform only
                (0, stack_1.pushTransform)();
                for (var i = 0; i < objects.length; i++) {
                    shared_1._k.gfx.fixed = (0, utils_1.isFixed)(objects[i]);
                    (0, stack_1.loadMatrix)(objects[i].transform);
                    objects[i]._drawEvents.trigger();
                }
                (0, stack_1.popTransform)();
                shared_1._k.gfx.fixed = f;
            }, function() {
                (0, stack_1.pushTransform)();
                (0, stack_1.loadMatrix)(_this.transform);
                // Draw mask
                _this._drawEvents.trigger();
                (0, stack_1.popTransform)();
            });
        }
        else {
            // If this subtree is rendered to a target, enable target
            if (this.target) {
                if (
                    !((_a = this.target) === null || _a === void 0
                        ? void 0
                        : _a.refreshOnly)
                    || !((_b = this.target) === null || _b === void 0
                        ? void 0
                        : _b.isFresh)
                ) {
                    (0, stack_1.flush)();
                    if (
                        this.target.destination
                            instanceof FrameBuffer_1.FrameBuffer
                    ) {
                        this.target.destination.bind();
                    }
                    else if (
                        this.target.destination instanceof drawPicture_1.Picture
                    ) {
                        (0, drawPicture_1.beginPicture)(
                            this.target.destination,
                        );
                    }
                }
            }
            if (
                !((_c = this.target) === null || _c === void 0
                    ? void 0
                    : _c.refreshOnly)
                || !((_d = this.target) === null || _d === void 0
                    ? void 0
                    : _d.isFresh)
            ) {
                var f = shared_1._k.gfx.fixed;
                (0, stack_1.pushTransform)();
                // Parent is drawn before children if !childrenOnly
                if (
                    !((_e = this.target) === null || _e === void 0
                        ? void 0
                        : _e.childrenOnly)
                ) {
                    shared_1._k.gfx.fixed = (0, utils_1.isFixed)(this);
                    (0, stack_1.loadMatrix)(this.transform);
                    this._drawEvents.trigger();
                }
                // Draw children
                for (var i = 0; i < objects.length; i++) {
                    // An object with a mask is drawn at draw time, but the transform still needs to be calculated,
                    // so we push the parent's transform and pretend we are
                    shared_1._k.gfx.fixed = (0, utils_1.isFixed)(objects[i]);
                    if (objects[i].mask) {
                        (0, stack_1.loadMatrix)(objects[i].parent.transform);
                        objects[i].drawTree();
                    }
                    else {
                        (0, stack_1.loadMatrix)(objects[i].transform);
                        objects[i]._drawEvents.trigger();
                    }
                }
                (0, stack_1.popTransform)();
                shared_1._k.gfx.fixed = f;
            }
            // If this subtree is rendered to a target, disable target
            if (this.target) {
                if (
                    !((_f = this.target) === null || _f === void 0
                        ? void 0
                        : _f.refreshOnly)
                    || !((_g = this.target) === null || _g === void 0
                        ? void 0
                        : _g.isFresh)
                ) {
                    (0, stack_1.flush)();
                    if (
                        this.target.destination
                            instanceof FrameBuffer_1.FrameBuffer
                    ) {
                        this.target.destination.unbind();
                    }
                    else if (
                        this.target.destination instanceof drawPicture_1.Picture
                    ) {
                        (0, drawPicture_1.endPicture)();
                    }
                }
            }
            // If this object needs the refresh flag in order to draw children, set it to fresh
            if (
                ((_h = this.target) === null || _h === void 0
                    ? void 0
                    : _h.refreshOnly)
                && !((_j = this.target) === null || _j === void 0
                    ? void 0
                    : _j.isFresh)
            ) {
                this.target.isFresh = true;
            }
            // If children only flag is on
            if (
                (_l = this.target) === null || _l === void 0
                    ? void 0
                    : _l.childrenOnly
            ) {
                // Parent is drawn on screen, children are drawn in target
                var f = shared_1._k.gfx.fixed;
                shared_1._k.gfx.fixed = (0, utils_1.isFixed)(this);
                (0, stack_1.pushTransform)();
                (0, stack_1.loadMatrix)(this.transform);
                this._drawEvents.trigger();
                (0, stack_1.popTransform)();
                shared_1._k.gfx.fixed = f;
            }
        }
    },
    inspect: function() {
        var _a, _b;
        var info = {};
        for (var _i = 0, _c = this._compStates; _i < _c.length; _i++) {
            var _d = _c[_i], tag = _d[0], comp = _d[1];
            info[tag] = (_b = (_a = comp.inspect) === null || _a === void 0
                            ? void 0
                            : _a.call(comp)) !== null && _b !== void 0
                ? _b
                : null;
        }
        for (
            var _e = 0, _f = this._anonymousCompStates.entries();
            _e < _f.length;
            _e++
        ) {
            var _g = _f[_e], i = _g[0], comp = _g[1];
            if (comp.inspect) {
                info[i] = comp.inspect();
                continue;
            }
            for (var _h = 0, _j = Object.entries(comp); _h < _j.length; _h++) {
                var _l = _j[_h], key = _l[0], value = _l[1];
                if (typeof value === "function") {
                    continue;
                }
                else {
                    info[key] = "".concat(key, ": ").concat(value);
                }
            }
        }
        return info;
    },
    drawInspect: function() {
        if (this.hidden) {
            return;
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].drawInspect();
        }
        (0, stack_1.loadMatrix)(this.transform);
        this.trigger("drawInspect");
    },
    collectAndTransform: function(objects) {
        (0, stack_1.pushTransform)();
        if (this.pos) {
            (0, stack_1.multTranslateV)(this.pos);
        }
        if (this.angle) {
            (0, stack_1.multRotate)(this.angle);
        }
        if (this.scale) {
            (0, stack_1.multScaleV)(this.scale);
        }
        if (!this.transform) {
            this.transform = new math_1.Mat23();
        }
        (0, stack_1.storeMatrix)(this.transform);
        // Add to objects
        objects.push(this);
        // Recurse on children
        for (var i = 0; i < this.children.length; i++) {
            // While we could do this test in collect, it would mean an extra function call
            // so it is better to do this preemptively
            if (this.children[i].hidden) {
                continue;
            }
            if (this.target) {
                this.drawTree();
            }
            else if (!this.mask) {
                this.children[i].collectAndTransform(objects);
            }
        }
        (0, stack_1.popTransform)();
    },
    // #endregion
    // #region Comps
    use: function(comp) {
        var _this = this;
        var _a;
        if (!comp || typeof comp != "object") {
            throw new Error(
                "You can only pass objects to .use(), you passed a \"".concat(
                    typeof comp,
                    "\"",
                ),
            );
        }
        var addCompIdAsTag = this.id === 0
            ? false
            : shared_1._k.globalOpt.tagsAsComponents;
        var gc = [];
        // clear if overwrite
        if (comp.id) {
            this.unuse(comp.id);
            this._cleanups[comp.id] = [];
            gc = this._cleanups[comp.id];
            this._compStates.set(comp.id, comp);
            if (addCompIdAsTag) {
                this._tags.add(comp.id);
            }
        }
        else {
            this._anonymousCompStates.push(comp);
        }
        var _loop_1 = function(key) {
            // These are properties from the component data (id, require), shouldn't
            // be added to the game obj prototype, that's why we continue
            if (general_1.COMP_DESC.has(key)) {
                return "continue";
            }
            var prop = Object.getOwnPropertyDescriptor(comp, key);
            if (!prop) {
                return "continue";
            }
            if (typeof prop.value === "function") {
                // @ts-ignore
                comp[key] = comp[key].bind(this_1);
            }
            if (prop.set) {
                Object.defineProperty(comp, key, {
                    set: prop.set.bind(this_1),
                });
            }
            if (prop.get) {
                Object.defineProperty(comp, key, {
                    get: prop.get.bind(this_1),
                });
            }
            if (general_1.COMP_EVENTS.has(key)) {
                // Automatically clean up events created by components in add() stage
                var func = key === "add"
                    ? function() {
                        var _a;
                        _this._onCurCompCleanup = function(c) {
                            return gc.push(c);
                        };
                        (_a = comp[key]) === null || _a === void 0
                            ? void 0
                            : _a.call(comp);
                        _this._onCurCompCleanup = null;
                    }
                    : comp[key];
                gc.push(this_1.on(key, func).cancel);
            }
            else {
                // @ts-ignore
                if (this_1[key] === undefined) {
                    // Assign comp fields to game obj
                    Object.defineProperty(this_1, key, {
                        get: function() {
                            return comp[key];
                        },
                        set: function(val) {
                            return comp[key] = val;
                        },
                        configurable: true,
                        enumerable: true,
                    });
                    // @ts-ignore
                    gc.push(function() {
                        return delete _this[key];
                    });
                }
                else {
                    var originalCompId =
                        (_a = this_1._compStates.values().find(function(c) {
                                    return c[key] !== undefined;
                                })) === null || _a === void 0
                            ? void 0
                            : _a.id;
                    throw new Error(
                        "Duplicate component property: \"".concat(
                            key,
                            "\" while adding component \"",
                        ).concat(comp.id, "\"")
                            + (originalCompId
                                ? " (originally added by \"".concat(
                                    originalCompId,
                                    "\")",
                                )
                                : ""),
                    );
                }
            }
        };
        var this_1 = this;
        for (var key in comp) {
            _loop_1(key);
        }
        // Check for component dependencies
        var checkDeps = function() {
            if (!comp.require) {
                return;
            }
            try {
                for (var _i = 0, _a = comp.require; _i < _a.length; _i++) {
                    var dep = _a[_i];
                    if (!_this._compsIds.has(dep)) {
                        throw new Error(
                            "Component \"".concat(
                                comp.id,
                                "\" requires component \"",
                            ).concat(dep, "\""),
                        );
                    }
                }
            } catch (e) {
                (0, errors_1.handleErr)(e);
            }
        };
        if (comp.destroy) {
            gc.push(comp.destroy.bind(this));
        }
        // Manually trigger add event if object already exist
        // ID == 0 is root
        if (this.id != 0 && this.exists()) {
            checkDeps();
            if (comp.add) {
                this._onCurCompCleanup = function(c) {
                    return gc.push(c);
                };
                comp.add.call(this);
                this._onCurCompCleanup = null;
            }
            if (comp.id) {
                this.trigger("use", comp.id);
                shared_1._k.game.events.trigger("use", this, comp.id);
            }
        }
        else {
            if (comp.require) {
                checkDeps();
            }
        }
    },
    // Remove components
    unuse: function(id) {
        var addCompIdAsTag = this.id === 0
            ? false
            : shared_1._k.globalOpt.tagsAsComponents;
        if (this._compStates.has(id)) {
            // check all components for a dependent, if there's one, throw an error
            for (
                var _i = 0, _a = this._compStates.values();
                _i < _a.length;
                _i++
            ) {
                var comp = _a[_i];
                if (comp.require && comp.require.includes(id)) {
                    throw new Error(
                        "Can't unuse. Component \"".concat(
                            comp.id,
                            "\" requires component \"",
                        ).concat(id, "\""),
                    );
                }
            }
            this._compStates.delete(id);
            this._compsIds.delete(id);
            this.trigger("unuse", id);
            shared_1._k.game.events.trigger("unuse", this, id);
        }
        else if (addCompIdAsTag && this._tags.has(id)) {
            this._tags.delete(id);
        }
        if (this._cleanups[id]) {
            this._cleanups[id].forEach(function(e) {
                return e();
            });
            delete this._cleanups[id];
        }
    },
    has: function(compList, op) {
        var _this = this;
        if (op === void 0) op = "and";
        if (Array.isArray(compList)) {
            if (op === "and") {
                return compList.every(function(c) {
                    return _this._compStates.has(c);
                });
            }
            else {
                return compList.some(function(c) {
                    return _this._compStates.has(c);
                });
            }
        }
        else {
            return this._compStates.has(compList);
        }
    },
    c: function(id) {
        var _a;
        return (_a = this._compStates.get(id)) !== null && _a !== void 0
            ? _a
            : null;
    },
    // #endregion
    // #region Tags
    tag: function(tag) {
        if (Array.isArray(tag)) {
            for (var _i = 0, tag_1 = tag; _i < tag_1.length; _i++) {
                var t = tag_1[_i];
                this._tags.add(t);
                this.trigger("tag", t);
                shared_1._k.game.events.trigger("tag", this, t);
            }
        }
        else {
            this._tags.add(tag);
            this.trigger("tag", tag);
            shared_1._k.game.events.trigger("tag", this, tag);
        }
    },
    untag: function(tag) {
        if (Array.isArray(tag)) {
            for (var _i = 0, tag_2 = tag; _i < tag_2.length; _i++) {
                var t = tag_2[_i];
                this._tags.delete(t);
                this.trigger("untag", t);
                shared_1._k.game.events.trigger("untag", this, t);
            }
        }
        else {
            this._tags.delete(tag);
            this.trigger("untag", tag);
            shared_1._k.game.events.trigger("untag", this, tag);
        }
    },
    is: function(tag, op) {
        var _this = this;
        if (op === void 0) op = "and";
        if (Array.isArray(tag)) {
            if (op === "and") {
                return tag.every(function(tag) {
                    return _this._tags.has(tag);
                });
            }
            else {
                return tag.some(function(tag) {
                    return _this._tags.has(tag);
                });
            }
        }
        else {
            return this._tags.has(tag);
        }
    },
    // #endregion
    // #region Events
    on: function(name, action) {
        var _this = this;
        var ctrl = (function(func) {
            switch (name) {
                case "fixedUpdate":
                    return _this._fixedUpdateEvents.add(func);
                case "update":
                    return _this._updateEvents.add(func);
                case "draw":
                    return _this._drawEvents.add(func);
                default:
                    return _this._events.on(name, func);
            }
        })(action.bind(this));
        if (this._onCurCompCleanup) {
            this._onCurCompCleanup(function() {
                return ctrl.cancel();
            });
        }
        return ctrl;
    },
    trigger: function(name) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = this._events).trigger.apply(
            _a,
            __spreadArray([name], args, false),
        );
    },
    clearEvents: function() {
        this._events.clear();
        this._drawEvents.clear();
        this._updateEvents.clear();
        this._fixedUpdateEvents.clear();
    },
    // #endregion
    // #region Helper Events
    onAdd: function(cb) {
        return this.on("add", cb);
    },
    onFixedUpdate: function(cb) {
        return this.on("fixedUpdate", cb);
    },
    onUpdate: function(cb) {
        return this.on("update", cb);
    },
    onDraw: function(cb) {
        return this.on("draw", cb);
    },
    onDestroy: function(action) {
        return this.on("destroy", action);
    },
    onTag: function(action) {
        return this.on("tag", action);
    },
    onUntag: function(action) {
        return this.on("untag", action);
    },
    onUse: function(action) {
        return this.on("use", action);
    },
    onUnuse: function(action) {
        return this.on("unuse", action);
    },
    // #endregion
};
// #region App Events in Proto
function attachAppToGameObjRaw() {
    // We add App Events for "attaching" it to game object
    var appEvs = [
        "onKeyPress",
        "onKeyPressRepeat",
        "onKeyDown",
        "onKeyRelease",
        "onMousePress",
        "onMouseDown",
        "onMouseRelease",
        "onMouseMove",
        "onCharInput",
        "onMouseMove",
        "onTouchStart",
        "onTouchMove",
        "onTouchEnd",
        "onScroll",
        "onGamepadButtonPress",
        "onGamepadButtonDown",
        "onGamepadButtonRelease",
        "onGamepadStick",
        "onButtonPress",
        "onButtonDown",
        "onButtonRelease",
    ];
    var _loop_2 = function(e) {
        var obj = exports.GameObjRawPrototype;
        obj[e] = function() {
            var _this = this;
            var _a, _b;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // @ts-ignore
            var ev = (_b = (_a = shared_1._k.app)[e]) === null || _b === void 0
                ? void 0
                : _b.call.apply(_b, __spreadArray([_a], args, false));
            ev.paused = this.paused;
            this._inputEvents.push(ev);
            this.onDestroy(function() {
                return ev.cancel();
            });
            // This only happens if obj.has("stay");
            this.on("sceneEnter", function() {
                var _a, _b;
                // All app events are already canceled by changing the scene
                // so we don't need to event.cancel();
                _this._inputEvents.splice(_this._inputEvents.indexOf(ev), 1);
                // create a new event with the same arguments
                // @ts-ignore
                var newEv =
                    (_b = (_a = shared_1._k.app)[e]) === null || _b === void 0
                        ? void 0
                        : _b.call.apply(_b, __spreadArray([_a], args, false));
                // Replace the old event handler with the new one
                // old KEventController.cancel() => new KEventController.cancel()
                events_1.KEventController.replace(ev, newEv);
                _this._inputEvents.push(ev);
            });
            return ev;
        };
    };
    for (var _i = 0, appEvs_1 = appEvs; _i < appEvs_1.length; _i++) {
        var e = appEvs_1[_i];
        _loop_2(e);
    }
}
// #endregion
