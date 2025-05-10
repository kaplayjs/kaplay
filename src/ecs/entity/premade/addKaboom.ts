import { _k } from "../../../kaplay";
import type { Vec2 } from "../../../math/Vec2";
import type { CompList, GameObj } from "../../../types";
import { sprite } from "../../components/draw/sprite";
import { boom } from "../../components/misc/boom";
import { stay } from "../../components/misc/stay";
import { timer } from "../../components/misc/timer";
import { anchor } from "../../components/transform/anchor";
import { pos } from "../../components/transform/pos";
import { scale } from "../../components/transform/scale";

/**
 * @group Options
 */
export interface BoomOpt {
    /**
     * Animation speed.
     */
    speed?: number;
    /**
     * Scale.
     */
    scale?: number;
    /**
     * Additional components.
     *
     * @since v3000.0
     */
    comps?: CompList<any>;
}

export function addKaboom(p: Vec2, opt: BoomOpt = {}): GameObj {
    if (!_k.game.boomSprite || !_k.game.kaSprite) {
        throw new Error("You can't use addKaboom without the sprites loaded");
    }

    const kaboom = _k.game.root.add([
        pos(p),
        stay(),
    ]);

    const speed = (opt.speed || 1) * 5;
    const s = opt.scale || 1;

    kaboom.add([
        sprite(_k.game.boomSprite),
        scale(0),
        anchor("center"),
        boom(speed, s),
        ...opt.comps ?? [],
    ]);

    const ka = kaboom.add([
        sprite(_k.game.kaSprite),
        scale(0),
        anchor("center"),
        timer(),
        ...opt.comps ?? [],
    ]);

    ka.wait(0.4 / speed, () => ka.use(boom(speed, s)));
    ka.onDestroy(() => kaboom.destroy());

    return kaboom;
}
