import { _k } from "../../shared.js";
import type { GameObj } from "../../types.js";

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

export function isPaused(obj: GameObj): boolean {
    if (obj.paused) return true;
    return obj.parent ? isPaused(obj.parent) : false;
}
