import { expect, type Page, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

async function setup(page: Page) {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        const k = kaplay({
            global: false,
            width: 320,
            height: 240,
            touchToMouse: false,
            buttons: { action: { keyboard: "f", gamepad: "south" } },
        });
        (window as any).contextTest = {
            k,
            canvas: document.querySelector("canvas"),
            events: [] as string[],
        };
    });
}

async function frame(page: Page) {
    await page.evaluate(() =>
        new Promise<void>(resolve => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
}

async function key(page: Page, type: "keydown" | "keyup", value: string) {
    await page.evaluate(({ type, value }) => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(
            new KeyboardEvent(type, {
                key: value,
                code: value.length === 1 ? `Key${value.toUpperCase()}` : value,
                bubbles: true,
            }),
        );
    }, { type, value });
    await frame(page);
}

async function pressKey(page: Page, value: string) {
    await key(page, "keydown", value);
    await key(page, "keyup", value);
}

async function mouse(
    page: Page,
    type: "mousedown" | "mouseup",
    button: number,
) {
    await page.evaluate(({ type, button }) => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(new MouseEvent(type, { button, bubbles: true }));
    }, { type, button });
    await frame(page);
}

async function events(page: Page): Promise<string[]> {
    return await page.evaluate(() => [...(window as any).contextTest.events]);
}

test("nested contexts route key presses to the top and leave app handlers active", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyPress("q", () => events.push("scene"));
        k.app.onKeyPress("q", () => events.push("app"));
        const menu = k.createInputContext();
        const methods = [
            "onKeyDown",
            "onKeyPress",
            "onKeyPressRepeat",
            "onKeyRelease",
            "onCharInput",
            "onMouseDown",
            "onMousePress",
            "onMouseRelease",
            "onMouseMove",
            "onTouchStart",
            "onTouchEnd",
            "onTouchMove",
            "onScroll",
            "onGamepadButtonDown",
            "onGamepadButtonPress",
            "onGamepadButtonRelease",
            "onGamepadStick",
            "onButtonDown",
            "onButtonPress",
            "onButtonRelease",
        ];
        (window as any).contextTest.methodsPresent = methods.every(
            method => typeof menu[method] === "function",
        );
        const detachedControllers = methods.map(method => {
            const register = menu[method];
            return method === "onGamepadStick"
                ? register("left", () => {})
                : register(() => {});
        });
        (window as any).contextTest.detachedControllersValid =
            detachedControllers.every(
                controller => typeof controller?.cancel === "function",
            );
        detachedControllers.forEach(controller => controller.cancel());
        const onMenuKeyPress = menu.onKeyPress;
        onMenuKeyPress("q", () => events.push("menu"));
        const dialog = k.createInputContext();
        dialog.onKeyPress("q", () => events.push("dialog"));
        (window as any).contextTest.menu = menu;
        (window as any).contextTest.dialog = dialog;
    });
    expect(
        await page.evaluate(() => (window as any).contextTest.methodsPresent),
    ).toBe(true);
    expect(
        await page.evaluate(() =>
            (window as any).contextTest.detachedControllersValid
        ),
    ).toBe(true);
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual(["app", "scene"]);
    await page.evaluate(() => {
        const { k, menu } = (window as any).contextTest;
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    expect((await events(page)).slice(2).sort()).toEqual(["app", "menu"]);
    await page.evaluate(() => {
        const { k, dialog } = (window as any).contextTest;
        k.pushInputContext(dialog);
    });
    await pressKey(page, "q");
    expect((await events(page)).slice(4).sort()).toEqual(["app", "dialog"]);
    await page.evaluate(() => (window as any).contextTest.k.popInputContext());
    await pressKey(page, "q");
    expect((await events(page)).slice(6).sort()).toEqual(["app", "menu"]);
    await page.evaluate(() => (window as any).contextTest.k.popInputContext());
    await pressKey(page, "q");
    expect((await events(page)).slice(8).sort()).toEqual(["app", "scene"]);
});

