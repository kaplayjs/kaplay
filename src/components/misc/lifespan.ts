import { game } from "../../kaplay";
import easings from "../../math/easings";
import type { EmptyComp, GameObj } from "../../types";
import type { OpacityComp } from "../draw/opacity";

/**
 * The {@link lifespan `lifespan()`} component.
 *
 * @group Component Types
 */
export interface LifespanCompOpt {
    /**
     * Fade out duration (default 0 which is no fade out).
     */
    fade?: number;
}

export function lifespan(time: number, opt: LifespanCompOpt = {}): EmptyComp {
    if (time == null) {
        throw new Error("lifespan() requires time");
    }
    const fade = opt.fade ?? 0;
    return {
        id: "lifespan",
        require: ["opacity"],
        async add(this: GameObj<OpacityComp>) {
            await game.root.wait(time);
            this.opacity = this.opacity ?? 1;
            if (fade > 0) {
                await game.root.tween(
                    this.opacity,
                    0,
                    fade,
                    (a) => this.opacity = a,
                    easings.linear,
                );
            }
            this.destroy();
        },
    };
}
