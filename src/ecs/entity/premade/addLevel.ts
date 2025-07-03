import { vec2 } from "../../../math/math.js";
import type { Vec2 } from "../../../math/Vec2.js";
import { _k } from "../../../shared.js";
import type { GameObj } from "../../../types.js";
import {
    level,
    type LevelComp,
    type LevelOpt,
} from "../../components/level/level.js";
import { pos, type PosComp } from "../../components/transform/pos.js";

/**
 * Options for the {@link addLevel `addLevel()`}.
 *
 * @group Options
 */
export interface AddLevelOpt extends LevelOpt {
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
