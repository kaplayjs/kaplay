import type { Comp, GameObj } from "../../types";
import type { KEventController } from "../../utils/";

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
    hp: number
    /**
     * Max amount of HP.
     */
    maxHP: number | undefined
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
        hurt(this: GameObj, n: number = 1) {
            this.trigger("hurt", n);
            this.hp -= n;
        },
        heal(this: GameObj, n: number = 1) {
            this.trigger("heal", n);
            this.hp += n;
        },
        get hp(): number {
            return hp;
        },
        set hp(n: number) {
            hp = this.maxHP ? Math.min(this.maxHP, n) : n;
            if (hp <= 0) {
                (this as unknown as GameObj<HealthComp>).trigger("death");
            }
        },
        maxHP,
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
            return `health: ${this.hp}` + (this.maxHP ? `/${this.maxHP}` : "");
        },
    };
}
