import { expect, type Page, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

async function setup(page: Page) {
    await page.addScriptTag({ path: "dist/kaplay.js" });
    await page.evaluate(() => {
        const k = kaplay({ global: false, width: 200, height: 150 });
        const payload = (data: any) => ({
            id: "payload",
            payload: data,
            serialize(this: any) {
                return this.payload;
            },
        });
        (window as any).prefabTest = { k, payload };
    });
}

for (const capture of ["serialize", "createPrefab"]) {
    test(`${capture} remaps root, forward, backward and mutual object references`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(capture => {
            const { k, payload } = (window as any).prefabTest;
            k.registerPrefabFactory("payload", payload);
            const root = k.add([payload({}), "root"]);
            const left = root.add([payload({}), "left"]);
            const right = root.add([payload({}), "right"]);
            root.payload = { self: root, target: right };
            left.payload = { other: right, parent: root };
            right.payload = { other: left, self: right };
            const snapshot = capture === "serialize"
                ? root.serialize()
                : k.createPrefab(root);
            const copy = k.addPrefab(JSON.parse(JSON.stringify(snapshot)));
            return [
                copy.payload.self === copy,
                copy.payload.target === copy.children[1],
                copy.children[0].payload.other === copy.children[1],
                copy.children[0].payload.parent === copy,
                copy.children[1].payload.other === copy.children[0],
                copy.children[1].payload.self === copy.children[1],
                copy.children[0].is("left"),
                copy.children[1].is("right"),
                copy.is("root"),
                copy !== root && copy.children[0] !== left,
            ];
        }, capture);
        expect(result).toEqual(Array(10).fill(true));
    });
}

test("container cycles and aliases span component payloads and objects", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        const other = (data: any) => ({
            id: "other",
            other: data,
            serialize(this: any) {
                return this.other;
            },
        });
        k.registerPrefabFactory("payload", payload);
        k.registerPrefabFactory("other", other);
        const shared: any = {
            number: 7,
            nil: null,
            flag: false,
            text: "",
            missing: undefined,
        };
        const array: any[] = [shared, undefined, true, 3.25];
        shared.self = shared;
        shared.array = array;
        array.push(array);
        const root = k.add([payload(shared), other({ shared })]);
        root.add([payload(array)]);
        const copy = k.addPrefab(JSON.parse(JSON.stringify(root.serialize())));
        const data = copy.payload;
        return [
            data.self === data,
            data === copy.other.shared,
            data.array === copy.children[0].payload,
            data.array[0] === data,
            data.array[4] === data.array,
            Object.hasOwn(data, "missing") && data.missing === undefined,
            data.array.length === 5 && data.array[1] === undefined,
            data.number === 7 && data.nil === null && data.flag === false
            && data.text === "",
            data.array[2] === true && data.array[3] === 3.25,
        ];
    });
    expect(result).toEqual(Array(9).fill(true));
});

test("vectors and colors retain methods and shared identity after JSON", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const vector = k.vec2(4, -3);
        const color = k.rgb(12, 34, 56);
        const root = k.add([
            payload({ vector, color, aliases: [vector, color] }),
        ]);
        const copy = k.addPrefab(JSON.parse(JSON.stringify(root.serialize())));
        const p = copy.payload;
        return {
            vector: p.vector instanceof k.Vec2,
            color: p.color instanceof k.Color,
            aliases: p.vector === p.aliases[0] && p.color === p.aliases[1],
            length: p.vector.len(),
            rgb: [p.color.r, p.color.g, p.color.b],
            isolated: p.vector !== vector && p.color !== color,
        };
    });
    expect(result).toEqual({
        vector: true,
        color: true,
        aliases: true,
        length: 5,
        rgb: [12, 34, 56],
        isolated: true,
    });
});

