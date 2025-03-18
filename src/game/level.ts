import { level, pos, type LevelComp, type PosComp } from "../components";
import { _k } from "../kaplay";
import { vec2 } from "../math";
import type { AddLevelOpt, GameObj } from "../types.ts";

export function addLevel(
  map: string[],
  opt: AddLevelOpt,
  parent: GameObj = _k.game.root
): GameObj<PosComp | LevelComp> {
  return parent.add([pos(opt.pos ?? vec2(0)), level(map, opt)]);
}
