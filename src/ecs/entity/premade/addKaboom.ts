import type { Vec2 } from "../../../math/Vec2.js";
import { _k } from "../../../shared.js";
import type { CompList, GameObj } from "../../../types.js";
import { sprite } from "../../components/draw/sprite.js";
import { boom } from "../../components/misc/boom.js";
import { stay } from "../../components/misc/stay.js";
import { timer } from "../../components/misc/timer.js";
import { anchor } from "../../components/transform/anchor.js";
import { pos } from "../../components/transform/pos.js";
import { scale } from "../../components/transform/scale.js";

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
    if (!_k.game.defaultAssets.boom || !_k.game.defaultAssets.ka) {
        throw new Error("You can't use addKaboom with kaplay/mini");
    }

    const kaboom = _k.game.root.add([
        pos(p),
        stay(),
    ]);

    const speed = (opt.speed || 1) * 5;
    const s = opt.scale || 1;

    kaboom.add([
        sprite(_k.game.defaultAssets.boom),
        scale(0),
        anchor("center"),
        boom(speed, s),
        ...opt.comps ?? [],
    ]);

    const ka = kaboom.add([
        sprite(_k.game.defaultAssets.ka),
        scale(0),
        anchor("center"),
        timer(),
        ...opt.comps ?? [],
    ]);

    ka.wait(0.4 / speed, () => ka.use(boom(speed, s)));
    ka.onDestroy(() => kaboom.destroy());

    return kaboom;
}
