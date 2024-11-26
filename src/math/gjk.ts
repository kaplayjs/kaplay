import type { Shape } from "../types";
import { Circle, Ellipse, Polygon, Rect, Vec2, vec2 } from "./math";
import { Vec3 } from "./vec3";

interface Collider {
    center: Vec2;
    /**
     * This function needs to return the furthest point of the collider in the given direction.
     * @param direction The direction to search in.
     */
    support(direction: Vec2): Vec2;
}

class CircleCollider implements Collider {
    center: Vec2;
    radius: number;

    constructor(center: Vec2, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    support(direction: Vec2): Vec2 {
        return this.center.add(direction.unit().scale(this.radius));
    }
}

class EllipseCollider implements Collider {
    center: Vec2;
    radiusX: number;
    radiusY: number;
    angle: number;

    constructor(center: Vec2, radiusX: number, radiusY: number, angle: number) {
        this.center = center;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.angle = angle;
    }

    support(direction: Vec2): Vec2 {
        // Axis aligned
        if (this.angle === 0.0) {
            const axis = direction.unit().scale(this.radiusX, this.radiusY)
                .unit().scale(this.radiusX, this.radiusY);
            return this.center.add(axis);
        }
        // Rotated
        else {
            direction = direction.rotate(-this.angle);
            let axis = direction.unit().scale(this.radiusX, this.radiusY).unit()
                .scale(this.radiusX, this.radiusY);
            axis = axis.rotate(this.angle);
            return this.center.add(axis);
        }
    }
}

class PolygonCollider implements Collider {
    vertices: Vec2[];
    center: Vec2;

    constructor(vertices: Vec2[]) {
        this.vertices = vertices;
        this.center = this.vertices[0];
    }

    support(direction: Vec2): Vec2 {
        let maxPoint;
        let maxDistance = Number.NEGATIVE_INFINITY;

        for (const vertex of this.vertices) {
            const distance = vertex.dot(direction);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxPoint = vertex;
            }
        }

        return maxPoint!;
    }
}

function calculateSupport(
    shapeA: Collider,
    shapeB: Collider,
    direction: Vec2,
): Vec2 {
    // Calculate the support vector. This is done by calculating the difference between
    // the furthest points found of the shapes along the given direction.
    var oppositeDirection: Vec2 = direction.scale(-1);
    return shapeA.support(direction).sub(shapeB.support(oppositeDirection));
}

function addSupport(
    vertices: Array<Vec2>,
    shapeA: Collider,
    shapeB: Collider,
    direction: Vec2,
): boolean {
    var support: Vec2 = calculateSupport(shapeA, shapeB, direction);
    vertices.push(support);
    // Returns true if both vectors are in the same direction
    return direction.dot(support) >= 0;
}

enum EvolveResult {
    NoIntersection,
    FoundIntersection,
    Evolving,
}

function tripleProduct(a: Vec2, b: Vec2, c: Vec2): Vec2 {
    const A: Vec3 = new Vec3(a.x, a.y, 0);
    const B: Vec3 = new Vec3(b.x, b.y, 0);
    const C: Vec3 = new Vec3(c.x, c.y, 0);

    const first: Vec3 = A.cross(B);
    const second: Vec3 = first.cross(C);

    // This vector lies in the same plane as a and b and is perpendicular to c
    return vec2(second.x, second.y);
}

