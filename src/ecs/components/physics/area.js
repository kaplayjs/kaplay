"use strict";
var __assign = (this && this.__assign) || function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) {
                    t[p] = s[p];
                }
            }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usesArea = usesArea;
exports.area = area;
var general_1 = require("../../../constants/general");
var camera_1 = require("../../../game/camera");
var anchor_1 = require("../../../gfx/anchor");
var drawCircle_1 = require("../../../gfx/draw/drawCircle");
var drawPolygon_1 = require("../../../gfx/draw/drawPolygon");
var drawRect_1 = require("../../../gfx/draw/drawRect");
var stack_1 = require("../../../gfx/stack");
var color_1 = require("../../../math/color");
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
var shared_1 = require("../../../shared");
var utils_1 = require("../../entity/utils");
function usesArea() {
    return shared_1._k.game.areaCount > 0;
}
function area(opt) {
    var _a, _b, _c, _d;
    if (opt === void 0) opt = {};
    var colliding = {};
    var collidingThisFrame = new Set();
    var events = [];
    var oldShape;
    return {
        id: "area",
        collisionIgnore: (_a = opt.collisionIgnore) !== null && _a !== void 0
            ? _a
            : [],
        restitution: opt.restitution,
        friction: opt.friction,
        add: function() {
            var _this = this;
            shared_1._k.game.areaCount++;
            if (this.area.cursor) {
                events.push(this.onHover(function() {
                    return shared_1._k.app.setCursor(_this.area.cursor);
                }));
            }
            events.push(this.onCollideUpdate(function(obj, col) {
                if (!obj.id) {
                    throw new Error("area() requires the object to have an id");
                }
                if (!colliding[obj.id]) {
                    _this.trigger("collide", obj, col);
                }
                if (!col) {
                    return;
                }
                colliding[obj.id] = col;
                collidingThisFrame.add(obj.id);
            }));
        },
        destroy: function() {
            shared_1._k.game.areaCount--;
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var event_1 = events_1[_i];
                event_1.cancel();
            }
        },
        fixedUpdate: function() {
            for (var id in colliding) {
                if (!collidingThisFrame.has(Number(id))) {
                    this.trigger("collideEnd", colliding[id].target);
                    delete colliding[id];
                }
            }
            collidingThisFrame.clear();
        },
        drawInspect: function() {
            var a = this.localArea();
            (0, stack_1.pushTransform)();
            (0, stack_1.multTranslate)(this.area.offset.x, this.area.offset.y);
            var opts = {
                outline: {
                    width: 4 / shared_1._k.gfx.viewport.scale,
                    color: (0, color_1.rgb)(0, 0, 255),
                },
                anchor: this.anchor,
                fill: false,
                fixed: (0, utils_1.isFixed)(this),
            };
            if (a instanceof math_1.Rect) {
                (0, drawRect_1.drawRect)(
                    __assign(__assign({}, opts), {
                        pos: a.pos,
                        width: a.width * this.area.scale.x,
                        height: a.height * this.area.scale.y,
                    }),
                );
            }
            else if (a instanceof math_1.Polygon) {
                (0, drawPolygon_1.drawPolygon)(
                    __assign(__assign({}, opts), {
                        pts: a.pts,
                        scale: this.area.scale,
                    }),
                );
            }
            else if (a instanceof math_1.Circle) {
                (0, drawCircle_1.drawCircle)(
                    __assign(__assign({}, opts), {
                        pos: a.center,
                        radius: a.radius,
                    }),
                );
            }
            (0, stack_1.popTransform)();
        },
        area: {
            shape: (_b = opt.shape) !== null && _b !== void 0 ? _b : null,
            scale: opt.scale
                ? (0, math_1.vec2)(opt.scale)
                : (0, math_1.vec2)(1),
            offset: (_c = opt.offset) !== null && _c !== void 0
                ? _c
                : (0, math_1.vec2)(0),
            cursor: (_d = opt.cursor) !== null && _d !== void 0 ? _d : null,
        },
        isClicked: function() {
            if (shared_1._k.game.fakeMouse) {
                return shared_1._k.game.fakeMouse.isPressed
                    && this.isHovering();
            }
            return shared_1._k.app.isMousePressed() && this.isHovering();
        },
        isHovering: function() {
            if (shared_1._k.game.fakeMouse) {
                var mpos_1 = (0, utils_1.isFixed)(this)
                    ? shared_1._k.game.fakeMouse.pos
                    : (0, camera_1.toWorld)(shared_1._k.game.fakeMouse.pos);
                return this.hasPoint(mpos_1);
            }
            var mpos = (0, utils_1.isFixed)(this)
                ? shared_1._k.app.mousePos()
                : (0, camera_1.toWorld)(shared_1._k.app.mousePos());
            return this.hasPoint(mpos);
        },
        checkCollision: function(other) {
            var _a;
            if (!other.id) {
                throw new Error(
                    "checkCollision() requires the object to have an id",
                );
            }
            return (_a = colliding[other.id]) !== null && _a !== void 0
                ? _a
                : null;
        },
        getCollisions: function() {
            return Object.values(colliding);
        },
        // TODO: perform check instead of use cache
        isColliding: function(otherOrTag) {
            var _this = this;
            if (typeof otherOrTag === "string") {
                return this.getCollisions().some(function(c) {
                    return c.source === _this && c.target.is(otherOrTag)
                        || c.target === _this && c.source.is(otherOrTag);
                });
            }
            else {
                if (!otherOrTag.id) {
                    throw new Error(
                        "isColliding() requires the object to have an id",
                    );
                }
                return Boolean(colliding[otherOrTag.id]);
            }
        },
        isOverlapping: function(other) {
            if (!other.id) {
                throw new Error(
                    "isOverlapping() requires the object to have an id",
                );
            }
            var col = colliding[other.id];
            return col && col.hasOverlap();
        },
        onClick: function(action, btn) {
            var _this = this;
            if (btn === void 0) btn = "left";
            if (shared_1._k.game.fakeMouse) {
                shared_1._k.game.fakeMouse.onPress(function() {
                    if (_this.isHovering()) {
                        action();
                    }
                });
            }
            var e = this.onMousePress(btn, function() {
                if (_this.isHovering()) {
                    action();
                }
            });
            events.push(e);
            return e;
        },
        onHover: function(action) {
            var _this = this;
            var hovering = false;
            return this.onUpdate(function() {
                if (!hovering) {
                    if (_this.isHovering()) {
                        hovering = true;
                        action();
                    }
                }
                else {
                    hovering = _this.isHovering();
                }
            });
        },
        onHoverUpdate: function(onHover) {
            var _this = this;
            return this.onUpdate(function() {
                if (_this.isHovering()) {
                    onHover();
                }
            });
        },
        onHoverEnd: function(action) {
            var _this = this;
            var hovering = false;
            return this.onUpdate(function() {
                if (hovering) {
                    if (!_this.isHovering()) {
                        hovering = false;
                        action();
                    }
                }
                else {
                    hovering = _this.isHovering();
                }
            });
        },
        onCollide: function(tag, cb) {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collide", tag);
            }
            else if (typeof tag === "string") {
                return this.onCollide(function(obj, col) {
                    if (obj.is(tag)) {
                        cb === null || cb === void 0 ? void 0 : cb(obj, col);
                    }
                });
            }
            else {
                throw new Error(
                    "onCollide() requires either a function or a tag",
                );
            }
        },
        onCollideUpdate: function(tag, cb) {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collideUpdate", tag);
            }
            else if (typeof tag === "string") {
                return this.on("collideUpdate", function(obj, col) {
                    return obj.is(tag)
                        && (cb === null || cb === void 0
                            ? void 0
                            : cb(obj, col));
                });
            }
            else {
                throw new Error(
                    "onCollideUpdate() requires either a function or a tag",
                );
            }
        },
        onCollideEnd: function(tag, cb) {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collideEnd", tag);
            }
            else if (typeof tag === "string") {
                return this.on("collideEnd", function(obj) {
                    return obj.is(tag)
                        && (cb === null || cb === void 0 ? void 0 : cb(obj));
                });
            }
            else {
                throw new Error(
                    "onCollideEnd() requires either a function or a tag",
                );
            }
        },
        hasPoint: function(pt) {
            var localArea = this.localArea();
            pt = this.transform.inverse.transform(pt);
            Vec2_1.Vec2.sub(pt, this.area.offset, pt);
            Vec2_1.Vec2.scalec(
                pt,
                1 / this.area.scale.x,
                1 / this.area.scale.y,
                pt,
            );
            if (localArea instanceof math_1.Rect && this.anchor !== "topleft") {
                var offset = (0, anchor_1.anchorPt)(
                    this.anchor || general_1.DEF_ANCHOR,
                )
                    .add(1, 1)
                    .scale(-0.5 * localArea.width, -0.5 * localArea.height);
                Vec2_1.Vec2.sub(pt, offset, pt);
            }
            return this.localArea().contains(pt);
        },
        // push an obj out of another if they're overlapped
        resolveCollision: function(obj) {
            var col = this.checkCollision(obj);
            if (col && !col.resolved) {
                this.pos = this.pos.add(col.displacement);
                col.resolved = true;
            }
        },
        localArea: function() {
            return this.area.shape ? this.area.shape : this.renderArea();
        },
        // TODO: cache
        worldArea: function() {
            var localArea = this.localArea();
            // World transform
            var transform = this.transform.clone();
            // Optional area offset
            if (this.area.offset.x !== 0 || this.area.offset.y !== 0) {
                transform.translateSelfV(this.area.offset);
            }
            // Optional area scale
            if (this.area.scale.x !== 1 || this.area.scale.y !== 1) {
                transform.scaleSelfV(this.area.scale);
            }
            // Optional anchor offset (Rect only??)
            if (localArea instanceof math_1.Rect && this.anchor !== "topleft") {
                var offset = (0, anchor_1.anchorPt)(
                    this.anchor || general_1.DEF_ANCHOR,
                )
                    .add(1, 1)
                    .scale(-0.5 * localArea.width, -0.5 * localArea.height);
                transform.translateSelfV(offset);
            }
            return oldShape = localArea.transform(transform, oldShape);
        },
        screenArea: function() {
            var area = this.worldArea();
            if ((0, utils_1.isFixed)(this)) {
                return area;
            }
            else {
                return oldShape = area.transform(
                    shared_1._k.game.cam.transform,
                    oldShape,
                );
            }
        },
        inspect: function() {
            var _a, _b, _c, _d, _e, _f, _g;
            if (
                ((_a = this.area.scale) === null || _a === void 0
                    ? void 0
                    : _a.x) == ((_b = this.area.scale) === null || _b === void 0
                        ? void 0
                        : _b.y)
            ) {
                return "area: ".concat(
                    (_d = (_c = this.area.scale) === null || _c === void 0
                                ? void 0
                                : _c.x) === null || _d === void 0
                        ? void 0
                        : _d.toFixed(1),
                    "x",
                );
            }
            else {
                return "area: (".concat(
                    (_f = (_e = this.area.scale) === null || _e === void 0
                                ? void 0
                                : _e.x) === null || _f === void 0
                        ? void 0
                        : _f.toFixed(1),
                    "x, ",
                ).concat(
                    (_g = this.area.scale.y) === null || _g === void 0
                        ? void 0
                        : _g.toFixed(1),
                    "y)",
                );
            }
        },
    };
}
