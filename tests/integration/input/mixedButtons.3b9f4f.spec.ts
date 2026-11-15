import { expect, type Page, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { ButtonsDef } from "../../../src";

async function setup(page: Page, buttons: ButtonsDef) {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate((defs) => {
        const k = kaplay({
            global: false,
            buttons: defs,
            width: 320,
            height: 240,
        });
        const events: string[] = [];
        k.onButtonPress(button => events.push(`+${button}`));
        k.onButtonRelease(button => events.push(`-${button}`));
        (window as any).buttonTest = {
            k,
            events,
            canvas: document.querySelector("canvas"),
        };
    }, buttons);
}

async function nextInputFrame(page: Page) {
    await page.evaluate(() =>
        new Promise<void>(resolve => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
}

async function input(
    page: Page,
    type: "keydown" | "keyup" | "mousedown" | "mouseup",
    value: string,
) {
    await page.evaluate(({ type, value }) => {
        const canvas = (window as any).buttonTest.canvas as HTMLCanvasElement;
        if (type === "keydown" || type === "keyup") {
            const key = value === "space" ? " " : value;
            const code = value.length === 1
                ? `Key${value.toUpperCase()}`
                : value;
            canvas.dispatchEvent(
                new KeyboardEvent(type, { key, code, bubbles: true }),
            );
        }
        else {
            const button = ({
                left: 0,
                middle: 1,
                right: 2,
                back: 3,
                forward: 4,
            } as Record<string, number>)[
                value
            ];
            canvas.dispatchEvent(
                new MouseEvent(type, { button, bubbles: true }),
            );
        }
    }, { type, value });
    await nextInputFrame(page);
}

async function snapshot(page: Page, buttons: string[]) {
    return await page.evaluate((names) => {
        const { k, events } = (window as any).buttonTest;
        return {
            events: [...events],
            down: names.filter(name => k.isButtonDown(name)),
        };
    }, buttons);
}

test("keyboard and mouse together press and release one button", async ({ page }) => {
    await setup(page, {
        inspect: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "keydown", "Shift");
    expect(await snapshot(page, ["inspect"])).toEqual({ events: [], down: [] });
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["inspect"])).toEqual({
        events: ["+inspect"],
        down: ["inspect"],
    });
    await input(page, "mouseup", "left");
    expect(await snapshot(page, ["inspect"])).toEqual({
        events: ["+inspect", "-inspect"],
        down: [],
    });
});

test("modified click takes precedence over plain click", async ({ page }) => {
    await setup(page, {
        select: { mouse: "left" },
        inspect: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["select", "inspect"])).toEqual({
        events: ["+select"],
        down: ["select"],
    });
    await input(page, "mouseup", "left");
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["select", "inspect"])).toEqual({
        events: ["+select", "-select", "+inspect"],
        down: ["inspect"],
    });
});

test("most specific matching chords win and equally specific chords can both fire", async ({ page }) => {
    await setup(page, {
        shifted: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
        special: {
            keyboardMouse: { keyboard: ["control", "shift"], mouse: "left" },
        },
        second: {
            keyboardMouse: { keyboard: ["shift", "control"], mouse: "left" },
        },
    });
    await input(page, "keydown", "Control");
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    const tied = await snapshot(page, ["shifted", "special", "second"]);
    expect(tied.down).toEqual(["special", "second"]);
    expect(tied.events.sort()).toEqual(["+second", "+special"]);
    await input(page, "keyup", "Control");
    const released = await snapshot(page, ["shifted", "special", "second"]);
    expect(released.down).toEqual([]);
    expect(released.events.sort()).toEqual([
        "+second",
        "+special",
        "-second",
        "-special",
    ]);
});