test("context reuse respects cancellation, pause, and stack boundaries", async ({ page }) => {
    await setup(page);
    const boundaries = await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onMousePress("left", () => events.push("scene"));
        const menu = k.createInputContext();
        const controller = menu.onMousePress("left", () => events.push("menu"));
        k.popInputContext();
        k.pushInputContext(menu);
        let duplicateRejected = false;
        try {
            k.pushInputContext(menu);
        } catch {
            duplicateRejected = true;
        }
        (window as any).contextTest.menu = menu;
        (window as any).contextTest.controller = controller;
        return duplicateRejected;
    });
    expect(boundaries).toBe(true);
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    expect(await events(page)).toEqual(["menu"]);
    await page.evaluate(() => {
        const { k, controller } = (window as any).contextTest;
        controller.paused = true;
        k.popInputContext();
        k.pushInputContext((window as any).contextTest.menu);
    });
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    expect(await events(page)).toEqual(["menu"]);
    await page.evaluate(() => {
        const { k, controller } = (window as any).contextTest;
        controller.paused = false;
        controller.cancel();
        k.popInputContext();
        k.pushInputContext((window as any).contextTest.menu);
    });
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    expect(await events(page)).toEqual(["menu"]);
    await page.evaluate(() => {
        const { k } = (window as any).contextTest;
        k.popInputContext();
        k.popInputContext();
    });
    await mouse(page, "mousedown", 0);
    expect(await events(page)).toEqual(["menu", "scene"]);
    const poppedDisposed = await page.evaluate(() => {
        const { k, menu } = (window as any).contextTest;
        menu.dispose();
        try {
            k.pushInputContext(menu);
            return false;
        } catch {
            return true;
        }
    });
    expect(poppedDisposed).toBe(true);
});

test("array mouse-release filters route through the active context and retain controllers", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        for (const selected of ["left", "right"]) {
            k.onMouseRelease(
                selected,
                button => events.push(`scene-${button}`),
            );
            k.app.onMouseRelease(
                selected,
                button => events.push(`app-${button}`),
            );
        }
        const menu = k.createInputContext();
        const onRelease = menu.onMouseRelease;
        const controller = onRelease(
            ["left", "right"],
            button => events.push(`menu-${button}`),
        );
        (window as any).contextTest.menu = menu;
        (window as any).contextTest.releaseController = controller;
    });
    await mouse(page, "mousedown", 0);
    const held = await page.evaluate(() => {
        const { k, menu } = (window as any).contextTest;
        const beforePush = k.isMouseDown("left");
        k.pushInputContext(menu);
        return { beforePush, afterPush: k.isMouseDown("left") };
    });
    expect(held).toEqual({ beforePush: true, afterPush: true });
    expect(await events(page)).toEqual([]);
    await mouse(page, "mouseup", 0);
    for (const button of [2, 1]) {
        await mouse(page, "mousedown", button);
        await mouse(page, "mouseup", button);
    }
    expect((await events(page)).sort()).toEqual([
        "app-left",
        "app-right",
        "menu-left",
        "menu-right",
    ]);
    await page.evaluate(() => {
        (window as any).contextTest.releaseController.paused = true;
    });
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    expect((await events(page)).slice(4)).toEqual(["app-left"]);
    await page.evaluate(() => {
        const { k, releaseController } = (window as any).contextTest;
        releaseController.paused = false;
        releaseController.cancel();
        k.popInputContext();
    });
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    expect((await events(page)).slice(5).sort()).toEqual([
        "app-left",
        "scene-left",
    ]);
});

test("a popped context keeps its own live handlers for later reuse", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyPress("q", () => events.push("scene"));
        const menu = k.createInputContext();
        const controller = menu.onKeyPress("q", () => events.push("menu"));
        k.pushInputContext(menu);
        (window as any).contextTest.menu = menu;
        (window as any).contextTest.controller = controller;
    });
    await pressKey(page, "q");
    await page.evaluate(() => (window as any).contextTest.k.popInputContext());
    await pressKey(page, "q");
    await page.evaluate(() => {
        const { k, menu } = (window as any).contextTest;
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["menu", "scene", "menu"]);
    await page.evaluate(() => {
        const { k, menu, controller } = (window as any).contextTest;
        controller.cancel();
        k.popInputContext();
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["menu", "scene", "menu"]);
});

test("pushing a context already below the top is rejected", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const menu = k.createInputContext();
        const dialog = k.createInputContext();
        menu.onKeyPress("q", () => events.push("menu"));
        dialog.onKeyPress("q", () => events.push("dialog"));
        k.pushInputContext(menu);
        k.pushInputContext(dialog);
        try {
            k.pushInputContext(menu);
            return false;
        } catch {
            return true;
        }
    });
    expect(result).toBe(true);
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["dialog"]);
});

