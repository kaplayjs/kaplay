import type { ButtonsDef } from "./app/inputBindings";
import type { Asset } from "./assets/asset";
import type { ShaderData, Uniform } from "./assets/shader";
import type { KAPLAYCtx } from "./core/contextType";
import type { TypesOpt } from "./core/taf";
import type { GameObjRaw } from "./ecs/entity/GameObjRaw";
import type { LineCap, LineJoin } from "./gfx/draw/drawLine";
import type { Picture } from "./gfx/draw/drawPicture";
import type { FrameBuffer } from "./gfx/FrameBuffer";
import type { Color, RGBAValue, RGBValue } from "./math/color";
import type { Circle, Ellipse, Line, Point, Polygon, Rect } from "./math/math";
import type { Vec2 } from "./math/Vec2";
import type { Defined, MergeObj } from "./utils/types";

export type Tag = string;

/**
 * The basic unit of object in KAPLAY. The player, a butterfly, a tree, or even a piece of text.
 *
 * @group Game Obj
 * @subgroup Types
 */
export type GameObj<T = any> = GameObjRaw & MergeComps<T>;

type RemoveCompProps<T> = Defined<
    {
        [K in keyof T]: K extends keyof Comp ? never : T[K];
    }
>;

/**
 * A type to merge the components of a game object, omitting the default component properties.
 *
 * @group Components
 * @subgroup Component Types
 */
export type MergeComps<T> = MergeObj<RemoveCompProps<T>>;

export type MergePlugins<T extends PluginList<any>> = MergeObj<
    ReturnType<T[number]>
>;

/**
 * A component list.
 *
 * @group Components
 * @subgroup Component Types
 */
export type CompList<T extends any | undefined> = (T | Tag)[];
export type PluginList<T> = Array<T | KAPLAYPlugin<any>>;

/**
 * A key.
 *
 * @group Input
 * @subgroup Keyboard
 */
export type Key =
    | (
        | "f1"
        | "f2"
        | "f3"
        | "f4"
        | "f5"
        | "f6"
        | "f7"
        | "f8"
        | "f9"
        | "f10"
        | "f11"
        | "f12"
        | "`"
        | "1"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "8"
        | "9"
        | "0"
        | "-"
        | "+"
        | "="
        | "q"
        | "w"
        | "e"
        | "r"
        | "t"
        | "y"
        | "u"
        | "i"
        | "o"
        | "p"
        | "["
        | "]"
        | "\\"
        | "a"
        | "s"
        | "d"
        | "f"
        | "g"
        | "h"
        | "j"
        | "k"
        | "l"
        | ";"
        | "'"
        | "z"
        | "x"
        | "c"
        | "v"
        | "b"
        | "n"
        | "m"
        | ","
        | "."
        | "/"
        | "escape"
        | "backspace"
        | "enter"
        | "tab"
        | "control"
        | "alt"
        | "meta"
        | "space"
        | " "
        | "left"
        | "right"
        | "up"
        | "down"
        | "shift"
    )
    | (string & {});

/**
 * You can use 3 or more keys (like `control+shift+s`),
 * it just isn't included in the type here because typescript
 * crashes when it tries to expand all 74^3 = 405224 combinations
 * for 3 keys.
 */
export type ChordedKey = Key | `${Key}+${Key}`;

/**
 * A mouse button.
 *
 * @group Input
 * @subgroup Mouse
 */
export type MouseButton = "left" | "right" | "middle" | "back" | "forward";
export type ChordedMouseButton = MouseButton | `${MouseButton}+${MouseButton}`;

/**
 * A gamepad button.
 *
 * @group Input
 * @subgroup Gamepad
 */
export type KGamepadButton =
    | "north"
    | "east"
    | "south"
    | "west"
    | "ltrigger"
    | "rtrigger"
    | "lshoulder"
    | "rshoulder"
    | "select"
    | "start"
    | "lstick"
    | "rstick"
    | "dpad-up"
    | "dpad-right"
    | "dpad-down"
    | "dpad-left"
    | "home"
    | "capture"
    | "touchpad";
export type ChordedKGamepadButton =
    | KGamepadButton
    | `${KGamepadButton}+${KGamepadButton}`
    | `${KGamepadButton}+${KGamepadButton}+${KGamepadButton}`;

/**
 * A gamepad stick.
 *
 * @group Input
 * @subgroup Gamepad
 */
export type KGamepadStick = "left" | "right";

/**
 * A gamepad definition. Used in {@link KAPLAYOpt `KAPLAYOpt`}
 *
 * @group Input
 * @subgroup Gamepad
 */
export type GamepadDef = {
    buttons: Record<string, KGamepadButton>;
    sticks: Partial<Record<KGamepadStick, { x: number; y: number }>>;
};

/**
 *  A KAPLAY gamepad
 *
 * @group Input
 * @subgroup Gamepad
 */
