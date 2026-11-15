import { expect, test } from "@playwright/test";

test("keyboard, code, and mouse bindings still operate independently", async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        const k = kaplay({
            global: false,
            width: 320,
            height: 240,
            buttons: {
                save: { keyboard: "control+s" },
                code: { keyboardCode: "KeyQ" },
                click: { mouse: "right" },
            },
        });
        const events: string[] = [];
        k.onButtonPress(button => events.push(`+${button}`));
        k.onButtonRelease(button => events.push(`-${button}`));
        (window as any).legacyButtonTest = {
            k,
            events,
            canvas: document.querySelector("canvas"),
        };
    });

    const send = async (
        type: "keydown" | "keyup" | "mousedown" | "mouseup",
        key?: string,
    ) => {
        await page.evaluate(({ type, key }) => {
            const canvas = (window as any).legacyButtonTest
                .canvas as HTMLCanvasElement;
            if (type === "keydown" || type === "keyup") {
                canvas.dispatchEvent(
                    new KeyboardEvent(type, {
                        key,
                        code: key === "Control"
                            ? "ControlLeft"
                            : `Key${key?.toUpperCase()}`,
                    }),
                );
            }
            else {
                canvas.dispatchEvent(new MouseEvent(type, { button: 2 }));
            }
        }, { type, key });
        await page.evaluate(() =>
            new Promise<void>(resolve => {
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve())
                );
            })
        );
    };

    await send("keydown", "Control");
    await send("keydown", "s");
    await send("keydown", "q");
    await send("mousedown");
    expect(
        await page.evaluate(() => {
            const { k, events } = (window as any).legacyButtonTest;
            return {
                events: [...events],
                down: ["save", "code", "click"].filter(b => k.isButtonDown(b)),
            };
        }),
    ).toEqual({
        events: ["+save", "+code", "+click"],
        down: ["save", "code", "click"],
    });

    await send("mouseup");
    await send("keyup", "q");
    await send("keyup", "s");
    expect(
        await page.evaluate(() => {
            const { k, events } = (window as any).legacyButtonTest;
            return {
                events: [...events],
                down: ["save", "code", "click"].filter(b => k.isButtonDown(b)),
            };
        }),
    ).toEqual({
        events: ["+save", "+code", "+click", "-click", "-code", "-save"],
        down: [],
    });
});