test("ordinary keys and marker-shaped data remain ordinary payloads", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const data = JSON.parse(
            "{\"$ref\":0,\"$type\":\"GameObj\",\"kind\":\"reference\",\"index\":2,\"constructor\":{\"x\":1},\"__proto__\":{\"marker\":9}}",
        );
        const source = k.add([payload(data)]);
        const copy = k.addPrefab(
            JSON.parse(JSON.stringify(source.serialize())),
        );
        return {
            json: JSON.stringify(copy.payload),
            own: Object.hasOwn(copy.payload, "__proto__"),
            nested: copy.payload.__proto__.marker,
        };
    });
    expect(JSON.parse(result.json)).toEqual({
        $ref: 0,
        $type: "GameObj",
        kind: "reference",
        index: 2,
        constructor: { x: 1 },
        ["__proto__"]: { marker: 9 },
    });
    expect(result.own).toBe(true);
    expect(result.nested).toBe(9);
});

test("capture and repeated instantiation isolate mutable data without losing aliases", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const shared = { value: 3 };
        const data = { a: shared, b: shared, vector: k.vec2(1, 2) };
        const source = k.add([payload(data)]);
        const snapshot = source.serialize();
        const frozen = JSON.stringify(snapshot);
        shared.value = 90;
        data.vector.x = 80;
        const parent = k.add(["holder"]);
        const one = parent.addPrefab(snapshot);
        const two = k.addPrefab(snapshot);
        const before = [
            one.payload.a.value,
            two.payload.a.value,
            two.payload.vector.x,
        ];
        one.payload.a.value = 12;
        one.payload.vector.x = 22;
        return {
            before,
            alias: one.payload.a === one.payload.b,
            separate: one.payload.a !== two.payload.a,
            after: [
                two.payload.a.value,
                two.payload.vector.x,
                shared.value,
                data.vector.x,
            ],
            unchanged: JSON.stringify(snapshot) === frozen,
            parent: one.parent === parent,
        };
    });
    expect(result).toEqual({
        before: [3, 3, 1],
        alias: true,
        separate: true,
        after: [3, 1, 90, 80],
        unchanged: true,
        parent: true,
    });
});

test("factory mutation affects only the newly decoded instance", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        const source = k.add([payload({ n: 4 })]);
        const snapshot = JSON.parse(JSON.stringify(source.serialize()));
        const original = JSON.stringify(snapshot);
        k.registerPrefabFactory("payload", (data: any) => {
            data.n++;
            return payload(data);
        });
        const first = k.addPrefab(snapshot);
        const second = k.addPrefab(snapshot);
        return [
            first.payload.n,
            second.payload.n,
            source.payload.n,
            JSON.stringify(snapshot) === original,
        ];
    });
    expect(result).toEqual([5, 5, 4, true]);
});

test("add callbacks see the complete graph, dependencies and root overrides", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        const source = k.add([payload({}), k.pos(1, 2), "root"]);
        const left = source.add([payload({}), k.pos(3, 4), "left"]);
        const right = source.add([payload({}), k.pos(5, 6), "right"]);
        source.payload = { root: source, peer: right, tag: "root" };
        left.payload = { root: source, peer: right, tag: "left" };
        right.payload = { root: source, peer: left, tag: "right" };
        const snapshot = JSON.parse(JSON.stringify(source.serialize()));
        const seen: string[] = [];
        k.registerPrefabFactory("payload", (data: any) => ({
            ...payload(data),
            require: ["pos"],
            add(this: any) {
                if (
                    !data.root.children.every((child: any) =>
                        child.parent === data.root && child.has("payload")
                        && child.has("pos")
                    )
                ) throw Error("incomplete tree");
                if (
                    !data.peer.payload || !data.peer.pos
                    || data.root.pos.x !== 99
                ) throw Error("incomplete components");
                seen.push(data.tag);
            },
        }));
        const copy = k.addPrefab(snapshot, [k.pos(99, 100)]);
        return {
            seen: seen.sort(),
            position: [copy.pos.x, copy.pos.y],
            children: copy.children.map((
                child: any,
            ) => [child.pos.x, child.pos.y]),
        };
    });
    expect(result).toEqual({
        seen: ["left", "right", "root"],
        position: [99, 100],
        children: [[3, 4], [5, 6]],
    });
});

