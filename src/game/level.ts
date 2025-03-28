import { level, type LevelComp } from "../ecs/components/level/level";
import { pos, type PosComp } from "../ecs/components/transform/pos";
import { _k } from "../kaplay";
import { vec2 } from "../math/math";
import type { AddLevelOpt, GameObj } from "../types.ts";

export function addLevel(
    map: string[],
    opt: AddLevelOpt,
    parent: GameObj = _k.game.root,
): GameObj<PosComp | LevelComp> {
    return parent.add([pos(opt.pos ?? vec2(0)), level(map, opt)]);
}
