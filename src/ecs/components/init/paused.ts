import type { GameObj } from "../../../types";

const PausedComp = {
    add(this: GameObj) {
        this.paused = true;
    },
};

export function paused() {
    return PausedComp;
}
