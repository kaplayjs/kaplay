import { describe, expectTypeOf } from "vitest";
import type { CircleComp, ScaleComp } from "../../src/";
import { kaplay } from "../../src/kaplay";
import type { GameObj } from "../../src/types";

// We use circle() component because it only have 1 prop and 1 method, easy
// for debugging

describe("Type Inference from add()", () => {
    const k = kaplay();

    test("add() should return GameObj<unknown>", () => {
        const obj = k.add();
        //     ^?

        // Actually this test can give falsy true because unknown is acceptable for never
        expectTypeOf(obj).toEqualTypeOf<GameObj<unknown>>();
    });

    test("add([]) should return GameObj<never>", () => {
        const obj = k.add([]);
        //     ^?

        // Actually this test can give falsy true because unknown is acceptable for never
        expectTypeOf(obj).toEqualTypeOf<GameObj<never>>();
    });

    test("add([circle()] should return GameObj<CircleComp>", () => {
        const obj = k.add([
            k.circle(4),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });

    test("add([circle(), scale()]) should return GameObj<CircleComp | ScaleComp>", () => {
        const obj = k.add([
            k.circle(4),
            k.scale(),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp | ScaleComp>>();
    });

    test("add([circle(), \"cat\"]) should return GameObj<CircleComp>", () => {
        const obj = k.add([
            k.circle(4),
            "cat",
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });

    test("add([make(circle())]) should return GameObj<CircleComp>", () => {
        const base = k.make([
            k.circle(4),
        ]);

        const obj = k.add(base);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });

    test("add([circle(), circle()]) should return GameObj<CircleComp>", () => {
        const obj = k.add([
            k.circle(4),
            k.circle(4),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });

    test("add([circle(), { require: [] }]) shouldn't let you obj.require", () => {
        const obj = k.add([
            k.circle(4),
            {
                require: ["love"],
            },
        ]);

        // @ts-expect-error
        obj.require; // require is removed from Types because Omit<T>
    });

    test("add() should tuple components", () => {
        const componentA = () => {
            return {
                id: "componentA",
                propertyA: true,
                add() {
                    console.log("add A");
                },
            };
        };

        const componentB = () => {
            return {
                id: "componentB",
                // Un-comment to fix type error:
                // propertyB: true,
                add() {
                    console.log("add B");
                },
            };
        };

        const obj = k.add(
            [
                k.circle(4),
                componentA(),
                componentB(),
            ],
        );

        //        expectTypeOf(obj.propertyA).toBeBoolean();
    });
});

describe("Type Inference from make()", () => {
    const k = kaplay();

    test("make() should return GameObj<unknown>", () => {
        const obj = k.make();
        //     ^?

        // Actually this test can give falsy true because unknown is acceptable for never
        expectTypeOf(obj).toEqualTypeOf<GameObj<unknown>>();
    });

    test("make([]) should return GameObj<never>", () => {
        const obj = k.make([]);
        //     ^?

        // Actually this test can give falsy true because unknown is acceptable for never
        expectTypeOf(obj).toEqualTypeOf<GameObj<never>>();
    });

    test("make([circle()] should return GameObj<CircleComp>", () => {
        const obj = k.make([
            k.circle(4),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });

    test("make([circle(), scale()]) should return GameObj<CircleComp | ScaleComp>", () => {
        const obj = k.make([
            k.circle(4),
            k.scale(),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp | ScaleComp>>();
    });

    test("make([circle(), \"cat\"]) should return GameObj<CircleComp>", () => {
        const obj = k.make([
            k.circle(4),
            "cat",
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<CircleComp>>();
    });
});
