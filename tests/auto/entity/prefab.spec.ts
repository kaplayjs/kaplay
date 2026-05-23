import { beforeAll, describe, expect, test } from "vitest";

describe("Prefabs", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "An object created using a addPrefab() should exist",
        async () => {
            const result = await page.evaluate(() => {
                const k = kaplay();
                k.loadBean();

                const bean = k.add([
                    k.pos(10, 10),
                    k.move(k.RIGHT, 100),
                    "friend",
                ]);

                const r = bean.add([
                    k.rect(10, 10),
                ]);

                r.add([
                    k.sprite("bean"),
                ]);

                const beanPrefab = bean.serialize();

                return Promise.resolve(
                    new Promise((res) => {
                        k.onLoad(() => {
                            const bean2 = k.addPrefab(beanPrefab);

                            res(bean2.exists());
                        });
                    }),
                );
            });

            expect(result).toBeTruthy();
        },
        20000,
    );

    test(
        "An object created using a addPrefab() with parameters should keep new component props",
        async () => {
            const result = await page.evaluate(() => {
                const k = kaplay();
                k.loadBean();

                const bean = k.add([
                    k.pos(10, 10),
                    k.move(k.RIGHT, 100),
                    "friend",
                ]);

                const r = bean.add([
                    k.rect(10, 10),
                ]);

                r.add([
                    k.sprite("bean"),
                ]);

                const beanPrefab = bean.serialize();

                return Promise.resolve(
                    new Promise((res) => {
                        k.onLoad(() => {
                            const bean2 = k.addPrefab(beanPrefab, [
                                k.pos(10, 12),
                            ]);

                            res(bean2.pos.x == 10 && bean2.pos.y == 12);
                        });
                    }),
                );
            });

            expect(result).toBeTruthy();
        },
        20000,
    );
});
