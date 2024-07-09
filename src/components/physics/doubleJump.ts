import type { Comp, GameObj } from "../../types";
import type { KEventController } from "../../utils/";
import type { BodyComp } from "./body";

/**
 * The {@link doubleJump `doubleJump()`} component.
 *
 * @group Component Types
 */
export interface DoubleJumpComp extends Comp {
    /**
     * Number of jumps allowed.
     */
    numJumps: number;
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
    };
}