export type KGamepad = {
    /** The order of the gamepad in the gamepad list. */
    index: number;
    /** If certain button is pressed. */
    isPressed(b: KGamepadButton): boolean;
    /** If certain button is held down. */
    isDown(b: KGamepadButton): boolean;
    /** If certain button is released. */
    isReleased(b: KGamepadButton): boolean;
    /** Get the value of a stick. */
    getStick(stick: KGamepadStick): Vec2;
    /** Get the 0-1 analog value of the button
     * (useful for `ltrigger` and `rtrigger` buttons) */
    getAnalog(b: KGamepadButton): number;
};

/**
 * Inspect info for a game object.
 */
export type GameObjInspect = Record<Tag, string | null>;

export type MustKAPLAYOpt = {
    scale: number;
    spriteAtlasPadding: number;
} & KAPLAYOpt;

/**
 * KAPLAY configurations.
 *
 * @group Start
 */
export interface KAPLAYOpt {
    /**
     * Width of game.
     */
    width?: number;
    /**
     * Height of game.
     */
    height?: number;
    /**
     * Pixel scale / size.
     */
    scale?: number;
    /**
     * Keep aspect ratio and leave black bars on remaining spaces.
     */
    letterbox?: boolean;
    /**
     * If register debug buttons (default true)
     */
    debug?: boolean;
    /**
     * Key that toggles debug mode
     */
    debugKey?: Key;
    /**
     * Default font (defaults to "monospace").
     */
    font?: string;
    /**
     * Device pixel scale (defaults to 1, high pixel density will hurt performance).
     *
     * @since v3000.0
     */
    pixelDensity?: number;
    /**
     * Disable antialias and enable sharp pixel display. If you see rendering artifacts, set `pixelDensity`
     * param to `Math.min(devicePixelRatio, 2)` and `scale` to FHD resolution (e.g. 960x540 would need scale 2). Will result in up to 4K.
     */
    crisp?: boolean;
    /**
     * The canvas DOM element to use. If empty will create one.
     */
    canvas?: HTMLCanvasElement;
    /**
     * The container DOM element to insert the canvas if created. Defaults to document.body.
     */
    root?: HTMLElement;
    /**
     * Background color. E.g. [ 0, 0, 255 ] for solid blue background, or [ 0, 0, 0, 0 ] for transparent background. Accepts RGB value array or string hex codes.
     */
    background?: RGBValue | RGBAValue | string;
    /**
     * Default texture filter.
     */
    texFilter?: TexFilter;
    /**
     * How many log messages can there be on one screen (default 8).
     */
    logMax?: number;
    /**
     * How many seconds log messages stay on screen (default 4).
     *
     * @since v3000.1
     */
    logTime?: number;
    /**
     * Size of the spatial hash grid for collision detection (default 64).
     *
     * @since v3000.0
     */
    hashGridSize?: number;
    /**
     * If translate touch events as mouse clicks (default true).
     */
    touchToMouse?: boolean;
    /**
     * If KAPLAY should render a default loading screen when assets are not fully ready (default true).
     *
     * @since v3000.0
     */
    loadingScreen?: boolean;
    /**
     * If pause audio when tab is not active (default false).
     *
     * @since v3000.0
     */
    backgroundAudio?: boolean;
    /**
     * Custom gamepad definitions (see gamepad.json for reference of the format).
     *
     * @since v3000.0
     */
    gamepads?: Record<string, GamepadDef>;
    /**
     * Defined buttons for input binding.
     *
     * @since v30010
     */
    buttons?: ButtonsDef;
    /**
     * Limit framerate to an amount per second.
     *
     * @since v3000.0
     */
    maxFPS?: number;
    /**
     * If focus on the canvas on start (default true).
     *
     * @since v3001.0
     */
    focus?: boolean;
    /**
     * If import all KAPLAY functions to global (default true).
     */
    global?: boolean;
    /**
     * List of plugins to import.
     */
    plugins?: PluginList<any>;
    /**
     * Enter burp mode.
     */
    burp?: boolean;
    /**
     * Make components ids be added as tags.
     *
     * That means .is() will return true for components with that id.
     *
     * @default true
     */
    tagComponentIds?: boolean;
    /**
     * Padding used when adding sprites to texture atlas.
     *
     * @default 2
     */
    spriteAtlasPadding?: number;
    /**
     * If the debug inspect view should ignore objects that are paused when choosing
     * the object to show the inspect view on.
     *
     * @default false
     * @experimental
     */
    inspectOnlyActive?: boolean;
    /**
     * Which strategy to use for narrow phase collision, gjk or sat
     * @default "gjk"
     */
    narrowPhaseCollisionAlgorithm?: string;
    /**
     * Timeout (in milliseconds) at which other loaders waiting on sprites will give
     * up and throw an error.
     *
     * Currently this is only used by {@link KAPLAYCtx.loadBitmapFontFromSprite}.
     *
     * @default 3000
     */
    loadTimeout?: number;
    /**
     * The default lifetime scope used for event handlers.
     *
     * @default "scene"
     */
    defaultLifetimeScope?: "scene" | "app";
    /**
     * TypeScript Advanced Features (TAF) are a series of options for TypeScript
     * only features.
     *
     * It should be created using the helper function `kaplayTypes`.
     *
     * ```ts
     * kaplay({
     *    types: kaplayTypes<Opt<{
     *        scenes: {}
     *    }>>();
     * });
     * ```
     *
     * @since v4000.0
     */
    types?: TypesOpt;
}

