// The E of ECS

import type { AppEvents } from "../../app/app";
import { COMP_DESC, COMP_EVENTS } from "../../constants/general";
import { handleErr } from "../../core/errors";
import type { GameObjEventNames } from "../../events/eventMap";
import {
    type KEvent,
    KEventController,
    type KEventHandler,
} from "../../events/events";
import {
    onAdd,
    onDestroy,
    onTag,
    onUntag,
    onUnuse,
    onUse,
} from "../../events/globalEvents";
import { drawMasked } from "../../gfx/draw/drawMasked";
import { beginPicture, endPicture, Picture } from "../../gfx/draw/drawPicture";
import { drawSubtracted } from "../../gfx/draw/drawSubstracted";
import { FrameBuffer } from "../../gfx/FrameBuffer";
import {
    flush,
    loadMatrix,
    multRotate,
    multScaleV,
    multTranslateV,
    popTransform,
    pushTransform,
    storeMatrix,
} from "../../gfx/stack";
import { Mat23 } from "../../math/math";
import { calcTransform } from "../../math/various";
import { _k } from "../../shared";
import type {
    Comp,
    CompList,
    GameObj,
    GameObjID,
    GameObjInspect,
    GetOpt,
    KAPLAYCtx,
    QueryOpt,
    RenderTarget,
    Tag,
} from "../../types";
import type { MaskComp } from "../components/draw/mask";
import type { FixedComp } from "../components/transform/fixed";
import type { LayerComp } from "../components/transform/layer";
import type { PosComp } from "../components/transform/pos";
import type { RotateComp } from "../components/transform/rotate";
import type { ScaleComp } from "../components/transform/scale";
import type { ZComp } from "../components/transform/z";
import { make } from "./make";

export enum KeepFlags {
    Pos = 1,
    Angle = 2,
    Scale = 4,
    All = 7,
}

export type SetParentOpt = {
    keep: KeepFlags;
};

/**
 * Base interface of all game objects.
 *
 * @since v2000.0
 * @group Game Obj
 */
