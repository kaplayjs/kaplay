import type { KEventController } from "../../../events/events";
import type { Comp, GameObj } from "../../../types";

/**
 * The {@link health `health()`} component.
 *
 * @group Component Types
 */
export interface HealthComp extends Comp {
    /**
     * Current health points. Setting it to a lower or higher value will trigger onHurt() and onHeal()
     */
    hp: number;
    /**
     * Max amount of HP.
     */
    maxHP: number;
    /**
     * Wheter hp is 0.
     */
    readonly dead: boolean;
    /**
     * Register an event that runs when the hp is lowered.
     *
     * @since v2000.1
     */
    onHurt(action: (amount?: number) => void): KEventController;
    /**
     * Register an event that runs when the hp is increased.
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
        add() {
            if (!this.maxHP) this.maxHP = this.hp;
        },
        get hp() {
            return hp;
        },
        set hp(val: number) {
            const origHP = this.hp;
            hp = this.maxHP ? Math.min(this.maxHP, val) : val;
            if (hp < origHP) {
                (this as unknown as GameObj).trigger("hurt", origHP - hp);
            }
            else if (hp > origHP) {
                (this as unknown as GameObj).trigger("heal", origHP - hp);
            }
            if (hp <= 0) (this as unknown as GameObj).trigger("death");
        },
        get maxHP() {
            return maxHP as number;
        },
        set maxHP(val: number) {
            maxHP = val;
        },
        get dead() {
            return this.hp <= 0;
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
