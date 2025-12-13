import type { AreaComp } from "../../ecs/components/physics/area";
import type { GameObj } from "../../types";

export interface BroadPhaseAlgorithm {
    add(obj: GameObj<AreaComp>): void;
    remove(obj: GameObj<AreaComp>): void;
    clear(): void;
    update(): void;
    iterPairs(
        pairCb: (obj1: GameObj<AreaComp>, obj2: GameObj<AreaComp>) => void,
    ): void;
}
