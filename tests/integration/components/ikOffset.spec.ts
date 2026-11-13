import { expect, test } from "@playwright/test";

for (const algorithm of ["FABRIK", "CCD"] as const) {
    test(`ik() ${algorithm} reaches the offset point in the target's local space`, async ({ page }) => {
        await page.addScriptTag({ path: "dist/kaplay.js" });

        const reached = await page.evaluate(async algorithm => {
            const k = kaplay({ global: false });

            // The target is rotated 90 degrees, so its local (10, 0) is
            // world (0, 10) away from its position
            const target = k.add([k.pos(120, 150), k.rotate(90)]);

            const root = k.add([k.pos(100, 100), k.rotate(0)]);
            const mid = root.add([k.pos(50, 0), k.rotate(0)]);
            const tip = mid.add([
                k.pos(50, 0),
                k.constraint.ik(target, {
                    algorithm,
                    depth: 2,
                    iterations: 50,
                    offset: k.vec2(10, 0),
                }),
            ]);

            await new Promise<void>(res => k.wait(0.5, () => res()));

            return { x: tip.transform.e, y: tip.transform.f };
        }, algorithm);

        expect(reached.x).toBeCloseTo(120, 0);
        expect(reached.y).toBeCloseTo(160, 0);
    });
}
