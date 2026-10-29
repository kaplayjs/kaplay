import { expect, test } from "@playwright/test";

test("existing level routing respects obstacles, boundaries, and agent targets", async ({ page }) => {
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(1000000);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    const result = await page.evaluate(() => {
        const k = kaplay();
        const level = k.addLevel([".#.", "..."], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: { ".": () => [], "#": () => [k.tile({ isObstacle: true })] },
        });
        const path = level.getTilePath(k.vec2(0, 0), k.vec2(2, 0));
        const owner = level.add([k.pos(0, 0), k.tile(), k.agent()]);
        owner.setTarget(k.vec2(32, 0));
        return {
            route: path?.map(p => [p.x, p.y]),
            blocked: level.getTilePath(k.vec2(0, 0), k.vec2(1, 0)),
            outside: level.getTilePath(k.vec2(-1, 0), k.vec2(2, 0)),
            reachable: owner.isTargetReachable(),
            target: [owner.getTarget()?.x, owner.getTarget()?.y],
        };
    });
    expect(result.blocked).toBeNull();
    expect(result.outside).toBeNull();
    expect(result.route).not.toContainEqual([1, 0]);
    expect(result.route?.at(-1)).toEqual([2, 0]);
    expect(result.reachable).toBe(true);
    expect(result.target).toEqual([32, 0]);
});
