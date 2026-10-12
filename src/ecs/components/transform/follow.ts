import type { KEventController } from "../../../events/events";
import { vec2 } from "../../../math/math";
import { type SerializedVec2, Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj, Tag } from "../../../types";
import { exists } from "../../entity/utils";
import type { PosComp } from "./pos";

/**
 * The serialized {@link follow `follow()`} component.
 * The `obj` properties depend on object or value passed.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedFollowComp {
    obj: {
        /**
         * From object that uses `named()` comp.
         * During deserialization, uniqueness/correctness are not guaranteed, and the obj must already exist.
         */
        name?: string;
        /**
         * Object tag, preferably a singleton one (`KAPLAYOpt.singletonTags`}).
         * **The safest way** to retrieve the correct obj after deserialization.
         *
         * Note: If the referenced obj is included in a prefab, the singleton tag will always resolve to the last one created.
         */
        tag?: Tag;
        /**
         * If a raw obj is passed, a unique identifier is used that only works for objects outside of prefabs.
         * Only viable during runtime prefab creation and immediate use within the same scene.
         */
        uid?: string;
    };
    offset: SerializedVec2;
}

/**
 * The {@link follow `follow()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface FollowComp extends Comp {
    follow: {
        /**
         * The followed object.
         */
        get obj(): GameObj | null;
        /**
         * The object to follow.
         */
        set obj(o: GameObj | string | null);
        /**
         * The offset to follow the object by.
         */
        offset: Vec2;
    };
    /**
     * Note: Use with a `KAPLAYOpt.singletonTags` to ensure correct object resolution after deserialization.
     */
    serialize(): SerializedFollowComp;
}

const _followedUids = new Set<string>();

export function follow(
    obj: GameObj | string | null,
    offset?: Vec2,
): FollowComp {
    let _refreshObj = false;
    let _byTag = false;
    let _obj: GameObj | null = null;
    let _objUid: string;
    let _objDestroyController: KEventController;
    let _objUntagController: KEventController;

    function _resolveObj(o: typeof obj) {
        if (typeof o !== "string") return o;
        return ((_byTag = !!_k.globalOpt.singletonTags?.includes(o))
            ? _k.game.root.get(o, { recursive: true })[0]
            : _k.game.root.get("*", { recursive: true }).find(
                f => f?.name === o || (_byTag = f.is(o)),
            )) ?? null;
    }

    const _onObjChange = (o: GameObj | null) => {
        _followedUids.delete(_objUid);
        _objUid = "";
        _objDestroyController?.cancel();
        _objUntagController?.cancel();
        if (!o) return;

        _objUid = `${performance.now()}-${o.id}`;
        _followedUids.add(_objUid);
        _objDestroyController = o?.onDestroy(() => {
            _objUntagController?.cancel();
            _followedUids.delete(_objUid);
        });

        if (_byTag && typeof obj === "string") {
            _objUntagController = o?.onUntag(t => {
                if (t !== obj) return;
                _refreshObj = true;
                _objUntagController.cancel();
            });
        }
    };

    return {
        id: "follow",
        require: ["pos"],
        follow: {
            get obj(): GameObj | null {
                if (_refreshObj) {
                    _obj = _resolveObj(obj);
                    if (_obj) {
                        _refreshObj = false;
                        _onObjChange(_obj);
                    }
                    return _obj;
                }
                return _obj = _resolveObj(_obj);
            },
            set obj(o: GameObj | string | null) {
                obj = o;
                _obj = _resolveObj(o);
                _onObjChange(_obj);
            },
            offset: offset ?? vec2(0),
        },
        add(this: GameObj<FollowComp | PosComp>) {
            _obj = _resolveObj(obj);
            _onObjChange(_obj);

            if (this.follow.obj && exists(this.follow.obj)) {
                _onObjChange(this.follow.obj);
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
        update(this: GameObj<FollowComp | PosComp>) {
            if (this.follow.obj && exists(this.follow.obj)) {
                this.pos = this.follow.obj.pos.add(this.follow.offset);
            }
        },
        destroy() {
            _followedUids.delete(_objUid);
            _objDestroyController?.cancel();
        },
        serialize() {
            const singletonTags = _k.globalOpt.singletonTags;
            const data: SerializedFollowComp = {
                obj: {},
                offset: this.follow.offset.serialize(),
            };

            if (_obj?.has("named")) data.obj.name = _obj.name;

            if (_byTag && typeof obj === "string") data.obj.tag = obj;
            if (!data.obj.tag && singletonTags?.length && _obj?.tags) {
                for (const tag of _obj?.tags) {
                    if (singletonTags.includes(tag)) {
                        data.obj.tag = tag;
                        break;
                    }
                }
            }

            if (_objUid) data.obj.uid = _objUid;

            return data;
        },
    };
}

export function followFactory(data: SerializedFollowComp) {
    let obj = null;
    // Try and pass a `singletonTag` first
    if (data.obj.tag && _k.globalOpt.singletonTags?.includes(data.obj.tag)) {
        obj = data.obj.tag;
    }
    // If prefab is used during runtime and references a raw object outside of prefab
    // and no other obj ref is deductible (basically skipped if within prefab/not in runtime)
    // The only safe way of retrieving raw obj ref with no false positives
    else if (data.obj.uid && _followedUids.has(data.obj.uid)) {
        const id = parseInt(data.obj.uid.split("-")[1]);
        obj = _k.game.root.get("*", { recursive: true }).find(o => o.id === id);
    }

    // Falls back to:
    // - name from named() comp (correctness not guaranteed but possibly viable use during runtime)
    // - tag if used but not a singletonTag
    return follow(
        obj ?? data.obj.name ?? data.obj.tag ?? null,
        Vec2.deserialize(data.offset),
    );
}
