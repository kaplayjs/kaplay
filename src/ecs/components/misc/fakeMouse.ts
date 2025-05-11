import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "../transform/pos";

/**
 * The {@link fakeMouse `fakeMouse()`} component.
 */
export interface FakeMouseComp extends Comp {
    /**
     * Whether the fake mouse is pressed.
     */
    get isPressed(): boolean;
    /**
     * Trigger press (onClick).
     */
    press(): void;
    /**
     * Trigger release.
     */
    release(): void;
    /**
     * Register an event that runs when the fake mouse performs a click.
     */
    onPress(action: () => void): void;
    /**
     * Register an event that runs when the fake mouse releases.
     */
    onRelease(action: () => void): void;
}

/**
 * Options for the {@link fakeMouse `fakeMouse()`} component.
 */
export type FakeMouseOpt = {
    /**
     * Whether the fake mouse should follow the real mouse. Defaults to `true`.
     */
    followMouse?: boolean;
};

type FakeMouse = GameObj<FakeMouseComp | PosComp>;

export const fakeMouse = (opt: FakeMouseOpt = {
    followMouse: true,
}): FakeMouseComp => {
    let isPressed = false;

    return {
        id: "fakeMouse",
        require: ["pos"],
        add(this: GameObj<FakeMouse>) {
            if (_k.game.fakeMouse) {
                throw new Error("Fake mouse already exists");
            }

            _k.game.fakeMouse = this;
        },
        destroy() {
            _k.game.fakeMouse = null;
        },
        get isPressed() {
            return isPressed;
        },
        update(this: FakeMouse) {
            if (!opt.followMouse) return;

            if (_k.app.isMouseMoved()) {
                this.pos = _k.app.mousePos();
            }
        },
        press(this: FakeMouse) {
            isPressed = true;
            this.trigger("press");
        },
        release(this: FakeMouse) {
            isPressed = false;
            this.trigger("release");
        },
        onPress(this: FakeMouse, action) {
            this.on("press", action);
        },
        onRelease(this: FakeMouse, action) {
            this.on("release", action);
        },
    };
};
