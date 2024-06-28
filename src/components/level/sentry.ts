import { getKaboomContext } from "../../kaboom";
import { Vec2 } from "../../math";
import type { Comp, GameObj, PosComp, QueryOpt } from "../../types";
import type { KEventController } from "../../utils";
import { raycast } from "../draw/raycast";

/**
 * The {@link sentry `sentry()`} component.
 *
 * @group Component Types
 */
export interface SentryComp extends Comp {
    /*
     * The direction the sentry is pointing to.
     */
    direction?: Vec2;
    /*
     * The direction of the sentry as an angle in degrees.
     */
    directionAngle?: number;
    /*
     * The field of view of the sentry in degrees.
     */
    fieldOfView?: number;
    /*
     * The objects spotted most recently.
     */
    spotted: GameObj<any>[];
    /*
     * Binds the event fired when objects of interest are spotted.
     */
    onObjectsSpotted(cb: (objects: GameObj[]) => void): KEventController;
    /*
     * Returns whether the object is within the field of view.
     */
    isWithinFieldOfView(
        obj: GameObj<PosComp>,
        direction?: Vec2,
        fieldOfView?: number,
    ): boolean;
    /*
     * Returns whether there is a line of sight to the object.
     */
    hasLineOfSight(obj: GameObj<PosComp>): boolean;
}

/**
 * Options for the {@link sentry `sentry()`} component.
 *
 * @group Component Types
 */
export interface SentryCompOpt {
    /*
     * The direction the sentry is pointing to. If undefined, direction has no influence.
     */
    direction?: Vec2 | number;
    /*
     * The field of view of the sentry in degrees. If undefined, defaults to human fov of 200 degrees.
     */
    fieldOfView?: number;
    /*
     * If true, line of sight matters. This means that objects which are blocked from view by areas are invisible.
     */
    lineOfSight?: boolean;
    /*
     * When using line of sight, the objects which are transparent for the ray. Include at least a tag identifying the sentry.
     */
    raycastExclude?: string[];
    /*
     * The frequency of checking, defaults to every second.
     */
    checkFrequency?: number;
}

export type SentryCandidatesCb = () => GameObj<any>[];
export type SentryCandidates = SentryCandidatesCb | QueryOpt;

export function sentry(
    candidates: SentryCandidates,
    opts: SentryCompOpt = {},
): SentryComp {
    const k = getKaboomContext(this);
    const get: SentryCandidatesCb = typeof candidates === "function"
        ? candidates
        : () => {
            return k.query(candidates);
        };
    const checkFrequency = opts.checkFrequency || 1;
    const directionVector = typeof opts.direction === "number"
        ? Vec2.fromAngle(opts.direction)
        : opts.direction;
    let t = 0;
    return {
        id: "sentry",
        require: ["pos"],
        direction: typeof opts.direction == "number"
            ? Vec2.fromAngle(opts.direction)
            : opts.direction,
        spotted: [],
        set directionAngle(value: number) {
            this.direction = value !== undefined
                ? Vec2.fromAngle(value)
                : undefined;
        },
        get directionAngle(): number {
            return this.direction ? this.direction.angle() : undefined;
        },
        fieldOfView: opts.fieldOfView || 200, // 200 degrees = Human field of view
        isWithinFieldOfView(
            this: GameObj<SentryComp | PosComp>,
            obj: GameObj<PosComp>,
            direction?: Vec2,
            fieldOfView?: number,
        ) {
            const dir: Vec2 = (typeof direction === "number"
                ? Vec2.fromAngle(direction)
                : direction) || directionVector;
            const fov: number = fieldOfView || opts.fieldOfView;
            if (!dir || !fov || fov >= 360) return true;
            const halfAngle = fov / 2;
            return obj.pos
                && dir.angleBetween(obj.pos.sub(this.pos)) <= halfAngle;
        },
        hasLineOfSight(
            this: GameObj<SentryComp | PosComp>,
            obj: GameObj<PosComp>,
        ) {
            const hit = raycast(
                this.pos,
                obj.pos.sub(this.pos),
                opts.raycastExclude,
            );
            return hit && hit.object === obj;
        },
        update(this: GameObj<SentryComp | PosComp>) {
            t += k.dt();
            if (t > checkFrequency) {
                t -= checkFrequency;
                let objects = get();
                // If fieldOfView is used, keep only object within view
                if (
                    objects.length && directionVector && this.fieldOfView
                    && this.fieldOfView < 360
                ) {
                    const halfAngle = this.fieldOfView / 2;
                    objects = objects.filter(o =>
                        o.pos
                        && directionVector.angleBetween(o.pos.sub(this.pos))
                            <= halfAngle
                    );
                }
                // If lineOfSight is used, raycast
                if (objects.length && opts.lineOfSight) {
                    objects = objects.filter(o => {
                        return o.pos
                            && this.hasLineOfSight(o as GameObj<PosComp>);
                    });
                }
                if (objects.length > 0) {
                    this.spotted = objects;
                    this.trigger("object-spotted", objects);
                }
            }
        },
        onObjectsSpotted(cb: (objects: GameObj[]) => void) {
            return this.on("object-spotted", cb);
        },
    };
}
