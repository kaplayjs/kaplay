import type { EmptyComp, GameObj } from "../../../types";
import type { GameObjRaw } from "../../entity/GameObjRawPrototype";

export function parent(obj: GameObj): EmptyComp {
    return {
        id: "parent",
        add(this: GameObjRaw) {
            this._parent = obj;
        },
    };
}