function evolveSimplex(
    simplex: Vec2[],
    colliderA: Collider,
    colliderB: Collider,
    direction: Vec2,
): EvolveResult {
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
            const ab: Vec2 = simplex[1].sub(simplex[0]);
            const a0: Vec2 = simplex[0].scale(-1);

            // Get the vector perpendicular to ab and a0
            // Then get the vector perpendicular to the result and ab
            const tp = tripleProduct(ab, a0, ab);
            // This is our new direction to form a triangle
            direction.x = tp.x;
            direction.y = tp.y;
            break;
        }
        case 3:
            {
                // We have a triangle, and need to check if it contains the origin
                const c0: Vec2 = simplex[2].scale(-1);
                const bc: Vec2 = simplex[1].sub(simplex[2]);
                const ca: Vec2 = simplex[0].sub(simplex[2]);

                var bcNorm: Vec2 = tripleProduct(ca, bc, bc);
                var caNorm: Vec2 = tripleProduct(bc, ca, ca);

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
                `Can\'t have s simplex with ${simplex.length} vertices!`,
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
 * @param colliderA The first collider to test
 * @param colliderB The second collider to test
 * @returns True if the colliders intersect
 */
function gjkIntersects(colliderA: Collider, colliderB: Collider): boolean {
    const vertices: Vec2[] = [];
    let direction: Vec2 = vec2();

    var result: EvolveResult = EvolveResult.Evolving;
    while (result === EvolveResult.Evolving) {
        result = evolveSimplex(vertices, colliderA, colliderB, direction);
    }
    return result === EvolveResult.FoundIntersection;
}

enum PolygonWinding {
    Clockwise,
    CounterClockwise,
}

type Edge = {
    distance: number;
    normal: Vec2;
    index: number;
};

/**
 * Returns the edge closest to the origin.
 * @param simplex The simplex whose edges we will check to find the closest edge to the origin
 * @param winding The winding order of the simplex
 * @returns The edge closest to the origin.
 */
function findClosestEdge(simplex: Vec2[], winding: PolygonWinding): Edge {
    var minDistance: number = Number.POSITIVE_INFINITY;
    var minNormal: Vec2 = new Vec2();
    var minIndex: number = 0;
    var line: Vec2 = new Vec2();
    for (let i = 0; i < simplex.length; i++) {
        let j: number = i + 1;
        if (j >= simplex.length) j = 0;

        line = simplex[j].sub(simplex[i]);

        // The normal of the edge depends on the polygon winding of the simplex
        let norm: Vec2;
        switch (winding) {
            case PolygonWinding.Clockwise:
                norm = new Vec2(line.y, -line.x);
            case PolygonWinding.CounterClockwise:
                norm = new Vec2(-line.y, line.x);
        }
        norm = norm.unit();

        // Only keep the edge closest to the origin
        var dist: number = norm.dot(simplex[i]);
        if (dist < minDistance) {
            minDistance = dist;
            minNormal = norm;
            minIndex = j;
        }
    }

    return { distance: minDistance, normal: minNormal, index: minIndex };
}

export type GjkCollisionResult = {
    /**
     * The direction the first shape needs to be moved to resolve the collision
     */
    normal: Vec2;
    /**
     * The distance the first shape needs to be moved to resolve the collision
     */
    distance: number;
};

const MAX_TRIES = 20;

/**
 * Returns true if the shapes collide
 * @param colliderA The first collider to test
 * @param colliderB The second collider to test
 * @returns True if the shapes collide
 */
function getIntersection(
    colliderA: Collider,
    colliderB: Collider,
    simplex: Vec2[],
): GjkCollisionResult | null {
    const EPSILON = 0.00001;

    const e0: number = (simplex[1].x - simplex[0].x)
        * (simplex[1].y + simplex[0].y);
    const e1: number = (simplex[2].x - simplex[1].x)
        * (simplex[2].y + simplex[1].y);
    const e2: number = (simplex[0].x - simplex[2].x)
        * (simplex[0].y + simplex[2].y);
    var winding: PolygonWinding = (e0 + e1 + e2 >= 0)
        ? PolygonWinding.Clockwise
        : PolygonWinding.CounterClockwise;

    let intersection: Vec2 = new Vec2();
    for (let i = 0; i < MAX_TRIES; i++) {
        var edge: Edge = findClosestEdge(simplex, winding);
        // Calculate the difference for the two vertices furthest along the direction of the edge normal
        var support: Vec2 = calculateSupport(colliderA, colliderB, edge.normal);
        // Check distance to the origin
        var distance: number = support.dot(edge.normal);

        intersection = edge.normal.scale(distance);

        // If close enough, return if we need to move a distance greater than 0
        if (Math.abs(distance - edge.distance) <= EPSILON) {
            const len = intersection.len();
            if (len != 0) {
                return { normal: intersection.scale(-1 / len), distance: len };
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
    const len = intersection.len();
    if (len != 0) {
        return { normal: intersection.scale(-1 / len), distance: len };
    }
    else {
        return null;
    }
}

/**
 * Returns a collision result if there was a collision
 * @param colliderA The first collider to test
 * @param colliderB The second collider to test
 * @returns A collision result or null
 */
function gjkIntersection(
    colliderA: Collider,
    colliderB: Collider,
): GjkCollisionResult | null {
    const vertices: Vec2[] = [];
    let direction: Vec2 = colliderB.center.sub(colliderA.center);

    var result: EvolveResult = EvolveResult.Evolving;
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
 * @param shape The shape to get a collider for.
 * @returns
 */
function shapeToCollider(shape: Shape): Collider {
    if (shape instanceof Rect) {
        return new PolygonCollider((shape as Rect).points());
    }
    else if (shape instanceof Circle) {
        return new CircleCollider(
            (shape as Circle).center,
            (shape as Circle).radius,
        );
    }
    else if (shape instanceof Polygon) {
        return new PolygonCollider((shape as Polygon).pts);
    }
    else if (shape instanceof Ellipse) {
        return new EllipseCollider(
            (shape as Ellipse).center,
            (shape as Ellipse).radiusX,
            (shape as Ellipse).radiusY,
            (shape as Ellipse).angle,
        );
    }
    else {
        return new PolygonCollider(shape.bbox().points());
    }
}

/**
 * Returns true if the shapes collide
 * @param shapeA The first shape to test
 * @param shapeB The second shape to test
 * @returns True if the shapes collide
 */
export function gjkShapeIntersects(shapeA: Shape, shapeB: Shape): boolean {
    const colliderA = shapeToCollider(shapeA);
    const colliderB = shapeToCollider(shapeB);
    return gjkIntersects(colliderA, colliderB);
}

/**
 * Returns a collision result if there was a collision
 * @param shapeA The first shape to test
 * @param shapeB The second shape to test
 * @returns A collision result or null
 */
export function gjkShapeIntersection(
    shapeA: Shape,
    shapeB: Shape,
): GjkCollisionResult | null {
    const colliderA = shapeToCollider(shapeA);
    const colliderB = shapeToCollider(shapeB);
    return gjkIntersection(colliderA, colliderB);
}
