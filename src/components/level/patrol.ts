import { Vec2 } from "../../math/math";
import type { Comp, GameObj } from "../../types";
import type { KEventController } from "../../utils/";
import type { PosComp } from "../transform/pos";

export interface PatrolComp extends Comp {
    /**
     * Path to follow. If null, doesn't move.
     */
    waypoints: Vec2[] | undefined;
    /**
     * Speed of the movement during patrol.
     */
    patrolSpeed: number;
    /**
     * Current subgoal, if any.
     */
    nextLocation: Vec2 | undefined;
    /**
     * Attaches an event handler which is called when using "stop" and the end of the path is reached.
     * @param cb The event handler called when the patrol finishes.
     */
    onPatrolFinished(cb: (objects: GameObj[]) => void): KEventController;
}

type PatrolEndBehavior =
    /* Go directly back to the start */
    | "loop"
    /* Traveling the reverse path back to the start */
    | "ping-pong"
    /* Stop */
    | "stop";

export interface PatrolCompOpt {
    /**
     * Path to follow. If null, starts suspended.
     */
    waypoints?: Vec2[];
    /**
     * Speed of the movement during patrol.
     */
    speed?: number;
    /**
     * What to do after the last waypoint has been reached.
     */
    endBehavior?: PatrolEndBehavior;
}

export function patrol(
    opts: PatrolCompOpt = {},
): PatrolComp {
    let waypoints = opts.waypoints;
    let speed = opts.speed || 100; // Or throw error?
    let endBehavior = opts.endBehavior || "stop"; // Default is stop.
    let index = 0;
    let finished = waypoints != null;
    return {
        id: "patrol",
        require: ["pos"],
        get patrolSpeed() {
            return speed;
        },
        set patrolSpeed(value) {
            speed = value;
        },
        get waypoints() {
            return waypoints;
        },
        set waypoints(value) {
            waypoints = value;
            index = 0;
            finished = false;
        },
        get nextLocation() {
            return waypoints ? waypoints[index] : undefined;
        },
        update(this: GameObj<PatrolComp | PosComp>) {
            const nextWaypoint = this.nextLocation;
            if (!waypoints || !nextWaypoint || finished) return;
            this.moveTo(nextWaypoint, speed);
            if (this.pos.sdist(nextWaypoint) < 9) {
                switch (endBehavior) {
                    case "loop":
                        index = (index + 1) % waypoints.length;
                        break;
                    case "ping-pong":
                        index = index + 1;
                        if (index == waypoints.length) {
                            waypoints.reverse();
                            index = 0;
                        }
                        break;
                    case "stop":
                        index = Math.min(index + 1, waypoints.length - 1);
                        if (index == waypoints.length - 1) {
                            finished = true;
                            this.trigger("patrolFinished");
                        }
                        break;
                }
            }
        },
        onPatrolFinished(cb: (objects: GameObj[]) => void) {
            return (this as unknown as GameObj<PatrolComp>).on(
                "patrolFinished",
                cb,
            );
        },
    };
}
