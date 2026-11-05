import { expect, test } from "@playwright/test";
import {
    type AreaComp,
    type AreaEffectorComp,
    type BuoyancyEffectorComp,
    type CompList,
    type ConstantForceComp,
    type FakeMouseComp,
    type GameObj,
    type HealthComp,
    type KAPLAYCtx,
    type NamedComp,
    type PlatformEffectorComp,
    type PointEffectorComp,
    type StateComp,
    type StayComp,
    type SurfaceEffectorComp,
    type TextInputComp,
    type TimerComp,
} from "../../../src";
import type { LifespanComp } from "../../../src/ecs/components/misc/lifespan";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

// we need to create tests for each factory registered in:
// src/core/engine.ts
// there may be exceptions tho...

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
