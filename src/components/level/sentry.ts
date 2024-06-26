import { getKaboomContext } from "../../kaboom";
import { Vec2 } from "../../math";
import type { Comp, GameObj, PosComp, QueryOpt } from "../../types";
import type { EventController } from "../../utils";
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
    onObjectsSpotted(cb: (objects: GameObj[]) => void): EventController;
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
    direction?: Vec2;
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
    let t = 0;
    const get: SentryCandidatesCb = typeof candidates === "function"
        ? candidates
        : () => {
            return k.query(candidates);
        };
    const checkFrequency = opts.checkFrequency || 1;
    return {
        id: "sentry",
        require: ["pos"],
        direction: opts.direction,
        spotted: [],
        set directionAngle(value: number) {
            this.direction = value !== undefined
                ? Vec2.fromAngle(value)
                : undefined;
        },
        get directionAngle(): number {
            return this.direction ? this.direction.angle() : undefined;
        },
        fieldOfView: opts.fieldOfView || 200,
        update(this: GameObj<SentryComp | PosComp>) {
            t += k.dt();
            if (t > checkFrequency) {
                t -= checkFrequency;
                let objects = get();
                // If fieldOfView is used, keep only object within view
                if (
                    this.direction && this.fieldOfView && this.fieldOfView < 360
                ) {
                    const halfAngle = this.fieldOfView / 2;
                    objects = objects.filter(o =>
                        o.pos
                        && this.direction.angleBetween(o.pos.sub(this.pos))
                            <= halfAngle
                    );
                }
                // If lineOfSight is used, raycast
                if (opts.lineOfSight) {
                    objects = objects.filter(o => {
                        const hit = raycast(
                            this.pos,
                            o.pos.sub(this.pos),
                            opts.raycastExclude,
                        );
                        return hit.object === o;
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
