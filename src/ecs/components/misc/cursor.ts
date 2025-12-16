import { KEventController } from "../../../events/events";
import { _k } from "../../../shared";
import type { Comp, Cursor, GameObj } from "../../../types";
import type { AreaComp } from "../physics/area";
import { type UIComp } from "./ui";

export interface CursorComp extends Comp {
    /**
     * The cursor to use when the mouse is hovering over the area
     */
    cursor?: Cursor;

    serialize(): any;
}

export type CursorCompOpt = {
    /**
     * The cursor to use when the mouse is hovering over the area
     */
    cursor?: Cursor;
};

export function cursor(opt: string | CursorCompOpt = {}): CursorComp {
    const _events: KEventController[] = [];

    return {
        id: "cursor",
        require: ["area", "ui"],

        add(this: GameObj<AreaComp | UIComp | CursorComp>) {
            const cursor = typeof opt === "string" ? opt : opt.cursor;
            if (cursor) {
                this.area.cursor = cursor;
            }
            if (this.area.cursor) {
                _events.push(
                    this.onHover(() => _k.app.setCursor(this.area.cursor!)),
                );
            }
        },

        destroy() {
            for (const event of _events) {
                event.cancel();
            }
        },

        get cursor() {
            return (this as unknown as AreaComp).area.cursor;
        },

        set cursor(value: Cursor | undefined) {
            const area = (this as unknown as AreaComp).area;
            area.cursor = value;
            if (area.cursor && _events.length == 0) {
                _events.push(
                    (this as unknown as UIComp).onHover(() =>
                        _k.app.setCursor(area.cursor!)
                    ),
                );
            }
        },

        serialize() {
            const data: any = {};
            return data;
        },
    };
}

export function cursorFactory(data: any) {
    const opt: any = {};
    return cursor(opt);
}
