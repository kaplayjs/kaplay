import { describe, expectTypeOf, test } from "vitest";
import { kaplay } from "../../src/kaplay";
import type { InfOpt } from "../../src/types";

describe("TypeOpt", () => {
    // Inferred Plugin

    test("TypeOpt should infer scenes", () => {
        const k = kaplay<
            InfOpt<{
                Scenes: {
                    "game": [score: number, username: string];
                };
                StrictScenes: true;
            }>
        >();

        k.scene("game", (score, username) => {
            expectTypeOf(score).toEqualTypeOf<number>();
            expectTypeOf(username).toEqualTypeOf<string>();
        });

        // @ts-expect-error Use invalid scene name
        k.scene("ga", () => {});

        // @ts-expect-error Use more scene args
        k.scene("game", (score, username, any) => {});
    });

    test("kaplay<TypeOpt>() should infer tags", () => {
        const k = kaplay({});

        const obj = k.add([
            k.sprite("ka"),
            k.pos(0, 0),
        ]);

        obj.tag("player");
    });
});
