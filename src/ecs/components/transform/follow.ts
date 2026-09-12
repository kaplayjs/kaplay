import type { KEventController } from "../../../events/events";
import { vec2 } from "../../../math/math";
import { type SerializedVec2, Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { exists } from "../../entity/utils";
import type { PosComp } from "./pos";

/**
 * The serialized {@link follow `follow()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedFollowComp {
    objUid: string;
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
         * The object to follow.
         */
        obj: GameObj | null;
        /**
         * The offset to follow the object by.
         */
        offset: Vec2;
    };
    serialize(): SerializedFollowComp;
}

const _followedUids = new Set<string>();

export function follow(obj: GameObj | null, offset?: Vec2): FollowComp {
    let _objUid: string;
    let _objDestroyController: KEventController;

    const _onObjChange = (obj: GameObj | null) => {
        _followedUids.delete(_objUid);
        _objUid = "";
        _objDestroyController?.cancel();
        if (!obj) return;

        _objUid = `${performance.now()}-${obj.id}`;
        _followedUids.add(_objUid);
        _objDestroyController = obj?.onDestroy(() =>
            _followedUids.delete(_objUid)
        );
    };

    return {
        id: "follow",
        require: ["pos"],
        follow: {
            get obj() {
                return obj;
            },
            set obj(o) {
                obj = o;
                _onObjChange(o);
            },
            offset: offset ?? vec2(0),
        },
        add(this: GameObj<FollowComp | PosComp>) {
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
            return {
                objUid: _objUid,
                offset: this.follow.offset.serialize(),
            };
        },
    };
}

export function followFactory(data: SerializedFollowComp) {
    let obj = null;
    if (_followedUids.has(data.objUid)) {
        const id = parseInt(data.objUid.split("-")[1]);
        obj = _k.game.root.get("*", { recursive: true }).find(o => o.id === id)
            ?? null;
    }
    return follow(obj, Vec2.deserialize(data.offset));
}
