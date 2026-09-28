import { expect, test } from "@playwright/test";
import { getSingletonTags } from "../../../src/api/singletonTags";

test.beforeEach(async ({ page }) => {
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test.describe("KAPLAYOpt.singletonTags API", () => {
    test(
        "setSingletonTags() should replace original tags and ensure only the last obj remains tagged",
        async ({ page }) => {
            const result = await page.evaluate(() => {
                const k = kaplay({ singletonTags: ["one", "two", "three"] });
                k.add(["oh"]);
                k.add(["hi"]);
                k.add(["oh"]);
                k.add(["hi"]);
                k.setSingletonTags(["oh", "hi"]);
                return [
                    k.getSingletonTags(),
                    k.get(["oh", "hi"], { op: "or" }).map(o => o.id),
                ];
            });

            expect(result).toEqual([["oh", "hi"], [3, 4]]);
        },
    );

    test(
        "addSingletonTags() should add a new tag and ensure only the last obj remains tagged",
        async ({ page }) => {
            const result = await page.evaluate(() => {
                const k = kaplay({ singletonTags: ["oh"] });
                k.add(["hi"]);
                k.add(["hi"]);
                k.addSingletonTag("hi");
                return [k.getSingletonTags(), k.get("hi")[0].id];
            });

            expect(result).toEqual([["oh", "hi"], 2]);
        },
    );

    test(
        "addSingletonTag() should add a new tag and ensure only the passed obj remains tagged",
        async ({ page }) => {
            const result = await page.evaluate(() => {
                const k = kaplay({ singletonTags: ["oh"] });
                const obj = k.add(["hi"]);
                k.add(["hi"]);
                k.addSingletonTag("hi", obj);
                return [k.getSingletonTags(), k.get("hi")[0].id];
            });

            expect(result).toEqual([["oh", "hi"], 1]);
        },
    );

    test(
        "After singletonTagRemove(), multiple objs can be tagged with the same tag",
        async ({ page }) => {
            const result = await page.evaluate(() => {
                const k = kaplay({ singletonTags: ["oh", "hi"] });
                k.add(["bean", "oh"]);
                k.add(["mark", "oh"]);
                k.removeSingletonTag("oh");
                k.add(["bobo", "oh"]);

                k.add(["bag", "hi"]);
                k.add(["kat"]).tag("hi");
                k.removeSingletonTag("hi");
                k.add(["ghosty"]).tag("hi");

                return [
                    k.get("oh").length,
                    k.get("hi").length,
                ];
            });

            expect(result).toEqual([2, 2]);
        },
    );

    test(
        "singletonTagRemove() should accept array of tags",
        async ({ page }) => {
            const result = await page.evaluate(() => {
                const k = kaplay({ singletonTags: ["oh", "hi", "mark"] });
                k.removeSingletonTag(["oh", "mark"]);
                return getSingletonTags();
            });

            expect(result).toEqual(["hi"]);
        },
    );
});

test(
    "Another obj tagged with the same singleton tag should remain only obj of the tag",
    async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay({ singletonTags: ["oh", "hi"] });
            k.add(["bean", "oh"]);
            k.add(["mark", "oh"]);
            k.add(["bag", "hi"]);
            k.add(["kat"]).tag("hi");
            return [
                k.get("oh")[0].tags[1],
                k.get("hi")[0].tags[1],
            ];
        });

        expect(result).toEqual(["mark", "kat"]);
    },
);

test(
    "get() live update should work with singleton tags",
    async ({ page }) => {
        const result = await page.evaluate(() => {
            const k = kaplay({ singletonTags: ["oh", "hi", "tmp"] });
            const objs = k.get(["oh", "hi", "tmp"], {
                liveUpdate: true,
                op: "or",
            });

            k.add(["bean", "oh"]);
            k.add(["mark", "oh"]);

            k.add(["bag", "oh", "hi"]);
            k.add(["kat"]).tag("hi");

            k.add(["skuller", "tmp"]);
            k.add(["ghosty", "tmp"]);
            k.removeSingletonTag("tmp");
            k.add(["ghostiny", "tmp"]);

            return [
                objs.length,
                ...objs.map(o => o.tags[1]),
            ];
        });

        expect(result).toEqual([4, "bag", "kat", "ghosty", "ghostiny"]);
    },
);
