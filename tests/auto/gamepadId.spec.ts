import { describe, expect, test } from "vitest";
import {
    detectGamepadType,
    parseGamepadVidPid,
    resolveGamepadMap,
} from "../../src/app/gamepadId";
import { GP_MAP } from "../../src/constants/general";

describe("parseGamepadVidPid", () => {
    test("parses Chrome id with STANDARD GAMEPAD tag", () => {
        expect(
            parseGamepadVidPid(
                "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
            ),
        ).toBe("054c:0ce6");
    });

    test("parses Chrome id without STANDARD GAMEPAD tag", () => {
        expect(
            parseGamepadVidPid("Pro Controller (Vendor: 057e Product: 2009)"),
        )
            .toBe("057e:2009");
    });

    test("returns null for the changed DualSense id that dropped Vendor/Product", () => {
        expect(
            parseGamepadVidPid(
                "DualSense Wireless Controller (STANDARD GAMEPAD)",
            ),
        ).toBeNull();
    });

    test("returns null for Chrome XInput ids (no vendor/product exposed)", () => {
        expect(
            parseGamepadVidPid("Xbox 360 Controller (XInput STANDARD GAMEPAD)"),
        )
            .toBeNull();
    });

    test("parses Firefox/Safari dash-delimited ids", () => {
        expect(parseGamepadVidPid("054c-0ce6-Wireless Controller")).toBe(
            "054c:0ce6",
        );
    });

    test("zero-pads short hex segments to 4 digits", () => {
        expect(parseGamepadVidPid("46d-c216-Logitech Dual Action")).toBe(
            "046d:c216",
        );
    });

    test("returns null for name-only ids", () => {
        expect(parseGamepadVidPid("DualSense Wireless Controller")).toBeNull();
    });
});

// Real Gamepad.id strings (Chrome/Firefox), vendor:product pairs cross-checked
// against SDL_GameControllerDB. Add your own here if you test real hardware.
type Fixture = {
    description: string;
    id: string;
    expectedName: string;
    expectButton?: [index: string, button: string | undefined];
};

const FIXTURES: Fixture[] = [
    {
        description: "DualSense, Chrome, old id format (w/ Vendor/Product)",
        id: "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
        expectedName: "DualSense",
        expectButton: ["17", "touchpad"],
    },
    {
        description:
            "DualSense, Chrome, current id (#867 - Vendor/Product dropped, recovered via name fallback)",
        id: "DualSense Wireless Controller (STANDARD GAMEPAD)",
        expectedName: "DualSense",
        expectButton: ["17", "touchpad"],
    },
    {
        description: "DualSense, Firefox/Safari dash id format",
        id: "054c-0ce6-DualSense Wireless Controller",
        expectedName: "DualSense",
        expectButton: ["17", "touchpad"],
    },
    {
        description:
            "DualShock 4, Vendor/Product stripped (Android Chrome) - NOT recovered, name is too generic to guess safely",
        id: "Wireless Controller",
        expectedName: "Standard Gamepad",
        expectButton: ["17", undefined],
    },
    {
        description: "DualShock 4, Chrome, PID 05c4",
        id: "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)",
        expectedName: "DualShock 4",
        expectButton: ["17", "touchpad"],
    },
    {
        description: "DualShock 4, Chrome, PID 09cc (later hardware revision)",
        id: "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)",
        expectedName: "DualShock 4",
        expectButton: ["17", "touchpad"],
    },
    {
        description: "Switch Pro Controller, Chrome, with STANDARD GAMEPAD tag",
        id: "Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)",
        expectedName: "Switch Pro Controller",
        expectButton: ["17", "capture"],
    },
    {
        description:
            "Switch Pro Controller, Chrome, without STANDARD GAMEPAD tag",
        id: "Pro Controller (Vendor: 057e Product: 2009)",
        expectedName: "Switch Pro Controller",
        expectButton: ["17", "capture"],
    },
    {
        description: "Joy-Con (L)",
        id: "Joy-Con (L) (STANDARD GAMEPAD Vendor: 057e Product: 2006)",
        expectedName: "Joy-Con (L)",
    },
    {
        description: "Joy-Con (R)",
        id: "Joy-Con (R) (STANDARD GAMEPAD Vendor: 057e Product: 2007)",
        expectedName: "Joy-Con (R)",
    },
    {
        description: "Joy-Con L+R combined",
        id: "Joy-Con L+R (STANDARD GAMEPAD Vendor: 057e Product: 200e)",
        expectedName: "Joy-Con L+R",
        expectButton: ["17", "capture"],
    },
    {
        description:
            "Xbox Series X|S (USB) - not in our table, default covers it fully",
        id: "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b12)",
        expectedName: "Standard Gamepad",
    },
    {
        description: "Xbox Wireless Controller over Bluetooth",
        id: "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)",
        expectedName: "Standard Gamepad",
    },
    {
        description:
            "Xbox 360 via XInput - Chrome exposes no vendor/product for these",
        id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
        expectedName: "Standard Gamepad",
    },
    {
        description: "Generic/\"knockoff\" USB gamepad (DragonRise chipset)",
        id: "Generic   USB Joystick (Vendor: 0079 Product: 0006)",
        expectedName: "Standard Gamepad",
    },
];

