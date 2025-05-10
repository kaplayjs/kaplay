import { _k } from "../../../kaplay";
import type { EmptyComp, GameObj } from "../../../types";
import type { GameObjRaw } from "../../entity/GameObjRaw";

export function parent(p: GameObj): EmptyComp {
    return {
        id: "parent",
        use(this: GameObjRaw) {
            this.parent = p;
        },
    };
}
