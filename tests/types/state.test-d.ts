import { describe, expectTypeOf, test } from "vitest";
import type { StateComp } from "../../src/ecs/components/misc/state.js";
import type { KEventController } from "../../src/events/events.js";
import kaplay from "../../src/kaplay.js";
import type { GameObj } from "../../src/types.js";

describe("Type Inference from state()", () => {
    const k = kaplay();
    const stateComp = k.state("initial", ["initial", "final"]);
    const obj = k.add([stateComp, "tag"]);

    test(`state() with args should return a typed StateComp`, () => {
        expectTypeOf(stateComp).toEqualTypeOf<StateComp<"initial" | "final">>;
    });

    test("StateComp.enterState() param should be typed", () => {
        expectTypeOf(stateComp.enterState).toEqualTypeOf<
            (state: "initial" | "final", ...args: any) => void
        >;
    });

    test("StateComp.state should be typed", () => {
        expectTypeOf(stateComp.state).toEqualTypeOf<"initial" | "final">;
    });

    test("StateComp.onEnterState args should be typed", () => {
        expectTypeOf(stateComp.onStateEnter).toEqualTypeOf<
            (
                state: "initial" | "final",
                action: (...args: any) => void,
            ) => KEventController
        >;
    });

    test("GameObj<StateComp> should be typed", () => {
        expectTypeOf(obj).toEqualTypeOf<
            GameObj<StateComp<"initial" | "final">>
        >;
    });

    test("GameObj<StateComp>.state should be typed", () => {
        expectTypeOf(obj.state).toEqualTypeOf<"initial" | "final">;
    });

    test("GameObj<StateComp>.enterState() should be typed", () => {
        expectTypeOf(obj.enterState).toEqualTypeOf<
            (state: "initial" | "final", ...args: any) => void
        >;
    });

    test("GameObj<StateComp>.onEnterState args should be typed", () => {
        expectTypeOf(obj.onStateEnter).toEqualTypeOf<
            (
                state: "initial" | "final",
                action: (...args: any) => void,
            ) => KEventController
        >;
    });
});
