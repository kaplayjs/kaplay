import type { GameObjRaw } from "../../entity/GameObjRawPrototype";

const PausedComp = {
    add(this: GameObjRaw) {
        this.paused = true;
    },
};

export function paused() {
    return PausedComp;
}
