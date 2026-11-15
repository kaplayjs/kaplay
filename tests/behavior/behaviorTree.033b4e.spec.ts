import { expect, test } from "@playwright/test";
import { checkPublicTypes } from "./publicTypes";

test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(1000000);
    await page.addScriptTag({ path: "dist/kaplay.js" });
});

test("actions enter once, retain running state, and settle once", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        let ticks = 0;
        const owner = k.add([k.behaviorTree({
            type: "action",
            enter: o => calls.push(o === owner ? "enter" : "wrong owner"),
            tick: () => (++ticks === 2 ? "success" : "running"),
            leave: (_, reason) => calls.push(reason),
        })]);
        const states = [
            owner.behaviorStatus,
            owner.tickBehavior(),
            owner.tickBehavior(),
            owner.tickBehavior(),
        ];
        owner.update();
        owner.stopBehavior();
        return { states, calls, ticks, stopped: owner.behaviorStatus };
    });
    expect(result).toEqual({
        states: ["idle", "running", "success", "success"],
        calls: ["enter", "success"],
        ticks: 2,
        stopped: "stopped",
    });
});

test("failure is terminal and stops the sequence", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const owner = k.add([k.behaviorTree({
            type: "sequence",
            children: [
                {
                    type: "action",
                    tick: () => "failure",
                    leave: (_, reason) => calls.push(reason),
                },
                {
                    type: "action",
                    tick: () => {
                        calls.push("tail");
                        return "success";
                    },
                },
            ],
        })]);
        const states = [owner.tickBehavior(), owner.tickBehavior()];
        owner.stopBehavior();
        return { states, calls };
    });
    expect(result).toEqual({
        states: ["failure", "failure"],
        calls: ["failure"],
    });
});

test("nested sequences remember progress and advance successes in one tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        let ready = false;
        const leaf = (name: string) => ({
            type: "action",
            tick: () => {
                calls.push(name);
                return "success";
            },
        });
        const owner = k.add([
            k.behaviorTree({
                type: "sequence",
                children: [leaf("a"), {
                    type: "sequence",
                    children: [leaf("b"), {
                        type: "action",
                        tick: () => {
                            calls.push("wait");
                            return ready ? "success" : "running";
                        },
                    }],
                }, leaf("c")],
            }),
        ]);
        const first = owner.tickBehavior();
        ready = true;
        return { states: [first, owner.tickBehavior()], calls };
    });
    expect(result).toEqual({
        states: ["running", "success"],
        calls: ["a", "b", "wait", "wait", "c"],
    });
});

for (const type of ["sequence", "selector"]) {
    test(`empty ${type} has a terminal result`, async ({ page }) => {
        const result = await page.evaluate(type => {
            const k = kaplay();
            const owner = k.add([
                k.behaviorTree(
                    type === "sequence"
                        ? { type, children: [] }
                        : { type, branches: [] },
                ),
            ]);
            return [owner.tickBehavior(), owner.tickBehavior()];
        }, type);
        expect(result).toEqual(
            type === "sequence"
                ? ["success", "success"]
                : ["failure", "failure"],
        );
    });
}

test("selectors check ordered guards each tick and retain the selected branch", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const owner = k.add([k.behaviorTree({
            type: "selector",
            branches: [
                {
                    when: () => {
                        calls.push("guard1");
                        return false;
                    },
                    node: {
                        type: "action",
                        tick: () => {
                            calls.push("wrong");
                            return "success";
                        },
                    },
                },
                {
                    when: o => {
                        calls.push(o === owner ? "guard2" : "wrong owner");
                        return true;
                    },
                    node: {
                        type: "action",
                        enter: () => calls.push("enter"),
                        tick: () => {
                            calls.push("tick");
                            return "running";
                        },
                    },
                },
                {
                    when: () => {
                        calls.push("unneeded guard");
                        return true;
                    },
                    node: { type: "sequence", children: [] },
                },
            ],
        })]);
        owner.tickBehavior();
        owner.tickBehavior();
        return calls;
    });
    expect(result).toEqual([
        "guard1",
        "guard2",
        "enter",
        "tick",
        "guard1",
        "guard2",
        "tick",
    ]);
});