test("switching contexts preserves held input without synthetic callbacks", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyRelease("q", () => events.push("scene-up"));
        const menu = k.createInputContext();
        menu.onKeyPress("q", () => events.push("menu-down"));
        menu.onKeyRelease("q", () => events.push("menu-up"));
        (window as any).contextTest.menu = menu;
    });
    await key(page, "keydown", "q");
    const held = await page.evaluate(() => {
        const { k, menu, events } = (window as any).contextTest;
        k.pushInputContext(menu);
        return { down: k.isKeyDown("q"), events: [...events] };
    });
    expect(held).toEqual({ down: true, events: [] });
    await key(page, "keyup", "q");
    expect(await events(page)).toEqual(["menu-up"]);
    const restored = await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.popInputContext();
        return { down: k.isKeyDown("q"), events: [...events] };
    });
    expect(restored).toEqual({ down: false, events: ["menu-up"] });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["menu-up", "scene-up"]);
});

test("held and repeated key callbacks use the active context on real input ticks", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyDown("q", () => events.push("scene-down"));
        k.onKeyPressRepeat("q", () => events.push("scene-repeat"));
        const menu = k.createInputContext();
        menu.onKeyDown("q", () => events.push("menu-down"));
        menu.onKeyPressRepeat("q", () => events.push("menu-repeat"));
        k.pushInputContext(menu);
        (window as any).contextTest.menu = menu;
    });
    await key(page, "keydown", "q");
    await page.evaluate(() => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "q",
                code: "KeyQ",
                repeat: true,
                bubbles: true,
            }),
        );
    });
    await frame(page);
    const first = await events(page);
    expect(new Set(first)).toEqual(new Set(["menu-down", "menu-repeat"]));
    const held = await page.evaluate(() => {
        const { k } = (window as any).contextTest;
        k.popInputContext();
        return k.isKeyDown("q");
    });
    expect(held).toBe(true);
    await frame(page);
    const afterPop = (await events(page)).slice(first.length);
    expect(new Set(afterPop)).toEqual(new Set(["scene-down"]));
    await key(page, "keyup", "q");
});

test("character, scroll, touch, and pointer callbacks follow the active context", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onCharInput(() => events.push("scene-char"));
        k.onScroll(() => events.push("scene-scroll"));
        k.onTouchStart(() => events.push("scene-touch"));
        k.onTouchMove(() => events.push("scene-touch-move"));
        k.onTouchEnd(() => events.push("scene-touch-end"));
        k.onMousePress(() => events.push("scene-mouse"));
        k.onMouseDown(() => events.push("scene-mouse-down"));
        k.onMouseRelease(() => events.push("scene-mouse-up"));
        k.onMouseMove(() => events.push("scene-mouse-move"));
        const menu = k.createInputContext();
        menu.onCharInput(() => events.push("menu-char"));
        const onMenuScroll = menu.onScroll;
        onMenuScroll(() => events.push("menu-scroll"));
        const onMenuTouchStart = menu.onTouchStart;
        onMenuTouchStart(() => events.push("menu-touch"));
        menu.onTouchMove(() => events.push("menu-touch-move"));
        menu.onTouchEnd(() => events.push("menu-touch-end"));
        const onMenuMousePress = menu.onMousePress;
        onMenuMousePress(() => events.push("menu-mouse"));
        menu.onMouseDown(() => events.push("menu-mouse-down"));
        menu.onMouseRelease(() => events.push("menu-mouse-up"));
        menu.onMouseMove(() => events.push("menu-mouse-move"));
        k.pushInputContext(menu);
    });
    await key(page, "keydown", "q");
    await mouse(page, "mousedown", 0);
    await mouse(page, "mouseup", 0);
    await page.evaluate(() => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(
            new MouseEvent("mousemove", {
                clientX: 12,
                clientY: 18,
                bubbles: true,
            }),
        );
    });
    await frame(page);
    await page.evaluate(() => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        canvas.dispatchEvent(
            new WheelEvent("wheel", {
                deltaX: 2,
                deltaY: 3,
                bubbles: true,
                cancelable: true,
            }),
        );
        const touch = new Touch({
            identifier: 1,
            target: canvas,
            clientX: 20,
            clientY: 30,
        });
        canvas.dispatchEvent(
            new TouchEvent("touchstart", {
                changedTouches: [touch],
                touches: [touch],
                targetTouches: [touch],
                bubbles: true,
                cancelable: true,
            }),
        );
    });
    await frame(page);
    await page.evaluate(() => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        const touch = new Touch({
            identifier: 1,
            target: canvas,
            clientX: 24,
            clientY: 34,
        });
        canvas.dispatchEvent(
            new TouchEvent("touchmove", {
                changedTouches: [touch],
                touches: [touch],
                targetTouches: [touch],
                bubbles: true,
                cancelable: true,
            }),
        );
    });
    await frame(page);
    await page.evaluate(() => {
        const canvas = (window as any).contextTest.canvas as HTMLCanvasElement;
        const touch = new Touch({
            identifier: 1,
            target: canvas,
            clientX: 24,
            clientY: 34,
        });
        canvas.dispatchEvent(
            new TouchEvent("touchend", {
                changedTouches: [touch],
                touches: [],
                targetTouches: [],
                bubbles: true,
                cancelable: true,
            }),
        );
    });
    await frame(page);
    expect(new Set(await events(page))).toEqual(
        new Set([
            "menu-char",
            "menu-mouse",
            "menu-mouse-down",
            "menu-mouse-move",
            "menu-mouse-up",
            "menu-scroll",
            "menu-touch",
            "menu-touch-end",
            "menu-touch-move",
        ]),
    );
});