/**
 * A plugin for KAPLAY.
 *
 * @example
 * ```js
 * // a plugin that adds a new function to KAPLAY
 * const myPlugin = (k) => ({
 *    myFunc: () => {
 *       k.debug.log("hello from my plugin")
 *   }
 * })
 *
 * // use the plugin
 * kaplay({
 *   plugins: [ myPlugin ]
 * })
 *
 * // now you can use the new function
 * myFunc()
 * ```
 *
 * @group Plugins
 */
export type KAPLAYPlugin<T> = (
    k: KAPLAYCtx,
) => T | ((...args: any) => (k: KAPLAYCtx) => T);

/**
 * @group Rendering
 * @subgroup Canvas
 */
export type RenderTarget = {
    destination: FrameBuffer | Picture | null;
    childrenOnly?: boolean;
    refreshOnly?: boolean;
    isFresh?: boolean;
};

/**
 * @group Game Obj
 * @subgroup Types
 */
export type GetOpt = {
    /**
     * Recursively get all children and their descendants.
     */
    recursive?: boolean;
    /**
     * Live update the returned list every time object is added / removed.
     */
    liveUpdate?: boolean;
    /**
     * Get only by tags or components.
     */
    only?: "tags" | "comps";
};

/**
 * @group Game Obj
 * @subgroup Types
 */
export type QueryOpt = {
    /**
     * All objects which include all or any of these tags, depending on includeOp.
     */
    include?: string | string[];
    /**
     * Selects the operator to use. Defaults to and.
     */
    includeOp?: "and" | "or";
    /**
     * All objects which do not have all or any of these tags, depending on excludeOp.
     */
    exclude?: string | string[];
    /**
     * Selects the operator to use. Defaults to and.
     */
    excludeOp?: "and" | "or";
    /**
     * All objects which are near or far to the position of this, depending on distanceOp.
     */
    distance?: number;
    /**
     * Selects the operator to use. Defaults to near.
     */
    distanceOp?: "near" | "far";
    /**
     * All objects visible from this standpoint.
     */
    visible?: boolean;
    /**
     * All objects in the given group. Defaults to children.
     */
    hierarchy?: "children" | "siblings" | "ancestors" | "descendants";
    /**
     * All objects matching name
     */
    name?: string;
};

/**
 * Sprite animation configuration when playing.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SpriteAnimPlayOpt {
    /**
     * If this anim should be played in loop.
     */
    loop?: boolean;
    /**
     * When looping should it move back instead of go to start frame again.
     */
    pingpong?: boolean;
    /**
     * This anim's speed in frames per second.
     */
    speed?: number;
    /**
     * If the animation should not restart from frame 1 and t=0 if it is already playing.
     *
     * @default false
     */
    preventRestart?: boolean;
    /**
     * Runs when this animation ends.
     */
    onEnd?: () => void;
}

/**
 * @group Assets
 * @subgroup Data
 */
export type MusicData = string;

/**
 * @group Assets
 * @subgroup Types
 */
export interface LoadFontOpt {
    filter?: TexFilter;
    outline?: number | Outline;
    /**
     * The size to load the font in (default 64).
     *
     * @since v3001.0
     */
    size?: number;
}

/**
 * @group Assets
 * @subgroup Types
 */
export type TextureOpt = {
    filter?: TexFilter;
    wrap?: TexWrap;
};

/**
 * @group Assets
 * @subgroup Types
 */
export type ImageSource = Exclude<TexImageSource, VideoFrame>;

/**
 * @group Rendering
 * @subgroup Canvas
 */
export type Canvas = {
    width: number;
    height: number;
    toImageData(): ImageData;
    toDataURL(): string;
    clear(): void;
    draw(action: () => void): void;
    free(): void;
    readonly fb: FrameBuffer;
};

/**
 * @group Rendering
 * @subgroup Shaders
 */
export interface Vertex {
    pos: Vec2;
    uv: Vec2;
    color: Color;
    opacity: number;
}

/**
 * @group Rendering
 * @subgroup Shaders
 */