test("priority changes abort a nested action before entering its replacement", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        let urgent = false;
        let enabled = true;
        const leaf = (name: string, terminal = false) => ({
            type: "action",
            enter: () => calls.push(`${name}:enter`),
            tick: () => terminal ? "success" : "running",
            leave: (_, reason) => calls.push(`${name}:${reason}`),
        });
        const owner = k.add([k.behaviorTree({
            type: "selector",
            branches: [
                { when: () => enabled && urgent, node: leaf("urgent") },
                {
                    when: () => enabled,
                    node: {
                        type: "sequence",
                        children: [leaf("setup", true), {
                            type: "sequence",
                            children: [leaf("patrol")],
                        }],
                    },
                },
            ],
        })]);
        owner.tickBehavior();
        urgent = true;
        owner.tickBehavior();
        enabled = false;
        return { state: owner.tickBehavior(), calls };
    });
    expect(result).toEqual({
        state: "failure",
        calls: [
            "setup:enter",
            "setup:success",
            "patrol:enter",
            "patrol:aborted",
            "urgent:enter",
            "urgent:aborted",
        ],
    });
});

test("a selected branch failure is not a request to try lower priorities", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        let lower = 0;
        const owner = k.add([k.behaviorTree({
            type: "selector",
            branches: [
                {
                    when: () => true,
                    node: { type: "action", tick: () => "failure" },
                },
                {
                    when: () => {
                        lower++;
                        return true;
                    },
                    node: { type: "sequence", children: [] },
                },
            ],
        })]);
        return { state: owner.tickBehavior(), lower };
    });
    expect(result).toEqual({ state: "failure", lower: 0 });
});

test("frozen definitions can be shared by owners and by node occurrences", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const entries = new Map<any, number>();
        const ticks = new Map<any, number>();
        const action = Object.freeze({
            type: "action",
            enter: o => entries.set(o, (entries.get(o) || 0) + 1),
            tick: o => {
                const n = (ticks.get(o) || 0) + 1;
                ticks.set(o, n);
                return n % 2 ? "running" : "success";
            },
        });
        const selector = Object.freeze({
            type: "selector",
            branches: Object.freeze([
                Object.freeze({ when: () => true, node: action }),
            ]),
        });
        const sequence = Object.freeze({
            type: "sequence",
            children: Object.freeze([selector]),
        });
        const root = Object.freeze({
            type: "sequence",
            children: Object.freeze([sequence, sequence]),
        });
        const a = k.add([k.behaviorTree(root)]);
        const b = k.add([k.behaviorTree(root)]);
        const states = [
            a.tickBehavior(),
            a.tickBehavior(),
            b.tickBehavior(),
            a.tickBehavior(),
            b.tickBehavior(),
            b.tickBehavior(),
        ];
        return {
            states,
            entries: [entries.get(a), entries.get(b)],
            ticks: [ticks.get(a), ticks.get(b)],
        };
    });
    expect(result).toEqual({
        states: [
            "running",
            "running",
            "running",
            "success",
            "running",
            "success",
        ],
        entries: [2, 2],
        ticks: [4, 4],
    });
});

test("object updates run behaviors and paused objects retain progress", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        let entries = 0;
        let ticks = 0;
        const owner = k.add([
            k.behaviorTree({
                type: "action",
                enter: () => entries++,
                tick: () => {
                    ticks++;
                    return "running";
                },
            }),
        ]);
        owner.paused = true;
        owner.update();
        const idle = owner.tickBehavior();
        owner.paused = false;
        owner.update();
        owner.paused = true;
        owner.update();
        const paused = owner.tickBehavior();
        owner.paused = false;
        owner.update();
        return { idle, paused, entries, ticks };
    });
    expect(result).toEqual({
        idle: "idle",
        paused: "running",
        entries: 1,
        ticks: 2,
    });
});

