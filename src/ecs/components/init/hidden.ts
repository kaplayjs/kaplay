import { _k } from "../../../kaplay";
import type { EmptyComp } from "../../../types";
import type { GameObjRaw } from "../../entity/GameObjRaw";

export function hidden(hide = true): EmptyComp {
    return {
        id: "hidden",
        use(this: GameObjRaw) {
            this.hidden = hide;
        },
    };
}
