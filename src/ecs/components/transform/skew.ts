import { vec2, type Vec2Args } from "../../../math/math";
import { Vec2, type Vec2Like } from "../../../math/Vec2";
import type { Comp } from "../../../types";
import {
    type InternalGameObjRaw,
    nextTransformVersion,
} from "../../entity/GameObjRaw";

/**
 * The serialized {@link skew `skew()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedSkewComp {
    skew: Vec2Like;
}

/**
 * The {@link skew `skew()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SkewComp extends Comp {
    /**
     * The current skew of the object
     *
     * @returns The current skew of the object as a {@link Vec2 `Vec2`}
     */
    skew: Vec2;
    /**
     * Serialize the current state comp
     */
    serialize(): SerializedSkewComp;
}

export function skew(...args: Vec2Args): SkewComp {
    if (args.length === 0) {
        return skew(1);
    }

    const _skew = vec2(...args);
    let skewProxy: Vec2 | null = null;

    return {
        id: "skew",

        add() {
            (this as any as InternalGameObjRaw)._transformVersion =
                nextTransformVersion();
        },

        get skew(): Vec2 {
            if (!skewProxy) {
                const self = this;
                skewProxy = new Proxy(_skew, {
                    set(target, prop, value) {
                        Reflect.set(target, prop, value);
                        (self as any as InternalGameObjRaw)._transformVersion =
                            nextTransformVersion();
                        return true;
                    },
                });
            }
            return skewProxy;
        },
        set skew(value: Vec2) {
            if (value instanceof Vec2 === false) {
                throw Error(
                    `The skew property is a vector. Pass a vec2, not ${typeof value}.`,
                );
            }
            _skew.x = value.x;
            _skew.y = value.y;
            (this as any as InternalGameObjRaw)._transformVersion =
                nextTransformVersion();
        },

        inspect() {
            if (_skew.x == _skew.y) {
                return `skew: ${_skew.x.toFixed(1)}x`;
            }
            else {
                return `skew: (${_skew.x.toFixed(1)}x, ${_skew.y.toFixed(1)}y)`;
            }
        },
        serialize() {
            return { skew: this.skew.serialize() };
        },
    };
}

export function skewFactory(data: SerializedSkewComp) {
    return skew(data.skew.x, data.skew.y);
}