test("stop and restart settle once and defer new execution until a tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const owner = k.add([
            k.behaviorTree({
                type: "action",
                enter: () => calls.push("enter"),
                tick: () => "running",
                leave: (_, r) => calls.push(r),
            }),
        ]);
        owner.tickBehavior();
        owner.stopBehavior();
        owner.stopBehavior();
        const stopped = owner.tickBehavior();
        owner.restartBehavior();
        const idle = owner.behaviorStatus;
        owner.tickBehavior();
        owner.restartBehavior();
        return { stopped, idle, final: owner.behaviorStatus, calls };
    });
    expect(result).toEqual({
        stopped: "stopped",
        idle: "idle",
        final: "idle",
        calls: ["enter", "aborted", "enter", "aborted"],
    });
});

for (const operation of ["remove", "replace", "destroy"]) {
    test(`${operation} permanently stops the old component instance`, async ({ page }) => {
        const result = await page.evaluate(operation => {
            const k = kaplay();
            const calls: string[] = [];
            const comp = k.behaviorTree({
                type: "action",
                enter: () => calls.push("enter"),
                tick: () => "running",
                leave: (_, r) => calls.push(r),
            });
            const owner = k.add([comp]);
            owner.tickBehavior();
            const tick = owner.tickBehavior;
            const restart = owner.restartBehavior;
            if (operation === "remove") owner.unuse(comp.id);
            if (operation === "replace") {
                owner.use(k.behaviorTree({ type: "sequence", children: [] }));
            }
            if (operation === "destroy") owner.destroy();
            restart();
            const old = tick();
            if (operation === "replace") owner.tickBehavior();
            return {
                old,
                calls,
                replacement: operation === "replace"
                    ? owner.behaviorStatus
                    : null,
            };
        }, operation);
        expect(result).toEqual({
            old: "stopped",
            calls: ["enter", "aborted"],
            replacement: operation === "replace" ? "success" : null,
        });
    });
}

for (const phase of ["guard", "enter", "tick", "leave"]) {
    for (const operation of ["stop", "restart"]) {
        test(`${operation} from ${phase} prevents remaining tick work`, async ({ page }) => {
            const result = await page.evaluate(({ phase, operation }) => {
                const k = kaplay();
                const calls: string[] = [];
                let changed = false;
                const visit = (name: string, o: any) => {
                    calls.push(name);
                    if (!changed && name === phase) {
                        changed = true;
                        if (operation === "stop") o.stopBehavior();
                        else o.restartBehavior();
                    }
                };
                const owner = k.add([
                    k.behaviorTree({
                        type: "selector",
                        branches: [{
                            when: o => {
                                visit("guard", o);
                                return true;
                            },
                            node: {
                                type: "sequence",
                                children: [
                                    {
                                        type: "action",
                                        enter: o => visit("enter", o),
                                        tick: o => {
                                            visit("tick", o);
                                            return "success";
                                        },
                                        leave: (o, r) => {
                                            calls.push(r);
                                            visit("leave", o);
                                        },
                                    },
                                    {
                                        type: "action",
                                        tick: () => {
                                            calls.push("tail");
                                            return "success";
                                        },
                                    },
                                ],
                            },
                        }],
                    }),
                ]);
                const first = owner.tickBehavior();
                const before = [...calls];
                const second = owner.tickBehavior();
                return { first, second, before, after: calls };
            }, { phase, operation });
            expect(result.first).toBe(
                operation === "stop" ? "stopped" : "idle",
            );
            expect(result.before).not.toContain("tail");
            expect(result.before).toEqual(
                phase === "guard"
                    ? ["guard"]
                    : phase === "enter"
                    ? ["guard", "enter", "aborted", "leave"]
                    : phase === "tick"
                    ? ["guard", "enter", "tick", "aborted", "leave"]
                    : ["guard", "enter", "tick", "success", "leave"],
            );
            if (operation === "stop") {
                expect(result.second).toBe("stopped");
                expect(result.after).toEqual(result.before);
            }
            else {
                expect(result.second).toBe("success");
                expect(result.after.slice(result.before.length)).toEqual([
                    "guard",
                    "enter",
                    "tick",
                    "success",
                    "leave",
                    "tail",
                ]);
            }
        });
    }
}

