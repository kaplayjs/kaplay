import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
    type AgentComp,
    type AnchorComp,
    type AreaComp,
    type AreaEffectorComp,
    type BlendComp,
    type BodyComp,
    type BuoyancyEffectorComp,
    type CircleComp,
    type ColorComp,
    type CompList,
    type ConstantForceComp,
    type DoubleJumpComp,
    type EllipseComp,
    type FakeMouseComp,
    type FillComp,
    type FixedComp,
    type FollowComp,
    type GameObj,
    type HealthComp,
    type KAPLAYCtx,
    type LayerComp,
    type LevelComp,
    type MaskComp,
    type MoveComp,
    type NamedComp,
    type OpacityComp,
    type OutlineComp,
    type PatrolComp,
    type PlatformEffectorComp,
    type PointEffectorComp,
    type PosComp,
    type RectComp,
    type RotateComp,
    type ScaleComp,
    type SentryComp,
    type ShaderComp,
    type SkewComp,
    type SpriteComp,
    type StateComp,
    type StayComp,
    type SurfaceEffectorComp,
    type TextComp,
    type TextInputComp,
    type TileComp,
    type TimerComp,
    type UVQuadComp,
    type VideoComp,
    type ZComp,
} from "../../../src";
import type { LifespanComp } from "../../../src/ecs/components/misc/lifespan";
import {
    type OffScreenComp,
} from "../../../src/ecs/components/transform/offscreen";
import { BlendMode } from "../../../src/types";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

// we need to create tests for each factory registered in:
// src/core/engine.ts
// there may be exceptions tho...

// Transform Serialization
// constraint() missing (has obj ref)
test("Test serialization of anchor() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.anchor("topleft"),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<AnchorComp>>(prefab);

        return typeof pf.anchor == "object" && pf.anchor.x == -1
            && pf.anchor.y == -1;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of fixed() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.fixed(true),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<FixedComp>>(prefab);

        return pf.fixed == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of follow() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay({
            singletonTags: ["bean"],
        });
        k.loadBean();

        const obj = k.add([k.pos(), "bean"]);

        const o = k.add([
            k.follow(obj, k.vec2(10, 10)),
            k.pos(),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<FollowComp>>(prefab);

        return pf.follow.obj?.tags.includes("bean");
    });

    expect(method).toBeTruthy();
});

test("Test serialization of layer() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.setLayers([
            "bg",
            "obj",
            "ui",
        ], "obj");

        const o = k.add([
            k.layer("obj"),
            k.pos(),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<LayerComp>>(prefab);

        return pf.layer == "obj";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of move() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.pos(),
            k.move(k.vec2(10, 10), 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<MoveComp>>(prefab);

        // just checking it was serialized properly
        return prefab.components["move"]["dir"]["x"] == 10
            && prefab.components["move"]["dir"]["y"] == 10
            && prefab.components["move"]["speed"];
    });

    expect(method).toBeTruthy();
});

