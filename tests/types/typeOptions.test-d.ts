import { describe, expectTypeOf, test } from "vitest";
import type { SpriteComp } from "../../src/ecs/components/draw/sprite";
import type { PosComp } from "../../src/ecs/components/transform/pos";
import { kaplay } from "../../src/kaplay";
import type {
    CreateTypeOpt,
    GameObj,
    GameObjT,
    InfOpt,
    KAPLAYCtx,
    KAPLAYOpt,
} from "../../src/types";

describe("TypeOpt", () => {
    type StrictTagsOpt = CreateTypeOpt<{
        Tags: {
            player: SpriteComp | PosComp;
            plant: SpriteComp;
            zombie: SpriteComp;
        };
        StrictTags: true;
    }>;

    const ctxTagsStrict = kaplay<StrictTagsOpt>();

    type TagsOpt = CreateTypeOpt<{
        Tags: {
            player: SpriteComp | PosComp;
            plant: SpriteComp;
            zombie: SpriteComp;
        };
    }>;

    const ctxTags = kaplay<TagsOpt>();

    // Normal KAPLAY
    const k = kaplay();

    // KAPLAY with options
    const opt = {
        plugins: [
            (k: KAPLAYCtx) => ({
                pluginname: "testPlugin",
            }),
        ],
    } satisfies KAPLAYOpt;

    const ko = kaplay(opt);

    test("kaplay() should return KAPLAYCtx<never>", () => {
        expectTypeOf(k).toEqualTypeOf<KAPLAYCtx<never>>();
    });

    test("KAPLAYYCtx<never>.add() should return GameObj", () => {
        const obj = k.add([
            k.sprite("ka"),
            k.pos(0, 0),
        ]);

        expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp | PosComp>>();
    });

    test("kaplay() with opt should infer plugins type inside KAPLAYCtx", () => {
        type ExpectedCtx = KAPLAYCtx<typeof opt> & {
            pluginname: string;
        };

        expectTypeOf(ko).toEqualTypeOf<ExpectedCtx>();
    });

    test("KAPLAYYCtx<never>.add() should return GameObj", () => {
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
        const k = kaplay<
            InfOpt<{
                Tags: {
                    player: SpriteComp | PosComp;
                };
            }>
        >();

        const obj = k.add([
            k.sprite("ka"),
            k.pos(0, 0),
        ]);

        obj.tag("player");
    });

    test("GameObj.is() shouldn't predicate GameObj", () => {
        const obj = k.add([
            k.sprite("ka"),
            k.pos(0, 0),
        ]);

        if (obj.is("player")) {
            expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp | PosComp>>();
        }
        else {
            expectTypeOf(obj).toEqualTypeOf<GameObj<SpriteComp | PosComp>>();
        }
    });

    test("GameObjT.is() should predicate GameObjT from tag type", () => {
        const obj = ctxTagsStrict.add([]);

        if (obj.is("player")) {
            expectTypeOf(obj).toEqualTypeOf<
                GameObjT<SpriteComp | PosComp, StrictTagsOpt>
            >();
        }
        else {
            expectTypeOf(obj).toEqualTypeOf<GameObjT<never, StrictTagsOpt>>();
        }
    });

    test("add() should let you use other tags", () => {
        ctxTags.add([
            ctxTags.sprite("bean"),
            "zimbie",
        ]);
    });

    test("GameObjT.tag() should let you use other tags", () => {
        const obj = ctxTags.add([]);

        obj.tag("zimbie");
    });

    test("add() with StrictTags should only let you use defined tags", () => {
        const obj = ctxTagsStrict.add([
            ctxTagsStrict.sprite("bean"),
            // @ts-expect-error Use invalid tag
            "zimbie",
        ]);

        // @ts-expect-error No inference
        obj.sprite;
    });

    test("GameObjT.tag() with StrictTags should only let you use defined tags", () => {
        const obj = ctxTagsStrict.add([]);

        // @ts-expect-error Use invalid tag
        obj.tag("zimbie");
    });

    test("get() should return the correct type when tag is defined", () => {
        const obj = ctxTagsStrict.get("zombie");

        // @ts-expect-error Use invalid tag
        obj.get("zimbie");

        expectTypeOf(obj).toEqualTypeOf<
            Array<GameObjT<SpriteComp | PosComp, StrictTagsOpt>>
        >();
    });
});
