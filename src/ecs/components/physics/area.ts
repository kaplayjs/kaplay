import { DEF_ANCHOR } from "../../../constants/general";
import type { KEventController } from "../../../events/events";
import { toWorld } from "../../../game/camera";
import { anchorPt } from "../../../gfx/anchor";
import { drawCircle } from "../../../gfx/draw/drawCircle";
import { drawPolygon } from "../../../gfx/draw/drawPolygon";
import { drawRect } from "../../../gfx/draw/drawRect";
import { multTranslate, popTransform, pushTransform } from "../../../gfx/stack";
import { rgb } from "../../../math/color";
import { Circle, Polygon, Rect, shapeFactory, vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type {
    Comp,
    Cursor,
    GameObj,
    MouseButton,
    Shape,
    Tag,
} from "../../../types";
import { isFixed } from "../../entity/utils";
import type { Collision } from "../../systems/Collision";
import { ui } from "../misc/ui";
import type { AnchorComp } from "../transform/anchor";
import type { FixedComp } from "../transform/fixed";
import type { PosComp } from "../transform/pos";

export function usesArea() {
    return _k.game.areaCount > 0;
}

/**
 * The {@link area `area()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaComp extends Comp {
    /**
     * Collider area info.
     */
    area: {
        /**
         * If we use a custom shape over render shape.
         */
        shape: Shape | null;
        /**
         * Area scale.
         */
        scale: Vec2;
        /**
         * Area offset.
         */
        offset: Vec2;
        /**
         * Cursor on hover.
         */
        cursor?: Cursor;
    };
    /**
     * If this object should ignore collisions against certain other objects.
     *
     * @since v3000.0
     */
    collisionIgnore: Tag[];
    /**
     * Restitution ("bounciness") of the object.
     */
    restitution?: number;
    /**
     * Friction of the object.
     */
    friction?: number;
    /**
     * Check collision with another game obj.
     *
     * @since v3000.0
     */
    checkCollision(other: GameObj<AreaComp>): Collision | null;
    /**
     * Get all collisions currently happening.
     *
     * @since v3000.0
     */
    getCollisions(): Collision[];
    /**
     * If is currently colliding with another game obj.
     */
    isColliding(o: GameObj<AreaComp>): boolean;
    /**
     * If is currently overlapping with another game obj (like isColliding, but will return false if the objects are just touching edges).
     */
    isOverlapping(o: GameObj<AreaComp>): boolean;
    /**
     * Register an event runs once when collide with another game obj with certain tag.
     *
     * @since v2001.0
     */
    onCollide(
        tag: Tag,
        f: (obj: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event runs once when collide with another game obj.
     *
     * @since v2000.1
     */
    onCollide(f: (obj: GameObj, col?: Collision) => void): KEventController;
    /**
     * Register an event runs every frame when collide with another game obj with certain tag.
     *
     * @since v3000.0
     */
    onCollideUpdate(
        tag: Tag,
        f: (obj: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event runs every frame when collide with another game obj.
     *
     * @since v3000.0
     */
    onCollideUpdate(
        f: (obj: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event runs once when stopped colliding with another game obj with certain tag.
     *
     * @since v3000.0
     */
    onCollideEnd(tag: Tag, f: (obj: GameObj) => void): KEventController;
    /**
     * Register an event runs once when stopped colliding with another game obj.
     *
     * @since v3000.0
     */
    onCollideEnd(f: (obj: GameObj) => void): void;
    /**
     * Push out from another solid game obj if currently overlapping.
     */
    resolveCollision(obj: GameObj): void;
    /**
     * Get the geometry data for the collider in local coordinate space.
     *
     * @since v3000.0
     */
    localArea(): Shape;
    /**
     * Get the geometry data for the collider in world coordinate space.
     */
    worldArea(): Shape;
    /**
     * Get the geometry data for the collider in screen coordinate space.
     */
    screenArea(): Shape;
    /**
     * Returns true if the given point in screen coordinates is inside the area.
     */
    hasScreenPoint(p: Vec2): boolean;
    /**
     * Returns true if the given point in world coordinates is inside the area.
     */
    hasWorldPoint(p: Vec2): boolean;

    serialize(): any;
}

/**
 * Options for the {@link area `area()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaCompOpt {
    /**
     * The shape of the area (currently only Rect and Polygon is supported).
     *
     * @example
     * ```js
     * add([
     *     sprite("butterfly"),
     *     pos(100, 200),
     *     // a triangle shape!
     *     area({ shape: new Polygon([vec2(0), vec2(100), vec2(-100, 100)]) }),
     * ])
     * ```
     */
    shape?: Shape;
    /**
     * Area scale.
     */
    scale?: number | Vec2;
    /**
     * Area offset.
     */
    offset?: Vec2;
    /**
     * Cursor on hover.
     */
    cursor?: Cursor;
    /**
     * If this object should ignore collisions against certain other objects.
     *
     * @since v3000.0
     */
    collisionIgnore?: Tag[];
    /**
     * Bounciness factor between 0 and 1.
     *
     * @since v4000.0
     */
    restitution?: number;
    /**
     * Friction factor between 0 and 1.
     *
     * @since v4000.0
     */
    friction?: number;
}

export function area(opt: AreaCompOpt = {}): AreaComp {
    const colliding: Record<string, Collision> = {};
    const collidingThisFrame = new Set();
    const events: KEventController[] = [];
    let oldShape: Shape | undefined;

    return {
        id: "area",
        collisionIgnore: opt.collisionIgnore ?? [],
        restitution: opt.restitution,
        friction: opt.friction,

        add(this: GameObj<AreaComp>) {
            _k.game.areaCount++;

            events.push(
                this.onCollideUpdate((obj, col) => {
                    if (!obj.exists()) return;
                    if (!colliding[obj.id]) {
                        this.trigger("collide", obj, col);
                    }
                    if (!col) {
                        return;
                    }

                    colliding[obj.id] = col;
                    collidingThisFrame.add(obj.id);
                }),
            );

            if (_k.globalOpt.areaHasUI ?? true) {
                if (!this.has("ui")) {
                    this.use(ui({ canFocus: false }));
                }
            }
        },

        destroy() {
            _k.game.areaCount--;
            for (const event of events) {
                event.cancel();
            }
        },

        fixedUpdate(this: GameObj<AreaComp>) {
            for (const id in colliding) {
                if (!collidingThisFrame.has(Number(id))) {
                    this.trigger("collideEnd", colliding[id].target);
                    delete colliding[id];
                }
            }
            collidingThisFrame.clear();
        },

        drawInspect(this: GameObj<AreaComp | AnchorComp | FixedComp>) {
            const a = this.localArea();

            pushTransform();
            multTranslate(this.area.offset.x, this.area.offset.y);

            const opts = {
                outline: {
                    width: 4 / _k.gfx.viewport.scale,
                    color: rgb(0, 0, 255),
                },
                anchor: this.anchor,
                fill: false,
                fixed: isFixed(this),
            };

            if (a instanceof Rect) {
                drawRect({
                    ...opts,
                    pos: a.pos,
                    width: a.width * this.area.scale.x,
                    height: a.height * this.area.scale.y,
                });
            }
            else if (a instanceof Polygon) {
                drawPolygon({
                    ...opts,
                    pts: a.pts,
                    scale: this.area.scale,
                });
            }
            else if (a instanceof Circle) {
                drawCircle({
                    ...opts,
                    pos: a.center,
                    radius: a.radius,
                });
            }

            popTransform();
        },

        area: {
            shape: opt.shape ?? null,
            scale: opt.scale ? vec2(opt.scale) : vec2(1),
            offset: opt.offset ?? vec2(0),
            cursor: opt.cursor,
        },

        checkCollision(this: GameObj, other: GameObj<AreaComp>) {
            if (!other.id) {
                throw new Error(
                    "checkCollision() requires the object to have an id",
                );
            }
            return colliding[other.id] ?? null;
        },

        getCollisions() {
            return Object.values(colliding);
        },

        // TODO: perform check instead of use cache
        isColliding(
            this: GameObj<AreaComp>,
            otherOrTag: GameObj<AreaComp> | string,
        ) {
            if (typeof otherOrTag === "string") {
                return this.getCollisions().some(c =>
                    c.source === this && c.target.is(otherOrTag)
                    || c.target === this && c.source.is(otherOrTag)
                );
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

        isOverlapping(other) {
            if (!other.id) {
                throw new Error(
                    "isOverlapping() requires the object to have an id",
                );
            }
            const col = colliding[other.id];
            return col && col.hasOverlap();
        },

        onCollide(
            this: GameObj,
            tag: Tag | ((obj: GameObj, col?: Collision) => void),
            cb?: (obj: GameObj, col?: Collision) => void,
        ): KEventController {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collide", tag);
            }
            else if (typeof tag === "string") {
                return this.onCollide((obj: GameObj, col: Collision) => {
                    if (obj.is(tag)) {
                        cb?.(obj, col);
                    }
                });
            }
            else {
                throw new Error(
                    "onCollide() requires either a function or a tag",
                );
            }
        },

        onCollideUpdate(
            this: GameObj<AreaComp>,
            tag: Tag | ((obj: GameObj, col?: Collision) => void),
            cb?: (obj: GameObj, col?: Collision) => void,
        ): KEventController {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collideUpdate", tag);
            }
            else if (typeof tag === "string") {
                return this.on(
                    "collideUpdate",
                    (obj, col) => obj.is(tag) && cb?.(obj, col),
                );
            }
            else {
                throw new Error(
                    "onCollideUpdate() requires either a function or a tag",
                );
            }
        },

        onCollideEnd(
            this: GameObj<AreaComp>,
            tag: Tag | ((obj: GameObj) => void),
            cb?: (obj: GameObj) => void,
        ): KEventController {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collideEnd", tag);
            }
            else if (typeof tag === "string") {
                return this.on("collideEnd", (obj) => obj.is(tag) && cb?.(obj));
            }
            else {
                throw new Error(
                    "onCollideEnd() requires either a function or a tag",
                );
            }
        },

        // push an obj out of another if they're overlapped
        resolveCollision(
            this: GameObj<AreaComp | PosComp>,
            obj: GameObj<AreaComp>,
        ) {
            const col = this.checkCollision(obj);
            if (col && !col.resolved) {
                this.pos = this.pos.add(col.displacement);
                col.resolved = true;
            }
        },

        localArea(this: GameObj<AreaComp | { renderArea(): Shape }>): Shape {
            return this.area.shape ? this.area.shape : this.renderArea();
        },

        // TODO: cache
        worldArea(this: GameObj<AreaComp | AnchorComp>): Shape {
            const localArea = this.localArea();

            // World transform
            const transform = this.transform.clone();
            // Optional area offset
            if (this.area.offset.x !== 0 || this.area.offset.y !== 0) {
                transform.translateSelfV(this.area.offset);
            }
            // Optional area scale
            if (this.area.scale.x !== 1 || this.area.scale.y !== 1) {
                transform.scaleSelfV(this.area.scale);
            }
            // Optional anchor offset (Rect only??)
            if (localArea instanceof Rect && this.anchor !== "topleft") {
                const offset = anchorPt(this.anchor || DEF_ANCHOR)
                    .add(1, 1)
                    .scale(-0.5 * localArea.width, -0.5 * localArea.height);
                transform.translateSelfV(offset);
            }

            return oldShape = localArea.transform(transform, oldShape);
        },

        screenArea(this: GameObj<AreaComp | FixedComp>): Shape {
            const area = this.worldArea();
            if (isFixed(this)) {
                return area;
            }
            else {
                return oldShape = area.transform(
                    _k.game.cam.transform,
                    oldShape,
                );
            }
        },

        inspect() {
            if (this.area.scale?.x == this.area.scale?.y) {
                return `area: ${this.area.scale?.x?.toFixed(1)}x`;
            }
            else {
                return `area: (${
                    this.area.scale?.x?.toFixed(
                        1,
                    )
                }x, ${this.area.scale.y?.toFixed(1)}y)`;
            }
        },

        hasScreenPoint(this: GameObj<AreaComp>, pt: Vec2) {
            return this.hasWorldPoint(
                isFixed(this)
                    ? pt
                    : toWorld(pt),
            );
        },

        hasWorldPoint(
            this: GameObj<AreaComp | AnchorComp>,
            pt: Vec2,
        ): boolean {
            const localArea = this.localArea();
            pt = this.transform.inverse.transform(pt);
            Vec2.sub(pt, this.area.offset, pt);
            Vec2.scalec(pt, 1 / this.area.scale.x, 1 / this.area.scale.y, pt);
            if (localArea instanceof Rect && this.anchor !== "topleft") {
                const offset = anchorPt(this.anchor || DEF_ANCHOR)
                    .add(1, 1)
                    .scale(-0.5 * localArea.width, -0.5 * localArea.height);
                Vec2.sub(pt, offset, pt);
            }
            return this.localArea().contains(pt);
        },

        serialize() {
            const data: any = {};
            if (this.area.shape) data.shape = this.area.shape.serialize();
            if (this.area.scale) {
                data.scale = this.area.scale instanceof Vec2
                    ? this.area.scale.serialize()
                    : opt.scale;
            }
            if (this.area.offset) data.offset = this.area.offset.serialize();
            if (opt.cursor) data.cursor = opt.cursor;
            // Make a copy, since it might be changed later
            if (this.collisionIgnore) {
                data.collisionIgnore = this.collisionIgnore.slice();
            }
            if (this.restitution) data.restitution = this.restitution;
            if (this.friction) data.friction = this.friction;
            return data;
        },
    };
}

export function areaFactory(data: any) {
    const opt: any = {};
    if (data.shape) opt.shape = shapeFactory(data.shape);
    if (data.scale) {
        opt.scale = typeof data.scale === "number"
            ? data.scale
            : Vec2.deserialize(data.scale);
    }
    if (data.offset) opt.offset = Vec2.deserialize(data.offset);
    if (data.cursor) opt.cursor = opt.cursor;
    // Make a copy, since it might be changed later
    if (data.collisionIgnore) {
        opt.collisionIgnore = data.collisionIgnore.slice();
    }
    if (data.restitution) opt.restitution = data.restitution;
    if (data.friction) opt.friction = data.friction;
    return area(opt);
}
