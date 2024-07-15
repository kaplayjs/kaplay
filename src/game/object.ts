import { game } from "../kaboom";
import type { GameObj } from "../types";

export function destroy(obj: GameObj) {
    obj.destroy();
}

export function getTreeRoot(): GameObj {
    return game.root;
}
