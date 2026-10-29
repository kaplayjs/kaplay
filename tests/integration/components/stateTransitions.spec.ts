import { expect, test } from "@playwright/test";

test("existing state callbacks follow transitions and object pausing", async ({ page }) => {
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(1000000);
    await page.addScriptTag({ path: "dist/kaplay.js" });
    const result = await page.evaluate(() => {
        const k = kaplay();
        const owner = k.add([
            k.state("idle", ["idle", "walk"], {
                idle: ["walk"],
                walk: ["idle"],
            }),
        ]);
        const calls: string[] = [];
        owner.onStateEnter("idle", () => calls.push("idle"));
        owner.onStateUpdate("idle", () => calls.push("idle update"));
        owner.onStateEnd("idle", () => calls.push("idle end"));
        owner.onStateEnter("walk", () => calls.push("walk"));
        owner.onStateUpdate("walk", () => calls.push("walk update"));
        owner.update();
        owner.enterState("walk");
        owner.paused = true;
        owner.update();
        owner.paused = false;
        owner.update();
        return { state: owner.state, calls };
    });
    expect(result).toEqual({
        state: "walk",
        calls: ["idle", "idle update", "idle end", "walk", "walk update"],
    });
});