for (const receiver of ["context", "object"]) {
    test(`${receiver} instantiates and replaces named prefabs synchronously`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(receiver => {
            const { k, payload } = (window as any).prefabTest;
            k.registerPrefabFactory("payload", payload);
            const parent = k.add([]);
            const add = () =>
                receiver === "context"
                    ? k.addPrefab("immediate")
                    : parent.addPrefab("immediate");
            const source = k.add([payload({ value: 3 })]);
            const child = source.add([payload({ root: source })]);
            source.payload.child = child;
            k.createPrefab("immediate", source);
            const first = add();
            const second = add();
            first.payload.value = 20;
            const replacement = k.add([payload({ value: 9 })]);
            replacement.payload.self = replacement;
            k.createPrefab("immediate", replacement);
            const third = add();
            return {
                links: first.payload.child === first.children[0]
                    && first.children[0].payload.root === first
                    && second.payload.child === second.children[0]
                    && second.children[0].payload.root === second,
                separate: first !== second
                    && first.children[0] !== second.children[0],
                values: [
                    first.payload.value,
                    second.payload.value,
                    third.payload.value,
                ],
                replacement: third.payload.self === third
                    && third.children.length === 0,
                parent: receiver === "context" || first.parent === parent,
            };
        }, receiver);
        expect(result).toEqual({
            links: true,
            separate: true,
            values: [20, 3, 9],
            replacement: true,
            parent: true,
        });
    });
}

test("named and loaded prefabs use the same graph reconstruction", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const source = k.add([payload({})]);
        source.payload.self = source;
        const snapshot = k.createPrefab("named-graph", source);
        await k.loadPrefab(
            "loaded-graph",
            "data:application/json,"
                + encodeURIComponent(JSON.stringify(snapshot)),
        );
        const named = k.addPrefab("named-graph");
        const loaded = k.addPrefab("loaded-graph");
        return [
            named.payload.self === named,
            loaded.payload.self === loaded,
            named !== loaded,
        ];
    });
    expect(result).toEqual([true, true, true]);
});

test("follow serializes a forward target and tracks the cloned target", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k } = (window as any).prefabTest;
        const root = k.add([]);
        const follower = root.add([k.pos(0, 0)]);
        const target = root.add([k.pos(10, 20)]);
        follower.use(k.follow(target, k.vec2(2, -3)));
        const copy = k.addPrefab(JSON.parse(JSON.stringify(root.serialize())));
        (window as any).prefabTest.copy = copy;
        (window as any).prefabTest.originalTarget = target;
        const clonedFollower = copy.children[0];
        const clonedTarget = copy.children[1];
        const initial = [clonedFollower.pos.x, clonedFollower.pos.y];
        clonedTarget.pos = k.vec2(40, 50);
        return {
            initial,
            target: clonedFollower.follow.obj === clonedTarget,
            offset: [
                clonedFollower.follow.offset.x,
                clonedFollower.follow.offset.y,
            ],
        };
    });
    expect(result).toEqual({
        initial: [12, 17],
        target: true,
        offset: [2, -3],
    });
    await page.evaluate(() =>
        new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    expect(
        await page.evaluate(() => {
            const { copy, originalTarget } = (window as any).prefabTest;
            return [
                copy.children[0].pos.x,
                copy.children[0].pos.y,
                originalTarget.pos.x,
                originalTarget.pos.y,
            ];
        }),
    ).toEqual([42, 47, 10, 20]);
});

for (const failure of ["missing", "throwing"]) {
    test(`${failure} factory leaves the parent unchanged and fires no add callbacks`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(failure => {
            const { k, payload } = (window as any).prefabTest;
            const source = k.add([payload({})]);
            source.add([{
                id: "broken",
                serialize() {
                    return {};
                },
            }]);
            const snapshot = JSON.parse(JSON.stringify(source.serialize()));
            const parent = k.add([]);
            const existing = parent.add(["existing"]);
            let adds = 0;
            k.registerPrefabFactory(
                "payload",
                (data: any) => ({
                    ...payload(data),
                    add() {
                        adds++;
                    },
                }),
            );
            const sentinel = new Error("factory sentinel");
            if (failure === "throwing") {
                k.registerPrefabFactory("broken", () => {
                    throw sentinel;
                });
            }
            let caught: any;
            try {
                parent.addPrefab(snapshot);
            } catch (error) {
                caught = error;
            }
            return {
                rejected: !!caught,
                original: failure !== "throwing" || caught === sentinel,
                intact: parent.children.length === 1
                    && parent.children[0] === existing,
                adds,
            };
        }, failure);
        expect(result).toEqual({
            rejected: true,
            original: true,
            intact: true,
            adds: 0,
        });
    });
}

