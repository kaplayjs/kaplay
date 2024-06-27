import { Vec2 } from "../../math";
import type { Comp, GameObj, PosComp } from "../../types";

export interface PatrolComp extends Comp {
    /*
     * Path to follow. If null, doesn't move.
     */
    waypoints?: Vec2[];
    /*
     * Speed of the movement during patrol.
     */
    patrolSpeed: number;
    /*
     * Current subgoal, if any.
     */
    nextLocation: Vec2 | null;
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
    let endBehavior = opts.endBehavior || "ping-pong"; // Default is traveling the reverse path back to the start.
    let index = 0;
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
        },
        get nextLocation() {
            return waypoints ? waypoints[index] : null;
        },
        update(this: GameObj<PatrolComp | PosComp>) {
            if (!waypoints) return;
            this.moveTo(this.nextLocation, speed);
            if (this.pos.sdist(this.nextLocation) < 4) {
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
                        break;
                }
            }
        },
    };
}