export interface GameObjRaw {
    /**
     * The unique id of the game obj.
     */
    id: GameObjID;
    /**
     * Get or set the parent game obj.
     *
     * @since v4000.0
     */
    parent: GameObj | null;
    /**
     * Get all children game objects.
     *
     * @readonly
     * @since v3000.0
     */
    children: GameObj[];
    /**
     * Get the tags of a game object. For update it, use `tag()` and `untag()`.
     *
     * @readonly
     * @since v3001.0
     */
    tags: string[];
    /**
     * Calculated transform matrix of a game object.
     *
     * @since v3000.0
     */
    transform: Mat23;
    /**
     * If draw the game obj (run "draw" event or not).
     *
     * @since v2000.0
     */
    hidden: boolean;
    /**
     * If update the game obj (run "update" event or not).
     *
     * @since v2000.0
     */
    paused: boolean;
    /**
     * The canvas to draw this game object on
     *
     * @since v3001.0
     */
    target?: RenderTarget;
    /**
     * Set the parent game obj with additional options.
     *
     * @since v4000.0
     */
    setParent(p: GameObj, opt: SetParentOpt): void;
    /**
     * Add a child.
     *
     * @param comps - The components to add.
     *
     * @returns The added game object.
     * @since v3000.0
     */
    add<T extends CompList<unknown>>(comps?: [...T]): GameObj<T[number]>;
    /**
     * Remove and re-add the game obj, without triggering add / destroy events.
     *
     * @param obj - The game object to re-add.
     *
     * @returns The re-added game object.
     * @since v3000.0
     */
    readd<T>(obj: GameObj<T>): GameObj<T>;
    /**
     * Remove a child.
     *
     * @param obj - The game object to remove.
     *
     * @since v3000.0
     */
    remove(obj: GameObj): void;
    /**
     * Remove all children with a certain tag.
     *
     * @param tag - The tag to remove.
     *
     * @since v3000.0
     */
    removeAll(tag: Tag): void;
    /**
     * Remove this game obj from scene.
     *
     * @since v2000.0
     */
    destroy(): void;
    /**
     * Remove all children.
     *
     * @since v3000.0
     */
    removeAll(): void;
    /**
     * If game obj is attached to the scene graph.
     *
     * @returns true if attached, false otherwise.
     * @since v2000.0
     */
    exists(): boolean;
    /**
     * Check if is an ancestor (recursive parent) of another game object
     *
     * @returns true if is ancestor, false otherwise.
     * @since v3000.0
     */
    isAncestorOf(obj: GameObj): boolean;
    /**
     * Get a list of all game objs with certain tag.
     *
     * @param tag - The tag to get.
     *
     * @since v3000.0
     */
    get<T = any>(tag: Tag | Tag[], opts?: GetOpt): GameObj<T>[];
    /**
     * Get a list of all game objs with certain properties.
     *
     * @param opt - The properties to get.
     *
     * @since v3001.0
     */
    query(opt: QueryOpt): GameObj[];
    /**
     * Update this game object and all children game objects.
     *
     * @since v3000.0
     */
    update(): void;
    /**
     * Update this game object and all children game objects.
     *
     * @since v3001.0
     */
    fixedUpdate(): void;
    /**
     * Draw this game object and all children game objects.
     *
     * @since v3000.0
     */
    draw(): void;
    drawTree(): void;
    /**
     * Gather debug info of all comps.
     *
     * @since v2000.0
     */
    inspect(): GameObjInspect;
    /**
     * Draw debug info in inspect mode
     *
     * @since v3000.0
     */
    drawInspect: () => void;
    /**
     * This method is called to transform and collect objects which should be drawn layered
     */
    collectAndTransform(objects: GameObj<any>[]): void;
    /**
     * Add a component.
     *
     * @example
     * ```js
     * const obj = add([
     *    sprite("bean"),
     * ]);
     *
     * // Add opacity
     * obj.use(opacity(0.5));
     * ```
     *
     * @since v2000.0
     */
    use(comp: Comp): void;
    /**
     * Remove a component with its id (the component name)
     *
     * @param comp - The component id to remove. It means the name, if sprite, then it's "sprite".
     *
     * @example
     * ```js
     * // Remove sprite component
     * obj.unuse("sprite");
     * ```
     *
     * @since v2000.0
     */
    unuse(comp: string): void;
    /**
     * Check if game object has a certain component.
     *
     * @param compId - The component id(s) to check.
     * @param op - The operator to use when searching for multiple components. Default is "and".
     *
     * @example
     * ```js
     * // Check if game object has sprite component
     * if(obj.has("sprite")) {
     *     debug.log("has sprite component");
     * }
     *
     * // Check if game object has tags
     * obj.has(["tag1", "tag2"]); // AND, it has both tags
     * obj.has(["tag1", "tag2"], "or"); // OR, it has either tag1 or tag2
     * ```
     *
     * @returns true if has the component(s), false otherwise.
     * @since v3001.0.5
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    has(compId: string | string[], op?: "and" | "or"): boolean;
    /**
     * Get state for a specific comp.
     *
     * @param id - The component id.
     *
     * @since v2000.0
     */
    c(id: string): Comp | null;
    /**
     * Add a tag(s) to the game obj.
     *
     * @param tag - The tag(s) to add.
     *
     * @example
     * ```js
     * // add enemy tag
     * obj.tag("enemy");
     *
     * // add multiple tags
     * obj.tag(["enemy", "boss"]);
     * ```
     *
     * @since v3001.0.5
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    tag(tag: Tag | Tag[]): void;
    /**
     * Remove a tag(s) from the game obj.
     *
     * @param tag - The tag(s) to remove.
     *
     * @example
     * ```js
     * // remove enemy tag
     * obj.untag("enemy");
     *
     * // remove multiple tags
     * obj.untag(["enemy", "boss"]);
     * ```
     *
     * @since v3001.0.5
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    untag(tag: Tag | Tag[]): void;
    /**
     * If there's certain tag(s) on the game obj.
     *
     * @param tag - The tag(s) for checking.
     * @param op - The operator to use when searching for multiple tags. Default is "and".
     *
     * @since v3001.0.5
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    is(tag: Tag | Tag[], op?: "and" | "or"): boolean;
    /**
     * Register an event.
     *
     * @param event - The event name.
     * @param action - The action to run when event is triggered.
     *
     * @returns The event controller.
     * @since v2000.0
     */
    on(
        event: GameObjEventNames | (string & {}),
        action: (...args: any) => void,
    ): KEventController;
    /**
     * Trigger an event.
     *
     * @param event - The event name.
     * @parm args - The arguments to pass to the event action.
     *
     * @since v2000.0
     */
    trigger(event: string, ...args: any): void;
    /**
     * Clear all events.
     */
    clearEvents: () => void;
    /**
     * Register an event that runs when the game obj is added to the scene.
     *
     * @returns The event controller.
     * @since v2000.0
     */
    onAdd(action: () => void): KEventController;
    /**
     * Register an event that runs every frame as long as the game obj exists.
     *
     * @returns The event controller.
     * @since v2000.1
     */
    onUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame as long as the game obj exists.
     *
     * @returns The event controller.
     * @since v2000.1
     */
    onFixedUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame as long as the game obj exists (this is the same as `onUpdate()`, but all draw events are run after all update events).
     *
     * @returns The event controller.
     * @since v2000.1
     */
    onDraw(action: () => void): KEventController;
    /**
     * Register an event that runs when the game obj is destroyed.
     *
     * @returns The event controller.
     * @since v2000.1
     */
    onDestroy(action: () => void): KEventController;
    /**
     * Register an event that runs when a component is used.
     *
     * @returns The event controller.
     * @since v4000.0
     */
    onUse(action: (id: string) => void): KEventController;
    /**
     * Register an event that runs when a component is unused.
     *
     * @returns The event controller.
     * @since v4000.0
     */
    onUnuse(action: (id: string) => void): KEventController;
    /**
     * Register an event that runs when a tag is added.
     *
     * @returns The event controller.
     * @since v4000.0
     */
    onTag(action: (tag: string) => void): KEventController;
    /**
     * Register an event that runs when a tag is removed.
     *
     * @returns The event controller.
     * @since v4000.0
     */
    onUntag(action: (tag: string) => void): KEventController;
    onKeyDown: KAPLAYCtx["onKeyDown"];
    onKeyPress: KAPLAYCtx["onKeyPress"];
    onKeyPressRepeat: KAPLAYCtx["onKeyPressRepeat"];
    onKeyRelease: KAPLAYCtx["onKeyRelease"];
    onCharInput: KAPLAYCtx["onCharInput"];
    onMouseDown: KAPLAYCtx["onMouseDown"];
    onMousePress: KAPLAYCtx["onMousePress"];
    onMouseRelease: KAPLAYCtx["onMouseRelease"];
    onMouseMove: KAPLAYCtx["onMouseMove"];
    onTouchStart: KAPLAYCtx["onTouchStart"];
    onTouchMove: KAPLAYCtx["onTouchMove"];
    onTouchEnd: KAPLAYCtx["onTouchEnd"];
    onScroll: KAPLAYCtx["onScroll"];
    onGamepadButtonDown: KAPLAYCtx["onGamepadButtonDown"];
    onGamepadButtonPress: KAPLAYCtx["onGamepadButtonPress"];
    onGamepadButtonRelease: KAPLAYCtx["onGamepadButtonRelease"];
    onGamepadStick: KAPLAYCtx["onGamepadStick"];
    onButtonDown: KAPLAYCtx["onButtonDown"];
    onButtonPress: KAPLAYCtx["onButtonPress"];
    onButtonRelease: KAPLAYCtx["onButtonRelease"];

