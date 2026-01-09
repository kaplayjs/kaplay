import { DEF_ANCHOR } from "../../../constants/general";
import type { ButtonName } from "../../../core/taf";
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
import { system, SystemPhase } from "../../systems/systems";
import { fakeMouse } from "../misc/fakeMouse";
import type { AnchorComp } from "../transform/anchor";
import type { FixedComp } from "../transform/fixed";
import type { PosComp } from "../transform/pos";

export function usesArea() {
    return _k.game.areaCount > 0;
}

let _nextRenderAreaVersion = 0;

export function nextRenderAreaVersion() {
    return _nextRenderAreaVersion++;
}

let _nextLocalAreaVersion = 0;

export function nextLocalAreaVersion() {
    return _nextLocalAreaVersion++;
}

let _nextWorldAreaVersion = 0;

export function nextWorldAreaVersion() {
    return _nextWorldAreaVersion++;
}

export function getRenderAreaVersion(obj: GameObj<any>) {
    return obj._renderAreaVersion;
}

export function getLocalAreaVersion(obj: GameObj<any>) {
    return obj._localAreaVersion;
}

function clickHandler(button: MouseButton) {
    const screenPos = _k.app.mousePos();
    const worldPos = toWorld(screenPos);
    const objects: Set<GameObj<AreaComp>> = new Set();
    // non-fixed objects
    _k.game.retrieve(
        new Rect(worldPos.sub(1, 1), 3, 3),
        obj => objects.add(obj),
    );

    objects.forEach(obj => {
        if (
            !(obj as unknown as GameObj<FixedComp>).fixed
            && obj.worldArea().contains(worldPos)
        ) {
            _k.game.gameObjEvents.trigger("click", obj);
            obj.trigger("click", button);
        }
    });

    // fixed objects
    _k.game.retrieve(new Rect(screenPos.sub(1, 1), 3, 3), obj => {
        if (objects.has(obj)) objects.delete(obj);
        else objects.add(obj);
    });
    objects.forEach(obj => {
        if (
            (obj as unknown as GameObj<FixedComp>).fixed
            && obj.worldArea().contains(screenPos)
        ) {
            _k.game.gameObjEvents.trigger("click", obj);
            obj.trigger("click", button);
        }
    });
}

let clickHandlerRunning = false;
function startClickHandler() {
    if (clickHandlerRunning) return;
    clickHandlerRunning = true;

    if (_k.game.fakeMouse) {
        _k.game.fakeMouse.on("press", clickHandler);
    }

    _k.app.onMousePress(clickHandler);
}

function hoverHandler() {
    let oldObjects: Set<GameObj<AreaComp>> = new Set();

    return (screenPos: Vec2) => {
        const worldPos = toWorld(screenPos);
        const newObjects: Set<GameObj<AreaComp>> = new Set();

        // non-fixed objects
        _k.game.retrieve(new Rect(worldPos.sub(1, 1), 3, 3), obj => {
            if (
                !(obj as unknown as GameObj<FixedComp>).fixed
                && obj.worldArea().contains(worldPos)
            ) {
                newObjects.add(obj);
            }
        });
        // fixed objects
        _k.game.retrieve(new Rect(screenPos.sub(1, 1), 3, 3), obj => {
            if (
                (obj as unknown as GameObj<FixedComp>).fixed
                && obj.worldArea().contains(screenPos)
            ) {
                newObjects.add(obj);
            }
        });

        newObjects.difference(oldObjects).forEach(obj => {
            _k.game.gameObjEvents.trigger("hover", obj);
            obj.trigger("hover");
        });
        oldObjects.difference(newObjects).forEach(obj => {
            _k.game.gameObjEvents.trigger("hoverEnd", obj);
            obj.trigger("hoverEnd");
        });
        newObjects.intersection(oldObjects).forEach(obj => {
            _k.game.gameObjEvents.trigger("hoverUpdate", obj);
            obj.trigger("hoverUpdate");
        });
        oldObjects = newObjects;
    };
}

/*let hoverHandlerRunning = false;
function startHoverHandler() {
    if (hoverHandlerRunning) return;
    hoverHandlerRunning = true;

    if (_k.game.fakeMouse) {
        _k.game.fakeMouse.on("fakeMouseMove", hoverHandler());
    }
    _k.app.onMouseMove(hoverHandler());
}*/

let systemInstalled = false;
function startHoverSystem() {
    if (systemInstalled) return;
    systemInstalled = true;

    const mouseHover = hoverHandler();
    const fakeMouseHover = hoverHandler();

    system("hover", () => {
        if (_k.game.fakeMouse) {
            fakeMouseHover(_k.game.fakeMouse.screenPos);
            return;
        }

        mouseHover(_k.app.mousePos());
    }, [
        SystemPhase.BeforeUpdate, // Because we need the transform to be up to date
    ]);
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
     * Whether collision detection should be done even without body.
     */
    isSensor: boolean;
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
     * Returns true if the objects collide in screen space
     * @param other
     */
    isVisuallyColliding(other: GameObj<AreaComp>): boolean;
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
     * Get the bounding box of the geometry data for the collider in world coordinate space.
     */
    worldBbox(): Rect;
    /**
     * Get the geometry data for the collider in screen coordinate space.
     */
    screenArea(): Shape;

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
    /**
     * Whether collision detection should be done even without body.
     *
     * @since v4000.0
     */
    isSensor?: boolean;
}

