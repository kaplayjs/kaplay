"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patrol = patrol;
function patrol(opts) {
    if (opts === void 0) { opts = {}; }
    var waypoints = opts.waypoints;
    var speed = opts.speed || 100; // Or throw error?
    var endBehavior = opts.endBehavior || "stop"; // Default is stop.
    var index = 0;
    var finished = false;
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
        update: function () {
            var nextWaypoint = this.nextLocation;
            if (!waypoints || !nextWaypoint || finished)
                return;
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
                        if (index < waypoints.length - 1) {
                            index += 1;
                        }
                        else if (!finished) {
                            finished = true;
                            this.trigger("patrolFinished", this);
                        }
                        break;
                }
            }
        },
        onPatrolFinished: function (cb) {
            return this.on("patrolFinished", cb);
        },
    };
}
