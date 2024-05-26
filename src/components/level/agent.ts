import {
    AgentComp,
    AgentCompOpt,
    EventController,
    GameObj,
    PosComp,
    TileComp,
    Vec2,
} from "@/types";

export function agent(opts: AgentCompOpt = {}): AgentComp {
    let target: Vec2 | null = null;
    let path: Vec2[] | null = null;
    let index: number | null = null;
    let navMapChangedEvent: EventController | null = null;
    return {
        id: "agent",
        require: ["pos", "tile"],
        agentSpeed: opts.speed ?? 100,
        allowDiagonals: opts.allowDiagonals ?? true,
        getDistanceToTarget(this: GameObj<AgentComp | PosComp>) {
            return target ? this.pos.dist(target) : 0;
        },
        getNextLocation() {
            return path && index ? path[index] : null;
        },
        getPath() {
            return path ? path.slice() : null;
        },
        getTarget() {
            return target;
        },
        isNavigationFinished() {
            return path ? index === null : true;
        },
        isTargetReachable() {
            return path !== null;
        },
        isTargetReached(this: GameObj<AgentComp | PosComp>) {
            return target ? this.pos.eq(target) : true;
        },
        setTarget(this: GameObj<AgentComp | TileComp | PosComp>, p: Vec2) {
            target = p;
            path = this.getLevel().getPath(this.pos, target, {
                allowDiagonals: this.allowDiagonals,
            });
            index = path ? 0 : null;
            if (path) {
                if (!navMapChangedEvent) {
                    navMapChangedEvent = this.getLevel()
                        .onNavigationMapChanged(() => {
                            if (path && index !== null) {
                                path = this.getLevel().getPath(
                                    this.pos,
                                    target,
                                    {
                                        allowDiagonals: this.allowDiagonals,
                                    },
                                );
                                index = path ? 0 : null;
                                if (path) {
                                    this.trigger(
                                        "navigation-next",
                                        this,
                                        path[index],
                                    );
                                } else {
                                    this.trigger("navigation-ended", this);
                                }
                            }
                        });
                    this.onDestroy(() => navMapChangedEvent.cancel());
                }
                this.trigger("navigation-started", this);
                this.trigger("navigation-next", this, path[index]);
            } else {
                this.trigger("navigation-ended", this);
            }
        },
        update(this: GameObj<AgentComp | PosComp>) {
            if (path && index !== null) {
                if (this.pos.sdist(path[index]) < 2) {
                    if (index === path.length - 1) {
                        this.pos = target.clone();
                        index = null;
                        this.trigger("navigation-ended", this);
                        this.trigger("target-reached", this);
                        return;
                    } else {
                        index++;
                        this.trigger("navigation-next", this, path[index]);
                    }
                }
                this.moveTo(path[index], this.agentSpeed);
            }
        },
        onNavigationStarted(this: GameObj<AgentComp>, cb: () => void) {
            return this.on("navigation-started", cb);
        },
        onNavigationNext(this: GameObj<AgentComp>, cb: () => void) {
            return this.on("navigation-next", cb);
        },
        onNavigationEnded(this: GameObj<AgentComp>, cb: () => void) {
            return this.on("navigation-ended", cb);
        },
        onTargetReached(this: GameObj<AgentComp>, cb: () => void) {
            return this.on("target-reached", cb);
        },
        inspect() {
            return JSON.stringify({
                target: JSON.stringify(target),
                path: JSON.stringify(path),
            });
        },
    };
}