test("nested explicit ticks do no work in any callback", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const visit = (o: any, name: string) => {
            calls.push(name);
            o.tickBehavior();
        };
        const owner = k.add([k.behaviorTree({
            type: "selector",
            branches: [{
                when: o => {
                    visit(o, "guard");
                    return true;
                },
                node: {
                    type: "action",
                    enter: o => visit(o, "enter"),
                    tick: o => {
                        visit(o, "tick");
                        return "success";
                    },
                    leave: o => visit(o, "leave"),
                },
            }],
        })]);
        return { state: owner.tickBehavior(), calls };
    });
    expect(result).toEqual({
        state: "success",
        calls: ["guard", "enter", "tick", "leave"],
    });
});

for (const phase of ["guard", "enter", "tick", "leave"]) {
    test(`an exception from ${phase} stops the runner and preserves its identity`, async ({ page }) => {
        const result = await page.evaluate(phase => {
            const k = kaplay();
            const error = new Error("action error");
            const calls: string[] = [];
            let shouldThrow = phase !== "guard";
            const check = (name: string) => {
                if (shouldThrow && name === phase) throw error;
            };
            const owner = k.add([k.behaviorTree({
                type: "selector",
                branches: [{
                    when: () => {
                        check("guard");
                        return true;
                    },
                    node: {
                        type: "action",
                        enter: () => check("enter"),
                        tick: () => {
                            check("tick");
                            return phase === "guard" ? "running" : "success";
                        },
                        leave: (_, r) => {
                            calls.push(r);
                            check("leave");
                        },
                    },
                }],
            })]);
            if (phase === "guard") {
                owner.tickBehavior();
                shouldThrow = true;
            }
            let same = false;
            try {
                owner.tickBehavior();
            } catch (e) {
                same = e === error;
            }
            return {
                same,
                state: owner.behaviorStatus,
                next: owner.tickBehavior(),
                calls,
            };
        }, phase);
        expect(result).toEqual({
            same: true,
            state: "stopped",
            next: "stopped",
            calls: [phase === "leave" ? "success" : "aborted"],
        });
    });
}

test("cleanup exceptions cannot replace the original callback exception", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const original = new Error("original");
        const cleanup = new Error("cleanup");
        let errors = true;
        const owner = k.add([k.behaviorTree({
            type: "action",
            tick: () => {
                if (errors) throw original;
                return "success";
            },
            leave: () => {
                if (errors) throw cleanup;
            },
        })]);
        let same = false;
        try {
            owner.tickBehavior();
        } catch (e) {
            same = e === original;
        }
        const stopped = owner.behaviorStatus;
        errors = false;
        owner.restartBehavior();
        return { same, stopped, recovered: owner.tickBehavior() };
    });
    expect(result).toEqual({
        same: true,
        stopped: "stopped",
        recovered: "success",
    });
});

test("stopping in preemption cleanup prevents the replacement from entering", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        let urgent = false;
        const calls: string[] = [];
        const owner = k.add([k.behaviorTree({
            type: "selector",
            branches: [
                {
                    when: () => urgent,
                    node: {
                        type: "action",
                        tick: () => {
                            calls.push("replacement");
                            return "success";
                        },
                    },
                },
                {
                    when: () => true,
                    node: {
                        type: "action",
                        tick: () => "running",
                        leave: (o, r) => {
                            calls.push(r);
                            o.stopBehavior();
                        },
                    },
                },
            ],
        })]);
        owner.tickBehavior();
        urgent = true;
        return { state: owner.tickBehavior(), calls };
    });
    expect(result).toEqual({ state: "stopped", calls: ["aborted"] });
});