test("external object references fail capture without replacing a named asset", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const good = k.add([payload({ n: 5 })]);
        k.createPrefab("stable-graph", good);
        const outside = k.add([]);
        const bad = k.add([payload({ target: outside })]);
        let rejected = false;
        try {
            k.createPrefab("stable-graph", bad);
        } catch {
            rejected = true;
        }
        return {
            rejected,
            original: bad.payload.target === outside && bad.exists(),
            value: k.addPrefab("stable-graph").payload.n,
        };
    });
    expect(result).toEqual({ rejected: true, original: true, value: 5 });
});

for (
    const kind of [
        "function",
        "symbol",
        "bigint",
        "nan",
        "infinity",
        "date",
        "map",
    ]
) {
    test(`capture rejects unsupported ${kind} values without source mutation`, async ({ page }) => {
        await setup(page);
        const result = await page.evaluate(kind => {
            const { k, payload } = (window as any).prefabTest;
            const values: Record<string, any> = {
                function: () => {},
                symbol: Symbol(),
                bigint: 1n,
                nan: NaN,
                infinity: Infinity,
                date: new Date(0),
                map: new Map(),
            };
            const value = values[kind];
            const data = { nested: [value] };
            const source = k.add([payload(data)]);
            let rejected = false;
            try {
                source.serialize();
            } catch {
                rejected = true;
            }
            return {
                rejected,
                intact: source.payload === data
                    && Object.is(source.payload.nested[0], value)
                    && source.exists(),
            };
        }, kind);
        expect(result).toEqual({ rejected: true, intact: true });
    });
}

test("legacy tree prefabs retain tags, child order and component overrides", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const legacy = {
            components: { pos: { pos: { x: 1, y: 2 } } },
            tags: ["old-root"],
            children: [
                {
                    components: { pos: { pos: { x: 3, y: 4 } } },
                    tags: ["old-child"],
                },
                { components: {}, tags: ["last"] },
            ],
        };
        const copy = k.addPrefab(legacy, [k.pos(9, 8)]);
        // Re-capturing the legacy instance also produces an independent snapshot.
        copy.use(payload({ self: copy }));
        const next = k.addPrefab(JSON.parse(JSON.stringify(copy.serialize())));
        return [
            next.pos.x,
            next.pos.y,
            next.children[0].pos.x,
            next.children[0].pos.y,
            next.is("old-root"),
            next.children[0].is("old-child"),
            next.children[1].is("last"),
            next.payload.self === next,
        ];
    });
    expect(result).toEqual([9, 8, 3, 4, true, true, true, true]);
});

