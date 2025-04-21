import type { GameObjRaw } from "../../entity/GameObjRaw";

const PausedComp = {
    add(this: GameObjRaw) {
        this.paused = true;
    },
};

export function paused() {
    return PausedComp;
}
