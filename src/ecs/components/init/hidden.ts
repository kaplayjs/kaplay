import type { EmptyComp } from "../../../types";
import type { GameObjRaw } from "../../entity/GameObjRaw";

const HiddenComp = {
    id: "hidden",
    add(this: GameObjRaw) {
        this.hidden = true;
    },
};

export function hidden(): EmptyComp {
    return HiddenComp;
}
