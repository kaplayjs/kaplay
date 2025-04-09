// The E of KAPLAY

import type { App } from "../app/app";
import { COMP_DESC, COMP_EVENTS } from "../constants";
import { handleErr } from "../core/errors";
import { KEvent, KEventController, KEventHandler } from "../events/events";
import { FrameBuffer } from "../gfx/classes/FrameBuffer";
import { beginPicture, endPicture, Picture } from "../gfx/draw/drawPicture";
import {
    flush,
    multRotate,
    multScaleV,
    multTranslateV,
    popTransform,
    pushTransform,
} from "../gfx/stack";
import { _k } from "../kaplay";
import { Mat23 } from "../math/math";
import { calcTransform } from "../math/various";
import type {
    Comp,
    CompList,
    GameObj,
    GameObjInspect,
    GameObjRaw,
    GetOpt,
    QueryOpt,
    Tag,
} from "../types";
import { uid } from "../utils/uid";
import type { MaskComp } from "./components/draw/mask";
import type { FixedComp } from "./components/transform/fixed";
import type { PosComp } from "./components/transform/pos";
import type { RotateComp } from "./components/transform/rotate";
import type { ScaleComp } from "./components/transform/scale";

export enum KeepFlags {
    Pos = 1,
    Angle = 2,
    Scale = 4,
    All = 7,
}

export type SetParentOpt = {
    keep: KeepFlags;
};

type AppEvents = keyof {
    [K in keyof App as K extends `on${any}` ? K : never]: [never];
};

type GameObjTransform = GameObj<PosComp | RotateComp | ScaleComp>;