test("public declarations expose factory registration and reusable prefab snapshots", () => {
    const dir = mkdtempSync(join(tmpdir(), "prefab-types-"));
    try {
        const pkg = JSON.parse(readFileSync("package.json", "utf8"));
        const declaration = resolve(pkg.types).replaceAll("\\", "/").replace(
            /\.d\.ts$/,
            ".js",
        );
        const source = join(dir, "consumer.ts");
        writeFileSync(
            source,
            `import kaplay from ${JSON.stringify(declaration)};
const k = kaplay({ global: false });
k.registerPrefabFactory("links", (data: { target: ReturnType<typeof k.add> }) => ({ id: "links", target: data.target }));
const root = k.add([k.pos(1, 2)]);
const value = root.serialize();
root.addPrefab(value, [k.pos(3, 4)]);
k.addPrefab(k.createPrefab(root));
k.createPrefab("named", root);
k.addPrefab("named");
`,
        );
        try {
            execFileSync(process.execPath, [
                resolve("node_modules/typescript/bin/tsc"),
                "--strict",
                "--noEmit",
                "--skipLibCheck",
                "--target",
                "ES2022",
                "--module",
                "ESNext",
                "--moduleResolution",
                "bundler",
                source,
            ], { encoding: "utf8" });
        } catch (error: any) {
            throw new Error(
                [error.message, error.stdout, error.stderr].filter(Boolean)
                    .join("\n"),
            );
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

test("deep descendants preserve cross-branch links before callbacks through named object loading", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { k, payload } = (window as any).prefabTest;
        const source = k.add([payload({}), "root"]);
        const branch = source.add([payload({}), "branch"]);
        const leaf = branch.add([payload({}), "leaf"]);
        const other = source.add([payload({}), "other"]);
        source.payload = { target: leaf, label: "root" };
        branch.payload = { target: other, label: "branch" };
        leaf.payload = { target: source, label: "leaf" };
        other.payload = { target: leaf, label: "other" };
        const seen: string[] = [];
        k.registerPrefabFactory("payload", (data: any) => ({
            ...payload(data),
            add() {
                const target = data.target;
                if (
                    !target.payload || !target.parent
                    || !target.is(target.payload.label)
                ) {
                    throw Error("referenced descendant is incomplete");
                }
                seen.push(data.label);
            },
        }));
        const snapshot = k.createPrefab("deep-tree", source);
        await k.loadPrefab(
            "deep-copy",
            "data:application/json,"
                + encodeURIComponent(JSON.stringify(snapshot)),
        );
        const parent = k.add(["holder"]);
        const copy = parent.addPrefab("deep-copy");
        const clonedLeaf = copy.children[0].children[0];
        const second = parent.addPrefab(snapshot);
        const independent =
            second.payload.target === second.children[0].children[0]
            && second.children[0].children[0].payload.target === second
            && second.payload.target !== clonedLeaf;
        return {
            independent,
            links: copy.payload.target === clonedLeaf
                && clonedLeaf.payload.target === copy
                && copy.children[0].payload.target === copy.children[1]
                && copy.children[1].payload.target === clonedLeaf,
            parents: copy.parent === parent
                && clonedLeaf.parent === copy.children[0],
            order: copy.children.map((child: any) => child.payload.label),
            seen: seen.sort(),
        };
    });
    expect(result).toEqual({
        links: true,
        parents: true,
        order: ["branch", "other"],
        seen: [
            "branch",
            "branch",
            "leaf",
            "leaf",
            "other",
            "other",
            "root",
            "root",
        ],
        independent: true,
    });
});

test("whole component payloads preserve null, undefined and scalar values", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const values = [undefined, null, false, true, "", "text", 0, -4.5];
        return values.map(value => {
            const source = k.add([payload(value)]);
            const copy = k.addPrefab(
                JSON.parse(JSON.stringify(source.serialize())),
            );
            return Object.is(copy.payload, value);
        });
    });
    expect(result).toEqual(Array(8).fill(true));
});

test("legacy payloads are independent across instantiations and factory mutations", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        const legacy = {
            components: { payload: { nested: [3] } },
            tags: ["legacy"],
        };
        k.registerPrefabFactory("payload", (data: any) => {
            data.nested.push(4);
            return payload(data);
        });
        const one = k.addPrefab(legacy);
        const two = k.addPrefab(legacy);
        one.payload.nested[0] = 90;
        return {
            original: legacy.components.payload.nested,
            one: one.payload.nested,
            two: two.payload.nested,
            distinct: one.payload !== two.payload,
        };
    });
    expect(result).toEqual({
        original: [3],
        one: [90, 4],
        two: [3, 4],
        distinct: true,
    });
});

test("built-in color values survive both legacy and graph reconstruction", async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(() => {
        const { k, payload } = (window as any).prefabTest;
        k.registerPrefabFactory("payload", payload);
        const legacy = {
            components: { color: { color: { r: 12, g: 34, b: 56 } } },
            tags: [],
        };
        const loaded = k.addPrefab(legacy);
        const source = k.add([k.color(78, 90, 123), payload({})]);
        source.payload.self = source;
        const copy = k.addPrefab(
            JSON.parse(JSON.stringify(source.serialize())),
        );
        return {
            legacy: [loaded.color.r, loaded.color.g, loaded.color.b],
            graph: [copy.color.r, copy.color.g, copy.color.b],
            reference: copy.payload.self === copy,
        };
    });
    expect(result).toEqual({
        legacy: [12, 34, 56],
        graph: [78, 90, 123],
        reference: true,
    });
});
