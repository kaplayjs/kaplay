import { expect, test } from "@playwright/test";
import fs from "fs";
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
    type GameObj,
    type HealthComp,
    type KAPLAYCtx,
    type LevelComp,
    type MaskComp,
    type NamedComp,
    type OpacityComp,
    type OutlineComp,
    type PatrolComp,
    type PlatformEffectorComp,
    type PointEffectorComp,
    type RectComp,
    type ShaderComp,
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
} from "../../../src";
import type { LifespanComp } from "../../../src/ecs/components/misc/lifespan";
import { BlendMode } from "../../../src/types";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

// we need to create tests for each factory registered in:
// src/core/engine.ts
// there may be exceptions tho...

// Draw Serialization
test("Test serialization of blend() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

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
        k.loadBean();

        const o = k.add([
            k.circle(10, { fill: true }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<CircleComp>>(prefab);

        // no way to check for fill
        return pf.radius == 10;
    });

    expect(method).toBeTruthy();
});

// test("Test serialization of color() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();
//         k.loadBean();

//         const o = k.add([
//             k.color(10, 10, 10),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         const pf = k.addPrefab<CompList<ColorComp>>(prefab);

//         // prefab.components.color.color.r is 10, i think color is being deserialized incorrectly
//         return pf.color.r == 10 && pf.color.g == 10 && pf.color.b == 10;
//     });

//     expect(method).toBeTruthy();
// });

test("Test serialization of ellipse() component", async ({ page }) => {
    page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

    const method = await page.evaluate(() => {
        const k = kaplay();
        k.loadBean();

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
        k.loadBean();

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
        k.loadBean();

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
        k.loadBean();

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
        k.loadBean();

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
        k.loadBean();

        const o = k.add([
            k.rect(10, 10, { fill: true, radius: 10 }),
        ]);

        const prefab = o.serialize();
        o.destroy();

        console.log(prefab.components);

        const pf = k.addPrefab<CompList<RectComp>>(prefab);

        // no option to check for fill
        return pf.width == 10 && pf.height == 10 && pf.radius == 10;
    });

    expect(method).toBeTruthy();
});

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

        // no option for uniform
        return pf.shader == "name";
    });

    expect(method).toBeTruthy();
});

// test("Test serialization of sprite() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();

//         k.loadSprite(
//             "dino",
//             `data:image/png;base64,${
//                 fs.readFileSync(
//                     new URL(
//                         "../../../examples/sprites/dungeon-dino.png",
//                         import.meta.url,
//                     ),
//                     "base64",
//                 )
//             }`,
//             {
//                 // The image contains 9 frames layered out horizontally, slice it into individual frames
//                 sliceX: 9,
//                 // Define animations
//                 anims: {
//                     "idle": {
//                         // Starts from frame 0, ends at frame 3
//                         from: 0,
//                         to: 3,
//                         // Frame per second
//                         speed: 5,
//                         loop: true,
//                     },
//                     "run": {
//                         from: 4,
//                         to: 7,
//                         speed: 10,
//                         loop: true,
//                     },
//                     // This animation only has 1 frame
//                     "jump": 8,
//                 },
//             },
//         );

//         const o = k.add([
//             k.sprite("dino", {
//                 anim: "idle",
//                 animSpeed: 10,
//                 fill: true,
//                 flipX: true,
//                 flipY: true,
//                 frame: 0,
//                 height: 10,
//                 tiled: true,
//                 width: 10,
//             }),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<SpriteComp>>(prefab);

//         // no option for fill
//         // no option for quad
//         // no option for tiled
//         return pf.sprite == "bean" && pf.getCurAnim()?.name == "idle"
//             && pf.animSpeed == 10 && pf.flipX == true && pf.flipY == true
//             && pf.frame == 0 && pf.height == 10
//             && pf.width == 10;
//     });

//     expect(method).toBeTruthy();
// });

// test("Test serialization of text() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();

//         const CharTransform = {
//             angle: 10,
//             color: k.RED,
//             font: "happy",
//             opacity: 10,
//             override: true,
//             pos: k.vec2(10),
//             scale: k.vec2(10),
//             shader: "shader",
//             skew: 10,
//             stretchInPlace: true,
//         };

