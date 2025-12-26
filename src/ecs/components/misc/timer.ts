import { KEvent } from "../../../events/events";
import { easings } from "../../../math/easings";
import { lerp, type LerpValue } from "../../../math/lerp";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";

/**
 * @group Timer
 */
export interface TimerController {
    /**
     * The time left for the callback to be called.
     */
    timeLeft: number;
    /**
     * If the event handler is paused.
     */
    paused: boolean;
    /**
     * Cancel the event handler.
     */
    cancel(): void;
    /**
     * Register an event when finished.
     */
    onEnd(action: () => void): void;
    then(action: () => void): TimerController;
}

/**
 * Event controller for tween.
 *
 * @group Timer
 */
export interface TweenController extends TimerController {
    /**
     * The current time in the duration of the tween
     */
    currentTime: number;
    /**
     * Finish the tween now and cancel.
     */
    finish(): void;
}

/**
 * The {@link timer `timer()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
                get timeLeft() {
                    return t;
                },
                set timeLeft(val: number) {
                    t = val;
                },
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
            if (typeof (from as any).clone == "function") {
                from = (from as any).clone() as V;
            }
            if (typeof (to as any).clone == "function") {
                to = (to as any).clone() as V;
            }

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
                get currentTime() {
                    return curTime;
                },
                set currentTime(val) {
                    curTime = val;
                },
                get timeLeft() {
                    return duration - curTime;
                },
                set timeLeft(val: number) {
                    curTime = duration - val;
                },
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
