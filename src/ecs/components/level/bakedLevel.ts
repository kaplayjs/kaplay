import { getSprite } from "../../../assets/sprite";
import { getRenderProps } from "../../../game/utils";
import { BakedTiles } from "../../../gfx/bakedTiles";
import type { Frame } from "../../../gfx/TexPacker";
import { Rect, vec2 } from "../../../math/math";
import { type TileRect, tileRects } from "../../../math/tileRects";
import type { Comp, GameObj } from "../../../types";
import { area, type AreaComp } from "../physics/area";
import { body, type BodyComp } from "../physics/body";
import { pos, type PosComp } from "../transform/pos";

export interface BakedTile {
    sprite?: string;
    frame?: number;
    solid?: boolean;
}

export interface BakedLevelOpt {
    tileWidth: number;
    tileHeight: number;
    tiles: Readonly<Record<string, BakedTile>>;
}

export interface BakedLevelComp extends Comp {
    setTile(x: number, y: number, symbol: string): void;
}

type TileData = {
    frame?: Frame;
    solid: boolean;
};

type Collider = GameObj<PosComp | AreaComp | BodyComp>;

export function bakedLevel(
    map: readonly string[],
    opt: BakedLevelOpt,
): BakedLevelComp {
    const { tileWidth, tileHeight } = opt;
    if (
        !Number.isFinite(tileWidth) || tileWidth <= 0
        || !Number.isFinite(tileHeight) || tileHeight <= 0
    ) {
        throw new RangeError("Tile dimensions must be finite and positive");
    }

    const definitions = new Map<string, TileData>();
    for (const [symbol, definition] of Object.entries(opt.tiles)) {
        let frame: Frame | undefined;
        const index = definition.frame ?? 0;
        if (!Number.isInteger(index) || index < 0) {
            throw new RangeError("Invalid tile frame");
        }
        if (definition.sprite !== undefined) {
            const asset = getSprite(definition.sprite);
            if (!asset?.loaded || !asset.data) {
                throw new Error(`Sprite is not loaded: ${definition.sprite}`);
            }
            const source = asset.data.frames[index];
            if (!source) throw new RangeError("Invalid tile frame");
            frame = { ...source, q: source.q.clone() };
        }
        definitions.set(symbol, { frame, solid: definition.solid ?? false });
    }

    const rows = map.map(row => row.split(""));
    const columns = rows.reduce((width, row) => Math.max(width, row.length), 0);
    const geometry = new BakedTiles();
    let colliders = new Map<string, Collider>();
    const rectangleKey = (r: TileRect) =>
        `${r.x}:${r.y}:${r.width}:${r.height}`;
    let owner: GameObj<PosComp> | undefined;
    let dirty = true;
    let disposed = false;

    const rebuildColliders = () => {
        if (!owner) return;
        const rectangles = tileRects(
            rows.map(row =>
                row.map(symbol => definitions.get(symbol)?.solid ?? false)
            ),
        );
        const next = new Map<string, Collider>();
        const created: Collider[] = [];
        try {
            for (const rectangle of rectangles) {
                const key = rectangleKey(rectangle);
                const existing = colliders.get(key);
                if (existing?.exists()) {
                    next.set(key, existing);
                    continue;
                }
                const collider = owner.add([
                    pos(rectangle.x * tileWidth, rectangle.y * tileHeight),
                    area({
                        shape: new Rect(
                            vec2(0),
                            rectangle.width * tileWidth,
                            rectangle.height * tileHeight,
                        ),
                    }),
                    body({ isStatic: true }),
                ]);
                next.set(key, collider);
                created.push(collider);
            }
        } catch (error) {
            for (const collider of created) collider.destroy();
            throw error;
        }
        for (const [key, collider] of colliders) {
            if (!next.has(key)) collider.destroy();
        }
        colliders = next;
    };

    return {
        id: "bakedLevel",
        require: ["pos"],

        add(this: GameObj<PosComp>) {
            if (disposed) return;
            owner = this;
            rebuildColliders();
        },

        setTile(x, y, symbol) {
            if (disposed) throw new Error("Baked level has been removed");
            if (
                !Number.isInteger(x) || !Number.isInteger(y)
                || x < 0 || y < 0 || x >= columns || y >= rows.length
            ) {
                throw new RangeError("Tile position is outside the level");
            }
            if (rows[y][x] === symbol) return;
            const previous = rows[y][x];
            const length = rows[y].length;
            rows[y][x] = symbol;
            const before = definitions.get(previous);
            const after = definitions.get(symbol);
            try {
                if (Boolean(before?.solid) !== Boolean(after?.solid)) {
                    rebuildColliders();
                }
            } catch (error) {
                rows[y][x] = previous;
                rows[y].length = length;
                throw error;
            }
            if (before?.frame !== after?.frame) dirty = true;
        },

        draw(this: GameObj<PosComp | BakedLevelComp>) {
            if (disposed) return;
            if (dirty) {
                geometry.rebuild(
                    rows.map(row =>
                        row.map(symbol => definitions.get(symbol)?.frame)
                    ),
                    tileWidth,
                    tileHeight,
                );
                dirty = false;
            }
            geometry.draw(getRenderProps(this));
        },

        destroy() {
            if (disposed) return;
            disposed = true;
            for (const collider of colliders.values()) collider.destroy();
            colliders.clear();
            geometry.free();
            owner = undefined;
        },
    };
}