test("gamepad and logical-button callbacks route while physical state keeps updating", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        let scenePadDownSeen = false;
        k.onGamepadButtonDown("south", () => {
            if (!scenePadDownSeen) {
                scenePadDownSeen = true;
                events.push("scene-pad-down");
            }
        });
        k.onGamepadButtonPress("south", () => events.push("scene-pad"));
        k.onGamepadButtonRelease("south", () => events.push("scene-pad-up"));
        let sceneStickSeen = false;
        k.onGamepadStick("left", value => {
            if (value.x > 0.5 && !sceneStickSeen) {
                sceneStickSeen = true;
                events.push("scene-stick");
            }
        });
        k.onButtonPress("action", () => events.push("scene-action"));
        let sceneActionDownSeen = false;
        k.onButtonDown("action", () => {
            if (!sceneActionDownSeen) {
                sceneActionDownSeen = true;
                events.push("scene-action-down");
            }
        });
        k.onButtonRelease("action", () => events.push("scene-action-up"));
        const menu = k.createInputContext();
        let menuPadDownSeen = false;
        menu.onGamepadButtonDown(["south", "east"], () => {
            if (!menuPadDownSeen) {
                menuPadDownSeen = true;
                events.push("menu-pad-down");
            }
        });
        const onMenuGamepadButtonPress = menu.onGamepadButtonPress;
        onMenuGamepadButtonPress("south", () => events.push("menu-pad"));
        menu.onGamepadButtonRelease("south", () => events.push("menu-pad-up"));
        let menuStickSeen = false;
        menu.onGamepadStick("left", value => {
            if (value.x > 0.5 && !menuStickSeen) {
                menuStickSeen = true;
                events.push("menu-stick");
            }
        });
        const onMenuButtonPress = menu.onButtonPress;
        onMenuButtonPress(
            ["action", "cancel"],
            () => events.push("menu-action"),
        );
        let menuActionDownSeen = false;
        menu.onButtonDown(["action", "cancel"], () => {
            if (!menuActionDownSeen) {
                menuActionDownSeen = true;
                events.push("menu-action-down");
            }
        });
        menu.onButtonRelease(
            ["action", "cancel"],
            () => events.push("menu-action-up"),
        );
        k.pushInputContext(menu);
        (window as any).contextTest.pad = {
            id: "test controller",
            index: 0,
            buttons: Array.from(
                { length: 17 },
                () => ({ pressed: false, value: 0 }),
            ),
            axes: [0, 0, 0, 0],
        };
        Object.defineProperty(navigator, "getGamepads", {
            configurable: true,
            value: () => [(window as any).contextTest.pad],
        });
        (window as any).contextTest.pad.buttons[0].pressed = true;
        (window as any).contextTest.pad.buttons[0].value = 1;
        (window as any).contextTest.pad.axes[0] = 0.8;
    });
    await frame(page);
    const first = await events(page);
    expect(new Set(first)).toEqual(
        new Set([
            "menu-action",
            "menu-action-down",
            "menu-pad",
            "menu-pad-down",
            "menu-stick",
        ]),
    );
    const down = await page.evaluate(() =>
        (window as any).contextTest.k.isButtonDown("action")
    );
    expect(down).toBe(true);
    await page.evaluate(() => {
        const { k, pad } = (window as any).contextTest;
        k.popInputContext();
        pad.buttons[0].pressed = false;
        pad.axes[0] = 0;
    });
    await frame(page);
    const second = await events(page);
    expect(new Set(second.slice(first.length))).toEqual(
        new Set([
            "scene-action-up",
            "scene-pad-up",
        ]),
    );
    await page.evaluate(() => {
        const pad = (window as any).contextTest.pad;
        pad.buttons[0].pressed = true;
        pad.axes[0] = 0.8;
    });
    await frame(page);
    expect(new Set((await events(page)).slice(second.length))).toEqual(
        new Set([
            "scene-action",
            "scene-action-down",
            "scene-pad",
            "scene-pad-down",
            "scene-stick",
        ]),
    );
});

