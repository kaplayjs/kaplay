import { loadAseprite } from "../../../assets/aseprite";
import { type Asset, fetchJSON, load } from "../../../assets/asset";
import {
    loadSprite,
    type LoadSpriteOpt,
    type SpriteData,
} from "../../../assets/sprite";
import { Color, rgb } from "../../../math/color";
import { vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";

export type ThemeSprite = {
    sprite: string | SpriteData | Asset<SpriteData>;
    frame?: number;
};

export const THEME_NORMAL = 0;
export const THEME_PRESSED = 1;
export const THEME_HOVER = 2;
export const THEME_HOVER_PRESSED = 3;
export const THEME_FOCUS = 4;
export const THEME_FOCUS_PRESSED = 5;
export const THEME_HOVER_FOCUS = 6;
export const THEME_FOCUS_HOVER_PRESSED = 7;

export type ThemeData = {
    files: Record<string, [string, string] | [string, LoadSpriteOpt]>;
    hoverColor: Color;
    backgroundColor: Color;
    fontColor: Color;
    fontSize: number;
    button: {
        padding?: Vec2;
        alignContent?: Vec2;
        sprites: ThemeSprite[]; // normal, pressed, etc
    };
    checkbox: {
        padding?: Vec2;
        spacing?: Vec2;
        sprites: ThemeSprite[]; // normal, pressed, etc
    };
    radio: {
        padding?: Vec2;
        spacing?: Vec2;
        sprites: ThemeSprite[]; // normal, pressed, etc
    };
    slider: {
        padding?: Vec2;
        spacing?: Vec2;
        gutter: ThemeSprite;
        gutterfill?: ThemeSprite;
        thumb: ThemeSprite;
    };
    scrollbar?: {
        padding?: Vec2;
        spacing?: Vec2;
        gutter: ThemeSprite;
        gutterfill?: ThemeSprite;
        thumb: ThemeSprite;
    };
};

export const DefaultTheme: ThemeData = {
    files: {
        "ui": ["/sprites/ui.png", "/sprites/ui.json"],
        "button": ["/sprites/button.png", {
            slice9: { left: 3, top: 3, right: 3, bottom: 3 },
        }],
        "buttonpressed": ["/sprites/buttonpressed.png", {
            slice9: { left: 3, top: 3, right: 3, bottom: 3 },
        }],
    },
    hoverColor: rgb(80, 80, 255),
    backgroundColor: rgb(144, 163, 174),
    fontColor: rgb(0, 0, 0),
    fontSize: 20,
    button: {
        padding: vec2(2),
        sprites: [
            { sprite: "button" },
            { sprite: "buttonpressed" },
            { sprite: "button" },
            { sprite: "buttonpressed" },
            { sprite: "button" },
            { sprite: "buttonpressed" },
            { sprite: "button" },
            { sprite: "buttonpressed" },]
    },
    checkbox: {
        padding: vec2(2),
        spacing: vec2(2),
        sprites: [
            { sprite: "ui", frame: 0 },
            { sprite: "ui", frame: 1 },
            { sprite: "ui", frame: 0 },
            { sprite: "ui", frame: 1 },
            { sprite: "ui", frame: 0 },
            { sprite: "ui", frame: 1 },
            { sprite: "ui", frame: 0 },
            { sprite: "ui", frame: 1 },]
    },
    radio: {
        padding: vec2(2),
        spacing: vec2(2),
        sprites: [
            { sprite: "ui", frame: 2 },
            { sprite: "ui", frame: 3 },
            { sprite: "ui", frame: 2 },
            { sprite: "ui", frame: 3 },
            { sprite: "ui", frame: 2 },
            { sprite: "ui", frame: 3 },
            { sprite: "ui", frame: 2 },
            { sprite: "ui", frame: 3 },]
    },
    slider: {
        padding: vec2(2),
        spacing: vec2(2),
        gutter: {
            sprite: "buttonpressed",
        },
        thumb: {
            sprite: "button",
        },
    },
};

export let _theme = DefaultTheme;

const _themes: Record<string, ThemeData> = {};

function loadThemeAssets(theme: ThemeData) {
    for (const [name, options] of Object.entries(theme.files)) {
        if (typeof options[1] == "string") {
            loadAseprite(name, options[0], options[1]);
        }
        else {
            loadSprite(name, options[0], options[1]);
        }
    }
}

export function loadDefaultTheme(name: string = "default") {
    loadThemeAssets(DefaultTheme);
    _themes[name] = DefaultTheme;
    _theme = DefaultTheme;
}

export function loadTheme(name: string, src: string): Asset<ThemeData> | null {
    return load(
        new Promise((res, rej) => {
            fetchJSON(src).then((theme) => {
                loadThemeAssets(theme);
                _themes[name] = theme;
                _theme = theme;
            });
        }),
    );
}

export function setTheme(name: string) {
    if (!_themes[name]) {
        throw new Error(`No theme called ${name} is currently loaded.`);
    }
    _theme = _themes[name];
}
