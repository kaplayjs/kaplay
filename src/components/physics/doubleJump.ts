import type {
    BodyComp,
    DoubleJumpComp,
    EventController,
    GameObj,
} from "@/types";

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
        onDoubleJump(this: GameObj, action: () => void): EventController {
            return this.on("doubleJump", action);
        },
        inspect(this: GameObj<BodyComp | DoubleJumpComp>) {
            return `${jumpsLeft}`;
        },
    };
}
