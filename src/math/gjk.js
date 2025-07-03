"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gjkShapeIntersects = gjkShapeIntersects;
exports.gjkShapeIntersection = gjkShapeIntersection;
var general_1 = require("../constants/general");
var math_1 = require("./math");
var Vec2_1 = require("./Vec2");
var CircleCollider = /** @class */ function() {
    function CircleCollider(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    CircleCollider.prototype.support = function(direction) {
        var s = new Vec2_1.Vec2(direction.x, direction.y);
        Vec2_1.Vec2.unit(s, s);
        Vec2_1.Vec2.scale(s, this.radius, s);
        Vec2_1.Vec2.add(s, this.center, s);
        return s;
    };
    return CircleCollider;
}();
var EllipseCollider = /** @class */ function() {
    function EllipseCollider(center, radiusX, radiusY, angle) {
        this.center = center;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.angle = angle;
    }
    EllipseCollider.prototype.support = function(direction) {
        // Axis aligned
        if (this.angle === 0.0) {
            var axis = new Vec2_1.Vec2(direction.x, direction.y);
            Vec2_1.Vec2.unit(axis, axis);
            Vec2_1.Vec2.scalec(axis, this.radiusX, this.radiusY, axis);
            Vec2_1.Vec2.add(axis, this.center, axis);
            return axis;
        }
        // Rotated
        else {
            var axis = new Vec2_1.Vec2(direction.x, direction.y);
            Vec2_1.Vec2.rotateByAngle(axis, -this.angle, axis);
            Vec2_1.Vec2.unit(axis, axis);
            Vec2_1.Vec2.scalec(axis, this.radiusX, this.radiusY, axis);
            Vec2_1.Vec2.rotateByAngle(axis, this.angle, axis);
            Vec2_1.Vec2.add(axis, this.center, axis);
            return axis;
        }
    };
    return EllipseCollider;
}();
var PolygonCollider = /** @class */ function() {
    function PolygonCollider(vertices) {
        this.vertices = vertices;
        this.center = this.vertices[0];
    }
    PolygonCollider.prototype.support = function(direction) {
        var maxPoint;
        var maxDistance = Number.NEGATIVE_INFINITY;
        var vertex;
        for (var i = 0; i < this.vertices.length; i++) {
            vertex = this.vertices[i];
            var distance = vertex.dot(direction);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxPoint = vertex;
            }
        }
        return maxPoint;
    };
    return PolygonCollider;
}();
function calculateSupport(shapeA, shapeB, direction) {
    // Calculate the support vector. This is done by calculating the difference between
    // the furthest points found of the shapes along the given direction.
    var oppositeDirection = new Vec2_1.Vec2(-direction.x, -direction.y);
    var supportA = shapeA.support(direction);
    var supportB = shapeB.support(oppositeDirection);
    return new Vec2_1.Vec2(supportA.x - supportB.x, supportA.y - supportB.y);
}
function addSupport(vertices, shapeA, shapeB, direction) {
    var support = calculateSupport(shapeA, shapeB, direction);
    vertices.push(support);
    // Returns true if both vectors are in the same direction
    return direction.dot(support) >= 0;
}
var EvolveResult;
(function(EvolveResult) {
    EvolveResult[EvolveResult["NoIntersection"] = 0] = "NoIntersection";
    EvolveResult[EvolveResult["FoundIntersection"] = 1] = "FoundIntersection";
    EvolveResult[EvolveResult["Evolving"] = 2] = "Evolving";
})(EvolveResult || (EvolveResult = {}));
function tripleProduct(a, b, c) {
    // AxB = (0, 0, axb)
    // AxBxC = (-axb * c.y, axb * c.x, 0)
    var n = a.x * b.y - a.y * b.x;
    // This vector lies in the same plane as a and b and is perpendicular to c
    return new Vec2_1.Vec2(-n * c.y, n * c.x);
}
function evolveSimplex(simplex, colliderA, colliderB, direction) {
    switch (simplex.length) {
        case 0: {
            // Zero points, set the direction the center of colliderA
            // towards the center of of colliderB
            direction.x = colliderB.center.x - colliderA.center.x;
            direction.y = colliderB.center.y - colliderA.center.y;
            break;
        }
        case 1: {
            // Reverse the direction, to make a line
            direction.x = direction.x *= -1;
            direction.y = direction.y *= -1;
            break;
        }
        case 2: {
            // We now have a line ab. Take the vector ab and the vector a origin
            var ab = new Vec2_1.Vec2(
                simplex[1].x - simplex[0].x,
                simplex[1].y - simplex[0].y,
            );
            var a0 = new Vec2_1.Vec2(-simplex[0].x, -simplex[0].y);
            // Get the vector perpendicular to ab and a0
            // Then get the vector perpendicular to the result and ab
            var tp = tripleProduct(ab, a0, ab);
            // This is our new direction to form a triangle
            direction.x = tp.x;
            direction.y = tp.y;
            break;
        }
        case 3:
            {
                // We have a triangle, and need to check if it contains the origin
                var c0 = new Vec2_1.Vec2(-simplex[2].x, -simplex[2].y);
                var bc = new Vec2_1.Vec2(
                    simplex[1].x - simplex[2].x,
                    simplex[1].y - simplex[2].y,
                );
                var ca = new Vec2_1.Vec2(
                    simplex[0].x - simplex[2].x,
                    simplex[0].y - simplex[2].y,
                );
                var bcNorm = tripleProduct(ca, bc, bc);
                var caNorm = tripleProduct(bc, ca, ca);
                if (bcNorm.dot(c0) > 0) {
                    // The origin does not lie within the triangle
                    // Remove the first point and look in the direction of bcNorm
                    simplex.splice(0, 1);
                    direction.x = bcNorm.x;
                    direction.y = bcNorm.y;
                }
                else if (caNorm.dot(c0) > 0) {
                    // The origin does not lie within the triangle
                    // Remove the second point and look in the direction of caNorm
                    simplex.splice(1, 1);
                    direction.x = caNorm.x;
                    direction.y = caNorm.y;
                }
                else {
                    // The origin lies within the triangle
                    return EvolveResult.FoundIntersection;
                }
            }
            break;
        default:
            throw Error(
                "Can't have s simplex with ".concat(
                    simplex.length,
                    " vertices!",
                ),
            );
    }
    // Try to add a new support point to the simplex
    // If successful, continue evolving
    return addSupport(simplex, colliderA, colliderB, direction)
        ? EvolveResult.Evolving
        : EvolveResult.NoIntersection;
}
/**
 * Returns true if the colliders intersect.
 * @param colliderA - The first collider to test
 * @param colliderB - The second collider to test
 *
 * @returns True if the colliders intersect
 */
