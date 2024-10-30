import { _k } from "../kaplay";
import type { GameObj } from "../types";

export function destroy(obj: GameObj) {
    obj.destroy();
}

export function getTreeRoot(): GameObj {
    return _k.game.root;
}
