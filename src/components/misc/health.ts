import { EventController, GameObj, HealthComp } from "../../types";

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
            this.setHP(hp - n);
            this.trigger("hurt", n);
        },
        heal(this: GameObj, n: number = 1) {
            const origHP = hp;
            this.setHP(hp + n);
            this.trigger("heal", hp - origHP);
        },
        hp(): number {
            return hp;
        },
        maxHP(): number | null {
            return maxHP ?? null;
        },
        setMaxHP(n: number): void {
            maxHP = n;
        },
        setHP(this: GameObj, n: number) {
            hp = maxHP ? Math.min(maxHP, n) : n;
            if (hp <= 0) {
                this.trigger("death");
            }
        },
        onHurt(
            this: GameObj,
            action: (amount?: number) => void,
        ): EventController {
            return this.on("hurt", action);
        },
        onHeal(
            this: GameObj,
            action: (amount?: number) => void,
        ): EventController {
            return this.on("heal", action);
        },
        onDeath(this: GameObj, action: () => void): EventController {
            return this.on("death", action);
        },
        inspect() {
            return `${hp}`;
        },
    };
}
