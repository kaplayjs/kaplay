import easings from "@/easings";
import { getKaboomContext } from "@/kaboom";
import { lerp } from "@/math";
import {
    EventController,
    GameObj,
    LerpValue,
    TimerComp,
    TimerController,
} from "@/types";

export function timer(): TimerComp {
    return {
        id: "timer",
        wait(
            this: GameObj<TimerComp>,
            time: number,
            action?: () => void,
        ): TimerController {
            const k = getKaboomContext(this);
            const actions = [];
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
        loop(t: number, action: () => void): EventController {
            let curTimer: null | TimerController = null;
            const newAction = () => {
                // TODO: should f be execute right away as loop() is called?
                curTimer = this.wait(t, newAction);
                action();
            };
            curTimer = this.wait(0, newAction);
            return {
                get paused() {
                    return curTimer.paused;
                },
                set paused(p) {
                    curTimer.paused = p;
                },
                cancel: () => curTimer.cancel(),
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
            const k = getKaboomContext(this);
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
