import { vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { GameObj } from "../../../types";
import {
    level,
    type LevelComp,
    type LevelCompOpt,
} from "../../components/level/level";
import { pos, type PosComp } from "../../components/transform/pos";

/**
 * Options for the {@link addLevel `addLevel()`}.
 *
 * @group Game Obj
 * @subgroup Types
 */
export interface AddLevelOpt extends LevelCompOpt {
    /**
     * Position of the first block.
     */
    pos?: Vec2;
}

export function addLevel(
    map: string[],
    opt: AddLevelOpt,
    parent: GameObj = _k.game.root,
): GameObj<PosComp | LevelComp> {
    return parent.add([pos(opt.pos ?? vec2(0)), level(map, opt)]);
}
