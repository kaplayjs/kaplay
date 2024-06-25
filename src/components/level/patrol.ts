import { Vec2 } from "../../math";
import type { Comp, GameObj, PosComp, QueryOpt } from "../../types";

export interface PatrolComp extends Comp {
    patrolSpeed: number;
    nextLocation: Vec2;
}

type PatrolEndBehavior =
    /* Go directly bak to the start */
    | "loop"
    | /* Traveling the reverse path back to the start */ "ping-pong"
    | /* Stop */ "stop";

export interface PatrolCompOpt {
    speed?: number;
    endBehavior?: PatrolEndBehavior;
}

export function patrol(
    waypoints: Vec2[],
    opts: PatrolCompOpt = {},
): PatrolComp {
    let speed = opts.speed || 100; // Or throw error?
    let endBehavior = opts.endBehavior || "ping-pong"; // Default is traveling the reverse path back to the start.
    let index = 0;
    return {
        id: "patrol",
        get patrolSpeed() {
            return speed;
        },
        set patrolSpeed(value) {
            speed = value;
        },
        get nextLocation() {
            return waypoints[index];
        },
        update(this: GameObj<PatrolComp | PosComp>) {
            // TODO: When this object has agent, movement should happen through agent instead
            this.moveTo(this.nextLocation, speed);
            if (this.pos.sdist(this.nextLocation) < 4) {
                switch (endBehavior) {
                    case "loop":
                        index = (index + 1) % waypoints.length;
                        break;
                    case "ping-pong":
                        index = index + 1;
                        if (index = waypoints.length) {
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