export function area(
    opt: AreaCompOpt = {},
): AreaComp & { _localAreaVersion: number } {
    // The id => collision map of objects colliding with this object
    const colliding: Record<string, Collision> = {};
    // The ids of the objects which are colliding with this object during this frame
    const collidingThisFrame = new Set();
    // Events to cancel in destroy when the component gets removed
    const events: KEventController[] = [];
    // We overwrite the shape rather than allocating a new one
    let _worldShape: Shape | undefined;
    let _worldBBox: Rect | undefined;
    let _screenShape: Shape | undefined;

    let _shape: Shape | null = opt.shape ?? null;
    let _scale: Vec2 = opt.scale ? vec2(opt.scale) : vec2(1);
    let _offset: Vec2 = opt.offset ?? vec2(0);
    let _cursor: Cursor | null = opt.cursor ?? null;

    let _localAreaVersion = -1; // Track local changes in area properties
    let _worldAreaVersion = -1; // Track local changes in world area
    let _worldBBoxVersion = -1; // Track world area changes for bbox
    let _cachedTransformVersion = -1; // Currently used transform
    let _cachedRenderAreaVersion = -1; // Currently used render shape
    let _cachedLocalAreaVersion = -1; // Currently used local area

    return {
        id: "area",
        collisionIgnore: opt.collisionIgnore ?? [],
        restitution: opt.restitution,
        friction: opt.friction,
        isSensor: opt.isSensor ?? false,

        add(this: GameObj<AreaComp>) {
            _k.game.areaCount++;
            if (this.area.cursor) {
                events.push(
                    this.onHover(() => _k.app.setCursor(this.area.cursor!)),
                );
            }

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

        get _localAreaVersion() {
            return _localAreaVersion;
        },

        area: {
            set shape(value: Shape | null) {
                _shape = value;
                _localAreaVersion = nextLocalAreaVersion();
            },
            get shape(): Shape | null {
                return _shape;
            },
            set scale(value: Vec2) {
                _scale = this.scale;
                _localAreaVersion = nextLocalAreaVersion();
            },
            get scale(): Vec2 {
                return _scale;
            },
            set offset(value: Vec2) {
                _offset = value;
                _localAreaVersion = nextLocalAreaVersion();
            },
            get offset() {
                return _offset;
            },
            set cursor(value: Cursor | null) {
                _cursor = value;
                // TODO: attach/detach hover
            },
            get cursor(): Cursor | null {
                return _cursor;
            },
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
                    c.source === this && c.target.is(otherOrTag)
                    || c.target === this && c.source.is(otherOrTag)
                );
            }
            else {
                if (!otherOrTag.id) {
                    /*throw new Error(
                        "isColliding() requires the object to have an id",
                    );*/
                    return false;
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

        isVisuallyColliding(other) {
            return this.screenArea().collides(other.screenArea());
        },

        onClick(
            this: GameObj<AreaComp>,
            action: () => void,
            btn: MouseButton = "left",
        ): KEventController {
            startClickHandler();
            return this.on("click", action);
        },

        onHover(this: GameObj, action: () => void): KEventController {
            startHoverSystem();
            return this.on("hover", action);
        },

        onHoverUpdate(this: GameObj, action: () => void): KEventController {
            startHoverSystem();
            return this.on("hoverUpdate", action);
        },

        onHoverEnd(this: GameObj, action: () => void): KEventController {
            startHoverSystem();
            return this.on("hoverEnd", action);
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
            const renderAreaVersion = getRenderAreaVersion(this);
            if (
                !_worldShape
                || _cachedTransformVersion !== (this as any)._transformVersion // Transform changed
                || (renderAreaVersion !== undefined // Render area (shape) changed
                    && _cachedRenderAreaVersion !== renderAreaVersion) // Render area (shape) changed
                || _cachedLocalAreaVersion !== _localAreaVersion // Area settings changed
            ) {
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

                _worldShape = localArea.transform(transform, _worldShape);

                _cachedTransformVersion = (this as any)._transformVersion;
                _cachedRenderAreaVersion = renderAreaVersion ?? 0;
                _cachedLocalAreaVersion = _localAreaVersion;
                _worldAreaVersion = nextWorldAreaVersion();
            }
            return _worldShape;
        },

        worldBbox(this: GameObj<AreaComp>): Rect {
            const renderAreaVersion = (this as any).renderAreaVersion;
            if (
                !_worldBBox || _worldAreaVersion != _worldBBoxVersion
                || !_worldShape
                || _cachedTransformVersion != (this as any)._transformVersion // Transform changed
                || (renderAreaVersion != undefined // Render area (shape) changed
                    && _cachedRenderAreaVersion != renderAreaVersion) // Render area (shape) changed
                || _cachedLocalAreaVersion != _localAreaVersion // Area settings changed
            ) {
                _worldBBox = this.worldArea().bbox(_worldBBox);
                _worldBBoxVersion = _worldAreaVersion;
            }
            return _worldBBox;
        },

        screenArea(this: GameObj<AreaComp | FixedComp>): Shape {
            const area = this.worldArea();
            if (isFixed(this)) {
                return area;
            }
            else {
                return _screenShape = area.transform(
                    _k.game.cam.transform,
                    _screenShape,
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
