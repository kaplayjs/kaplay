import type { KEventController } from "../../../events/events";
import { clamp } from "../../../math/clamp";
import type { Comp, GameObj } from "../../../types";
import type { BodyComp } from "./body";

/**
 * The serialized {@link doubleJump `doubleJump()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedDoubleJumpComp {
    numJumps: number;
}

/**
 * The {@link doubleJump `doubleJump()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface DoubleJumpComp extends Comp {
    /**
     * Number of jumps allowed.
     */
    numJumps: number;
    /**
     * Number of jumps left.
     */
    jumpsLeft: number;
    /**
     * Performs double jump (the initial jump only happens if player is grounded).
     */
    doubleJump(force?: number): void;
    /**
     * Register an event that runs when the object performs the second jump when double jumping.
     */
    onDoubleJump(action: () => void): KEventController;
}

export function doubleJump(numJumps: number = 2): DoubleJumpComp {
    let jumpsLeft = numJumps;
    return {
        id: "doubleJump",
        require: ["body"],
        numJumps: numJumps,
        get jumpsLeft() {
            return jumpsLeft;
        },
        set jumpsLeft(n: number) {
            jumpsLeft = clamp(n, 0, this.numJumps);
        },
        add(this: GameObj<BodyComp | DoubleJumpComp>) {
            this.onGround(() => {
                jumpsLeft = this.numJumps;
            });
        },
        doubleJump(
            this: GameObj<BodyComp | DoubleJumpComp>,
            force?: number,
        ) {
            if (jumpsLeft <= 0) {
                return;
            }
            if (jumpsLeft < this.numJumps) {
                this.trigger("doubleJump");
            }
            jumpsLeft--;
            this.jump(force);
        },
        onDoubleJump(this: GameObj, action: () => void): KEventController {
            return this.on("doubleJump", action);
        },
        inspect(this: GameObj<BodyComp | DoubleJumpComp>) {
            return `jumpsLeft: ${jumpsLeft}`;
        },
        serialize() {
            return {
                numJumps: this.numJumps,
            };
        },
    };
}

export function doubleJumpFactory(data: SerializedDoubleJumpComp) {
    return doubleJump(data.numJumps);
}