test("specificity counts distinct inputs rather than duplicate entries", async ({ page }) => {
    await setup(page, {
        repeated: {
            keyboardMouse: { keyboard: ["shift", "shift"], mouse: "left" },
        },
        distinct: {
            keyboardMouse: { keyboard: ["shift", "alt"], mouse: "left" },
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "keydown", "Alt");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["repeated", "distinct"])).toEqual({
        events: ["+distinct"],
        down: ["distinct"],
    });
});

test("keyboard codes participate in precedence and specificity", async ({ page }) => {
    await setup(page, {
        plain: { mouse: "left" },
        codeOnly: { keyboardMouse: { keyboardCode: "KeyQ", mouse: "left" } },
        combined: {
            keyboardMouse: {
                keyboard: "shift",
                keyboardCode: "KeyQ",
                mouse: "left",
            },
        },
    });
    await input(page, "keydown", "q");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["plain", "codeOnly", "combined"])).toEqual({
        events: ["+codeOnly"],
        down: ["codeOnly"],
    });
    await input(page, "mouseup", "left");
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["plain", "codeOnly", "combined"])).toEqual({
        events: ["+codeOnly", "-codeOnly", "+combined"],
        down: ["combined"],
    });
});

test("a later press on another mouse button does not replace an active chord", async ({ page }) => {
    await setup(page, {
        leftAction: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
        rightAction: {
            keyboardMouse: { keyboard: ["control", "alt"], mouse: "right" },
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await input(page, "keydown", "Control");
    await input(page, "keydown", "Alt");
    await input(page, "mousedown", "right");
    expect(await snapshot(page, ["leftAction", "rightAction"])).toEqual({
        events: ["+leftAction", "+rightAction"],
        down: ["leftAction", "rightAction"],
    });
    await input(page, "mouseup", "right");
    expect(await snapshot(page, ["leftAction", "rightAction"])).toEqual({
        events: ["+leftAction", "+rightAction", "-rightAction"],
        down: ["leftAction"],
    });
});

test("modifier changes while mouse is held do not activate another binding", async ({ page }) => {
    await setup(page, {
        plain: { mouse: "left" },
        shifted: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "mousedown", "left");
    await input(page, "keydown", "Shift");
    expect(await snapshot(page, ["plain", "shifted"])).toEqual({
        events: ["+plain"],
        down: ["plain"],
    });
    await input(page, "mouseup", "left");
    await input(page, "mousedown", "left");
    await input(page, "keyup", "Shift");
    expect(await snapshot(page, ["plain", "shifted"])).toEqual({
        events: ["+plain", "-plain", "+shifted", "-shifted"],
        down: [],
    });
});

test("all required keys and keyboard codes must be held", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: {
                keyboard: ["shift", "alt"],
                keyboardCode: "KeyQ",
                mouse: "right",
            },
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "keydown", "q");
    await input(page, "mousedown", "right");
    expect(await snapshot(page, ["action"])).toEqual({ events: [], down: [] });
    await input(page, "mouseup", "right");
    await input(page, "keydown", "Alt");
    await input(page, "mousedown", "right");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "q");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("every keyboard code in a readonly chord array is required", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: {
                keyboardCode: ["KeyQ", "KeyE"],
                mouse: "middle",
            },
        },
    });
    await input(page, "keydown", "q");
    await input(page, "mousedown", "middle");
    expect(await snapshot(page, ["action"])).toEqual({ events: [], down: [] });
    await input(page, "mouseup", "middle");
    await input(page, "keydown", "e");
    await input(page, "mousedown", "middle");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "q");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("keyboardCode uses the physical code even when the key label differs", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboardCode: "KeyQ", mouse: "left" } },
    });
    await page.evaluate(() => {
        const canvas = (window as any).buttonTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "z",
                code: "KeyQ",
                bubbles: true,
            }),
        );
    });
    await nextInputFrame(page);
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
});

