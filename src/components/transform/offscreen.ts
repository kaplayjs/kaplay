import { DEF_OFFSCREEN_DIS } from "@/constants";
import { getKaboomContext } from "@/kaboom";
import { Rect, vec2 } from "@/math";
import type {
    GameObj,
    OffScreenComp,
    OffScreenCompOpt,
    PosComp,
} from "@/types";
import type { EventController } from "@/utils";

export function offscreen(opt: OffScreenCompOpt = {}): OffScreenComp {
    const k = getKaboomContext(this);
    const distance = opt.distance ?? DEF_OFFSCREEN_DIS;
    let isOut = false;

    return {
        id: "offscreen",
        require: ["pos"],
        isOffScreen(this: GameObj<PosComp>): boolean {
            const pos = this.screenPos();
            const screenRect = new Rect(vec2(0), k.width(), k.height());
            return !k.testRectPoint(screenRect, pos)
                && screenRect.sdistToPoint(pos) > distance * distance;
        },
        onExitScreen(this: GameObj, action: () => void): EventController {
            return this.on("exitView", action);
        },
        onEnterScreen(this: GameObj, action: () => void): EventController {
            return this.on("enterView", action);
        },
        update(this: GameObj) {
            if (this.isOffScreen()) {
                if (!isOut) {
                    this.trigger("exitView");
                    isOut = true;
                }
                if (opt.hide) this.hidden = true;
                if (opt.pause) this.paused = true;
                if (opt.destroy) this.destroy();
            } else {
                if (isOut) {
                    this.trigger("enterView");
                    isOut = false;
                }
                if (opt.hide) this.hidden = false;
                if (opt.pause) this.paused = false;
            }
        },
    };
}