    /** @readonly */
    _parent: GameObj;
    _compsIds: Set<string>;
    _compStates: Map<string, Comp>;
    _anonymousCompStates: Comp[];
    _cleanups: Record<string, (() => any)[]>;
    _events: KEventHandler<any>;
    _fixedUpdateEvents: KEvent<[]>;
    _updateEvents: KEvent<[]>;
    _drawEvents: KEvent<[]>;
    _inputEvents: KEventController[];
    _onCurCompCleanup: Function | null;
    _tags: Set<Tag>;
    _paused: boolean;
}

type GameObjTransform = GameObj<PosComp | RotateComp | ScaleComp>;
type GameObjCamTransform = GameObj<
    PosComp | RotateComp | ScaleComp | FixedComp | MaskComp
>;

export const GameObjRawPrototype: Omit<GameObjRaw, AppEvents> = {
    // This chain of `as any`, is because we never should use this object
    // directly, it's only a prototype. These properties WILL be defined
    // (by our factory function `make`) when we create a new game object.
    _paused: null as any,
    _anonymousCompStates: null as any,
    _cleanups: null as any,
    _compsIds: null as any,
    _compStates: null as any,
    _events: null as any,
    _fixedUpdateEvents: null as any,
    _inputEvents: null as any,
    _onCurCompCleanup: null as any,
    _parent: null as any,
    _tags: null as any,
    _updateEvents: null as any,
    _drawEvents: null as any,
    children: null as any,
    hidden: null as any,
    id: null as any,
    transform: null as any,
    target: null as any,

    // #region Setters and Getters
    set parent(p: GameObj) {
        // We assume this will never be ran in root
        // so this is GameObj

        if (this._parent === p) return;
        const index = this._parent
            ? this._parent.children.indexOf(this as GameObj)
            : -1;
        if (index !== -1) {
            this._parent.children.splice(index, 1);
        }
        this._parent = p;
        if (p) {
            p.children.push(this as GameObj);
        }
    },

    set paused(paused: boolean) {
        if (this._paused === paused) return;
        this._paused = paused;

        for (const e of this._inputEvents) {
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
    setParent(
        this: GameObjTransform,
        p: GameObj,
        opt: SetParentOpt,
    ) {
        if (this._parent === p) return;
        const oldTransform = this._parent?.transform;
        const newTransform = p.transform;
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

    add<T2 extends CompList<unknown>>(
        this: GameObjRaw,
        a: [...T2],
    ): GameObj<T2[number]> {
        const obj = make(a);

        if (obj.parent) {
            throw new Error(
                "Cannot add a game obj that already has a parent.",
            );
        }

        obj.parent = this;

        calcTransform(obj, obj.transform);

        try {
            obj.trigger("add", obj);
            obj.children.forEach(c => c.trigger("add", c));
        } catch (e) {
            handleErr(e);
        }

        _k.game.events.trigger("add", obj);

        return obj;
    },

    readd<T>(this: GameObjRaw, obj: GameObj<T>): GameObj<T> {
        const idx = this.children.indexOf(obj);

        if (idx !== -1) {
            this.children.splice(idx, 1);
            this.children.push(obj);
        }

        return obj;
    },

    remove(this: GameObjRaw, obj: GameObj): void {
        obj.parent = null;

        const trigger = (o: GameObj) => {
            o.trigger("destroy");
            _k.game.events.trigger("destroy", o);
            o.children.forEach((child) => trigger(child));
        };

        trigger(obj);
    },

    removeAll(this: GameObjRaw, tag?: Tag): void {
        if (tag) {
            this.get(tag).forEach((obj) => this.remove(obj));
        }
        else {
            for (const child of [...this.children]) this.remove(child);
        }
    },

    destroy(this: GameObjRaw) {
        if (this.parent) {
            this.parent.remove(this);
        }
    },

    exists(this: GameObjRaw) {
        return this.parent !== null;
    },

    isAncestorOf(this: GameObjRaw, obj: GameObj) {
        if (!obj.parent) {
            return false;
        }
        return obj.parent === this || this.isAncestorOf(obj.parent);
    },
    // #endregion

    // #region Get & Query
    get<T = any>(
        this: GameObjRaw,
        t: Tag | Tag[],
        opts: GetOpt = {},
    ): GameObj<T>[] {
        const compIdAreTags = _k.globalOpt.tagsAsComponents;

        const checkTagsOrComps = (child: GameObj, t: Tag | Tag[]) => {
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

        let list: GameObj[] = opts.recursive
            ? this.children.flatMap(
                function recurse(child: GameObj): GameObj[] {
                    return [child, ...child.children.flatMap(recurse)];
                },
            )
            : this.children;

        list = list.filter((child) => t ? checkTagsOrComps(child, t) : true);

        if (opts.liveUpdate) {
            const isChild = (obj: GameObj) => {
                return opts.recursive
                    ? this.isAncestorOf(obj)
                    : obj.parent === this;
            };

            const events: KEventController[] = [];

            // TODO: clean up when obj destroyed
            events.push(onAdd((obj) => {
                if (isChild(obj) && checkTagsOrComps(obj, t)) {
                    list.push(obj);
                }
            }));
            events.push(onDestroy((obj) => {
                if (checkTagsOrComps(obj, t)) {
                    const idx = list.findIndex((o) => o.id === obj.id);
                    if (idx !== -1) {
                        list.splice(idx, 1);
                    }
                }
            }));
            // If tags are components, we need to use these callbacks, whether watching tags or components
            // If tags are not components, we only need to use these callbacks if this query looks at components
            if (compIdAreTags || opts.only !== "tags") {
                events.push(onUse((obj, id) => {
                    if (isChild(obj) && checkTagsOrComps(obj, t)) {
                        const idx = list.findIndex((o) => o.id === obj.id);
                        if (idx == -1) {
                            list.push(obj);
                        }
                    }
                }));
                events.push(onUnuse((obj, id) => {
                    if (isChild(obj) && !checkTagsOrComps(obj, t)) {
                        const idx = list.findIndex((o) => o.id === obj.id);
                        if (idx !== -1) {
                            list.splice(idx, 1);
                        }
                    }
                }));
            }
            // If tags are are components, we don't need to use these callbacks
            // If tags are not components, we only need to use these callbacks if this query looks at tags
            if (!compIdAreTags && opts.only !== "comps") {
                events.push(onTag((obj, tag) => {
                    if (isChild(obj) && checkTagsOrComps(obj, t)) {
                        const idx = list.findIndex((o) => o.id === obj.id);
                        if (idx == -1) {
                            list.push(obj);
                        }
                    }
                }));
                events.push(onUntag((obj, tag) => {
                    if (isChild(obj) && !checkTagsOrComps(obj, t)) {
                        const idx = list.findIndex((o) => o.id === obj.id);
                        if (idx !== -1) {
                            list.splice(idx, 1);
                        }
                    }
                }));
            }
            this.onDestroy(() => {
                for (const ev of events) {
                    ev.cancel();
                }
            });
        }

        return list as GameObj<T>[];
    },

    query(this: GameObjTransform, opt: QueryOpt) {
        const hierarchy = opt.hierarchy || "children";
        const include = opt.include;
        const exclude = opt.exclude;
        let list: GameObj[] = [];

        switch (hierarchy) {
            case "children":
                list = this.children;
                break;
            case "siblings":
                list = this.parent
                    ? this.parent.children.filter((o: GameObj) => o !== this)
                    : [];
                break;
            case "ancestors":
                let parent = this.parent;
                while (parent) {
                    list.push(parent);
                    parent = parent.parent;
                }
                break;
            case "descendants":
                list = this.children.flatMap(
                    function recurse(child: GameObj): GameObj[] {
                        return [
                            child,
                            ...child.children.flatMap(recurse),
                        ];
                    },
                );
                break;
        }

        if (include) {
            const includeOp = opt.includeOp || "and";

            if (includeOp === "and" || !Array.isArray(opt.include)) {
                // Accept if all match
                list = list.filter(o => o.is(include));
            }
            else { // includeOp == "or"
                // Accept if some match
                list = list.filter(o =>
                    (opt.include as string[]).some(t => o.is(t))
                );
            }
        }

        if (exclude) {
            const excludeOp = opt.includeOp || "and";
            if (excludeOp === "and" || !Array.isArray(opt.include)) {
                // Reject if all match
                list = list.filter(o => !o.is(exclude));
            }
            else { // includeOp == "or"
                // Reject if some match
                list = list.filter(o =>
                    !(opt.exclude as string[]).some(t => o.is(t))
                );
            }
        }

        if (opt.visible === true) {
            list = list.filter(o => o.visible);
        }

        if (opt.distance) {
            if (!this.pos) {
                throw Error(
                    "Can't do a distance query from an object without pos",
                );
            }
            const distanceOp = opt.distanceOp || "near";
            const sdist = opt.distance * opt.distance;
            if (distanceOp === "near") {
                list = list.filter(o =>
                    o.pos && this.pos.sdist(o.pos) <= sdist
                );
            }
            else { // distanceOp === "far"
                list = list.filter(o => o.pos && this.pos.sdist(o.pos) > sdist);
            }
        }
        if (opt.name) {
            list = list.filter(o => o.name === opt.name);
        }
        return list;
    },
    // #endregion

    // #region Lifecycle
    update(this: GameObjRaw) {
        if (this.paused) return;
        this._updateEvents.trigger();
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update();
        }
    },

    fixedUpdate(this: GameObjRaw) {
        if (this.paused) return;
        this._fixedUpdateEvents.trigger();
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].fixedUpdate();
        }
    },

    draw(this: GameObjRaw) {
        this.drawTree();
    },

    drawTree(this: GameObjCamTransform) {
        if (this.hidden) return;

        const objects = new Array<
            GameObj<LayerComp | ZComp | FixedComp | MaskComp>
        >();

        pushTransform();
        if (this.pos) multTranslateV(this.pos);
        if (this.angle) multRotate(this.angle);
        if (this.scale) multScaleV(this.scale);

        if (!this.transform) this.transform = new Mat23();
        storeMatrix(this.transform);

        // For each child call collect
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].hidden) continue;
            this.children[i].collectAndTransform(objects);
        }

        popTransform();

        // Sort objects on layer, then z
        objects.sort((o1, o2) => {
            const l1 = o1.layerIndex ?? _k.game.defaultLayerIndex;
            const l2 = o2.layerIndex ?? _k.game.defaultLayerIndex;
            return (l1 - l2) || (o1.z ?? 0) - (o2.z ?? 0);
        });

        // If this subtree is masking, the root is drawn into the mask, then the children are drawn
        if (this.mask) {
            const maskFunc = {
                intersect: drawMasked,
                subtract: drawSubtracted,
            }[this.mask];
            if (!maskFunc) {
                throw new Error(`Invalid mask func: "${this.mask}"`);
            }
            maskFunc(() => {
                // Draw children masked
                const f = _k.gfx.fixed;
                // We push once, then update the current transform only
                pushTransform();
                for (let i = 0; i < objects.length; i++) {
                    _k.gfx.fixed = objects[i].fixed;
                    loadMatrix(objects[i].transform);
                    objects[i]._drawEvents.trigger();
                }
                popTransform();
                _k.gfx.fixed = f;
            }, () => {
                // Draw mask
                this._drawEvents.trigger();
            });
        }
        else {
            // If this subtree is rendered to a target, enable target
            if (this.target) {
                if (!this.target?.refreshOnly || !this.target?.isFresh) {
                    flush();
                    if (this.target.destination instanceof FrameBuffer) {
                        this.target.destination.bind();
                    }
                    else if (this.target.destination instanceof Picture) {
                        beginPicture(this.target.destination);
                    }
                }
            }

            if (!this.target?.refreshOnly || !this.target?.isFresh) {
                const f = _k.gfx.fixed;
                pushTransform();
                // Parent is drawn before children if !childrenOnly
                if (!this.target?.childrenOnly) {
                    _k.gfx.fixed = this.fixed;
                    loadMatrix(this.transform);
                    this._drawEvents.trigger();
                }
                // Draw children
                for (let i = 0; i < objects.length; i++) {
                    // An object with a mask is drawn at draw time, but the transform still needs to be calculated,
                    // so we push the parent's transform and pretend we are
                    _k.gfx.fixed = objects[i].fixed;
                    if (objects[i].mask) {
                        loadMatrix(objects[i].parent!.transform);
                        objects[i].drawTree();
                    }
                    else {
                        loadMatrix(objects[i].transform);
                        objects[i]._drawEvents.trigger();
                    }
                }
                popTransform();
                _k.gfx.fixed = f;
            }

            // If this subtree is rendered to a target, disable target
            if (this.target) {
                if (!this.target?.refreshOnly || !this.target?.isFresh) {
                    flush();
                    if (this.target.destination instanceof FrameBuffer) {
                        this.target.destination.unbind();
                    }
                    else if (this.target.destination instanceof Picture) {
                        endPicture();
                    }
                }
            }

            // If this object needs the refresh flag in order to draw children, set it to fresh
            if (this.target?.refreshOnly && !this.target?.isFresh) {
                this.target.isFresh = true;
            }

            // If children only flag is on
            if (this.target?.childrenOnly) {
                // Parent is drawn on screen, children are drawn in target
                const f = _k.gfx.fixed;
                _k.gfx.fixed = this.fixed;
                pushTransform();
                loadMatrix(this.transform);
                this._drawEvents.trigger();
                popTransform();
                _k.gfx.fixed = f;
            }
        }
    },

    inspect(this: GameObjRaw): GameObjInspect {
        const info = {} as GameObjInspect;

        for (const [tag, comp] of this._compStates) {
            info[tag] = comp.inspect?.() ?? null;
        }

        for (const [i, comp] of this._anonymousCompStates.entries()) {
            if (comp.inspect) {
                info[i] = comp.inspect();
                continue;
            }

            for (const [key, value] of Object.entries(comp)) {
                if (typeof value === "function") {
                    continue;
                }
                else {
                    info[key] = `${key}: ${value}`;
                }
            }
        }

        return info;
    },

    drawInspect(this: GameObj<PosComp | ScaleComp | RotateComp>) {
        if (this.hidden) return;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].drawInspect();
        }

        loadMatrix(this.transform);
        this.trigger("drawInspect");
    },

    collectAndTransform(
        this: GameObj<
            PosComp | ScaleComp | RotateComp | FixedComp | MaskComp
        >,
        objects: GameObj<any>[],
    ) {
        pushTransform();
        if (this.pos) multTranslateV(this.pos);
        if (this.angle) multRotate(this.angle);
        if (this.scale) multScaleV(this.scale);

        if (!this.transform) this.transform = new Mat23();
        storeMatrix(this.transform);

        // Add to objects
        objects.push(this);

        // Recurse on children
        for (let i = 0; i < this.children.length; i++) {
            // While we could do this test in collect, it would mean an extra function call
            // so it is better to do this preemptively
            if (this.children[i].hidden) continue;
            if (this.target) {
                this.drawTree();
            }
            else if (!this.mask) {
                this.children[i].collectAndTransform(objects);
            }
        }

        popTransform();
    },
    // #endregion

    // #region Comps
    use(this: GameObjRaw, comp: Comp) {
        if (!comp || typeof comp != "object") {
            throw new Error(
                `You can only pass objects to .use(), you passed a "${typeof comp}"`,
            );
        }

        const addCompIdAsTag = this.id === 0
            ? false
            : _k.globalOpt.tagsAsComponents;

        let gc = [];

        // clear if overwrite
        if (comp.id) {
            this.unuse(comp.id);
            this._cleanups[comp.id] = [];
            gc = this._cleanups[comp.id];
            this._compStates.set(comp.id, comp);

            if (addCompIdAsTag) this._tags.add(comp.id);
        }
        else {
            this._anonymousCompStates.push(comp);
        }

        for (const key in comp) {
            // These are properties from the component data (id, require), shouldn't
            // be added to the game obj prototype, that's why we continue
            if (COMP_DESC.has(key)) {
                continue;
            }

            const prop = Object.getOwnPropertyDescriptor(comp, key);
            if (!prop) continue;

            if (typeof prop.value === "function") {
                // @ts-ignore
                comp[key] = comp[key].bind(this);
            }

            if (prop.set) {
                Object.defineProperty(comp, key, {
                    set: prop.set.bind(this),
                });
            }

            if (prop.get) {
                Object.defineProperty(comp, key, {
                    get: prop.get.bind(this),
                });
            }

            if (COMP_EVENTS.has(key)) {
                // Automatically clean up events created by components in add() stage
                const func = key === "add"
                    ? () => {
                        this._onCurCompCleanup = (c: any) => gc.push(c);
                        comp[key]?.();
                        this._onCurCompCleanup = null;
                    }
                    : comp[<keyof typeof comp> key];
                gc.push(this.on(key, <any> func).cancel);
            }
            else {
                // @ts-ignore
                if (this[key] === undefined) {
                    // Assign comp fields to game obj
                    Object.defineProperty(this, key, {
                        get: () => comp[<keyof typeof comp> key],
                        set: (val) => comp[<keyof typeof comp> key] = val,
                        configurable: true,
                        enumerable: true,
                    });
                    // @ts-ignore
                    gc.push(() => delete this[key]);
                }
                else {
                    const originalCompId = this._compStates.values().find(c =>
                        (c as any)[key] !== undefined
                    )?.id;
                    throw new Error(
                        `Duplicate component property: "${key}" while adding component "${comp.id}"`
                            + (originalCompId
                                ? ` (originally added by "${originalCompId}")`
                                : ""),
                    );
                }
            }
        }

        // Check for component dependencies
        const checkDeps = () => {
            if (!comp.require) return;

            try {
                for (const dep of comp.require) {
                    if (!this._compsIds.has(dep)) {
                        throw new Error(
                            `Component "${comp.id}" requires component "${dep}"`,
                        );
                    }
                }
            } catch (e) {
                handleErr(e);
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
                this._onCurCompCleanup = (c: any) => gc.push(c);
                comp.add.call(this);
                this._onCurCompCleanup = null;
            }
            if (comp.id) {
                this.trigger("use", comp.id);
                _k.game.events.trigger("use", this as GameObj, comp.id);
            }
        }
        else {
            if (comp.require) {
                checkDeps();
            }
        }
    },

    // Remove components
    unuse(this: GameObjRaw, id: string) {
        const addCompIdAsTag = this.id === 0
            ? false
            : _k.globalOpt.tagsAsComponents;

        if (this._compStates.has(id)) {
            // check all components for a dependent, if there's one, throw an error
            for (const comp of this._compStates.values()) {
                if (comp.require && comp.require.includes(id)) {
                    throw new Error(
                        `Can't unuse. Component "${comp.id}" requires component "${id}"`,
                    );
                }
            }

            this._compStates.delete(id);
            this._compsIds.delete(id);

            this.trigger("unuse", id);
            _k.game.events.trigger("unuse", this, id);
        }
        else if (addCompIdAsTag && this._tags.has(id)) {
            this._tags.delete(id);
        }

        if (this._cleanups[id]) {
            this._cleanups[id].forEach((e) => e());
            delete this._cleanups[id];
        }
    },

    has(
        this: GameObjRaw,
        compList: string | string[],
        op: "and" | "or" = "and",
    ): boolean {
        if (Array.isArray(compList)) {
            if (op === "and") {
                return compList.every((c) => this._compStates.has(c));
            }
            else {
                return compList.some(c => this._compStates.has(c));
            }
        }
        else {
            return this._compStates.has(compList);
        }
    },

    c(this: GameObjRaw, id: string): Comp | null {
        return this._compStates.get(id) ?? null;
    },

    // #endregion

    // #region Tags
    tag(this: GameObjRaw, tag: Tag | Tag[]): void {
        if (Array.isArray(tag)) {
            for (const t of tag) {
                this._tags.add(t);
                this.trigger("tag", t);
                _k.game.events.trigger("tag", this as GameObj, t);
            }
        }
        else {
            this._tags.add(tag);
            this.trigger("tag", tag);
            _k.game.events.trigger("tag", this as GameObj, tag);
        }
    },

    untag(this: GameObjRaw, tag: Tag | Tag[]): void {
        if (Array.isArray(tag)) {
            for (const t of tag) {
                this._tags.delete(t);
                this.trigger("untag", t);
                _k.game.events.trigger("untag", this, t);
            }
        }
        else {
            this._tags.delete(tag);
            this.trigger("untag", tag);
            _k.game.events.trigger("untag", this, tag);
        }
    },

    is(this: GameObjRaw, tag: Tag | Tag[], op: "or" | "and" = "and"): boolean {
        if (Array.isArray(tag)) {
            if (op === "and") {
                return tag.every(tag => this._tags.has(tag));
            }
            else {
                return tag.some(tag => this._tags.has(tag));
            }
        }
        else {
            return this._tags.has(tag);
        }
    },
    // #endregion

    // #region Events
    on(
        this: GameObjRaw,
        name: string,
        action: (...args: unknown[]) => void,
    ): KEventController {
        const ctrl = ((func) => {
            switch (name) {
                case "fixedUpdate":
                    return this._fixedUpdateEvents.add(func);
                case "update":
                    return this._updateEvents.add(func);
                case "draw":
                    return this._drawEvents.add(func);
                default:
                    return this._events.on(name, func);
            }
        })(action.bind(this));

        if (this._onCurCompCleanup) {
            this._onCurCompCleanup(() => ctrl.cancel());
        }

        return ctrl;
    },

    trigger(this: GameObjRaw, name: string, ...args: unknown[]): void {
        this._events.trigger(name, ...args);
    },

    clearEvents(this: GameObjRaw) {
        this._events.clear();
        this._drawEvents.clear();
        this._updateEvents.clear();
        this._fixedUpdateEvents.clear();
    },
    // #endregion

    // #region Helper Events
    onAdd(cb: () => void): KEventController {
        return this.on("add", cb);
    },

    onFixedUpdate(cb: () => void): KEventController {
        return this.on("fixedUpdate", cb);
    },

    onUpdate(cb: () => void): KEventController {
        return this.on("update", cb);
    },

    onDraw(cb: () => void): KEventController {
        return this.on("draw", cb);
    },

    onDestroy(action: () => void): KEventController {
        return this.on("destroy", action);
    },

    onTag(action: (id: string) => void): KEventController {
        return this.on("tag", action);
    },

    onUntag(action: (id: string) => void): KEventController {
        return this.on("untag", action);
    },

    onUse(action: (id: string) => void): KEventController {
        return this.on("use", action);
    },

    onUnuse(action: (id: string) => void): KEventController {
        return this.on("unuse", action);
    },
    // #endregion
};

// #region App Events in Proto
export function attachAppToGameObjRaw() {
    // We add App Events for "attaching" it to game object
    const appEvs = [
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
    ] satisfies [...AppEvents[]];

    for (const e of appEvs) {
        const obj = GameObjRawPrototype as Record<string, any>;

        obj[e] = function(this: GameObjRaw, ...args: [any]) {
            // @ts-ignore
            const ev: KEventController = _k.app[e]?.(...args);
            ev.paused = this.paused;

            this._inputEvents.push(ev);

            this.onDestroy(() => ev.cancel());

            // This only happens if obj.has("stay");
            this.on("sceneEnter", () => {
                // All app events are already canceled by changing the scene
                // so we don't need to event.cancel();
                this._inputEvents.splice(this._inputEvents.indexOf(ev), 1);

                // create a new event with the same arguments
                // @ts-ignore
                const newEv = _k.app[e]?.(...args);

                // Replace the old event handler with the new one
                // old KEventController.cancel() => new KEventController.cancel()
                KEventController.replace(ev, newEv);
                this._inputEvents.push(ev);
            });

            return ev;
        };
    }
}
// #endregion
