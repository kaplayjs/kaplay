import { expect, type Page, test } from "@playwright/test";

type BodySetup = {
    x: number;
    vel: number;
    mass?: number;
    isStatic?: boolean;
};

/**
 * Total momentum of two bodies moving on a line.
 */
function momentum(
    [a, b]: [BodySetup, BodySetup],
    [velA, velB]: [number, number],
): number {
    return (a.mass ?? 1) * velA + (b.mass ?? 1) * velB;
}

/**
 * Total kinetic energy of two bodies moving on a line.
 */
function kineticEnergy(
    [a, b]: [BodySetup, BodySetup],
    [velA, velB]: [number, number],
): number {
    return ((a.mass ?? 1) * velA ** 2 + (b.mass ?? 1) * velB ** 2) / 2;
}

/**
 * Put two boxes on a horizontal line without gravity, let them collide and
 * return their horizontal velocities after the collision.
 */
async function collide(
    page: Page,
    restitution: number,
    a: BodySetup,
    b: BodySetup,
): Promise<[number, number]> {
    await page.addScriptTag({ path: "dist/kaplay.js" });

    return await page.evaluate(([restitution, a, b]) => {
        const k = kaplay({ global: false });

        const [objA, objB] = [a, b].map(setup => {
            const obj = k.add([
                k.pos(setup.x, 100),
                k.rect(32, 32),
                k.area({ restitution, friction: 0 }),
                k.body({ mass: setup.mass, isStatic: setup.isStatic }),
            ]);
            obj.vel = k.vec2(setup.vel, 0);
            return obj;
        });

        return new Promise<[number, number]>(res => {
            k.wait(1, () => res([objA.vel.x, objB.vel.x]));
        });
    }, [restitution, a, b] as const);
}

test.describe("Collision between two non-static bodies", () => {
    const cases: [string, BodySetup, BodySetup][] = [
        [
            "a resting body of the same mass",
            { x: 100, vel: 200 },
            { x: 200, vel: 0 },
        ],
        [
            "a heavier resting body",
            { x: 100, vel: 300, mass: 1 },
            { x: 200, vel: 0, mass: 2 },
        ],
        [
            "a lighter resting body",
            { x: 100, vel: 300, mass: 5 },
            { x: 200, vel: 0, mass: 1 },
        ],
        [
            "a body coming the other way",
            { x: 100, vel: 150 },
            { x: 300, vel: -50, mass: 3 },
        ],
        [
            "a slower body moving the same way",
            { x: 100, vel: 300, mass: 2 },
            { x: 200, vel: 100 },
        ],
    ];

    for (const [name, a, b] of cases) {
        const before: [number, number] = [a.vel, b.vel];

        test(`elastic collision with ${name} conserves momentum and energy`, async ({ page }) => {
            const after = await collide(page, 1, a, b);

            expect(after).not.toEqual(before);
            expect(momentum([a, b], after)).toBeCloseTo(
                momentum([a, b], before),
            );
            expect(kineticEnergy([a, b], after)).toBeCloseTo(
                kineticEnergy([a, b], before),
            );
        });

        test(`inelastic collision with ${name} conserves momentum and loses energy`, async ({ page }) => {
            const after = await collide(page, 0, a, b);

            // Without restitution both bodies move on together
            expect(after[0]).toBeCloseTo(after[1]);
            expect(momentum([a, b], after)).toBeCloseTo(
                momentum([a, b], before),
            );
            expect(kineticEnergy([a, b], after)).toBeLessThan(
                kineticEnergy([a, b], before),
            );
        });
    }

    test("elastic collision passes the velocity on to a resting body of the same mass", async ({ page }) => {
        const [velA, velB] = await collide(
            page,
            1,
            { x: 100, vel: 200 },
            { x: 200, vel: 0 },
        );

        expect(velA).toBeCloseTo(0);
        expect(velB).toBeCloseTo(200);
    });
});

test.describe("Collision between two non-static bodies with gravity", () => {
    test("a light body on top of a heavy bouncing body is launched higher than it was dropped from", async ({ page }) => {
        await page.addScriptTag({ path: "dist/kaplay.js" });

        const [dropHeight, maxHeight] = await page.evaluate(() => {
            const FLOOR_Y = 1900;
            const k = kaplay({ global: false, height: 2000 });
            k.setGravity(800);

            const bouncy = () => k.area({ restitution: 1, friction: 0 });

            k.add([
                k.pos(0, FLOOR_Y),
                k.rect(600, 40),
                bouncy(),
                k.body({ isStatic: true }),
            ]);
            k.add([
                k.pos(100, FLOOR_Y - 364),
                k.rect(64, 64),
                bouncy(),
                k.body({ mass: 20 }),
            ]);
            const light = k.add([
                k.pos(116, FLOOR_Y - 398),
                k.rect(32, 32),
                bouncy(),
                k.body({ mass: 1 }),
            ]);

            const dropHeight = FLOOR_Y - light.pos.y;
            let maxHeight = dropHeight;
            k.onUpdate(() => {
                maxHeight = Math.max(maxHeight, FLOOR_Y - light.pos.y);
            });

            return new Promise<[number, number]>(res => {
                k.wait(4, () => res([dropHeight, maxHeight]));
            });
        });

        expect(maxHeight).toBeGreaterThan(dropHeight * 3);
    });

    test("bodies stacked on the ground stay in place", async ({ page }) => {
        await page.addScriptTag({ path: "dist/kaplay.js" });

        const maxMoved = await page.evaluate(() => {
            const k = kaplay({ global: false });
            k.setGravity(1600);

            k.add([
                k.pos(0, 400),
                k.rect(600, 40),
                k.area(),
                k.body({ isStatic: true }),
            ]);
            const boxes = [1, 2, 3, 4, 5].map(i =>
                k.add([
                    k.pos(100, 400 - 32 * i),
                    k.rect(32, 32),
                    k.area(),
                    k.body(),
                ])
            );

            const startY = boxes.map(box => box.pos.y);
            let maxMoved = 0;
            k.onUpdate(() => {
                boxes.forEach((box, i) => {
                    maxMoved = Math.max(
                        maxMoved,
                        Math.abs(box.pos.y - startY[i]),
                    );
                });
            });

            return new Promise<number>(res => {
                k.wait(2, () => res(maxMoved));
            });
        });

        expect(maxMoved).toBeLessThan(12);
    });
});

test("Collision with a static body still reflects the velocity", async ({ page }) => {
    const [velA, velB] = await collide(
        page,
        1,
        { x: 100, vel: 200 },
        { x: 200, vel: 0, isStatic: true },
    );

    expect(velA).toBeCloseTo(-200);
    expect(velB).toBeCloseTo(0);
});