/*
Order of making a game object:

1. We receive an array of components and tags from add([])
2. We create the GameObjRaw interface
3. We call .use() or .tag() on elements in the compAndTags array
*/
export function make<T extends CompList<unknown>>(
    compsAndTags: [...T],
): GameObj<T[number]> {
    const id = uid();
    const compIds = new Set<string>();
    const compStates = new Map<string, Comp>();
    const anonymousCompStates: Comp[] = [];
    const cleanups = {} as Record<string, (() => unknown)[]>;
    const events = new KEventHandler();
    const fixedUpdateEvents = new KEvent<[]>();
    const updateEvents = new KEvent<[]>();
    const drawEvents = new KEvent<[]>();
    const inputEvents: KEventController[] = [];
    const tags = new Set<Tag>("*");
    const treatTagsAsComponents = id == 0
        ? false
        : _k.globalOpt.tagsAsComponents;
    let onCurCompCleanup: Function | null = null;
    let paused = false;
    let _parent: GameObj;

    // the game object without the event methods, added later
    const obj = {
        id: id,
        // TODO: a nice way to hide / pause when add()-ing
        hidden: false,
        transform: new Mat23(),
        children: [],

        get parent() {
            return _parent!;
        },

        set parent(p: GameObj) {
            if (_parent === p) return;
            const index = _parent
                ? _parent.children.indexOf(this as GameObj)
                : -1;
            if (index !== -1) {
                _parent.children.splice(index, 1);
            }
            _parent = p;
            if (p) {
                p.children.push(this as GameObj);
            }
        },

        setParent(
            this: GameObjTransform,
            p: GameObj,
            opt: SetParentOpt,
        ) {
            if (_parent === p) return;
            const oldTransform = _parent.transform;
            const newTransform = p.transform;
            if ((opt.keep & KeepFlags.Pos) && this.pos !== undefined) {
                oldTransform.transformPoint(this.pos, this.pos);
                newTransform.inverse.transformPoint(this.pos, this.pos);
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

        set paused(p) {
            if (p === paused) return;
            paused = p;
            for (const e of inputEvents) {
                e.paused = p;
            }
        },

        get paused() {
            return paused;
        },

        get tags() {
            return Array.from(tags);
        },

        add<T2 extends CompList<unknown>>(
            this: GameObj,
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

        readd<T>(obj: GameObj<T>): GameObj<T> {
            const idx = this.children.indexOf(obj);
            if (idx !== -1) {
                this.children.splice(idx, 1);
                this.children.push(obj);
            }
            return obj;
        },

        remove(obj: GameObj): void {
            obj.parent = null;

            const trigger = (o: GameObj) => {
                o.trigger("destroy");
                _k.game.events.trigger("destroy", o);
                o.children.forEach((child) => trigger(child));
            };

            trigger(obj);
        },
        // TODO: recursive
        removeAll(this: GameObj, tag?: Tag) {
            if (tag) {
                this.get(tag).forEach((obj) => this.remove(obj));
            }
            else {
                for (const child of [...this.children]) this.remove(child);
            }
        },

        fixedUpdate(this: GameObj) {
            if (this.paused) return;
            this.children
                /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                .forEach((child) => child.fixedUpdate());
            fixedUpdateEvents.trigger();
        },

        update(this: GameObj) {
            if (this.paused) return;
            this.children
                /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                .forEach((child) => child.update());
            updateEvents.trigger();
        },

        draw(
            this: GameObj<
                PosComp | ScaleComp | RotateComp | FixedComp | MaskComp
            >,
        ) {
            if (this.hidden) return;
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
            const f = _k.gfx.fixed;
            if (this.fixed) _k.gfx.fixed = true;
            pushTransform();
            multTranslateV(this.pos);
            multScaleV(this.scale);
            multRotate(this.angle);
            const children = this.children.sort((o1, o2) => {
                const l1 = o1.layerIndex ?? _k.game.defaultLayerIndex;
                const l2 = o2.layerIndex ?? _k.game.defaultLayerIndex;
                return (l1 - l2) || (o1.z ?? 0) - (o2.z ?? 0);
            });
            // TODO: automatically don't draw if offscreen
            if (this.mask) {
                const maskFunc = {
                    intersect: _k.k.drawMasked,
                    subtract: _k.k.drawSubtracted,
                }[this.mask];
                if (!maskFunc) {
                    throw new Error(`Invalid mask func: "${this.mask}"`);
                }
                maskFunc(() => {
                    for (let i = 0; i < children.length; i++) {
                        children[i].draw();
                    }
                }, () => {
                    drawEvents.trigger();
                });
            }
            else {
                if (!this.target?.refreshOnly || !this.target?.isFresh) {
                    // Parent is drawn with children
                    if (!this.target?.childrenOnly) {
                        drawEvents.trigger();
                    }
                    for (let i = 0; i < children.length; i++) {
                        children[i].draw();
                    }
                }
            }
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
            if (this.target?.refreshOnly && !this.target?.isFresh) {
                this.target.isFresh = true;
            }
            if (this.target?.childrenOnly) {
                // Parent is drawn on screen, children are drawn in target
                drawEvents.trigger();
            }
            popTransform();
            _k.gfx.fixed = f;
        },

        drawInspect(this: GameObj<PosComp | ScaleComp | RotateComp>) {
            if (this.hidden) return;
            pushTransform();
            multTranslateV(this.pos);
            multScaleV(this.scale);
            multRotate(this.angle);
            this.children
                /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                .forEach((child) => child.drawInspect());
            this.trigger("drawInspect");
            popTransform();
        },

        // use a comp
        /*
        Order of use:
        1. If we're ovewriting it
        */
        use(comp: Comp) {
            if (!comp || typeof comp != "object") {
                throw new Error(
                    `You can only pass objects to .use(), you passed a "${typeof comp}"`,
                );
            }

            let gc = [];

            // clear if overwrite
            if (comp.id) {
                this.unuse(comp.id);
                cleanups[comp.id] = [];
                gc = cleanups[comp.id];
                compStates.set(comp.id, comp);
                // supporting tagsAsComponents
                if (treatTagsAsComponents) tags.add(comp.id);
            }
            else {
                anonymousCompStates.push(comp);
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
                            onCurCompCleanup = (c: any) => gc.push(c);
                            comp[key]?.();
                            onCurCompCleanup = null;
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
                        const originalCompId = compStates.values().find(c =>
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
                        if (!compIds.has(dep)) {
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
                    onCurCompCleanup = (c: any) => gc.push(c);
                    comp.add.call(this);
                    onCurCompCleanup = null;
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
        unuse(this: GameObj, id: string) {
            if (compStates.has(id)) {
                // check all components for a dependent, if there's one, throw an error
                for (const comp of compStates.values()) {
                    if (comp.require && comp.require.includes(id)) {
                        throw new Error(
                            `Can't unuse. Component "${comp.id}" requires component "${id}"`,
                        );
                    }
                }

                compStates.delete(id);
                compIds.delete(id);

                this.trigger("unuse", id);
                _k.game.events.trigger("unuse", this, id);
            }
            else if (treatTagsAsComponents && tags.has(id)) {
                tags.delete(id);
            }

            if (cleanups[id]) {
                cleanups[id].forEach((e) => e());
                delete cleanups[id];
            }
        },

        c(id: Tag): Comp | null {
            return compStates.get(id) ?? null;
        },

        get<T = any>(t: Tag | Tag[], opts: GetOpt = {}): GameObj<T>[] {
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

            list = list.filter((child) =>
                t ? checkTagsOrComps(child, t) : true
            );

            if (opts.liveUpdate) {
                const isChild = (obj: GameObj) => {
                    return opts.recursive
                        ? this.isAncestorOf(obj)
                        : obj.parent === this;
                };

                const events: KEventController[] = [];

                // TODO: clean up when obj destroyed
                events.push(_k.k.onAdd((obj) => {
                    if (isChild(obj) && checkTagsOrComps(obj, t)) {
                        list.push(obj);
                    }
                }));
                events.push(_k.k.onDestroy((obj) => {
                    if (checkTagsOrComps(obj, t)) {
                        const idx = list.findIndex((o) => o.id === obj.id);
                        if (idx !== -1) {
                            list.splice(idx, 1);
                        }
                    }
                }));
                // If tags are components, we need to use these callbacks, whether watching tags or components
                // If tags are not components, we only need to use these callbacks if this query looks at components
                if (treatTagsAsComponents || opts.only !== "tags") {
                    events.push(_k.k.onUse((obj, id) => {
                        if (isChild(obj) && checkTagsOrComps(obj, t)) {
                            const idx = list.findIndex((o) => o.id === obj.id);
                            if (idx == -1) {
                                list.push(obj);
                            }
                        }
                    }));
                    events.push(_k.k.onUnuse((obj, id) => {
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
                if (!treatTagsAsComponents && opts.only !== "comps") {
                    events.push(_k.k.onTag((obj, tag) => {
                        if (isChild(obj) && checkTagsOrComps(obj, t)) {
                            const idx = list.findIndex((o) => o.id === obj.id);
                            if (idx == -1) {
                                list.push(obj);
                            }
                        }
                    }));
                    events.push(_k.k.onUntag((obj, tag) => {
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
                        ? this.parent.children.filter((o: GameObj) =>
                            o !== this
                        )
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
                    list = list.filter(o =>
                        o.pos && this.pos.sdist(o.pos) > sdist
                    );
                }
            }
            if (opt.name) {
                list = list.filter(o => o.name === opt.name);
            }
            return list;
        },

        isAncestorOf(obj: GameObj) {
            if (!obj.parent) {
                return false;
            }
            return obj.parent === this || this.isAncestorOf(obj.parent);
        },

        exists(this: GameObj): boolean {
            return _k.game.root.isAncestorOf(this);
        },

        // Tags related
        // Check if gameobj has a tag
        is(tag: Tag | Tag[], op: "or" | "and" = "and"): boolean {
            if (Array.isArray(tag)) {
                if (op === "and") {
                    return tag.every(tag => tags.has(tag));
                }
                else {
                    return tag.some(tag => tags.has(tag));
                }
            }
            else {
                return tags.has(tag);
            }
        },

        // Tag a game object
        tag(tag: Tag | Tag[]): void {
            if (Array.isArray(tag)) {
                for (const t of tag) {
                    tags.add(t);
                    this.trigger("tag", t);
                    _k.game.events.trigger("tag", this as GameObj, t);
                }
            }
            else {
                tags.add(tag);
                this.trigger("tag", tag);
                _k.game.events.trigger("tag", this as GameObj, tag);
            }
        },

        // Untag a game object
        untag(this: GameObj, tag: Tag | Tag[]): void {
            if (Array.isArray(tag)) {
                for (const t of tag) {
                    tags.delete(t);
                    this.trigger("untag", t);
                    _k.game.events.trigger("untag", this, t);
                }
            }
            else {
                tags.delete(tag);
                this.trigger("untag", tag);
                _k.game.events.trigger("untag", this, tag);
            }
        },

        // Check if gameobj has a component. It also checks many components with
        has(compList: string | string[], op: "and" | "or" = "and"): boolean {
            if (Array.isArray(compList)) {
                if (op === "and") {
                    return compList.every((c) => compStates.has(c));
                }
                else {
                    return compList.some(c => compStates.has(c));
                }
            }
            else {
                return compStates.has(compList);
            }
        },

        on(
            name: string,
            action: (...args: unknown[]) => void,
        ): KEventController {
            const ctrl = ((func) => {
                switch (name) {
                    case "fixedUpdate":
                        return fixedUpdateEvents.add(func);
                    case "update":
                        return updateEvents.add(func);
                    case "draw":
                        return drawEvents.add(func);
                    default:
                        return events.on(name, func);
                }
            })(action.bind(this));
            if (onCurCompCleanup) {
                onCurCompCleanup(() => ctrl.cancel());
            }
            return ctrl;
        },

        trigger(name: string, ...args: unknown[]): void {
            events.trigger(name, ...args);
        },

        destroy(this: GameObj) {
            if (this.parent) {
                this.parent.remove(this);
            }
        },

        inspect() {
            const info = {} as GameObjInspect;

            for (const [tag, comp] of compStates) {
                info[tag] = comp.inspect?.() ?? null;
            }

            for (const [i, comp] of anonymousCompStates.entries()) {
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

        clearEvents() {
            events.clear();
            fixedUpdateEvents.clear();
            updateEvents.clear();
            drawEvents.clear();
        },
    } satisfies Omit<GameObjRaw, AppEvents>;

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
        // @ts-ignore
        obj[e] = (...args: [any]) => {
            // @ts-ignore
            const ev = _k.app[e]?.(...args);
            inputEvents.push(ev);

            obj.onDestroy(() => ev.cancel());

            // This only happens if obj.has("stay");
            obj.on("sceneEnter", () => {
                // All app events are already canceled by changing the scene
                // so we don't need to event.cancel();
                inputEvents.splice(inputEvents.indexOf(ev), 1);
                // create a new event with the same arguments
                // @ts-ignore
                const newEv = _k.app[e]?.(...args);

                // Replace the old event handler with the new one
                // old KEventController.cancel() => new KEventController.cancel()
                KEventController.replace(ev, newEv);
                inputEvents.push(ev);
            });

            return ev;
        };
    }

    // Adding components passed from add([]);
    // We register here: The objects, because you can also pass tags to add().
    let comps = [];
    let tagList = [];

    for (const compOrTag of compsAndTags) {
        if (typeof compOrTag == "string") {
            tagList.push(compOrTag);
        }
        else {
            const compId = (<Comp> compOrTag).id;

            if (compId) {
                compIds.add(compId);
                if (treatTagsAsComponents) tagList.push(compId);
            }

            comps.push(compOrTag);
        }
    }

    // Using .use and .tag we trigger onUse and onTag events correctly
    for (const comp of comps) {
        obj.use(<Comp> comp);
    }

    for (const tag of tagList) {
        obj.tag(tag);
    }

    return obj as unknown as GameObj<T[number]>;
}
