import { vec2 } from "../../math/math";
import type { Vec2 } from "../../math/Vec2";
import { _k } from "../../shared";
import type { GameObj } from "../../types";

/**
 * Collision resolution data.
 *
 * @group Physics
 */

export class Collision {
    /**
     * The first game object in the collision.
     */
    source: GameObj;
    /**
     * The second game object in the collision.
     */
    target: GameObj;
    /**
     * The contact normal.
     */
    normal: Vec2;
    /**
     * The length of the displacement.
     */
    distance: number;
    /**
     * If the collision is resolved.
     */
    resolved: boolean = false;
    constructor(
        source: GameObj,
        target: GameObj,
        normal: Vec2,
        distance: number,
        resolved = false,
    ) {
        this.source = source;
        this.target = target;
        this.normal = normal;
        this.distance = distance;
        this.resolved = resolved;
    }
    /**
     * The displacement source game object have to make to avoid the collision.
     */
    get displacement() {
        return this.normal.scale(this.distance);
    }
    /**
     * Get a new collision with reversed source and target relationship.
     */
    reverse() {
        return new Collision(
            this.target,
            this.source,
            this.normal.scale(-1),
            this.distance,
            this.resolved,
        );
    }
    /**
     * If the 2 objects have any overlap, or they're just touching edges.
     *
     * @since v3000.0
     */
    hasOverlap() {
        return this.distance > 0;
    }
    /**
     * If the collision happened (roughly) on the left side.
     */
    isLeft() {
        return this.normal.cross(_k.game.gravity || vec2(0, 1)) > 0;
    }
    /**
     * If the collision happened (roughly) on the right side.
     */
    isRight() {
        return this.normal.cross(_k.game.gravity || vec2(0, 1)) < 0;
    }
    /**
     * If the collision happened (roughly) on the top side.
     */
    isTop() {
        return this.normal.dot(_k.game.gravity || vec2(0, 1)) > 0;
    }
    /**
     * If the collision happened (roughly) on the bottom side.
     */
    isBottom() {
        return this.normal.dot(_k.game.gravity || vec2(0, 1)) < 0;
    }
    /**
     * Prevent collision resolution if not yet resolved.
     *
     * @since v3000.0
     */
    preventResolution() {
        this.resolved = true;
    }
}
