import { easings } from "../../../math/easings";
import { _k } from "../../../shared";
import type { EmptyComp, GameObj } from "../../../types";
import type { OpacityComp } from "../draw/opacity";

/**
 * The serialized {@link lifespan `lifespan()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export type SerializedLifespanComp = LifespanCompOpt & {
    time: number;
};

/**
 * The {@link lifespan `lifespan()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface LifespanComp extends EmptyComp {
    serialize: () => SerializedLifespanComp;
}

/**
 * Options for the {@link lifespan `lifespan()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface LifespanCompOpt {
    /**
     * Fade out duration (default 0 which is no fade out).
     */
    fade?: number;
}

export function lifespan(
    time: number,
    opt: LifespanCompOpt = {},
): LifespanComp {
    if (time == null) {
        throw new Error("lifespan() requires time");
    }
    const fade = opt.fade ?? 0;
    return {
        id: "lifespan",
        require: ["opacity"],
        add(this: GameObj<OpacityComp>) {
            _k.game.root.wait(time, () => {
                this.opacity = this.opacity ?? 1;

                if (fade > 0) {
                    _k.game.root.tween(
                        this.opacity,
                        0,
                        fade,
                        (a) => this.opacity = a,
                        easings.linear,
                    ).onEnd(() => {
                        this.destroy();
                    });
                }
                else {
                    this.destroy();
                }
            });
        },
        serialize() {
            const data: SerializedLifespanComp = {
                time: time,
            };
            if (opt.fade !== undefined) data.fade = opt.fade;
            return data;
        },
    };
}

export function lifespanFactory(data: SerializedLifespanComp) {
    const { time, ...opt } = data;
    return lifespan(data.time, opt);
}