export enum BlendMode {
    Normal = 0,
    Add = 1,
    Multiply = 2,
    Screen = 3,
    Overlay = 4,
}

/**
 * @group Rendering
 * @subgroup Shaders
 */
export interface Attributes {
    pos: number[];
    uv: number[];
    color: number[];
    opacity: number[];
}

/**
 * Texture scaling filter. "nearest" is mainly for sharp pixelated scaling, "linear" means linear interpolation.
 */
export type TexFilter = "nearest" | "linear";
export type TexWrap = "repeat" | "clampToEdge";

/**
 * Common render properties.
 */
export interface RenderProps {
    pos?: Vec2;
    scale?: Vec2;
    angle?: number;
    skew?: Vec2;
    color?: Color;
    opacity?: number;
    fixed?: boolean;
    shader?: string | ShaderData | Asset<ShaderData> | null;
    uniform?: Uniform | null;
    blend?: BlendMode;
    outline?: Outline;
}

export interface Outline {
    /**
     * The width, or thickness of the line.
     */
    width?: number;
    /**
     * The color of the line.
     */
    color?: Color;
    /**
     * Opacity (overrides fill opacity).
     *
     * @since v3001.0
     */
    opacity?: number;
    /**
     * Line join.
     *
     * @since v3000.0
     */
    join?: LineJoin;
    /**
     * Miter limit. If the length of the miter divided by the line width exceeds this limit, the style is converted to a bevel.
     *
     * @since v3001.0
     */
    miterLimit?: number;
    /**
     * Line cap.
     *
     * @since v3001.0
     */
    cap?: LineCap;
}

/**
 * @group Rendering
 * @subgroup Screen
 */
export type Cursor =
    | string
    | "auto"
    | "default"
    | "none"
    | "context-menu"
    | "help"
    | "pointer"
    | "progress"
    | "wait"
    | "cell"
    | "crosshair"
    | "text"
    | "vertical-text"
    | "alias"
    | "copy"
    | "move"
    | "no-drop"
    | "not-allowed"
    | "grab"
    | "grabbing"
    | "all-scroll"
    | "col-resize"
    | "row-resize"
    | "n-resize"
    | "e-resize"
    | "s-resize"
    | "w-resize"
    | "ne-resize"
    | "nw-resize"
    | "se-resize"
    | "sw-resize"
    | "ew-resize"
    | "ns-resize"
    | "nesw-resize"
    | "nwse-resize"
    | "zoom-int"
    | "zoom-out";

/**
 * @group Draw
 */
export type Anchor =
    | "topleft"
    | "top"
    | "topright"
    | "left"
    | "center"
    | "right"
    | "botleft"
    | "bot"
    | "botright";

/**
 * @group Math
 * @subgroup Random
 */
export type RNGValue = number | Vec2 | Color;

/**
 * @group Components
 * @subgroup Component Types
 */
export interface Comp {
    /**
     * Component ID (if left out won't be treated as a comp).
     */
    id?: Tag;
    /**
     * What other comps this comp depends on.
     */
    require?: Tag[];
    /**
     * Event that runs when host game obj is added to scene.
     */
    add?: () => void;
    /**
     * Event that runs at a fixed frame rate.
     */
    fixedUpdate?: () => void;
    /**
     * Event that runs every frame.
     */
    update?: () => void;
    /**
     * Event that runs every frame after update.
     */
    draw?: () => void;
    /**
     * Event that runs when obj is removed from scene.
     */
    destroy?: () => void;
    /**
     * Debug info for inspect mode.
     */
    inspect?: () => string | null;
    /**
     * Draw debug info in inspect mode.
     *
     * @since v3000.0
     */
    drawInspect?: () => void;
    /**
     * Serializes the component.
     *
     * @since v4000.0
     */
    serialize?: () => any;
}

/**
 * A valid game object id.
 *
 * @group Game Obj
 * @subgroup GameObjID
 */
export type GameObjID = number;

/**
 * A component without own properties.
 *
 * @group Components
 * @subgroup Component Types
 */
export type EmptyComp = { id: string } & Comp;

/**
 * @group Draw
 */
export type Shape = Rect | Line | Point | Circle | Ellipse | Polygon;

export type Mask = "intersect" | "subtract";

/**
 * @group Math
 * @subgroup Advanced
 */
export type Edge = "left" | "right" | "top" | "bottom";

/**
 * @group Math
 * @subgroup Advanced
 */
export enum EdgeMask {
    None = 0,
    Left = 1,
    Top = 2,
    LeftTop = 3,
    Right = 4,
    Horizontal = 5,
    RightTop = 6,
    HorizontalTop = 7,
    Bottom = 8,
    LeftBottom = 9,
    Vertical = 10,
    LeftVertical = 11,
    RightBottom = 12,
    HorizontalBottom = 13,
    RightVertical = 14,
    All = 15,
}
