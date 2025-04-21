import type { Comp, GameObj } from "../../../types";

interface ParentComp<T = unknown> extends Comp {
    /**
     * The parent of the object
     */
    parent: GameObj<T>;
}

export function parent<T>(obj: GameObj<T>): ParentComp<T> {
    return {
        id: "parent",
        parent: obj,
    };
}
