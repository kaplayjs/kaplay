import { KEvent } from "../../../events/events";
import { _k } from "../../../kaplay";
import easings from "../../../math/easings";
import { lerp } from "../../../math/math";
import type {
    Comp,
    GameObj,
    LerpValue,
    TimerController,
    TweenController,
} from "../../../types";

/**
 * The {@link timer `timer()`} component.
 *
 * @group Component Types
 */
export interface TimerComp extends Comp {
    /**
     * The maximum number of loops per frame allowed,
     * to keep loops with sub-frame intervals from freezing the game.
     */
    maxLoopsPerFrame: number;
    /**
     * Run the callback after n seconds.
     */
    wait(time: number, action?: () => void): TimerController;
    /**
     * Run the callback every n seconds.
     *
     * If waitFirst is false (the default), the function will
     * be called once on the very next frame, and then loop like normal.
     *
     * @since v3000.0
     */
    loop(
        time: number,
        action: () => void,
        maxLoops?: number,
        waitFirst?: boolean,
    ): TimerController;
    /**
     * Tweeeeen! Note that this doesn't specifically mean tweening on this object's property, this just registers the timer on this object, so the tween will cancel with the object gets destroyed, or paused when obj.paused is true.
     *
     * @since v3000.0
     */
    tween<V extends LerpValue>(
        from: V,
        to: V,
        duration: number,
        setValue: (value: V) => void,
        easeFunc?: (t: number) => number,
    ): TweenController;
}

export function timer(maxLoopsPerFrame: number = 1000): TimerComp {
    return {
        id: "timer",
        maxLoopsPerFrame,
        loop(
            this: GameObj<TimerComp>,
            time: number,
            action: () => void,
            count: number = Infinity,
            waitFirst: boolean = false,
        ): TimerController {
            let t: number = waitFirst ? 0 : time;
            let onEndEvents = new KEvent();
            const ev = this.onUpdate(() => {
                t += _k.app.state.dt;
                for (let i = 0; t >= time && i < this.maxLoopsPerFrame; i++) {
                    count--;
                    action();
                    t -= time;
                    if (count <= 0) {
                        ev.cancel();
                        onEndEvents.trigger();
                        return;
                    }
                }
            });
            return {
                get paused() {
                    return ev.paused;
                },
                set paused(p) {
                    ev.paused = p;
                },
                cancel: ev.cancel,
                onEnd(f) {
                    onEndEvents.add(f);
                },
                then(f) {
                    onEndEvents.add(f);
                    return this;
                },
            };
        },
        wait(
            this: GameObj<TimerComp>,
            time: number,
            action?: () => void,
        ): TimerController {
            return this.loop(time, action ?? (() => {}), 1, true);
        },
        tween<V extends LerpValue>(
            this: GameObj<TimerComp>,
            from: V,
            to: V,
            duration: number,
            setValue: (value: V) => void,
            easeFunc = easings.linear,
        ) {
            let curTime = 0;
            const onEndEvents: Array<() => void> = [];
            const ev = this.onUpdate(() => {
                curTime += _k.app.state.dt;
                const t = Math.min(curTime / duration, 1);
                setValue(lerp(from, to, easeFunc(t)));
                if (t === 1) {
                    ev.cancel();
                    setValue(to);
                    onEndEvents.forEach((action) => action());
                }
            });
            return {
                get paused() {
                    return ev.paused;
                },
                set paused(p) {
                    ev.paused = p;
                },
                onEnd(action: () => void) {
                    onEndEvents.push(action);
                },
                then(action: () => void) {
                    this.onEnd(action);
                    return this;
                },
                cancel() {
                    ev.cancel();
                },
                finish() {
                    ev.cancel();
                    setValue(to);
                    onEndEvents.forEach((action) => action());
                },
            };
        },
    };
}