test("restart cleanup cannot recursively start a new tick", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const owner = k.add([
            k.behaviorTree({
                type: "action",
                enter: () => calls.push("enter"),
                tick: () => {
                    calls.push("tick");
                    return "running";
                },
                leave: o => {
                    calls.push("leave");
                    o.tickBehavior();
                },
            }),
        ]);
        owner.tickBehavior();
        owner.restartBehavior();
        const before = { state: owner.behaviorStatus, calls: [...calls] };
        owner.tickBehavior();
        return { before, after: calls };
    });
    expect(result).toEqual({
        before: { state: "idle", calls: ["enter", "tick", "leave"] },
        after: ["enter", "tick", "leave", "enter", "tick"],
    });
});

for (const operation of ["remove", "destroy"]) {
    test(`${operation} during a tick prevents subsequent action work`, async ({ page }) => {
        const result = await page.evaluate(operation => {
            const k = kaplay();
            const calls: string[] = [];
            const comp = k.behaviorTree({
                type: "sequence",
                children: [
                    {
                        type: "action",
                        tick: o => {
                            if (operation === "remove") o.unuse(comp.id);
                            else o.destroy();
                            return "success";
                        },
                        leave: (_, r) => calls.push(r),
                    },
                    {
                        type: "action",
                        tick: () => {
                            calls.push("tail");
                            return "success";
                        },
                    },
                ],
            });
            const owner = k.add([comp]);
            const tick = owner.tickBehavior;
            return { state: tick(), next: tick(), calls };
        }, operation);
        expect(result).toEqual({
            state: "stopped",
            next: "stopped",
            calls: ["aborted"],
        });
    });
}

test("public declarations support typed definitions and results", () => {
    checkPublicTypes(`
type Node = Parameters<typeof k.behaviorTree>[0];
const action: Node = { type: "action", enter: owner => { owner.paused = false; }, tick: owner => owner.paused ? "failure" : "success", leave: (_owner, reason) => { const result: "success" | "failure" | "aborted" = reason; } };
const children: readonly Node[] = [action];
const branch: Extract<Node, { type: "selector" }>["branches"][number] = { when: owner => !owner.paused, node: { type: "sequence", children } };
const branches: readonly typeof branch[] = [branch];
const root: Node = { type: "selector", branches };
const owner = k.add([k.behaviorTree(root)]);
const status: "idle" | "running" | "success" | "failure" | "stopped" = owner.tickBehavior();
owner.stopBehavior();
owner.restartBehavior();
const current: typeof status = owner.behaviorStatus;
// @ts-expect-error status is read-only
owner.behaviorStatus = "idle";
type Action = Extract<Node, { type: "action" }>;
// @ts-expect-error idle is a component status, not an action result
const idleTick: Action["tick"] = () => "idle";
// @ts-expect-error stopped is a component status, not an action result
const stoppedTick: Action["tick"] = () => "stopped";
// @ts-expect-error arbitrary strings are not action results
const invalidTick: Action["tick"] = () => "later";
// @ts-expect-error action ticks are synchronous
const asyncTick: Action["tick"] = async () => "running" as const;
// @ts-expect-error selector guards are synchronous
const asyncGuard: typeof branch.when = async () => true;

`);
});

for (const terminal of ["success", "failure"]) {
    test(`restart reenters a ${terminal} behavior from the beginning`, async ({ page }) => {
        const result = await page.evaluate(terminal => {
            const k = kaplay();
            const calls: string[] = [];
            const owner = k.add([
                k.behaviorTree({
                    type: "action",
                    enter: () => calls.push("enter"),
                    tick: () => terminal,
                    leave: (_, r) => calls.push(r),
                }),
            ]);
            const first = owner.tickBehavior();
            owner.restartBehavior();
            const idle = owner.behaviorStatus;
            return { states: [first, idle, owner.tickBehavior()], calls };
        }, terminal);
        expect(result).toEqual({
            states: [terminal, "idle", terminal],
            calls: ["enter", terminal, "enter", terminal],
        });
    });
}

