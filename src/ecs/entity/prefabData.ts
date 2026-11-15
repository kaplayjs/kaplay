import { Color } from "../../math/color";
import { Vec2 } from "../../math/Vec2";
import type { GameObj } from "../../types";
import { GameObjRawPrototype } from "./GameObjRaw";

type Value = null | boolean | string | number | { type: "undefined" } | {
    type: "object" | "gameObj";
    index: number;
};

type RecordData =
    | { type: "array"; values: Value[] }
    | { type: "record"; values: [string, Value][] }
    | { type: "vec2"; x: number; y: number }
    | { type: "color"; r: number; g: number; b: number };

/** JSON-safe shared component data for a serialized prefab. */
export interface PrefabData {
    version: 1;
    records: RecordData[];
}

export function createPrefabEncoder(objects: readonly GameObj[]) {
    const objectIds = new Map(objects.map((object, index) => [object, index]));
    const values = new Map<object, number>();
    const records: RecordData[] = [];

    function encode(value: any): Value {
        if (
            value === null || typeof value === "string"
            || typeof value === "boolean"
        ) {
            return value;
        }
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (value === undefined) return { type: "undefined" };
        if (typeof value !== "object") {
            throw new TypeError("Unsupported prefab value");
        }
        if (GameObjRawPrototype.isPrototypeOf(value)) {
            const index = objectIds.get(value);
            if (index === undefined) {
                throw new TypeError(
                    "Prefab references an object outside its subtree",
                );
            }
            return { type: "gameObj", index };
        }
        const known = values.get(value);
        if (known !== undefined) return { type: "object", index: known };

        const index = records.length;
        values.set(value, index);
        let record: RecordData;
        if (value instanceof Vec2) {
            if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
                throw new TypeError("Nonfinite prefab vector");
            }
            record = { type: "vec2", x: value.x, y: value.y };
        }
        else if (value instanceof Color) {
            if (![value.r, value.g, value.b].every(Number.isFinite)) {
                throw new TypeError("Nonfinite prefab color");
            }
            record = { type: "color", r: value.r, g: value.g, b: value.b };
        }
        else if (Array.isArray(value)) {
            record = { type: "array", values: [] };
            records.push(record);
            for (const item of value) record.values.push(encode(item));
            return { type: "object", index };
        }
        else if (
            Object.getPrototypeOf(value) === Object.prototype
            || Object.getPrototypeOf(value) === null
        ) {
            record = { type: "record", values: [] };
            records.push(record);
            for (const key of Object.keys(value)) {
                record.values.push([key, encode(value[key])]);
            }
            return { type: "object", index };
        }
        else {
            throw new TypeError("Unsupported prefab object");
        }
        records.push(record);
        return { type: "object", index };
    }

    return { encode, data: { version: 1, records } as PrefabData };
}

export function createPrefabDecoder(
    data: PrefabData,
    objects: readonly GameObj[],
) {
    if (data.version !== 1 || !Array.isArray(data.records)) {
        throw new TypeError("Invalid prefab data");
    }
    const values = data.records.map(record => {
        switch (record.type) {
            case "array":
                return [];
            case "record":
                return {};
            case "vec2":
                return new Vec2(record.x, record.y);
            case "color":
                return new Color(record.r, record.g, record.b);
            default:
                throw new TypeError("Invalid prefab record");
        }
    });

    function decode(value: Value): any {
        if (value === null || typeof value !== "object") return value;
        if (value.type === "undefined") return undefined;
        const source = value.type === "gameObj" ? objects : values;
        if (
            (value.type !== "object" && value.type !== "gameObj")
            || !Number.isSafeInteger(value.index) || value.index < 0
            || value.index >= source.length
        ) {
            throw new TypeError("Invalid prefab reference");
        }
        return source[value.index];
    }

    data.records.forEach((record, index) => {
        const target = values[index];
        if (record.type === "array") {
            for (const value of record.values) {
                (target as any[]).push(decode(value));
            }
        }
        else if (record.type === "record") {
            for (const [key, value] of record.values) {
                Object.defineProperty(target, key, {
                    value: decode(value),
                    enumerable: true,
                    writable: true,
                    configurable: true,
                });
            }
        }
    });
    return decode;
}
