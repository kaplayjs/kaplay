import { k } from "../../kaplay";
import easings from "../../math/easings";
import { lerp } from "../../math/math";
import type {
    Comp,
    GameObj,
    LerpValue,
    TimerController,
    TweenController,
} from "../../types";
import type { KEventController } from "../../utils";

/**
 * The {@link timer `timer()`} component.
 *
 * @group Component Types
 */
export interface TimerComp extends Comp {
    /**
     * Run the callback after n seconds.
     */
    wait(time: number, action?: () => void): TimerController;
    /**
     * Run the callback every n seconds.
     *
     * @since v3000.0
     */
    loop(time: number, action: () => void): KEventController;
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

export function timer(): TimerComp {
    return {
        id: "timer",
        wait(
            this: GameObj<TimerComp>,
            time: number,
            action?: () => void,
        ): TimerController {
            const actions: Function[] = [];

            if (action) actions.push(action);
            let t = 0;
            const ev = this.onUpdate(() => {
                t += k.dt();
                if (t >= time) {
                    actions.forEach((f) => f());
                    ev.cancel();
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
                onEnd(action) {
                    actions.push(action);
                },
                then(action) {
                    this.onEnd(action);
                    return this;
                },
            };
        },
        loop(t: number, action: () => void): KEventController {
            let curTimer: null | TimerController = null;
            const newAction = () => {
                // TODO: should f be execute right away as loop() is called?
                curTimer = this.wait(t, newAction);
                action();
            };
            curTimer = this.wait(0, newAction);
            return {
                get paused() {
                    return curTimer?.paused ?? false;
                },
                set paused(p) {
                    if (curTimer) curTimer.paused = p;
                },
                cancel: () => curTimer?.cancel(),
            };
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
                curTime += k.dt();
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
