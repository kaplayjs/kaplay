import type { KEventController } from "../../../events/events";
import { _k } from "../../../kaplay";
import { clamp } from "../../../math/clamp";
import type { Comp, GameObj } from "../../../types";

/**
 * The {@link health `health()`} component.
 *
 * @group Component Types
 */
export interface HealthComp extends Comp {
    /**
     * Decrease HP by n (defaults to 1).
     */
    hurt(n?: number): void;
    /**
     * Increase HP by n (defaults to 1).
     */
    heal(n?: number): void;
    /**
     * Current health points.
     */
    hp: number;
    /**
     * Max amount of HP.
     */
    maxHP: number | null;
    /**
     * Wheter hp is 0.
     */
    dead: boolean;
    /**
     * Register an event that runs when hurt() is called upon the object.
     *
     * @since v2000.1
     */
    onHurt(action: (amount?: number) => void): KEventController;
    /**
     * Register an event that runs when heal() is called upon the object.
     *
     * @since v2000.1
     */
    onHeal(action: (amount?: number) => void): KEventController;
    /**
     * Register an event that runs when object's HP is equal or below 0.
     *
     * @since v2000.1
     */
    onDeath(action: () => void): KEventController;
}

export function health(
    hp: number,
    maxHP?: number,
): HealthComp {
    if (hp == null) {
        throw new Error("health() requires the initial amount of hp");
    }

    return {
        id: "health",
        hp: hp,
        maxHP: maxHP as number | null,
        get dead() {
            return this.hp <= 0;
        },
        hurt(this: GameObj<HealthComp>, n: number = 1) {
            this.hp = maxHP ? Math.min(maxHP, this.hp - n) : this.hp - n;
            this.trigger("hurt", n);
            if (this.hp <= 0) {
                this.trigger("death");
            }
        },
        heal(this: GameObj, n: number = 1) {
            const origHP = hp;
            this.hp += n;
            this.setHP(hp + n);
            this.trigger("heal", hp - origHP);
        },
        onHurt(
            this: GameObj,
            action: (amount?: number) => void,
        ): KEventController {
            return this.on("hurt", action);
        },
        onHeal(
            this: GameObj,
            action: (amount?: number) => void,
        ): KEventController {
            return this.on("heal", action);
        },
        onDeath(this: GameObj, action: () => void): KEventController {
            return this.on("death", action);
        },
        inspect() {
            return `health: ${hp}`;
        },
    };
}
