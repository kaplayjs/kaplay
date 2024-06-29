import { Vec2 } from "../../math";
import type { Comp, GameObj, PosComp } from "../../types";
import type { KEventController } from "../../utils";

export interface PatrolComp extends Comp {
    /*
     * Path to follow. If null, doesn't move.
     */
    waypoints: Vec2[] | null;
    /*
     * Speed of the movement during patrol.
     */
    patrolSpeed: number;
    /*
     * Current subgoal, if any.
     */
    nextLocation: Vec2 | null;
    /*
     * Only called when using "stop" and the path reaches its end.
     */
    onPatrolFinished(cb: (objects: GameObj[]) => void): KEventController;
}

type PatrolEndBehavior =
    /* Go directly bak to the start */
    | "loop"
    /* Traveling the reverse path back to the start */
    | "ping-pong"
    /* Stop */
    | "stop";

export interface PatrolCompOpt {
    /*
     * Path to follow. If null, starts suspended.
     */
    waypoints?: Vec2[];
    /*
     * Speed of the movement during patrol.
     */
    speed?: number;
    /*
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
            return waypoints ? waypoints[index] : null;
        },
        update(this: GameObj<PatrolComp | PosComp>) {
            const nextWaypoint = this.nextLocation
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
                            this.trigger("patrol-finished");
                        }
                        break;
                }
            }
        },
        onPatrolFinished(cb: (objects: GameObj[]) => void) {
            return this.on("patrol-finished", cb);
        },
    };
}
