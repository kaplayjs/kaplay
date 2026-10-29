import type { Comp, GameObj } from "../../../types";

export type BehaviorResult = "running" | "success" | "failure";
export type BehaviorStatus = BehaviorResult | "idle" | "stopped";
export type BehaviorLeaveReason = "success" | "failure" | "aborted";

export type BehaviorNode = {
    readonly type: "action";
    readonly enter?: (owner: GameObj) => void;
    readonly tick: (owner: GameObj) => BehaviorResult;
    readonly leave?: (owner: GameObj, reason: BehaviorLeaveReason) => void;
} | {
    readonly type: "sequence";
    readonly children: readonly BehaviorNode[];
} | {
    readonly type: "selector";
    readonly branches: readonly {
        readonly when: (owner: GameObj) => boolean;
        readonly node: BehaviorNode;
    }[];
};

/**
 * Runs a behavior definition with independent progress on a game object.
 * @group Components
 * @subgroup Component Types
 */
export interface BehaviorTreeComp extends Comp {
    readonly behaviorStatus: BehaviorStatus;
    tickBehavior(): BehaviorStatus;
    stopBehavior(): void;
    restartBehavior(): void;
}

type ActionRuntime = {
    kind: "action";
    node: Extract<BehaviorNode, { type: "action" }>;
    state: "idle" | BehaviorResult;
};

type SequenceRuntime = {
    kind: "sequence";
    node: Extract<BehaviorNode, { type: "sequence" }>;
    childIndex: number;
    child?: BehaviorRuntime;
};

type SelectorRuntime = {
    kind: "selector";
    node: Extract<BehaviorNode, { type: "selector" }>;
    selected: number;
    child?: BehaviorRuntime;
};

type BehaviorRuntime = ActionRuntime | SequenceRuntime | SelectorRuntime;

function makeRuntime(node: BehaviorNode): BehaviorRuntime {
    switch (node.type) {
        case "action":
            return { kind: "action", node, state: "idle" };
        case "sequence":
            return { kind: "sequence", node, childIndex: 0 };
        case "selector":
            return { kind: "selector", node, selected: -1 };
    }
}

function abortRuntime(current: BehaviorRuntime, owner: GameObj): void {
    switch (current.kind) {
        case "action":
            if (current.state === "running") {
                // Detach active work before calling code that may stop again.
                current.state = "idle";
                current.node.leave?.(owner, "aborted");
            }
            return;
        case "sequence":
        case "selector": {
            const child = current.child;
            current.child = undefined;
            if (child) abortRuntime(child, owner);
            return;
        }
    }
}

/**
 * Attach an explicitly ticked behavior tree. Selectors recheck guards on each
 * tick and abort the previous action when a higher-priority branch becomes eligible.
 *
 * @example
 * const actor = add([behaviorTree({
 *     type: "action",
 *     tick: () => "success",
 * })]);
 * actor.tickBehavior();
 * actor.restartBehavior();
 */
export function behaviorTree(root: BehaviorNode): BehaviorTreeComp {
    let runtime: BehaviorRuntime | undefined;
    let status: BehaviorStatus = "idle";
    let controlVersion = 0;
    let ticking = false;
    let controlling = 0;
    let disposed = false;

    function isInterrupted(version: number): boolean {
        return disposed || controlVersion !== version;
    }

    function stopForError(owner: GameObj): void {
        const previous = runtime;
        runtime = undefined;
        ++controlVersion;
        status = "stopped";
        controlling++;
        try {
            if (previous) abortRuntime(previous, owner);
        } catch {
            // The callback error takes precedence over an abort error.
        } finally {
            controlling--;
            status = "stopped";
            ++controlVersion;
        }
    }

    function control(owner: GameObj, next: "idle" | "stopped"): void {
        if (disposed) return;

        const previous = runtime;
        runtime = undefined;
        ++controlVersion;
        // A subsequent control operation from leave() must remain authoritative.
        status = next;
        controlling++;
        try {
            if (previous) abortRuntime(previous, owner);
        } catch (error) {
            stopForError(owner);
            throw error;
        } finally {
            controlling--;
        }
    }

    function tickAction(
        current: ActionRuntime,
        owner: GameObj,
        version: number,
    ): BehaviorResult | undefined {
        if (current.state === "success" || current.state === "failure") {
            return current.state;
        }
        if (current.state === "idle") {
            current.state = "running";
            current.node.enter?.(owner);
            if (isInterrupted(version)) return;
        }

        const result = current.node.tick(owner);
        if (isInterrupted(version)) return;
        if (result === "running") return result;

        current.state = result;
        current.node.leave?.(owner, result);
        if (isInterrupted(version)) return;
        return result;
    }

    function tickSequence(
        current: SequenceRuntime,
        owner: GameObj,
        version: number,
    ): BehaviorResult | undefined {
        while (current.childIndex < current.node.children.length) {
            current.child ??= makeRuntime(
                current.node.children[current.childIndex],
            );
            const result = tickNode(current.child, owner, version);
            if (isInterrupted(version)) return;
            if (result !== "success") return result;
            current.child = undefined;
            current.childIndex++;
        }
        return "success";
    }

    function tickSelector(
        current: SelectorRuntime,
        owner: GameObj,
        version: number,
    ): BehaviorResult | undefined {
        let selected = -1;
        for (let i = 0; i < current.node.branches.length; i++) {
            const eligible = current.node.branches[i].when(owner);
            if (isInterrupted(version)) return;
            if (eligible) {
                selected = i;
                break;
            }
        }

        if (selected !== current.selected) {
            const previous = current.child;
            current.child = undefined;
            current.selected = -1;
            if (previous) abortRuntime(previous, owner);
            if (isInterrupted(version)) return;
            current.selected = selected;
        }

        if (selected === -1) return "failure";
        current.child ??= makeRuntime(current.node.branches[selected].node);
        return tickNode(current.child, owner, version);
    }

    function tickNode(
        current: BehaviorRuntime,
        owner: GameObj,
        version: number,
    ): BehaviorResult | undefined {
        switch (current.kind) {
            case "action":
                return tickAction(current, owner, version);
            case "sequence":
                return tickSequence(current, owner, version);
            case "selector":
                return tickSelector(current, owner, version);
        }
    }

    function tick(owner: GameObj): BehaviorStatus {
        if (
            disposed
            || owner.paused
            || ticking
            || controlling > 0
            || status === "success"
            || status === "failure"
            || status === "stopped"
        ) {
            return status;
        }

        ticking = true;
        const version = controlVersion;
        status = "running";
        runtime ??= makeRuntime(root);
        try {
            const result = tickNode(runtime, owner, version);
            if (!isInterrupted(version) && result !== undefined) {
                status = result;
                if (result !== "running") runtime = undefined;
            }
            return status;
        } catch (error) {
            stopForError(owner);
            throw error;
        } finally {
            ticking = false;
        }
    }

    return {
        id: "behaviorTree",

        get behaviorStatus() {
            return status;
        },

        tickBehavior(this: GameObj) {
            return tick(this);
        },

        stopBehavior(this: GameObj) {
            control(this, "stopped");
        },

        restartBehavior(this: GameObj) {
            control(this, "idle");
        },

        update(this: GameObj) {
            tick(this);
        },

        destroy(this: GameObj) {
            if (disposed) return;
            disposed = true;
            const previous = runtime;
            runtime = undefined;
            ++controlVersion;
            status = "stopped";
            controlling++;
            try {
                if (previous) abortRuntime(previous, this);
            } finally {
                controlling--;
            }
        },
    };
}