test("object input listeners pause while non-input scene work continues", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const object = k.add([]);
        object.onKeyPress("q", () => events.push("object"));
        k.onUpdate(() => {
            (window as any).contextTest.updates =
                ((window as any).contextTest.updates ?? 0) + 1;
        });
        k.onDraw(() => {
            (window as any).contextTest.draws =
                ((window as any).contextTest.draws ?? 0) + 1;
        });
        const menu = k.createInputContext();
        menu.onKeyPress("q", () => events.push("menu"));
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["menu"]);
    expect(await page.evaluate(() => (window as any).contextTest.updates))
        .toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as any).contextTest.draws))
        .toBeGreaterThan(0);
    await page.evaluate(() => (window as any).contextTest.k.popInputContext());
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["menu", "object"]);
});

test("object listeners registered in a context resume when that context returns", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const background = k.add([]);
        background.onKeyPress("q", () => events.push("background"));
        const menuObject = k.add([]);
        const menu = k.createInputContext();
        k.pushInputContext(menu);
        menuObject.onKeyPress("q", () => events.push("menu-object"));
        menu.onKeyPress("q", () => events.push("menu-context"));
        (window as any).contextTest.lateObject = k.add([]);
        (window as any).contextTest.menu = menu;
    });
    await pressKey(page, "q");
    expect(new Set(await events(page))).toEqual(
        new Set([
            "menu-context",
            "menu-object",
        ]),
    );
    await page.evaluate(() => {
        const { k, lateObject, events } = (window as any).contextTest;
        k.popInputContext();
        lateObject.onKeyPress("q", () => events.push("late-bottom"));
    });
    await pressKey(page, "q");
    expect((await events(page)).slice(2).sort()).toEqual([
        "background",
        "late-bottom",
    ]);
    await page.evaluate(() => {
        const { k, menu } = (window as any).contextTest;
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    expect(new Set((await events(page)).slice(4))).toEqual(
        new Set([
            "menu-context",
            "menu-object",
        ]),
    );
});

test("scene registrations made under a modal remain in the bottom context", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const menu = k.createInputContext();
        k.pushInputContext(menu);
        k.onKeyPress("q", () => events.push("scene"));
        k.app.onKeyPress("q", () => events.push("app"));
        const object = k.add([]);
        object.onKeyPress("q", () => events.push("menu-object"));
        menu.onKeyPress("q", () => events.push("menu"));
        (window as any).contextTest.menu = menu;
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual(["app", "menu", "menu-object"]);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        events.length = 0;
        k.popInputContext();
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual(["app", "scene"]);
    await page.evaluate(() => {
        const { k, menu, events } = (window as any).contextTest;
        events.length = 0;
        k.pushInputContext(menu);
        menu.dispose();
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual(["app", "scene"]);
});

test("disposing an inner or middle context cancels its handlers and restores routing", async ({ page }) => {
    await setup(page);
    const rejection = await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyPress("q", () => events.push("scene"));
        const menu = k.createInputContext();
        menu.onKeyPress("q", () => events.push("menu"));
        const dialog = k.createInputContext();
        dialog.onKeyPress("q", () => events.push("dialog"));
        k.pushInputContext(menu);
        k.pushInputContext(dialog);
        menu.dispose();
        menu.dispose();
        let registrationRejected = false;
        let scrollRejected = false;
        let stickRejected = false;
        let pushRejected = false;
        try {
            menu.onKeyPress("q", () => {});
        } catch {
            registrationRejected = true;
        }
        try {
            menu.onScroll(() => {});
        } catch {
            scrollRejected = true;
        }
        try {
            menu.onGamepadStick("left", () => {});
        } catch {
            stickRejected = true;
        }
        try {
            k.pushInputContext(menu);
        } catch {
            pushRejected = true;
        }
        (window as any).contextTest.dialog = dialog;
        return {
            registrationRejected,
            scrollRejected,
            stickRejected,
            pushRejected,
        };
    });
    expect(rejection).toEqual({
        registrationRejected: true,
        scrollRejected: true,
        stickRejected: true,
        pushRejected: true,
    });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["dialog"]);
    await page.evaluate(() => {
        const { dialog } = (window as any).contextTest;
        dialog.dispose();
        dialog.dispose();
    });
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["dialog", "scene"]);
});

