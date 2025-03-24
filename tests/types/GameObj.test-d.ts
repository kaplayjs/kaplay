import { describe, expectTypeOf } from "vitest";
import type { AreaComp, ScaleComp, SpriteComp } from "../../src/";
import { kaplay } from "../../src/kaplay";
import type { GameObj } from "../../src/types";

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

    test("add([sprite()] should return GameObj<SpriteComp>", () => {
        const obj = k.add([
            k.sprite("bean"),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp>>();
    });

    test("add([sprite(), scale()]) should return GameObj<SpriteComp | ScaleComp>", () => {
        const obj = k.add([
            k.sprite("bean"),
            k.scale(),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp | ScaleComp>>();
    });

    test("add([area(), \"cat\"]) should return GameObj<AreaComp>", () => {
        const obj = k.add([
            k.area(),
            "cat",
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<AreaComp>>();
    });

    test("add([make(sprite())]) should return GameObj<SpriteComp>", () => {
        const base = k.make([
            k.sprite("bean"),
        ]);

        const obj = k.add(base);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp>>();
    });

    test("add([sprite(), sprite()]) should return GameObj<SpriteComp>", () => {
        const obj = k.add([
            k.sprite("mark"),
            k.sprite("bean"),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp>>();
    });

    test("add([area(), { require: [] }]) shouldn't let you obj.require", () => {
        const obj = k.add([
            k.sprite("mark"),
            {
                require: ["love"],
            },
        ]);

        // @ts-expect-error
        obj.require; // require is removed from Types because Omit<T>
    });
});

describe("Type Inference from make()", () => {
    const k = kaplay();

    test("make([sprite()] should return GameObj<SpriteComp>", () => {
        const obj = k.make([
            k.sprite("bean"),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp>>();
    });

    test("make([sprite(), scale()]) should return GameObj<SpriteComp | ScaleComp>", () => {
        const obj = k.make([
            k.sprite("bean"),
            k.scale(),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp | ScaleComp>>();
    });

    test("make([area(), \"cat\"]) should return GameObj<AreaComp>", () => {
        const obj = k.make([
            k.area(),
            "cat",
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<AreaComp>>();
    });
});
