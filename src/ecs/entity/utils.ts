import { _k } from "../../_k";
import type { GameObj } from "../../types";

export function destroy(obj: GameObj) {
    obj.destroy();
}

export function getTreeRoot(): GameObj {
    return _k.game.root;
}

export function isFixed(obj: GameObj): boolean {
    if (obj.fixed) return true;
    return obj.parent ? isFixed(obj.parent) : false;
}