test("mixed presses and releases update the Buttons API state flags", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await page.evaluate(() => {
        const { k } = (window as any).buttonTest;
        const flags: boolean[][] = [];
        k.onButtonPress((button: string) => {
            flags.push([k.isButtonPressed(button), k.isButtonDown(button)]);
        });
        k.onButtonRelease((button: string) => {
            flags.push([k.isButtonReleased(button), k.isButtonDown(button)]);
        });
        (window as any).buttonTest.flags = flags;
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await input(page, "keyup", "Shift");
    expect(await page.evaluate(() => (window as any).buttonTest.flags)).toEqual(
        [
            [true, true],
            [true, false],
        ],
    );
});

test("public declarations accept readonly keyboard requirements", () => {
    const dir = mkdtempSync(join(tmpdir(), "kaplay-chord-types-"));
    try {
        const declaration = resolve("dist/doc.d.ts");
        const fixture = `
            import type { ButtonBinding } from ${JSON.stringify(declaration)};
            const keys = ["shift", "alt"] as const;
            const codes = ["KeyQ", "KeyE"] as const;
            const binding: ButtonBinding = {
                keyboardMouse: [
                    { mouse: "left", keyboard: keys, keyboardCode: codes },
                ],
            };
            void binding;
        `;
        const path = join(dir, "consumer.ts");
        writeFileSync(path, fixture);
        execFileSync(process.execPath, [
            resolve("node_modules/typescript/bin/tsc"),
            "--noEmit",
            "--strict",
            "--skipLibCheck",
            "--target",
            "esnext",
            "--module",
            "esnext",
            "--moduleResolution",
            "bundler",
            path,
        ]);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("another active source keeps the same logical button down", async ({ page }) => {
    await setup(page, {
        action: {
            keyboard: "space",
            keyboardMouse: { keyboard: "shift", mouse: "left" },
        },
    });
    await input(page, "keydown", "space");
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await input(page, "keyup", "space");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "mouseup", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("setButton clears a held chord without changing another button", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
        jump: { keyboard: "space" },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await input(page, "keydown", "space");
    await page.evaluate(() =>
        (window as any).buttonTest.k.setButton("action", { keyboardMouse: [] })
    );
    expect((await snapshot(page, ["jump"])).down).toEqual(["jump"]);
    await input(page, "mouseup", "left");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action", "jump"])).toEqual({
        events: ["+action", "+jump", "-action"],
        down: ["jump"],
    });
});

test("setButton replaces a held chord without retroactive activation", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await page.evaluate(() =>
        (window as any).buttonTest.k.setButton("action", {
            keyboardMouse: { keyboard: "control", mouse: "left" },
        })
    );
    await input(page, "keydown", "Control");
    expect(
        (await snapshot(page, ["action"])).events.filter(e => e === "+action"),
    ).toHaveLength(1);
    await input(page, "mouseup", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action", "+action"],
        down: ["action"],
    });
});

test("rebinding one action leaves another mixed action intact", async ({ page }) => {
    await setup(page, {
        first: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
        second: { keyboardMouse: { keyboard: "control", mouse: "right" } },
    });
    await input(page, "keydown", "Control");
    await input(page, "mousedown", "right");
    await page.evaluate(() =>
        (window as any).buttonTest.k.setButton("first", { keyboardMouse: [] })
    );
    expect(await snapshot(page, ["first", "second"])).toEqual({
        events: ["+second"],
        down: ["second"],
    });
    await input(page, "mouseup", "right");
    await input(page, "mousedown", "right");
    expect(await snapshot(page, ["first", "second"])).toEqual({
        events: ["+second", "-second", "+second"],
        down: ["second"],
    });
});

test("getButton reflects a replaced mixed binding", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    const replacement = { keyboard: "control", mouse: "right" } as const;
    await page.evaluate((chord) => {
        (window as any).buttonTest.k.setButton("action", {
            keyboardMouse: chord,
        });
    }, replacement);
    expect(
        await page.evaluate(() =>
            (window as any).buttonTest.k.getButton("action").keyboardMouse
        ),
    ).toEqual(replacement);
    await input(page, "keydown", "Control");
    await input(page, "mousedown", "right");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
});

