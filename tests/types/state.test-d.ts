import { describe, expectTypeOf, test } from "vitest";
import type { StateComp } from "../../src/ecs/components/misc/state";
import type { KEventController } from "../../src/events/events";
import kaplay from "../../src/kaplay";

describe("Type Inference from state()", () => {
    const k = kaplay();
    const stateComp = k.state("initial", ["initial", "final"]);

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
});
