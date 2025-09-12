import { _k } from "../../shared";
import type { GameObj } from "../../types";

export function destroy(obj: GameObj) {
    obj.destroy();
}

export function getTreeRoot(): GameObj {
    return _k.game.root;
}

const is = (
    obj: GameObj | null,
    field: "paused" | "fixed" | "hidden",
): boolean => obj ? (obj[field] ? true : is(obj.parent, field)) : false;

export const isFixed = (obj: GameObj): boolean => is(obj, "fixed");
export const isPaused = (obj: GameObj): boolean => is(obj, "paused");
export const isHidden = (obj: GameObj): boolean => is(obj, "hidden");