test("restart begins a partially completed composite from its first child", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        const owner = k.add([k.behaviorTree({
            type: "sequence",
            children: [
                {
                    type: "action",
                    tick: () => {
                        calls.push("setup");
                        return "success";
                    },
                },
                {
                    type: "action",
                    enter: () => calls.push("enter"),
                    tick: () => "running",
                    leave: (_, reason) => calls.push(reason),
                },
            ],
        })]);
        const first = owner.tickBehavior();
        owner.restartBehavior();
        const idle = owner.behaviorStatus;
        return { states: [first, idle, owner.tickBehavior()], calls };
    });
    expect(result).toEqual({
        states: ["running", "idle", "running"],
        calls: ["setup", "enter", "aborted", "setup", "enter"],
    });
});

for (const interruption of ["restart", "preemption"]) {
    test(`a leave exception during ${interruption} stops execution and preserves the exception`, async ({ page }) => {
        const result = await page.evaluate(interruption => {
            const k = kaplay();
            const original = new Error("leave error");
            let urgent = false;
            let ticks = 0;
            let replacement = 0;
            const reasons: string[] = [];
            const action = {
                type: "action",
                tick: () => {
                    ticks++;
                    return "running";
                },
                leave: (_, reason) => {
                    reasons.push(reason);
                    throw original;
                },
            };
            const root = interruption === "restart"
                ? action
                : {
                    type: "selector",
                    branches: [
                        {
                            when: () => urgent,
                            node: {
                                type: "action",
                                tick: () => {
                                    replacement++;
                                    return "running";
                                },
                            },
                        },
                        { when: () => true, node: action },
                    ],
                };
            const owner = k.add([k.behaviorTree(root)]);
            owner.tickBehavior();
            let same = false;
            try {
                if (interruption === "restart") owner.restartBehavior();
                else {
                    urgent = true;
                    owner.tickBehavior();
                }
            } catch (error) {
                same = error === original;
            }
            const stopped = owner.behaviorStatus;
            return {
                same,
                stopped,
                next: owner.tickBehavior(),
                ticks,
                replacement,
                reasons,
            };
        }, interruption);
        expect(result).toEqual({
            same: true,
            stopped: "stopped",
            next: "stopped",
            ticks: 1,
            replacement: 0,
            reasons: ["aborted"],
        });
    });
}

test("nested selectors reconsider guards without replaying the containing sequence", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const calls: string[] = [];
        let urgent = false;
        let outerGuards = 0;
        let innerGuards = 0;
        const action = (name: string) => ({
            type: "action",
            enter: () => calls.push(name),
            tick: () => "running",
            leave: (_, reason) => calls.push(`${name}:${reason}`),
        });
        const owner = k.add([k.behaviorTree({
            type: "sequence",
            children: [
                {
                    type: "action",
                    tick: () => {
                        calls.push("setup");
                        return "success";
                    },
                },
                {
                    type: "selector",
                    branches: [{
                        when: () => {
                            outerGuards++;
                            return true;
                        },
                        node: {
                            type: "selector",
                            branches: [
                                {
                                    when: () => {
                                        innerGuards++;
                                        return urgent;
                                    },
                                    node: action("urgent"),
                                },
                                { when: () => true, node: action("patrol") },
                            ],
                        },
                    }],
                },
            ],
        })]);
        const first = owner.tickBehavior();
        urgent = true;
        return {
            states: [first, owner.tickBehavior()],
            calls,
            outerGuards,
            innerGuards,
        };
    });
    expect(result).toEqual({
        states: ["running", "running"],
        calls: ["setup", "patrol", "patrol:aborted", "urgent"],
        outerGuards: 2,
        innerGuards: 2,
    });
});

