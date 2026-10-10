import { _k } from "../shared";
import type { GameObj, Tag } from "../types";

// API for `KAPLAYOpt.singletonTags`
// Singleton tags are ensured by `InternalGameObjRaw._ensureSingletonTag` during `obj.tag()`
// To get object with a singletonTag, just use regular `get("singleton-tag")?.[0]` API

export function getSingletonTags() {
    return _k.globalOpt.singletonTags;
}

export function setSingletonTags(tags: Tag[]) {
    const singletonTags = _k.globalOpt.singletonTags ??= [];
    const newTags = tags.filter(t => !singletonTags.includes(t));

    singletonTags.splice(0, singletonTags.length, ...tags);

    for (const tag of newTags) {
        const objs = _k.game.root.get(tag, { recursive: true });
        for (let i = 0; i < objs.length - 1; i++) {
            objs[i].untag(tag);
        }
    }
}

export function addSingletonTag(tag: Tag, obj?: GameObj) {
    const singletonTags = _k.globalOpt.singletonTags ??= [];

    if (singletonTags.includes(tag)) return;
    singletonTags.push(tag);

    if (obj && !obj.is(tag)) {
        obj.tag(tag);
        return;
    }

    const existing = _k.game.root.get(tag, { recursive: true });
    const len = existing.length - (obj?.exists() ? 0 : 1);
    const excludeId = obj?.id;
    for (let i = 0; i < len; i++) {
        const o = existing[i];
        if (excludeId !== o.id) o.untag(tag);
    }
}

export function removeSingletonTag(tag: Tag | Tag[]) {
    const singletonTags = getSingletonTags();
    if (!singletonTags?.length) return;

    if (Array.isArray(tag)) {
        singletonTags.splice(
            0,
            singletonTags.length,
            ...singletonTags.filter(t => !tag.includes(t)),
        );
    }
    else {
        const i = singletonTags.indexOf(tag);
        if (i !== -1) singletonTags.splice(i, 1);
    }
}

export function isSingletonTag(tag: Tag) {
    return !!getSingletonTags()?.includes(tag);
}
