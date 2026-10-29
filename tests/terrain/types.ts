import kaplay from "../../src/kaplay";

const k = kaplay();
const map = ["##", " #"] as const;
const tiles = { "#": { sprite: "rock", frame: 1, solid: true } } as const;
const terrain = k.add([
    k.pos(),
    k.bakedLevel(map, { tileWidth: 8, tileHeight: 12, tiles }),
]);
terrain.setTile(0, 1, "#");
const change: (x: number, y: number, symbol: string) => void = terrain.setTile;
change(1, 1, " ");
