import { describe, test } from "vitest";
import type { Opt } from "../../src/core/taf";
import { kaplay, kaplayTypes } from "../../src/kaplay";

describe("Typed Buttons", () => {
    const k = kaplay({
        background: "fff",
        buttons: {
            "jump": {},
        },
        types: kaplayTypes<
            Opt<
                {
                    scenes: {
                        "game": [score: number];
                    };
                }
            >
        >(),
    });

    k.scene("game", () => {});

    test("in isButtonPressed(btn), btn is typed", () => {
        k.isButtonPressed("jump");
        // @ts-expect-error
        k.isButtonPressed("f");
    });
});