function gjkIntersects(colliderA, colliderB) {
    var vertices = [];
    var direction = new Vec2_1.Vec2();
    var result = EvolveResult.Evolving;
    while (result === EvolveResult.Evolving) {
        result = evolveSimplex(vertices, colliderA, colliderB, direction);
    }
    return result === EvolveResult.FoundIntersection;
}
var PolygonWinding;
(function(PolygonWinding) {
    PolygonWinding[PolygonWinding["Clockwise"] = 0] = "Clockwise";
    PolygonWinding[PolygonWinding["CounterClockwise"] = 1] = "CounterClockwise";
})(PolygonWinding || (PolygonWinding = {}));
/**
 * Returns the edge closest to the origin.
 * @param simplex - The simplex whose edges we will check to find the closest edge to the origin
 * @param winding - The winding order of the simplex
 *
 * @returns The edge closest to the origin.
 */
function findClosestEdge(simplex, winding) {
    var minDistance = Number.POSITIVE_INFINITY;
    var minNormal = new Vec2_1.Vec2();
    var minIndex = 0;
    var line = new Vec2_1.Vec2();
    var norm = new Vec2_1.Vec2();
    for (var i = 0; i < simplex.length; i++) {
        var j = i + 1;
        if (j >= simplex.length) {
            j = 0;
        }
        Vec2_1.Vec2.sub(simplex[j], simplex[i], line);
        // The normal of the edge depends on the polygon winding of the simplex
        switch (winding) {
            case PolygonWinding.Clockwise:
                norm.x = line.y;
                norm.y = -line.x;
                break;
            case PolygonWinding.CounterClockwise:
                norm.x = -line.y;
                norm.y = line.x;
                break;
        }
        Vec2_1.Vec2.unit(norm, norm);
        // Only keep the edge closest to the origin
        var dist = norm.dot(simplex[i]);
        if (dist < minDistance) {
            minDistance = dist;
            Vec2_1.Vec2.copy(norm, minNormal);
            minIndex = j;
        }
    }
    return { distance: minDistance, normal: minNormal, index: minIndex };
}
/**
 * Returns true if the shapes collide
 * @param colliderA - The first collider to test
 * @param colliderB - The second collider to test
 *
 * @returns True if the shapes collide
 */
