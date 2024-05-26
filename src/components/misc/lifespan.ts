import easings from "@/easings";
import { getKaboomContext } from "@/kaboom";
import { EmptyComp, GameObj, LifespanCompOpt, OpacityComp } from "@/types";

export function lifespan(time: number, opt: LifespanCompOpt = {}): EmptyComp {
    const k = getKaboomContext(this);

    if (time == null) {
        throw new Error("lifespan() requires time");
    }
    const fade = opt.fade ?? 0;
    return {
        id: "lifespan",
        require: ["opacity"],
        async add(this: GameObj<OpacityComp>) {
            await k.wait(time);
            this.opacity = this.opacity ?? 1;
            if (fade > 0) {
                await k.tween(
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