test("scene changes dispose prior contexts and their registrations", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.scene("first", () => {
            const dormant = k.createInputContext();
            const popped = k.createInputContext();
            k.pushInputContext(popped);
            k.popInputContext();
            const context = k.createInputContext();
            context.onKeyPress("q", () => events.push("old"));
            k.pushInputContext(context);
            (window as any).contextTest.old = [context, popped, dormant];
        });
        k.scene("second", () => {
            k.onKeyPress("q", () => events.push("new"));
        });
        k.go("first");
    });
    await frame(page);
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["old"]);
    await page.evaluate(() => (window as any).contextTest.k.go("second"));
    await frame(page);
    await pressKey(page, "q");
    expect(await events(page)).toEqual(["old", "new"]);
    const rejected = await page.evaluate(() => {
        const { k, old } = (window as any).contextTest;
        return old.map((context: any) => {
            try {
                k.pushInputContext(context);
                return false;
            } catch {
                return true;
            }
        });
    });
    expect(rejected).toEqual([true, true, true]);
});

test("all callbacks from one keydown keep the same input recipient", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const menu = k.createInputContext();
        k.onCharInput(character => {
            if (character === "q") {
                events.push("scene-char");
                k.pushInputContext(menu);
            }
        });
        k.onKeyPress("q", () => events.push("scene-key"));
        menu.onKeyPress("q", () => events.push("menu-key"));
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual([
        "scene-char",
        "scene-key",
    ]);
    await pressKey(page, "q");
    expect((await events(page)).slice(2)).toEqual(["menu-key"]);
});

test("one gamepad press keeps one recipient across logical and physical callbacks", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const menu = k.createInputContext();
        k.onButtonPress("action", () => {
            events.push("scene-logical");
            k.pushInputContext(menu);
        });
        k.onGamepadButtonPress("south", () => events.push("scene-physical"));
        menu.onGamepadButtonPress("south", () => events.push("menu-physical"));
        (window as any).contextTest.pad = {
            id: "test controller",
            index: 0,
            buttons: Array.from(
                { length: 17 },
                () => ({ pressed: false, value: 0 }),
            ),
            axes: [0, 0, 0, 0],
        };
        Object.defineProperty(navigator, "getGamepads", {
            configurable: true,
            value: () => [(window as any).contextTest.pad],
        });
        (window as any).contextTest.pad.buttons[0].pressed = true;
        (window as any).contextTest.pad.buttons[0].value = 1;
    });
    await frame(page);
    expect((await events(page)).sort()).toEqual([
        "scene-logical",
        "scene-physical",
    ]);
    await page.evaluate(() => {
        (window as any).contextTest.pad.buttons[0].pressed = false;
    });
    await frame(page);
    await page.evaluate(() => {
        (window as any).contextTest.pad.buttons[0].pressed = true;
    });
    await frame(page);
    expect((await events(page)).slice(2)).toEqual(["menu-physical"]);
});

test("stack changes inside callbacks affect the next input event", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        const menu = k.createInputContext();
        k.onKeyPress("q", () => {
            events.push("scene-first");
            k.pushInputContext(menu);
        });
        k.onKeyPress("q", () => events.push("scene-second"));
        menu.onKeyPress("q", () => {
            events.push("menu-first");
            k.popInputContext();
        });
        menu.onKeyPress("q", () => events.push("menu-second"));
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual([
        "scene-first",
        "scene-second",
    ]);
    await pressKey(page, "q");
    expect((await events(page)).slice(2).sort()).toEqual([
        "menu-first",
        "menu-second",
    ]);
    expect((await events(page)).length).toBe(4);
});

