import { describe, expectTypeOf, test } from "vitest";
import type { Opt } from "../../src/core/taf";
import { kaplay, kaplayTypes } from "../../src/kaplay";

describe("Typed Scenes", () => {
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

    const ks = kaplay({
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
                    strictScenes: true;
                }
            >
        >(),
    });

    test("scene(name) name is typed", () => {
        k.scene("game", (score) => {
            expectTypeOf(score).toEqualTypeOf<number>;
        });
    });

    test("[Strict] in scene(name), name is typed and strict", () => {
        ks.scene("game", (score) => {
            expectTypeOf(score).toEqualTypeOf<number>;
        });

        // @ts-expect-error
        ks.scene("f", () => {});
        // @ts-expect-error
        ks.go("game", 1, 2);
    });
});