function getIntersection(colliderA, colliderB, simplex) {
    var EPSILON = 0.00001;
    var e0 = (simplex[1].x - simplex[0].x)
        * (simplex[1].y + simplex[0].y);
    var e1 = (simplex[2].x - simplex[1].x)
        * (simplex[2].y + simplex[1].y);
    var e2 = (simplex[0].x - simplex[2].x)
        * (simplex[0].y + simplex[2].y);
    var winding = (e0 + e1 + e2 >= 0)
        ? PolygonWinding.Clockwise
        : PolygonWinding.CounterClockwise;
    var intersection = new Vec2_1.Vec2();
    for (var i = 0; i < general_1.MAX_TRIES; i++) {
        var edge = findClosestEdge(simplex, winding);
        // Calculate the difference for the two vertices furthest along the direction of the edge normal
        var support = calculateSupport(colliderA, colliderB, edge.normal);
        // Check distance to the origin
        var distance = support.dot(edge.normal);
        Vec2_1.Vec2.scale(edge.normal, distance, intersection);
        // If close enough, return if we need to move a distance greater than 0
        if (Math.abs(distance - edge.distance) <= EPSILON) {
            var len_1 = intersection.len();
            if (len_1 != 0) {
                Vec2_1.Vec2.scale(intersection, -1 / len_1, intersection);
                return { normal: intersection, distance: len_1 };
            }
            else {
                return null;
            }
        }
        else {
            simplex.splice(edge.index, 0, support);
        }
    }
    // Return if we need to move a distance greater than 0
    // Since we did more than the maximum amount of iterations, this may not be optimal
    var len = intersection.len();
    if (len != 0) {
        Vec2_1.Vec2.scale(intersection, -1 / len, intersection);
        return { normal: intersection, distance: len };
    }
    else {
        return null;
    }
}
/**
 * Returns a collision result if there was a collision
 * @param colliderA - The first collider to test
 * @param colliderB - The second collider to test
 *
 * @returns A collision result or null
 */
function gjkIntersection(colliderA, colliderB) {
    var vertices = [];
    var direction = new Vec2_1.Vec2(
        colliderB.center.x - colliderA.center.x,
        colliderB.center.y - colliderA.center.y,
    );
    var result = EvolveResult.Evolving;
    while (result === EvolveResult.Evolving) {
        result = evolveSimplex(vertices, colliderA, colliderB, direction);
    }
    if (result !== EvolveResult.FoundIntersection) {
        return null;
    }
    return getIntersection(colliderA, colliderB, vertices);
}
/**
 * Returns a collider for the given shape.
 * @param shape - The shape to get a collider for.
 *
 * @returns
 */
function shapeToCollider(shape) {
    if (shape instanceof math_1.Rect) {
        return new PolygonCollider(shape.points());
    }
    else if (shape instanceof math_1.Circle) {
        return new CircleCollider(shape.center, shape.radius);
    }
    else if (shape instanceof math_1.Polygon) {
        return new PolygonCollider(shape.pts);
    }
    else if (shape instanceof math_1.Ellipse) {
        return new EllipseCollider(
            shape.center,
            shape.radiusX,
            shape.radiusY,
            shape.angle,
        );
    }
    else {
        return new PolygonCollider(shape.bbox().points());
    }
}
/**
 * Returns true if the shapes collide
 * @param shapeA - The first shape to test
 * @param shapeB - The second shape to test
 *
 * @returns True if the shapes collide
 */
function gjkShapeIntersects(shapeA, shapeB) {
    var colliderA = shapeToCollider(shapeA);
    var colliderB = shapeToCollider(shapeB);
    return gjkIntersects(colliderA, colliderB);
}
/**
 * Returns a collision result if there was a collision
 * @param shapeA - The first shape to test
 * @param shapeB - The second shape to test
 *
 * @returns A collision result or null
 */
function gjkShapeIntersection(shapeA, shapeB) {
    var colliderA = shapeToCollider(shapeA);
    var colliderB = shapeToCollider(shapeB);
    return gjkIntersection(colliderA, colliderB);
}
