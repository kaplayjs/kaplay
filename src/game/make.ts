import type { App } from "../app";
import type {
    FixedComp,
    MaskComp,
    PosComp,
    RotateComp,
    ScaleComp,
} from "../components";
import { COMP_DESC, COMP_EVENTS } from "../constants";
import {
    flush,
    popTransform,
    pushRotate,
    pushScaleV,
    pushTransform,
    pushTranslateV,
} from "../gfx";
import { _k } from "../kaplay";
import { Mat23 } from "../math/math";
import { calcTransform } from "../math/various";
import {
    type Comp,
    type CompList,
    type GameObj,
    type GameObjInspect,
    type GetOpt,
    type QueryOpt,
    type Tag,
} from "../types";
import { KEventController, KEventHandler, uid } from "../utils";
import type { Game } from "./game";

export enum KeepFlags {
    Pos = 1,
    Angle = 2,
    Scale = 4,
    All = 7,
}

export type SetParentOpt = {
    keep: KeepFlags;
};

export function make<T>(comps: CompList<T> = []): GameObj<T> {
    const compStates = new Map<string, Comp>();
    const anonymousCompStates: Comp[] = [];
    const cleanups = {} as Record<string, (() => unknown)[]>;
    const events = new KEventHandler();
    const inputEvents: KEventController[] = [];
    const tags = new Set<Tag>("*");
    const treatTagsAsComponents = _k.globalOpt.tagsAsComponents;
    let onCurCompCleanup: Function | null = null;
    let paused = false;
    let _parent: GameObj;

    // the game object without the event methods, added later
    const obj: Omit<GameObj, keyof typeof evs> = {
        id: uid(),
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

        setParent(p: GameObj, opt: SetParentOpt) {
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

        add<T2>(this: GameObj, a: CompList<T2> | GameObj<T2>): GameObj<T2> {
            const obj = Array.isArray(a) ? make(a) : a;
            if (obj.parent) {
                throw new Error(
                    "Cannot add a game obj that already has a parent.",
                );
            }
            obj.parent = this;
            calcTransform(obj, obj.transform);
            // TODO: trigger add for children
            obj.trigger("add", obj);
            _k.game.events.trigger("add", obj);
            return obj;
        },

        readd(obj: GameObj): GameObj {
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
            this.trigger("fixedUpdate");
        },

        update(this: GameObj) {
            if (this.paused) return;
            this.children
                /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                .forEach((child) => child.update());
            this.trigger("update");
        },

        draw(
            this: GameObj<
                PosComp | ScaleComp | RotateComp | FixedComp | MaskComp
            >,
        ) {
            if (this.hidden) return;
            if (this.canvas) {
                flush();
                this.canvas.bind();
            }
            const f = _k.gfx.fixed;
            if (this.fixed) _k.gfx.fixed = true;
            pushTransform();
            pushTranslateV(this.pos);
            pushScaleV(this.scale);
            pushRotate(this.angle);
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
                    this.trigger("draw");
                });
            }
            else {
                this.trigger("draw");
                for (let i = 0; i < children.length; i++) {
                    children[i].draw();
                }
            }
            popTransform();
            _k.gfx.fixed = f;
            if (this.canvas) {
                flush();
                this.canvas.unbind();
            }
        },

        drawInspect(this: GameObj<PosComp | ScaleComp | RotateComp>) {
            if (this.hidden) return;
            pushTransform();
            pushTranslateV(this.pos);
            pushScaleV(this.scale);
            pushRotate(this.angle);
            this.children
                /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                .forEach((child) => child.drawInspect());
            this.trigger("drawInspect");
            popTransform();
        },

        // use a comp
        use(this: GameObj, comp: Comp) {
            if (typeof comp == "string") {
                // for use add(["tag"])
                return tags.add(comp);
            }
            else if (!comp || typeof comp != "object") {
                throw new Error(
                    `You can only pass a component or a string to .use(), you passed a "${typeof comp}"`,
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

            for (const k in comp) {
                if (COMP_DESC.has(k)) {
                    continue;
                }

                const prop = Object.getOwnPropertyDescriptor(comp, k);
                if (!prop) continue;

                if (typeof prop.value === "function") {
                    // @ts-ignore
                    comp[k] = comp[k].bind(this);
                }

                if (prop.set) {
                    Object.defineProperty(comp, k, {
                        set: prop.set.bind(this),
                    });
                }

                if (prop.get) {
                    Object.defineProperty(comp, k, {
                        get: prop.get.bind(this),
                    });
                }

                if (COMP_EVENTS.has(k)) {
                    // automatically clean up events created by components in add() stage
                    const func = k === "add"
                        ? () => {
                            onCurCompCleanup = (c: any) => gc.push(c);
                            comp[k]?.();
                            onCurCompCleanup = null;
                        }
                        : comp[<keyof typeof comp>k];
                    gc.push(this.on(k, <any>func).cancel);
                }
                else {
                    if (this[k] === undefined) {
                        // assign comp fields to game obj
                        Object.defineProperty(this, k, {
                            get: () => comp[<keyof typeof comp>k],
                            set: (val) => comp[<keyof typeof comp>k] = val,
                            configurable: true,
                            enumerable: true,
                        });
                        gc.push(() => delete this[k]);
                    }
                    else {
                        const originalCompId = compStates.values().find(c =>
                            (c as any)[k] !== undefined
                        )?.id;
                        throw new Error(
                            `Duplicate component property: "${k}" while adding component "${comp.id}"`
                            + (originalCompId
                                ? ` (originally added by "${originalCompId}")`
                                : ""),
                        );
                    }
                }
            }

            // check for component dependencies
            const checkDeps = () => {
                if (!comp.require) return;
                for (const dep of comp.require) {
                    if (!this.c(dep)) {
                        throw new Error(
                            `Component "${comp.id}" requires component "${dep}"`,
                        );
                    }
                }
            };

            if (comp.destroy) {
                gc.push(comp.destroy.bind(this));
            }

            // manually trigger add event if object already exist
            if (this.exists()) {
                checkDeps();
                if (comp.add) {
                    onCurCompCleanup = (c: any) => gc.push(c);
                    comp.add.call(this);
                    onCurCompCleanup = null;
                }
                if (comp.id) {
                    this.trigger("use", comp.id);
                    _k.game.events.trigger("use", this, comp.id);
                }
            }
            else {
                if (comp.require) {
                    gc.push(this.on("add", checkDeps).cancel);
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
            return list;
        },

        query(opt: QueryOpt) {
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
        tag(this: GameObj, tag: Tag | Tag[]): void {
            if (Array.isArray(tag)) {
                for (const t of tag) {
                    tags.add(t);
                    this.trigger("tag", t);
                    _k.game.events.trigger("tag", this, t);
                }
            }
            else {
                tags.add(tag);
                this.trigger("tag", tag);
                _k.game.events.trigger("tag", this, tag);
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
            const ctrl = events.on(name, action.bind(this));
            if (onCurCompCleanup) {
                onCurCompCleanup(() => ctrl.cancel());
            }
            return ctrl;
        },

        trigger(name: string, ...args: unknown[]): void {
            events.trigger(name, ...args);
            _k.game.objEvents.trigger(name, this, ...args);
        },

        destroy() {
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
        },
    };

    const evs = [
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
    ] as unknown as [keyof Pick<App, "onKeyPress">];

    for (const e of evs) {
        obj[e] = (...args: [any]) => {
            const ev = _k.app[e]?.(...args);
            inputEvents.push(ev);

            obj.onDestroy(() => ev.cancel());
            obj.on("sceneEnter", () => {
                // All app events are already canceled by changing the scene
                // not neccesary -> ev.cancel();
                inputEvents.splice(inputEvents.indexOf(ev), 1);
                // create a new event with the same arguments
                const newEv = _k.app[e]?.(...args);

                // Replace the old event handler with the new one
                // old KEventController.cancel() => new KEventController.cancel()
                KEventController.replace(ev, newEv);
                inputEvents.push(ev);
            });

            return ev;
        };
    }

    for (const comp of comps) {
        obj.use(comp as string | Comp);
    }

    return obj as GameObj<T>;
}
