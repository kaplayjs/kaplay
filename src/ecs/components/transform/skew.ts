import { vec2, type Vec2Args } from "../../../math/math";
import { type SerializedVec2, Vec2 } from "../../../math/Vec2";
import type { Comp } from "../../../types";

/**
 * The serialized {@link skew `skew()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedSkewComp {
    skew: SerializedVec2;
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

    let _skew = vec2(...args);

    return {
        id: "skew",
        set skew(value: Vec2) {
            if (value instanceof Vec2 === false) {
                throw Error(
                    "The scale property on skew is a vector.",
                );
            }

            _skew = vec2(value);
        },
        get skew() {
            return _skew;
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
