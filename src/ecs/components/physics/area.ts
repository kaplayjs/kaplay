import { DEF_ANCHOR } from "../../../constants/general";
import type { KEventController } from "../../../events/events";
import { toWorld } from "../../../game/camera";
import { anchorPt } from "../../../gfx/anchor";
import { drawCircle } from "../../../gfx/draw/drawCircle";
import { drawPolygon } from "../../../gfx/draw/drawPolygon";
import { drawRect } from "../../../gfx/draw/drawRect";
import { multTranslate, popTransform, pushTransform } from "../../../gfx/stack";
import { rgb } from "../../../math/color";
import { Circle, Polygon, Rect, vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type {
    Collision,
    Comp,
    Cursor,
    GameObj,
    MouseButton,
    Shape,
    Tag,
} from "../../../types";
import { isFixed } from "../../entity/utils";
import type { FakeMouseComp } from "../misc/fakeMouse";
import type { AnchorComp } from "../transform/anchor";
import type { FixedComp } from "../transform/fixed";
import type { PosComp } from "../transform/pos";

export function usesArea() {
    return _k.game.areaCount > 0;
}

/**
 * The {@link area `area()`} component.
 *
 * @group Component Types
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
        cursor: Cursor | null;
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
     * If was just clicked on last frame.
     */
    isClicked(): boolean;
    /**
     * If is being hovered on.
     */
    isHovering(): boolean;
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
     * Register an event runs when clicked.
     *
     * @since v2000.1
     */
    onClick(f: () => void, btn?: MouseButton): KEventController;
    /**
     * Register an event runs once when hovered.
     *
     * @since v3000.0
     */
    onHover(action: () => void): KEventController;
    /**
     * Register an event runs every frame when hovered.
     *
     * @since v3000.0
     */
    onHoverUpdate(action: () => void): KEventController;
    /**
     * Register an event runs once when unhovered.
     *
     * @since v3000.0
     */
    onHoverEnd(action: () => void): KEventController;
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
     * If has a certain point inside collider.
     */
    hasPoint(p: Vec2): boolean;
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
}

/**
 * Options for the {@link area `area()`} component.
 *
 * @group Component Types
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
            if (this.area.cursor) {
                events.push(
                    this.onHover(() => _k.app.setCursor(this.area.cursor!)),
                );
            }

            events.push(
                this.onCollideUpdate((obj, col) => {
                    if (!obj.id) {
                        throw new Error(
                            "area() requires the object to have an id",
                        );
                    }
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
            cursor: opt.cursor ?? null,
        },

        isClicked(): boolean {
            if (_k.game.fakeMouse) {
                return _k.game.fakeMouse.isPressed && this.isHovering();
            }

            return _k.app.isMousePressed() && this.isHovering();
        },

        isHovering(this: GameObj<AreaComp>) {
            if (_k.game.fakeMouse) {
                const mpos = isFixed(this)
                    ? _k.game.fakeMouse.pos
                    : toWorld(_k.game.fakeMouse.pos);

                return this.hasPoint(mpos);
            }

            const mpos = isFixed(this)
                ? _k.app.mousePos()
                : toWorld(_k.app.mousePos());
            return this.hasPoint(mpos);
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
                    c.source === this && c.target.is("Monster")
                    || c.target === this && c.source.is("Monster")
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
            return false;
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

        onClick(
            this: GameObj<AreaComp>,
            action: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            if (_k.game.fakeMouse) {
                _k.game.fakeMouse.onPress(() => {
                    if (this.isHovering()) {
                        action();
                    }
                });
            }

            const e = this.onMousePress(btn, () => {
                if (this.isHovering()) {
                    action();
                }
            });

            events.push(e);

            return e;
        },

        onHover(this: GameObj, action: () => void): KEventController {
            let hovering = false;
            return this.onUpdate(() => {
                if (!hovering) {
                    if (this.isHovering()) {
                        hovering = true;
                        action();
                    }
                }
                else {
                    hovering = this.isHovering();
                }
            });
        },

        onHoverUpdate(this: GameObj, onHover: () => void): KEventController {
            return this.onUpdate(() => {
                if (this.isHovering()) {
                    onHover();
                }
            });
        },

        onHoverEnd(this: GameObj, action: () => void): KEventController {
            let hovering = false;
            return this.onUpdate(() => {
                if (hovering) {
                    if (!this.isHovering()) {
                        hovering = false;
                        action();
                    }
                }
                else {
                    hovering = this.isHovering();
                }
            });
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

        hasPoint(
            this: GameObj<AreaComp | PosComp | AnchorComp>,
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
    };
}
