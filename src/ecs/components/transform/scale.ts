import { vec2, type Vec2Args } from "../../../math/math";
import { type SerializedVec2, Vec2 } from "../../../math/Vec2";
import type { Comp } from "../../../types";
import {
    type InternalGameObjRaw,
    nextTransformVersion,
} from "../../entity/GameObjRaw";

/**
 * The serialized {@link scale `scale()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedScaleComp {
    scale: SerializedVec2;
}

/**
 * The {@link scale `scale()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface ScaleComp extends Comp {
    /**
     * The current scale of the object
     *
     * @returns The current scale of the object as a {@link Vec2 `Vec2`}
     */
    scale: Vec2;
    /**
     * Set the scale of the object to a number
     */
    scaleTo(s: number): void;
    /**
     * Set the scale of the object to a Vec2
     */
    scaleTo(s: Vec2): void;
    /**
     * Set the scale of the object to a number for x and y
     */
    scaleTo(sx: number, sy: number): void;
    /**
     * Scale the object by a number
     */
    scaleBy(s: number): void;
    /**
     * Scale the object by a Vec2
     */
    scaleBy(s: Vec2): void;
    /**
     * Scale the object by a number for x and y
     */
    scaleBy(sx: number, sy: number): void;
    /**
     * Serialize the current state comp
     */
    serialize(): SerializedScaleComp;
}

export function scale(...args: Vec2Args): ScaleComp {
    if (args.length === 0) {
        return scale(1);
    }

    const _scale = vec2(...args);
    const _scaleReadOnly = vec2(...args);

    return {
        id: "scale",

        get scale(): Vec2 {
            return _scaleReadOnly;
        },
        set scale(value: Vec2) {
            if (value instanceof Vec2 === false) {
                throw Error(
                    "The scale property on scale is a vector. Use scaleTo or scaleBy to set the scale with a number.",
                );
            }
            _scale.x = value.x;
            _scale.y = value.y;
            _scaleReadOnly.x = value.x;
            _scaleReadOnly.y = value.y;
            (this as any as InternalGameObjRaw)._transformVersion =
                nextTransformVersion();
        },

        scaleTo(...args: Vec2Args) {
            this.scale = vec2(...args);
        },
        scaleBy(...args: Vec2Args) {
            this.scale = _scale.scale(vec2(...args));
        },
        inspect() {
            if (_scale.x == _scale.y) {
                return `scale: ${_scale.x.toFixed(1)}x`;
            }
            else {
                return `scale: (${_scale.x.toFixed(1)}x, ${
                    _scale.y.toFixed(1)
                }y)`;
            }
        },
        serialize() {
            return { scale: this.scale.serialize() };
        },
    };
}

export function scaleFactory(data: SerializedScaleComp) {
    return scale(data.scale.x, data.scale.y);
}