test("automatic updates preserve callback exceptions and stop active work", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const original = Object.freeze({ reason: "tick failure" });
        const secondary = new Error("cleanup failure");
        const calls: string[] = [];
        let fail = false;
        const owner = k.add([k.behaviorTree({
            type: "action",
            tick: () => {
                calls.push("tick");
                if (fail) throw original;
                return "running";
            },
            leave: (_, reason) => {
                calls.push(reason);
                throw secondary;
            },
        })]);
        owner.update();
        fail = true;
        let same = false;
        try {
            owner.update();
        } catch (error) {
            same = error === original;
        }
        owner.update();
        return { same, status: owner.tickBehavior(), calls };
    });
    expect(result).toEqual({
        same: true,
        status: "stopped",
        calls: ["tick", "tick", "aborted"],
    });
});

test("disposing a paused behavior still aborts its active action", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        return ["remove", "replace", "destroy"].map(operation => {
            const calls: string[] = [];
            const component = k.behaviorTree({
                type: "action",
                tick: () => "running",
                leave: (_, reason) => calls.push(reason),
            });
            const owner = k.add([component]);
            owner.tickBehavior();
            owner.paused = true;
            const tick = owner.tickBehavior;
            const restart = owner.restartBehavior;
            if (operation === "remove") owner.unuse(component.id);
            else if (operation === "replace") {
                owner.use(k.behaviorTree({ type: "sequence", children: [] }));
            }
            else owner.destroy();
            restart();
            return { status: tick(), calls };
        });
    });
    expect(result).toEqual(
        Array(3).fill({ status: "stopped", calls: ["aborted"] }),
    );
});

test("restart during a tick honors a stop or disposal from aborted leave", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        return ["stop", "remove", "destroy"].map(operation => {
            const calls: string[] = [];
            let ticks = 0;
            const comp = k.behaviorTree({
                type: "action",
                tick: o => {
                    ticks++;
                    o.restartBehavior();
                    return "running";
                },
                leave: (o, reason) => {
                    calls.push(reason);
                    if (operation === "stop") o.stopBehavior();
                    else if (operation === "remove") o.unuse(comp.id);
                    else o.destroy();
                },
            });
            const owner = k.add([comp]);
            const tick = owner.tickBehavior;
            return { first: tick(), next: tick(), ticks, calls };
        });
    });
    expect(result).toEqual(
        Array(3).fill({
            first: "stopped",
            next: "stopped",
            ticks: 1,
            calls: ["aborted"],
        }),
    );
});

test("restart cleanup does not orphan an action entered by nested controls", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        let entries = 0;
        let ticks = 0;
        const reasons: string[] = [];
        const owner = k.add([k.behaviorTree({
            type: "action",
            enter: () => {
                entries++;
            },
            tick: () => {
                ticks++;
                return "running";
            },
            leave: (o, reason) => {
                reasons.push(reason);
                if (reasons.length === 1) {
                    o.restartBehavior();
                    o.tickBehavior();
                }
            },
        })]);
        owner.tickBehavior();
        owner.restartBehavior();
        owner.stopBehavior();
        const settled = { entries, ticks, reasons: [...reasons] };
        const next = owner.tickBehavior();
        return { settled, next, final: { entries, ticks, reasons } };
    });
    expect(result.settled.entries).toBeGreaterThan(0);
    expect(result.settled.reasons).toEqual(
        Array(result.settled.entries).fill("aborted"),
    );
    expect(result.next).toBe("stopped");
    expect(result.final).toEqual(result.settled);
});

test("a throwing leave after requesting restart still leaves external stop stopped", async ({ page }) => {
    const result = await page.evaluate(() => {
        const k = kaplay();
        const original = Object.freeze({ failure: true });
        let ticks = 0;
        const owner = k.add([k.behaviorTree({
            type: "action",
            tick: () => {
                ticks++;
                return "running";
            },
            leave: o => {
                o.restartBehavior();
                throw original;
            },
        })]);
        owner.tickBehavior();
        let same = false;
        try {
            owner.stopBehavior();
        } catch (error) {
            same = error === original;
        }
        const status = owner.behaviorStatus;
        const next = owner.tickBehavior();
        return { same, status, next, ticks };
    });
    expect(result).toEqual({
        same: true,
        status: "stopped",
        next: "stopped",
        ticks: 1,
    });
});
