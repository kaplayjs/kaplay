import { anchor, boom, pos, scale, sprite, stay, timer } from "../components";
import { boomSprite, game, kaSprite } from "../kaplay";
import type { Vec2 } from "../math";
import type { CompList, GameObj } from "../types";

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
    const kaboom = game.root.add([
        pos(p),
        stay(),
    ]);

    const speed = (opt.speed || 1) * 5;
    const s = opt.scale || 1;

    kaboom.add([
        sprite(boomSprite),
        scale(0),
        anchor("center"),
        boom(speed, s),
        ...opt.comps ?? [],
    ]);

    const ka = kaboom.add([
        sprite(kaSprite),
        scale(0),
        anchor("center"),
        timer(),
        ...opt.comps ?? [],
    ]);

    ka.wait(0.4 / speed, () => ka.use(boom(speed, s)));
    ka.onDestroy(() => kaboom.destroy());

    return kaboom;
}
