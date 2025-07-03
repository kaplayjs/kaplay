"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surfaceEffector = surfaceEffector;
exports.areaEffector = areaEffector;
exports.pointEffector = pointEffector;
exports.constantForce = constantForce;
exports.platformEffector = platformEffector;
exports.buoyancyEffector = buoyancyEffector;
var math_1 = require("../../../math/math");
var Vec2_1 = require("../../../math/Vec2");
function surfaceEffector(opts) {
    var _a, _b;
    return {
        id: "surfaceEffector",
        require: ["area"],
        speed: opts.speed,
        speedVariation: (_a = opts.speedVariation) !== null && _a !== void 0
            ? _a
            : 0,
        forceScale: (_b = opts.speedVariation) !== null && _b !== void 0
            ? _b
            : 0.9,
        add: function() {
            var _this = this;
            this.onCollideUpdate(function(obj, col) {
                if (!obj.has("body")) {
                    return;
                }
                var dir = col === null || col === void 0
                    ? void 0
                    : col.normal.normal();
                var currentVel = obj.vel.project(dir);
                var wantedVel = dir === null || dir === void 0
                    ? void 0
                    : dir.scale(_this.speed);
                var force = wantedVel === null || wantedVel === void 0
                    ? void 0
                    : wantedVel.sub(currentVel);
                obj.addForce(
                    force === null || force === void 0
                        ? void 0
                        : force.scale(obj.mass * _this.forceScale),
                );
            });
        },
    };
}
function areaEffector(opts) {
    var _a, _b;
    return {
        id: "areaEffector",
        require: ["area"],
        force: opts.force,
        linearDrag: (_a = opts.linearDrag) !== null && _a !== void 0 ? _a : 0,
        useGlobalAngle: (_b = opts.useGlobalAngle) !== null && _b !== void 0
            ? _b
            : true,
        add: function() {
            var _this = this;
            this.onCollideUpdate(function(obj) {
                if (!obj.has("body")) {
                    return;
                }
                obj.addForce(
                    _this.useGlobalAngle
                        ? _this.force
                        : _this.force.rotate(_this.transform.getRotation()),
                );
                if (_this.linearDrag) {
                    obj.addForce(obj.vel.scale(-_this.linearDrag));
                }
            });
        },
    };
}
function pointEffector(opts) {
    var _a, _b;
    return {
        id: "pointEffector",
        require: ["area", "pos"],
        forceMagnitude: opts.forceMagnitude,
        distanceScale: (_a = opts.distanceScale) !== null && _a !== void 0
            ? _a
            : 1,
        forceMode: opts.forceMode || "inverseLinear",
        linearDrag: (_b = opts.linearDrag) !== null && _b !== void 0 ? _b : 0,
        // angularDrag: opts.angularDrag ?? 0,
        add: function() {
            var _this = this;
            this.onCollideUpdate(function(obj, col) {
                if (!obj.has("body")) {
                    return;
                }
                var dir = _this.pos.sub(obj.pos);
                var length = dir.len();
                var distance = length * _this.distanceScale / 10;
                var forceScale = _this.forceMode === "constant"
                    ? 1
                    : _this.forceMode === "inverseLinear"
                    ? 1 / distance
                    : 1 / Math.pow(distance, 2);
                var force = dir.scale(
                    _this.forceMagnitude * forceScale / length,
                );
                obj.addForce(force);
                if (_this.linearDrag) {
                    obj.addForce(obj.vel.scale(-_this.linearDrag));
                }
            });
        },
    };
}
function constantForce(opts) {
    var _a;
    return {
        id: "constantForce",
        require: ["body"],
        force: opts.force,
        useGlobalAngle: (_a = opts.useGlobalAngle) !== null && _a !== void 0
            ? _a
            : true,
        update: function() {
            if (this.force) {
                this.addForce(
                    this.useGlobalAngle
                        ? this.force
                        : this.force.rotate(this.transform.getRotation()),
                );
            }
        },
    };
}
function platformEffector(opt) {
    var _a, _b;
    if (opt === void 0) opt = {};
    (_a = opt.ignoreSides) !== null && _a !== void 0
        ? _a
        : (opt.ignoreSides = [Vec2_1.Vec2.UP]);
    (_b = opt.shouldCollide) !== null && _b !== void 0
        ? _b
        : (opt.shouldCollide = function(_, normal) {
            var _a;
            return ((_a = opt.ignoreSides) === null || _a === void 0
                ? void 0
                : _a.findIndex(function(s) {
                    return s.sdist(normal) < Number.EPSILON;
                }))
                == -1;
        });
    return {
        id: "platformEffector",
        require: ["area", "body"],
        platformIgnore: new Set(),
        add: function() {
            var _this = this;
            this.onBeforePhysicsResolve(function(collision) {
                if (_this.platformIgnore.has(collision.target)) {
                    collision.preventResolution();
                }
                else if (
                    !opt.shouldCollide.call(
                        _this,
                        collision.target,
                        collision.normal,
                    )
                ) {
                    collision.preventResolution();
                    _this.platformIgnore.add(collision.target);
                }
            });
            this.onCollideEnd(function(obj) {
                _this.platformIgnore.delete(obj);
            });
        },
    };
}
function buoyancyEffector(opts) {
    var _a, _b, _c, _d, _e, _f;
    return {
        id: "buoyancyEffector",
        require: ["area"],
        surfaceLevel: opts.surfaceLevel,
        density: (_a = opts.density) !== null && _a !== void 0 ? _a : 1,
        linearDrag: (_b = opts.linearDrag) !== null && _b !== void 0 ? _b : 1,
        angularDrag: (_c = opts.angularDrag) !== null && _c !== void 0
            ? _c
            : 0.2,
        flowAngle: (_d = opts.flowAngle) !== null && _d !== void 0 ? _d : 0,
        flowMagnitude: (_e = opts.flowMagnitude) !== null && _e !== void 0
            ? _e
            : 0,
        flowVariation: (_f = opts.flowVariation) !== null && _f !== void 0
            ? _f
            : 0,
        add: function() {
            var _this = this;
            this.onCollideUpdate(function(obj, col) {
                if (!obj.has("body")) {
                    return;
                }
                var o = obj;
                var shape = o.worldArea();
                var polygon = shape instanceof math_1.Polygon
                    ? shape
                    : new math_1.Polygon(shape.bbox().points());
                var _a = polygon.cut(
                        (0, math_1.vec2)(-100, _this.surfaceLevel),
                        (0, math_1.vec2)(100, _this.surfaceLevel),
                    ),
                    submergedArea = _a[0],
                    _ = _a[1];
                if (submergedArea) {
                    _this.applyBuoyancy(o, submergedArea);
                    _this.applyDrag(o, submergedArea);
                }
                if (_this.flowMagnitude) {
                    o.addForce(
                        Vec2_1.Vec2.fromAngle(_this.flowAngle).scale(
                            _this.flowMagnitude,
                        ),
                    );
                }
            });
        },
        applyBuoyancy: function(body, submergedArea) {
            var displacedMass = this.density * submergedArea.area();
            var buoyancyForce = (0, math_1.vec2)(0, 1).scale(-displacedMass);
            // console.log("buoyancyForce", buoyancyForce)
            // TODO: Should be applied to the center of submergedArea, but since there is no torque yet, this is OK
            body.addForce(buoyancyForce);
        },
        applyDrag: function(body, submergedArea) {
            var velocity = body.vel;
            var dragMagnitude = this.density * this.linearDrag;
            var dragForce = velocity.scale(-dragMagnitude);
            // console.log("dragForce", dragForce)
            // TODO: Should be applied to the center of submergedArea, but since there is no torque yet, this is OK
            body.addForce(dragForce);
            // const angularDrag = submergedArea.area() * -body.angularVelocity * this.angularDrag;
            // object.addTorque(angularDrag);
        },
    };
}