test("clearing mixed alternatives preserves another binding on that action", async ({ page }) => {
    await setup(page, {
        action: {
            keyboard: "space",
            keyboardMouse: { keyboard: "shift", mouse: "left" },
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keydown", "space");
    await page.evaluate(() =>
        (window as any).buttonTest.k.setButton("action", { keyboardMouse: [] })
    );
    await input(page, "mouseup", "left");
    expect((await snapshot(page, ["action"])).down).toEqual(["action"]);
    await input(page, "keyup", "space");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("focus loss releases a held mixed chord", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await page.evaluate(() =>
        (window as any).buttonTest.canvas.dispatchEvent(new Event("blur"))
    );
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("window blur clears both the active chord and its held modifiers", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("keyboard state stays isolated across two KAPLAY instances", async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        const first = document.createElement("canvas");
        const second = document.createElement("canvas");
        document.body.append(first, second);
        const options = {
            global: false,
            width: 160,
            height: 120,
            buttons: {
                action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
            },
        };
        const a = kaplay({ ...options, canvas: first });
        const b = kaplay({ ...options, canvas: second });
        (window as any).twoButtonTests = { a, b, first, second };
        first.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft" }),
        );
        second.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
    });
    await nextInputFrame(page);
    expect(
        await page.evaluate(() => {
            const { a, b } = (window as any).twoButtonTests;
            return [a.isButtonDown("action"), b.isButtonDown("action")];
        }),
    ).toEqual([false, false]);
    await page.evaluate(() => {
        const { second } = (window as any).twoButtonTests;
        second.dispatchEvent(new MouseEvent("mouseup", { button: 0 }));
        second.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft" }),
        );
        second.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
    });
    await nextInputFrame(page);
    expect(
        await page.evaluate(() => {
            const { a, b } = (window as any).twoButtonTests;
            return [a.isButtonDown("action"), b.isButtonDown("action")];
        }),
    ).toEqual([false, true]);
});

test("alternative chords for one action share its logical state", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: [
                { keyboard: "shift", mouse: "left" },
                { keyboardCode: "KeyQ", mouse: "right" },
            ],
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    await input(page, "keydown", "q");
    await input(page, "mousedown", "right");
    await input(page, "mouseup", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "q");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("two held keyboard alternatives do not release on the first keyup", async ({ page }) => {
    await setup(page, { action: { keyboard: ["a", "b"] } });
    await input(page, "keydown", "a");
    await input(page, "keydown", "b");
    await input(page, "keyup", "a");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "b");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("a held gamepad binding survives keyboard and mouse focus loss", async ({ page }) => {
    await setup(page, {
        action: {
            gamepad: "south",
            keyboardMouse: { keyboard: "shift", mouse: "left" },
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await page.evaluate(() => {
        const buttons = Array.from(
            { length: 17 },
            () => ({ pressed: false, value: 0 }),
        );
        (window as any).fakeGamepad = {
            id: "test controller",
            index: 0,
            buttons,
            axes: [0, 0, 0, 0],
        };
        Object.defineProperty(navigator, "getGamepads", {
            configurable: true,
            value: () => [(window as any).fakeGamepad],
        });
        buttons[0].pressed = true;
        buttons[0].value = 1;
    });
    await nextInputFrame(page);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await page.evaluate(() => {
        (window as any).fakeGamepad.buttons[0].pressed = false;
        (window as any).fakeGamepad.buttons[0].value = 0;
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("two gamepads keep one action down until the last source releases", async ({ page }) => {
    await setup(page, { action: { gamepad: "south" } });
    await page.evaluate(() => {
        const makePad = (index: number) => ({
            id: `test controller ${index}`,
            index,
            buttons: Array.from(
                { length: 17 },
                () => ({ pressed: false, value: 0 }),
            ),
            axes: [0, 0, 0, 0],
        });
        (window as any).fakeGamepads = [makePad(0), makePad(1)];
        Object.defineProperty(navigator, "getGamepads", {
            configurable: true,
            value: () => (window as any).fakeGamepads,
        });
        for (const pad of (window as any).fakeGamepads) {
            pad.buttons[0].pressed = true;
            pad.buttons[0].value = 1;
        }
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await page.evaluate(() => {
        (window as any).fakeGamepads[0].buttons[0].pressed = false;
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await page.evaluate(() => {
        (window as any).fakeGamepads[1].buttons[0].pressed = false;
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("distinct gamepad alternatives share one logical down state", async ({ page }) => {
    await setup(page, { action: { gamepad: ["south", "east"] } });
    await page.evaluate(() => {
        const buttons = Array.from(
            { length: 17 },
            () => ({ pressed: false, value: 0 }),
        );
        (window as any).fakeGamepad = {
            id: "test controller",
            index: 0,
            buttons,
            axes: [0, 0, 0, 0],
        };
        Object.defineProperty(navigator, "getGamepads", {
            configurable: true,
            value: () => [(window as any).fakeGamepad],
        });
        buttons[0].pressed = true;
        buttons[0].value = 1;
    });
    await nextInputFrame(page);
    await page.evaluate(() => {
        (window as any).fakeGamepad.buttons[1].pressed = true;
        (window as any).fakeGamepad.buttons[1].value = 1;
    });
    await nextInputFrame(page);
    await page.evaluate(() => {
        (window as any).fakeGamepad.buttons[0].pressed = false;
        (window as any).fakeGamepad.buttons[0].value = 0;
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await page.evaluate(() => {
        (window as any).fakeGamepad.buttons[1].pressed = false;
        (window as any).fakeGamepad.buttons[1].value = 0;
    });
    await nextInputFrame(page);
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("same-mouse alternatives keep one action down until the last releases", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: [
                { keyboard: "shift", mouse: "left" },
                { keyboard: "control", mouse: "left" },
            ],
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "keydown", "Control");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "Shift");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
    await input(page, "keyup", "Control");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"],
        down: [],
    });
});

test("unrequired held keyboard inputs do not prevent a chord match", async ({ page }) => {
    await setup(page, {
        action: { keyboardMouse: { keyboard: "shift", mouse: "left" } },
        decoy: {
            keyboardMouse: { keyboard: ["alt", "control"], mouse: "left" },
        },
    });
    await input(page, "keydown", "Alt");
    await input(page, "keydown", "Shift");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action", "decoy"])).toEqual({
        events: ["+action"],
        down: ["action"],
    });
});

test("mixed chords support back and forward mouse buttons", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: [
                { keyboard: "shift", mouse: "back" },
                { keyboard: "shift", mouse: "forward" },
            ],
        },
    });
    await input(page, "keydown", "Shift");
    for (const button of ["back", "forward"]) {
        await input(page, "mousedown", button);
        expect(await snapshot(page, ["action"])).toEqual({
            events: button === "back"
                ? ["+action"]
                : ["+action", "-action", "+action"],
            down: ["action"],
        });
        await input(page, "mouseup", button);
    }
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action", "+action", "-action"],
        down: [],
    });
});

test("a less specific alternative on the same button does not remain active", async ({ page }) => {
    await setup(page, {
        action: {
            keyboardMouse: [
                { keyboard: "shift", mouse: "left" },
                { keyboard: ["shift", "control"], mouse: "left" },
            ],
        },
    });
    await input(page, "keydown", "Shift");
    await input(page, "keydown", "Control");
    await input(page, "mousedown", "left");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action"], down: ["action"],
    });
    await input(page, "keyup", "Control");
    expect(await snapshot(page, ["action"])).toEqual({
        events: ["+action", "-action"], down: [],
    });
});
