import { expect, test } from "@playwright/test";
// Initialize the math module before app.ts enters its circular imports.
import "../../../src/math/math";
import { type AppState } from "../../../src/app/app";
import { ButtonProcessor } from "../../../src/app/inputBindings";
import { KEventHandler } from "../../../src/events/events";

function setup() {
    const processor = new ButtonProcessor();
    const state = { events: new KEventHandler() } as AppState;
    return { processor, state };
}

for (const [first, second] of [["q", "w"], ["w", "q"]]) {
    for (const released of [first, second]) {
        test(`keeps the action down after ${first}, ${second}, release ${released}`, () => {
            const { processor, state } = setup();
            processor.updateBinding("foo", { keyboard: ["q", "w"] });
            processor.processKeydown(first, "", state);
            processor.update();
            processor.processKeydown(second, "", state);
            processor.update();
            processor.processKeyup(released, "", state);

            expect(processor.state.down.has("foo")).toBe(true);
            expect(processor.state.released.has("foo")).toBe(false);

            processor.processKeyup(
                released === first ? second : first,
                "",
                state,
            );
            expect(processor.state.down.has("foo")).toBe(false);
            expect(processor.state.released.has("foo")).toBe(true);
        });
    }
}

test("repeated keydown does not require repeated keyup", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("releasing a binding that was never pressed does not release the action", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(true);
});

test("tracks multiple keyboard codes for one action", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboardCode: ["KeyQ", "KeyW"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("one key can still activate multiple actions", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.updateBinding("bar", { keyboard: "q" });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    expect([...processor.state.down]).toEqual(["foo", "bar"]);
    processor.processKeyup("q", "KeyQ", state);
    expect([...processor.state.down]).toEqual(["foo"]);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.size).toBe(0);
});

test("focus cleanup clears all sources before a new press", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.releaseKeyboardMouse(state);
    expect(processor.state.down.size).toBe(0);
    expect(processor.byKey.isButtonUsed("foo")).toBe(false);
    processor.update();
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.size).toBe(0);
});

test("rebound held keys release the actions they originally activated", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.updateBinding("foo", { keyboard: "e" });
    processor.processKeydown("e", "KeyE", state);
    processor.processKeyup("e", "KeyE", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(false);
    processor.processKeydown("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("keeps an alternative chord active until its own commit key is released", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["shift+q", "w"] });
    processor.processKeydown("shift", "ShiftLeft", state);
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("supports symbol action names", () => {
    const { processor, state } = setup();
    const foo = Symbol("foo");
    processor.updateBinding(foo, { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has(foo)).toBe(true);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has(foo)).toBe(false);
});

for (const released of ["q", "w"]) {
    test(`coordinates keyboard and keyboardCode when releasing ${released}`, () => {
        const { processor, state } = setup();
        processor.updateBinding("foo", {
            keyboard: ["q", "w"],
            keyboardCode: "KeyQ",
        });
        processor.processKeydown("q", "KeyQ", state);
        processor.processKeydown("w", "KeyW", state);
        processor.processKeyup(
            released,
            released === "q" ? "KeyQ" : "KeyW",
            state,
        );
        expect(processor.state.down.has("foo")).toBe(true);
        processor.processKeyup(
            released === "q" ? "w" : "q",
            released === "q" ? "KeyW" : "KeyQ",
            state,
        );
        expect(processor.state.down.has("foo")).toBe(false);
    });
}

test("clearing a binding while held still releases on its original keyup", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"] });
    processor.processKeydown("q", "KeyQ", state);
    processor.updateBinding("foo", { keyboard: [] });
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("an unsatisfied chord cannot release another active binding", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["shift+q", "w"] });
    processor.processKeydown("w", "KeyW", state);
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processKeyup("w", "KeyW", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("focus cleanup preserves an action still held on a gamepad", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: ["q", "w"], gamepad: "south" });
    processor.processGamepadButtonDown("south", state);
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeydown("w", "KeyW", state);
    processor.releaseKeyboardMouse(state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processGamepadButtonUp("south", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("matching a key and its code emits one final release", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { keyboard: "q", keyboardCode: "KeyQ" });
    let releases = 0;
    state.events.on("buttonRelease", () => releases++);
    processor.processKeydown("q", "KeyQ", state);
    processor.processKeyup("q", "KeyQ", state);
    expect(releases).toBe(1);
});

test("multiple mouse buttons keep their shared action down", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { mouse: ["left", "right"] });
    processor.processMousedown("left", state);
    processor.processMousedown("right", state);
    processor.processMouseup("left", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processMouseup("right", state);
    expect(processor.state.down.has("foo")).toBe(false);
});

test("multiple buttons on a gamepad keep their shared action down", () => {
    const { processor, state } = setup();
    processor.updateBinding("foo", { gamepad: ["south", "east"] });
    processor.processGamepadButtonDown("south", state);
    processor.processGamepadButtonDown("east", state);
    processor.processGamepadButtonUp("south", state);
    expect(processor.state.down.has("foo")).toBe(true);
    processor.processGamepadButtonUp("east", state);
    expect(processor.state.down.has("foo")).toBe(false);
});
