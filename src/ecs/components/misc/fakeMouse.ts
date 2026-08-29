import type { KEventController } from "../../../events/events";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj, MouseButton } from "../../../types";
import type { PosComp } from "../transform/pos";

/**
 * The {@link fakeMouse `fakeMouse()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface FakeMouseComp extends Comp {
    /**
     * Whether the fake mouse is pressed.
     */
    get isPressed(): boolean;
    /**
     * How much the fakeMouse has moved in the last frame.
     */
    get deltaPos(): Vec2;
    /**
     * Trigger press (onClick).
     * @param btn The mouse button to press (Defaults to "left").
     */
    press(btn?: MouseButton): void;
    /**
     * Trigger release.
     */
    release(): void;
    /**
     * Trigger scroll event by this much (onScroll).
     * @param deltaPos How much scroll to trigger the event.
     */
    scrollBy(deltaPos: Vec2): void;
    /**
     * Register an event that runs when the fake mouse performs a click.
     * @param action The function to run. Has a parameter to access the btn.
     */
    onPress(action: (btn: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when the fake mouse releases.
     * @param action The function to run.
     */
    onRelease(action: () => void): KEventController;
    /**
     * Register an event that runs when the fake mouse scrolls.
     * @param action The function to run, has the deltaPos parameter.
     */
    onRelease(action: (deltaPos: Vec2) => void): KEventController;
}

/**
 * Options for the {@link fakeMouse `fakeMouse()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type FakeMouseOpt = {
    /**
     * Whether the fake mouse should follow the real mouse.
     * @default true
     */
    followMouse?: boolean;
};

type FakeMouse = GameObj<FakeMouseComp | PosComp>;

export const fakeMouse = (opt: FakeMouseOpt = {
    followMouse: true,
}): FakeMouseComp => {
    let isPressed = false;
    let lastPos: Vec2;
    let deltaPos: Vec2;

    return {
        id: "fakeMouse",
        require: ["pos"],
        add(this: FakeMouse) {
            if (_k.game.fakeMouse) {
                throw new Error("Fake mouse already exists");
            }

            lastPos = this.pos.clone();

            _k.game.fakeMouse = this;
        },
        destroy() {
            _k.game.fakeMouse = null;
        },
        get isPressed() {
            return isPressed;
        },
        get deltaPos() {
            return deltaPos;
        },
        update(this: FakeMouse) {
            deltaPos = this.pos.sub(lastPos);
            lastPos = this.pos.clone();

            if (this.deltaPos.len() > 0) {
                // TODO: does this even do anything?
                this.trigger("fakeMouseMove", this.deltaPos);
            }

            if (opt.followMouse && _k.app.isMouseMoved()) {
                this.screenPos = _k.app.mousePos();
            }
        },
        press(this: FakeMouse, btn = "left") {
            isPressed = true;
            this.trigger("press", btn);
        },
        release(this: FakeMouse) {
            isPressed = false;
            this.trigger("release");
        },
        scrollBy(deltaPos) {
            _k.app.state.events.trigger("scroll", deltaPos);
        },
        onPress(this: FakeMouse, action) {
            return this.on("press", action);
        },
        onRelease(this: FakeMouse, action) {
            return this.on("release", action);
        },
    };
};