//         const o = k.add([
//             k.text("hello", {
//                 align: "center",
//                 font: "happy",
//                 indentAll: true,
//                 letterSpacing: 10,
//                 lineSpacing: 10,
//                 locale: "es",
//                 size: 10,
//                 width: 10,
//                 styles: {
//                     "a": CharTransform,
//                 },
//                 transform: CharTransform,
//             }),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<TextComp>>(prefab);
//         console.log(
//             JSON.stringify(pf.textStyles["a"]),
//         );
//         console.log(JSON.stringify(CharTransform));
//         console.log(
//             JSON.stringify(pf.textStyles["a"])
//                 === JSON.stringify(CharTransform),
//         );

//         // no option for indentAll
//         // no option for locale
//         return pf.text == "hello" && pf.align == "center" && pf.font == "happy"
//             && pf.letterSpacing == 10 && pf.lineSpacing == 10
//             && pf.textSize == 10 && pf.width == 10;
//     });

//     expect(method).toBeTruthy();
// });

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

// test("Test serialization of video() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();
// !!! not checking yet properly because url weirdness similar to sprite
//         const o = k.add([
//             k.video("url", { width: 10, height: 10, loop: true, muted: true }),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<VideoComp>>(prefab);

//         return pf.width == 10 && pf.height == 10;
//     });

//     expect(method).toBeTruthy();
// });

// Level Serialization
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

// !!! can't be done/weird
// test("Test serialization of level() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();
//         k.loadBean();

//         const level = [
//             "                          $",
//             "                          $",
//             "           $$         =   $",
//             "  %      ====         =   $",
//             "                      =    ",
//             "       ^^      = >    =   &",
//             "===========================",
//         ];

//         const o = k.add([
//             k.level(level),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<LevelComp>>(prefab);
//     });

//     expect(method).toBeTruthy();
// });

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

        // no check for endBehaviour
        return pf.waypoints?.[0].eq(k.vec2(10)) && pf.patrolSpeed == 10;
    });

    expect(method).toBeTruthy();
});

// no gameobj as candidates
// test("Test serialization of sentry() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();
//         k.loadBean();

//         const o = k.add([
//             k.pos(),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<PatrolComp>>(prefab);

//         // no check for endBehaviour
//         return pf.waypoints?.[0].eq(k.vec2(10)) && pf.patrolSpeed == 10;
//     });

//     expect(method).toBeTruthy();
// });

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

        // area doesn't serialize area.cursor
        return pf.collisionIgnore.length == 1
            && pf.collisionIgnore[0] == "enemy"
            && pf.friction == 10 && pf.isSensor == true
            && pf.area.offset.eq(k.vec2(10)) && pf.restitution == 10
            && pf.area.scale.eq(k.vec2(10));
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

        // stickToPlatform is undefined for some weird reason
        const prefab = o.serialize();
        o.destroy();

        const pf = k.addPrefab<CompList<BodyComp>>(prefab);

        return pf.damping == 10 && pf.jumpForce == 10 && pf.gravityScale == 10
            && pf.isStatic == true
            && pf.mass == 10;
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

        // area doesn't serialize area.cursor
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

// didn't find how to test this one
// test("Test serialization of platformEffector() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();
//         k.loadBean();

//         const o = k.add([
//             k.platformEffector({
//                 ignoreSides: [k.vec2(10)],
//             }),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<PlatformEffectorComp>>(prefab);

//         return pf.
//     });

//     expect(method).toBeTruthy();
// });

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

// would have to add followMouse as opt in FakeMouse
// test("Test serialization of fakeMouse() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();

//         const o = k.add([
//             k.fakeMouse({ followMouse: true }),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<FakeMouseComp>>(prefab);

//         return pf;
//     });

//     expect(method).toBeTruthy();
// });

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

// would have to add one of the params to the comp
// test("Test serialization of lifespan() component", async ({ page }) => {
//     page.on("console", msg => console.log(`Browser log: ${msg.text()}`));

//     const method = await page.evaluate(() => {
//         const k = kaplay();

//         const o = k.add([
//             k.lifespan(1),
//         ]);

//         const prefab = o.serialize();
//         o.destroy();

//         console.log(prefab.components);

//         const pf = k.addPrefab<CompList<LifespanComp>>(prefab);

//         return pf;
//     });

//     expect(method).toBeTruthy();
// });

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

        // can't check maxInputLength because it's not stored on comp
        return pf.hasFocus == true;
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
