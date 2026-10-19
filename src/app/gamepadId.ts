import type { GamepadDef, GamepadType } from "../types";

// Gamepad.id isn't standardized by spec, and its format has changed across
// browser versions (PRs #867 & #1110), so we match on vendor:product hex
// when present rather than the raw id string.
// https://w3c.github.io/gamepad/#dom-gamepad-id
// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/id

// Chrome/Chromium/Opera: "<name> ([STANDARD GAMEPAD ]Vendor: xxxx Product: yyyy)"
const CHROME_VID_PID =
    /vendor:\s*([0-9a-f]{1,4})\D+product:\s*([0-9a-f]{1,4})/i;
// Firefox/Safari: "xxxx-yyyy-<name>"
const DASH_VID_PID = /^([0-9a-f]{1,4})-([0-9a-f]{1,4})-/i;

// Extracts a "vendor:product" key from a Gamepad.id, or null if the browser
// didn't expose one (Safari name-only ids, Chrome XInput devices, etc).
export function parseGamepadVidPid(id: string): string | null {
    const match = id.match(CHROME_VID_PID) ?? id.match(DASH_VID_PID);
    if (!match) return null;
    const vendor = match[1].toLowerCase().padStart(4, "0");
    const product = match[2].toLowerCase().padStart(4, "0");
    return `${vendor}:${product}`;
}

// Fallback for when vendor/product is stripped entirely. Only safe for
// controllers whose name text is itself distinctive - not used for e.g.
// DualShock 4, whose reported name is just the generic "Wireless Controller".
function matchByName(
    id: string,
    builtins: Record<string, GamepadDef>,
): GamepadDef | undefined {
    const lowerId = id.toLowerCase();
    for (const key in builtins) {
        const entry = builtins[key];
        if (entry.matchNames?.some(name => lowerId.includes(name))) {
            return entry;
        }
    }
    return undefined;
}

export type GamepadMapResolution = {
    map: GamepadDef;
    vidPid: string | null;
    name: string;
};

// Resolves the GamepadDef for a raw Gamepad.id. Pure function (no DOM
// dependency), so it's directly unit-testable. Priority: exact match in
// customMap > vendor:product match > name-substring fallback > "default".
export function resolveGamepadMap(
    id: string,
    builtins: Record<string, GamepadDef>,
    customMap: Record<string, GamepadDef> = {},
): GamepadMapResolution {
    const vidPid = parseGamepadVidPid(id);
    const map = customMap[id]
        ?? (vidPid ? builtins[vidPid] : undefined)
        ?? matchByName(id, builtins)
        ?? builtins["default"];
    return { map, vidPid, name: map.name ?? "Standard Gamepad" };
}

// Vendor-only fallback for controllers with no `type` in the table (e.g.
// Xbox, which already works under "default" and isn't in GP_MAP). Sony maps
// to the generic "playstation" here rather than ps4/ps5 - 054c alone doesn't
// say which generation, and a usable "it's a PlayStation pad" beats undefined.
const VENDOR_ONLY_TYPE: Record<string, GamepadType> = {
    "054c": "playstation", // Sony
    "045e": "xbox", // Microsoft
    "057e": "switch", // Nintendo
};

// Resolves a controller family from an already-resolved gamepad map, so it
// gets the same name-fallback recovery as `name`. Priority:
// resolved map's exact `type` (ps4/ps5) > vendor-only fallback (playstation)
// > undefined.
export function detectGamepadType(
    { map, vidPid }: Pick<GamepadMapResolution, "map" | "vidPid">,
): GamepadType | undefined {
    if (map.type) return map.type;
    if (!vidPid) return undefined;

    const [vendor] = vidPid.split(":");
    return VENDOR_ONLY_TYPE[vendor];
}
