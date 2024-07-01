import { DEF_ANCHOR } from "../../constants";
import { anchorPt, getKaboomContext } from "../../kaboom";
import { Polygon, rgb, testPolygonPoint, Vec2, vec2 } from "../../math";
import type {
    Collision,
    Comp,
    Cursor,
    GameObj,
    MouseButton,
    PosComp,
    Shape,
    Tag,
} from "../../types";
import type { KEventController } from "../../utils";
import type { AnchorComp } from "../transform/anchor";
import type { FixedComp } from "../transform/fixed";

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
    onClick(f: () => void, btn?: MouseButton): void;
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
    onCollide(tag: Tag, f: (obj: GameObj, col?: Collision) => void): void;
    /**
     * Register an event runs once when collide with another game obj.
     *
     * @since v2000.1
     */
    onCollide(f: (obj: GameObj, col?: Collision) => void): void;
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
    worldArea(): Polygon;
    /**
     * Get the geometry data for the collider in screen coordinate space.
     */
    screenArea(): Polygon;
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
}

export function area(opt: AreaCompOpt = {}): AreaComp {
    const k = getKaboomContext(this);
    const { app, isFixed, getViewportScale, game } = k._k;

    const colliding = {};
    const collidingThisFrame = new Set();

    return {
        id: "area",
        collisionIgnore: opt.collisionIgnore ?? [],

        add(this: GameObj<AreaComp>) {
            if (this.area.cursor) {
                this.onHover(() => app.setCursor(this.area.cursor));
            }

            this.onCollideUpdate((obj, col) => {
                if (!colliding[obj.id]) {
                    this.trigger("collide", obj, col);
                }
                colliding[obj.id] = col;
                collidingThisFrame.add(obj.id);
            });
        },

        update(this: GameObj<AreaComp>) {
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

            k.pushTransform();
            k.pushScale(this.area.scale);
            k.pushTranslate(this.area.offset);

            const opts = {
                outline: {
                    width: 4 / getViewportScale(),
                    color: rgb(0, 0, 255),
                },
                anchor: this.anchor,
                fill: false,
                fixed: isFixed(this),
            };

            if (a instanceof k.Rect) {
                k.drawRect({
                    ...opts,
                    pos: a.pos,
                    width: a.width,
                    height: a.height,
                });
            } else if (a instanceof k.Polygon) {
                k.drawPolygon({
                    ...opts,
                    pts: a.pts,
                });
            } else if (a instanceof k.Circle) {
                k.drawCircle({
                    ...opts,
                    pos: a.center,
                    radius: a.radius,
                });
            }

            k.popTransform();
        },

        area: {
            shape: opt.shape ?? null,
            scale: opt.scale ? vec2(opt.scale) : vec2(1),
            offset: opt.offset ?? vec2(0),
            cursor: opt.cursor ?? null,
        },

        isClicked(): boolean {
            return app.isMousePressed() && this.isHovering();
        },

        isHovering(this: GameObj) {
            const mpos = isFixed(this)
                ? k.mousePos()
                : k.toWorld(k.mousePos());
            return this.hasPoint(mpos);
        },

        checkCollision(this: GameObj, other: GameObj<AreaComp>) {
            return colliding[other.id] ?? null;
        },

        getCollisions() {
            return Object.values(colliding);
        },

        // TODO: perform check instead of use cache
        isColliding(other: GameObj<AreaComp>) {
            return Boolean(colliding[other.id]);
        },

        isOverlapping(other) {
            const col = colliding[other.id];
            return col && col.hasOverlap();
        },

        onClick(
            this: GameObj<AreaComp>,
            f: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            const e = app.onMousePress(btn, () => {
                if (this.isHovering()) {
                    f();
                }
            });
            this.onDestroy(() => e.cancel());
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
                } else {
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
                } else {
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
            } else if (typeof tag === "string") {
                return this.onCollide((obj, col) => {
                    if (obj.is(tag)) {
                        cb(obj, col);
                    }
                });
            }
        },

        onCollideUpdate(
            this: GameObj<AreaComp>,
            tag: Tag | ((obj: GameObj, col?: Collision) => void),
            cb?: (obj: GameObj, col?: Collision) => void,
        ): KEventController {
            if (typeof tag === "function" && cb === undefined) {
                return this.on("collideUpdate", tag);
            } else if (typeof tag === "string") {
                return this.on(
                    "collideUpdate",
                    (obj, col) => obj.is(tag) && cb(obj, col),
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
            } else if (typeof tag === "string") {
                return this.on(
                    "collideEnd",
                    (obj) => obj.is(tag) && cb(obj),
                );
            }
        },

        hasPoint(pt: Vec2): boolean {
            // TODO: convert to pt to local space instead
            return testPolygonPoint(this.worldArea(), pt);
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

        localArea(
            this: GameObj<AreaComp | { renderArea(): Shape }>,
        ): Shape {
            return this.area.shape
                ? this.area.shape
                : this.renderArea();
        },

        // TODO: cache
        worldArea(this: GameObj<AreaComp | AnchorComp>): Polygon {
            const localArea = this.localArea();

            if (
                !(localArea instanceof k.Polygon || localArea instanceof k.Rect)
            ) {
                throw new Error(
                    "Only support polygon and rect shapes for now",
                );
            }

            const transform = this.transform
                .clone()
                .scale(vec2(this.area.scale ?? 1))
                .translate(this.area.offset);

            if (localArea instanceof k.Rect) {
                const offset = anchorPt(this.anchor || DEF_ANCHOR)
                    .add(1, 1)
                    .scale(-0.5)
                    .scale(localArea.width, localArea.height);
                transform.translate(offset);
            }

            return localArea.transform(transform) as Polygon;
        },

        screenArea(this: GameObj<AreaComp | FixedComp>): Polygon {
            const area = this.worldArea();
            if (isFixed(this)) {
                return area;
            } else {
                return area.transform(game.cam.transform);
            }
        },

        inspect() {
            if (this.area.scale.x == this.area.scale.y) return `area: ${this.area.scale.x.toFixed(1)}x`;
            else return `area: (${this.area.scale.x.toFixed(1)}x, ${
                this.area.scale.y.toFixed(1)
            }y)`;
        },
    };
}