describe("resolveGamepadMap (built-in table)", () => {
    for (const fixture of FIXTURES) {
        test(fixture.description, () => {
            const { map, name } = resolveGamepadMap(
                fixture.id,
                GP_MAP,
            );
            expect(name).toBe(fixture.expectedName);
            if (fixture.expectButton) {
                const [index, expected] = fixture.expectButton;
                expect(map.buttons[index]).toBe(expected);
            }
        });
    }
});

describe("resolveGamepadMap (custom opt.gamepads override)", () => {
    test("a user-supplied map keyed by the literal id wins over the built-in table", () => {
        const id =
            "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)";
        const customMap = {
            [id]: {
                name: "My Custom DualSense Remap",
                buttons: { "0": "north" as const },
                sticks: {},
            },
        };

        const { map, name } = resolveGamepadMap(
            id,
            GP_MAP,
            customMap,
        );
        expect(name).toBe("My Custom DualSense Remap");
        expect(map.buttons["0"]).toBe("north");
    });

    test("a user override for one id doesn't affect resolution of other ids", () => {
        const overriddenId = "Some Weird Pad (Vendor: ffff Product: ffff)";
        const customMap = {
            [overriddenId]: {
                name: "Weird Pad",
                buttons: {},
                sticks: {},
            },
        };

        const { name } = resolveGamepadMap(
            "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
            GP_MAP,
            customMap,
        );
        expect(name).toBe("DualSense");
    });
});

describe("detectGamepadType", () => {
    function typeOf(id: string) {
        return detectGamepadType(resolveGamepadMap(id, GP_MAP));
    }

    test("DualSense resolves to ps5 via the built-in table's type field", () => {
        expect(
            typeOf(
                "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
            ),
        ).toBe("ps5");
    });

    test("DualShock 4 resolves to ps4 via the built-in table's type field", () => {
        expect(
            typeOf(
                "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)",
            ),
        ).toBe("ps4");
    });

    test("Switch Pro Controller resolves via the built-in table's type field", () => {
        expect(
            typeOf(
                "Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)",
            ),
        ).toBe("switch");
    });

    test("Xbox pad isn't in the built-in table, but still resolves via vendor-only fallback", () => {
        expect(
            typeOf(
                "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b12)",
            ),
        ).toBe("xbox");
    });

    test("DualSense with vendor/product stripped still resolves, via the same name-fallback that resolveGamepadMap uses", () => {
        expect(
            typeOf("DualSense Wireless Controller (STANDARD GAMEPAD)"),
        ).toBe("ps5");
    });

    test("Sony vendor id with an unrecognized product falls back to generic playstation instead of guessing ps4 vs ps5", () => {
        expect(
            typeOf(
                "Some Future Sony Pad (STANDARD GAMEPAD Vendor: 054c Product: ffff)",
            ),
        ).toBe("playstation");
    });

    test("unknown vendor returns undefined, doesn't guess", () => {
        expect(
            typeOf("Generic   USB Joystick (Vendor: 0079 Product: 0006)"),
        ).toBeUndefined();
    });

    test("no vendor/product and no distinctive name (DualShock 4 over Android) returns undefined", () => {
        expect(typeOf("Wireless Controller")).toBeUndefined();
    });
});
