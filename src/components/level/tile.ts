import { Vec2, vec2 } from "@/math";
import {
    type Edge,
    EdgeMask,
    type GameObj,
    type LevelComp,
    type TileComp,
    type TileCompOpt,
} from "@/types";

export function tile(opts: TileCompOpt = {}): TileComp {
    let tilePos = vec2(0);
    let isObstacle = opts.isObstacle ?? false;
    let cost = opts.cost ?? 0;
    let edges = opts.edges ?? [];

    const getEdgeMask = () => {
        const loopup = {
            "left": EdgeMask.Left,
            "top": EdgeMask.Top,
            "right": EdgeMask.Right,
            "bottom": EdgeMask.Bottom,
        };
        return edges.map(s => loopup[s] || 0).reduce(
            (mask, dir) => mask | dir,
            0,
        );
    };

    let edgeMask = getEdgeMask();

    return {
        id: "tile",
        tilePosOffset: opts.offset ?? vec2(0),

        set tilePos(p: Vec2) {
            const level = this.getLevel();
            tilePos = p.clone();
            // @ts-ignore
            this.pos = vec2(
                this.tilePos.x * level.tileWidth(),
                this.tilePos.y * level.tileHeight(),
            ).add(this.tilePosOffset);
        },

        get tilePos() {
            return tilePos;
        },

        set isObstacle(is: boolean) {
            if (isObstacle === is) return;
            isObstacle = is;
            this.getLevel().invalidateNavigationMap();
        },

        get isObstacle() {
            return isObstacle;
        },

        set cost(n: number) {
            if (cost === n) return;
            cost = n;
            this.getLevel().invalidateNavigationMap();
        },

        get cost() {
            return cost;
        },

        set edges(e: Edge[]) {
            edges = e;
            edgeMask = getEdgeMask();
            this.getLevel().invalidateNavigationMap();
        },

        get edges() {
            return edges;
        },

        get edgeMask() {
            return edgeMask;
        },

        getLevel(this: GameObj) {
            return this.parent as GameObj<LevelComp>;
        },

        moveLeft() {
            this.tilePos = this.tilePos.add(vec2(-1, 0));
        },

        moveRight() {
            this.tilePos = this.tilePos.add(vec2(1, 0));
        },

        moveUp() {
            this.tilePos = this.tilePos.add(vec2(0, -1));
        },

        moveDown() {
            this.tilePos = this.tilePos.add(vec2(0, 1));
        },
    };
}