test("Test serialization of offscreen() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.pos(),
            k.offscreen({
                destroy: true,
                distance: 10,
                hide: true,
                pause: true,
                unpause: true,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<OffScreenComp>>(prefab);

        return pf.offscreenDistance == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of pos() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.pos(10, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<PosComp>>(prefab);

        return pf.pos.x == 10 && pf.pos.y == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of rotate() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.rotate(10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<RotateComp>>(prefab);

        return pf.angle == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of scale() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.scale(10, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<ScaleComp>>(prefab);

        return pf.scale.x == 10 && pf.scale.y == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of skew() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.skew(10, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<SkewComp>>(prefab);

        return pf.skew.x == 10 && pf.skew.y == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of z() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.z(10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<ZComp>>(prefab);

        return pf.z == 10;
    });

    expect(method).toBeTruthy();
});

// Draw Serialization
// `drawon()` missing (has FrameBuffer, Picture refs)
// `fadeIn()` missing, but wasn't it deprecated?
// `particles()` missing (has Texture ref)
// `picture()` missing (has Picture ref)
// `polygon()` missing (has Texture ref)

test("Test serialization of blend() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.blend(BlendMode.Add),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<BlendComp>>(prefab);

        return pf.blend == BlendMode.Add;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of circle() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.circle(10, { fill: true }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<CircleComp>>(prefab);

        return pf.radius == 10 && pf.fill == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of color() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.color(10, 10, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        const pf = k.addPrefab<CompList<ColorComp>>(prefab);

        return pf.color.r == 10 && pf.color.g == 10 && pf.color.b == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of ellipse() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.ellipse(10, 20),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<EllipseComp>>(prefab);

        return pf.radiusX == 10 && pf.radiusY == 20;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of fill() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.fill(true),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<FillComp>>(prefab);

        return pf.fill == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of mask() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.mask("intersect"),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<MaskComp>>(prefab);

        return pf.mask == "intersect";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of opacity() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.opacity(10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<OpacityComp>>(prefab);

        return pf.opacity == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of outline() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.outline(10, k.rgb(10, 10, 10), 10, "bevel", 10, "butt"),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<OutlineComp>>(prefab);

        return pf.outline.width == 10 && pf.outline.color?.eq(k.rgb(10, 10, 10))
            && pf.outline.opacity == 10 && pf.outline.join == "bevel"
            && pf.outline.miterLimit == 10 && pf.outline.cap == "butt";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of rect() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.rect(10, 10, { fill: true, radius: 10 }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<RectComp>>(prefab);

        return pf.width == 10 && pf.height == 10 && pf.radius == 10
            && pf.fill == true;
    });

    expect(method).toBeTruthy();
});

// partial support (no uniform)
test("Test serialization of shader() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.shader("name"),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<ShaderComp>>(prefab);

        return pf.shader == "name";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of sprite() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const dinosrc = `data:image/png;base64,${await readFile(
        new URL(`../../fixtures/sprites/dungeon-dino.png`, import.meta.url),
        "base64",
    )}`;

    const method = await page.evaluate(async (dinosrc) => {
        const k = kaplay();

        await k.loadSprite(
            "dino",
            dinosrc,
            {
                // The image contains 9 frames layered out horizontally, slice it into individual frames
                sliceX: 9,
                // Define animations
                anims: {
                    "idle": {
                        // Starts from frame 0, ends at frame 3
                        from: 0,
                        to: 3,
                        // Frame per second
                        speed: 5,
                        loop: true,
                    },
                    "run": {
                        from: 4,
                        to: 7,
                        speed: 10,
                        loop: true,
                    },
                    // This animation only has 1 frame
                    "jump": 8,
                },
            },
        );

        const o = k.add([
            k.sprite("dino", {
                anim: "idle",
                animSpeed: 10,
                fill: true,
                flipX: true,
                flipY: true,
                frame: 0,
                height: 10,
                tiled: true,
                width: 10,
                quad: new k.Quad(10, 10, 10, 10),
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<SpriteComp>>(prefab);
        pf.play("idle");

        // can't check for fill (not used in sprite anyway)
        return pf.sprite == "dino" && pf.getCurAnim()?.name == "idle"
            && pf.animSpeed == 10 && pf.flipX == true && pf.flipY == true
            && pf.frame == 0 && pf.height == 10
            && pf.width == 10 && pf.tiled == true && pf.quad.x == 10
            && pf.quad.y == 10 && pf.quad.w == 10 && pf.quad.h == 10;
    }, dinosrc);

    expect(method).toBeTruthy();
});

// partial support (no transform & styles)
test("Test serialization of text() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.text("hello", {
                align: "center",
                font: "happy",
                indentAll: true,
                letterSpacing: 10,
                lineSpacing: 10,
                locale: "es",
                size: 10,
                width: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<TextComp>>(prefab);

        return pf.text == "hello" && pf.align == "center" && pf.font == "happy"
            && pf.letterSpacing == 10 && pf.lineSpacing == 10
            && pf.textSize == 10 && pf.width == 10 && pf.indentAll == true
            && pf.locale == "es";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of uvquad() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.uvquad(10, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<UVQuadComp>>(prefab);

        return pf.width == 10 && pf.height == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of video() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const videourl = `data:video/mp4;base64,${await readFile(
        new URL("../../fixtures/videos/dance.mp4", import.meta.url),
        "base64",
    )}`;

    const method = await page.evaluate(async (url) => {
        const k = kaplay();

        const o = k.add([
            k.video(url, {
                width: 10,
                height: 10,
                loop: true,
                muted: true,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<VideoComp>>(prefab);

        return pf.width == 10 && pf.height == 10 && pf.loop == true
            && pf.muted == true;
    }, videourl);

    expect(method).toBeTruthy();
});

// Level Serialization
// `pathfinder()` & `pathfinderMap()?` missing (needs Graph)

test("Test serialization of agent() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.pos(),
            k.tile(),
            k.agent({
                allowDiagonals: true,
                speed: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<AgentComp>>(prefab);

        return pf.allowDiagonals == true && pf.agentSpeed == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of level() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const tiles = {
            "@": () => [
                "player",
            ],
            "=": () => [
                "grass",
            ],
            "$": () => [
                "coin",
            ],
            "^": () => [
                "danger",
            ],
        };

        const o = k.add([
            k.level(
                [
                    // Design the level layout with symbols
                    "@  ^ $$",
                    "=======",
                ],
                {
                    // The size of each grid
                    tileWidth: 64,
                    tileHeight: 64,
                    // Define what each symbol means (in components)
                    tiles: tiles,
                },
            ),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<LevelComp>>(prefab);

        // checking for correct serialization of tiles
        // Note: For `wildcardTile`, only symbols already present in the level map and their results will be serialized.
        const serializedTiles = prefab.components["level"]["tiles"];

        const tilesMatch = Object.keys(tiles).every(
            key =>
                JSON.stringify(serializedTiles[key].tags)
                    // @ts-ignore
                    == JSON.stringify(tiles[key]()),
        );

        return pf.tileWidth() == 64 && pf.tileHeight() == 64
            && tilesMatch;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of patrol() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.pos(),
            k.patrol({
                endBehavior: "loop",
                speed: 10,
                waypoints: [k.vec2(10)],
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<PatrolComp>>(prefab);

        return pf.waypoints?.[0].eq(k.vec2(10));
    });

    expect(method).toBeTruthy();
});

// partial support (no () => GameObj[] as candidates)
test("Test serialization of sentry() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.pos(),
            k.sentry({
                include: "bean",
            }, { direction: k.vec2(10, 10) }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<SentryComp>>(prefab);

        // can't check for sentrycandidates, just checking serialization
        return pf.direction?.eq(k.vec2(10, 10))
            && prefab.components["sentry"]["candidates"]["include"].includes(
                "bean",
            );
    });

    expect(method).toBeTruthy();
});

test("Test serialization of tile() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.pos(),
            k.tile({
                cost: 10,
                edges: ["left"],
                isObstacle: true,
                offset: k.vec2(10),
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<TileComp>>(prefab);

        return pf.cost == 10 && pf.edges.length == 1 && pf.edges[0] == "left"
            && pf.isObstacle == true
            && pf.tilePosOffset.eq(k.vec2(10));
    });

    expect(method).toBeTruthy();
});

// Physics Serialization
test("Test serialization of area() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area({
                collisionIgnore: ["enemy"],
                cursor: "none",
                friction: 10,
                isSensor: true,
                offset: k.vec2(10),
                restitution: 10,
                scale: 10,
                shape: new k.Rect(k.vec2(0), 10, 10),
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<AreaComp>>(prefab);

        return pf.collisionIgnore.length == 1
            && pf.collisionIgnore[0] == "enemy"
            && pf.friction == 10 && pf.isSensor == true
            && pf.area.offset.eq(k.vec2(10)) && pf.restitution == 10
            && pf.area.scale.eq(k.vec2(10)) && pf.area.cursor == "none";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of body() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.pos(),
            k.body({
                damping: 10,
                jumpForce: 10,
                maxVelocity: 10,
                gravityScale: 10,
                isStatic: true,
                stickToPlatform: true,
                mass: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<BodyComp>>(prefab);

        return pf.damping == 10 && pf.jumpForce == 10 && pf.gravityScale == 10
            && pf.isStatic == true
            && pf.mass == 10 && pf.stickToPlatform == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of doubleJump() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.doubleJump(2),
            k.pos(),
            k.body(),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<DoubleJumpComp>>(prefab);

        return pf.numJumps == 2;
    });

    expect(method).toBeTruthy();
});

// Effectors
test("Test serialization of surfaceEffector() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area(),
            k.surfaceEffector({
                speed: 10,
                forceScale: 10,
                speedVariation: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<SurfaceEffectorComp>>(prefab);

        return pf.speed == 10 && pf.forceScale == 10 && pf.speedVariation == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of areaEffector() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area(),
            k.areaEffector({
                force: k.vec2(10, 10),
                linearDrag: 10,
                useGlobalAngle: true,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<AreaEffectorComp>>(prefab);

        return pf.force.eq(k.vec2(10, 10)) && pf.linearDrag == 10
            && pf.useGlobalAngle == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of pointEffector() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area(),
            k.pos(),
            k.pointEffector({
                forceMagnitude: 10,
                distanceScale: 10,
                forceMode: "constant",
                linearDrag: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<PointEffectorComp>>(prefab);

        return pf.forceMagnitude == 10 && pf.distanceScale == 10
            && pf.forceMode == "constant" && pf.linearDrag == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of constantForce() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area(),
            k.pos(),
            k.body(),
            k.constantForce({
                force: k.vec2(10, 10),
                useGlobalAngle: true,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<ConstantForceComp>>(prefab);

        return pf.force?.eq(k.vec2(10, 10)) && pf.useGlobalAngle == true;
    });

    expect(method).toBeTruthy();
});

// partial support (no shouldCollide() opt)
test("Test serialization of platformEffector() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.rect(10, 10),
            k.pos(),
            k.body(),
            k.area(),
            k.platformEffector({
                ignoreSides: [k.vec2(10)],
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<PlatformEffectorComp>>(prefab);

        // just making sure it serializes properly
        const serIgnoreSides = prefab
            .components["platformEffector"]["ignoreSides"];

        const deserIgnoreSides = k.Vec2.deserialize(serIgnoreSides[0]);

        return serIgnoreSides.length == 1
            && deserIgnoreSides.eq(k.vec2(10));
    });

    expect(method).toBeTruthy();
});

test("Test serialization of buoyancyEffector() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

        const o = k.add([
            k.sprite("bean"),
            k.area(),
            k.buoyancyEffector({
                surfaceLevel: 10,
                angularDrag: 10,
                density: 10,
                flowAngle: 10,
                flowMagnitude: 10,
                flowVariation: 10,
                linearDrag: 10,
            }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<BuoyancyEffectorComp>>(prefab);

        return pf.surfaceLevel == 10 && pf.angularDrag == 10 && pf.density == 10
            && pf.flowAngle == 10 && pf.flowMagnitude == 10
            && pf.flowVariation == 10 && pf.linearDrag == 10;
    });

    expect(method).toBeTruthy();
});

// Other & Misc Serialization
// `animate()` missing (complicated)
// `boom()` used only internally in `addKaboom()`

test("Test serialization of fakeMouse() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.pos(),
            k.fakeMouse({ followMouse: true }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<FakeMouseComp>>(prefab);

        return pf.followMouse == true;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of health() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.health(10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<HealthComp>>(prefab);

        return pf.hp == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of lifespan() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.opacity(),
            k.lifespan(1, { fade: 1 }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<LifespanComp>>(prefab);

        // just checking it was serialized properly
        return prefab.components["lifespan"]["time"] == 1
            && prefab.components["lifespan"]["fade"] == 1;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of named() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.named("ben"),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<NamedComp>>(prefab);

        return pf.name == "ben";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of state() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.state("idle", ["idle", "attack", "move"]),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<StateComp<"idle" | "attack" | "move">>>(
            prefab,
        );

        return pf.state == "idle";
    });

    expect(method).toBeTruthy();
});

test("Test serialization of stay() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const scenes = ["intro, mainmenu"];

        const o = k.add([
            k.stay(scenes),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<StayComp>>(
            prefab,
        );

        return pf.scenesToStay?.length == scenes.length
            && pf.scenesToStay.every((val, idx) => val == scenes[idx]);
    });

    expect(method).toBeTruthy();
});

test("Test serialization of textInput() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.text(),
            k.textInput(true, 10),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<TextInputComp>>(
            prefab,
        );

        // only checking if the maxInputLength was serialized correctly
        return pf.hasFocus == true
            && prefab.components["textInput"]["maxInputLength"] == 10;
    });

    expect(method).toBeTruthy();
});

test("Test serialization of timer() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();

        const o = k.add([
            k.timer(1000),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<TimerComp>>(
            prefab,
        );

        return pf.maxLoopsPerFrame == 1000;
    });

    expect(method).toBeTruthy();
});