test("public declarations expose context overloads and stack operations", () => {
    const dir = mkdtempSync(join(tmpdir(), "kaplay-input-contexts-"));
    try {
        const packageInfo = JSON.parse(readFileSync("package.json", "utf8"));
        const declaration = resolve(packageInfo.types);
        const source = `
            import type kaplay from ${JSON.stringify(declaration)};
            declare const k: ReturnType<typeof kaplay>;
            const context = k.createInputContext();
            type Controller = ReturnType<typeof k.onKeyPress>;
            const callback = () => {};
            const controllers: Controller[] = [
                context.onKeyDown(callback),
                context.onKeyDown("q", callback),
                context.onKeyDown(["q", "e"], callback),
                context.onKeyPress(callback),
                context.onKeyPress("q", callback),
                context.onKeyPress(["q", "e"], callback),
                context.onKeyPressRepeat(callback),
                context.onKeyPressRepeat("q", callback),
                context.onKeyPressRepeat(["q", "e"], callback),
                context.onKeyRelease(callback),
                context.onKeyRelease("q", callback),
                context.onKeyRelease(["q", "e"], callback),
                context.onCharInput(callback),
                context.onMouseDown(callback),
                context.onMouseDown("left", callback),
                context.onMouseDown(["left", "right"], callback),
                context.onMousePress(callback),
                context.onMousePress("left", callback),
                context.onMousePress(["left", "right"], callback),
                context.onMouseRelease(callback),
                context.onMouseRelease("left", callback),
                context.onMouseRelease(["left", "right"], callback),
                context.onMouseMove(callback),
                context.onTouchStart(callback),
                context.onTouchMove(callback),
                context.onTouchEnd(callback),
                context.onScroll(callback),
                context.onGamepadButtonDown(callback),
                context.onGamepadButtonDown("south", callback),
                context.onGamepadButtonDown(["south", "east"], callback),
                context.onGamepadButtonPress(callback),
                context.onGamepadButtonPress("south", callback),
                context.onGamepadButtonPress(["south", "east"], callback),
                context.onGamepadButtonRelease(callback),
                context.onGamepadButtonRelease("south", callback),
                context.onGamepadButtonRelease(["south", "east"], callback),
                context.onGamepadStick("left", callback),
                context.onButtonDown(callback),
                context.onButtonDown("action", callback),
                context.onButtonDown(["action", "cancel"], callback),
                context.onButtonPress(callback),
                context.onButtonPress("action", callback),
                context.onButtonPress(["action", "cancel"], callback),
                context.onButtonRelease(callback),
                context.onButtonRelease("action", callback),
                context.onButtonRelease(["action", "cancel"], callback),
            ];
            void controllers;
            k.pushInputContext(context);
            k.popInputContext();
            context.dispose();
        `;
        const path = join(dir, "consumer.ts");
        writeFileSync(path, source);
        try {
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
        } catch (error) {
            const failure = error as Error & {
                stdout?: Buffer;
                stderr?: Buffer;
            };
            throw new Error(
                [failure.message, failure.stdout, failure.stderr]
                    .filter(Boolean)
                    .map(part => part.toString())
                    .join("\n"),
            );
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("disposing during dispatch stops remaining context callbacks", async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const { k, events } = (window as any).contextTest;
        k.onKeyPress("q", () => events.push("scene"));
        k.app.onKeyPress("q", () => events.push("app"));
        const menu = k.createInputContext();
        for (const label of ["first", "second"]) {
            menu.onKeyPress("q", () => {
                events.push(label);
                menu.dispose();
            });
        }
        k.pushInputContext(menu);
    });
    await pressKey(page, "q");
    const firstInput = await events(page);
    expect(firstInput.filter(event => event === "app")).toHaveLength(1);
    expect(firstInput.filter(event => event === "first" || event === "second"))
        .toHaveLength(1);
    expect(firstInput).not.toContain("scene");
    await page.evaluate(() => {
        (window as any).contextTest.events.length = 0;
    });
    await pressKey(page, "q");
    expect((await events(page)).sort()).toEqual(["app", "scene"]);
});
