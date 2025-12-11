import type { FixedSpeedOption } from "../app/app";
import type {
    ButtonBinding,
    ButtonBindingDevice,
    ButtonsDef,
} from "../app/inputBindings";
import type { AsepriteData } from "../assets/aseprite";
import type { Asset } from "../assets/asset";
import type { BitmapFontData, LoadBitmapFontOpt } from "../assets/bitmapFont";
import type { FontData } from "../assets/font";
import type { ShaderData, Uniform } from "../assets/shader";
import type { SoundData } from "../assets/sound";
import type {
    LoadSpriteOpt,
    LoadSpriteSrc,
    SpriteData,
} from "../assets/sprite";
import type { SpriteAtlasData } from "../assets/spriteAtlas";
import type { AudioPlay, AudioPlayOpt } from "../audio/play";
import type { Debug } from "../debug/debug";
import type { Recording } from "../debug/record";
import type { BlendComp } from "../ecs/components/draw/blend";
import type { CircleComp, CircleCompOpt } from "../ecs/components/draw/circle";
import type { ColorComp } from "../ecs/components/draw/color";
import type { DrawonComp, DrawonCompOpt } from "../ecs/components/draw/drawon";
import type { EllipseComp } from "../ecs/components/draw/ellipse";
import type { MaskComp } from "../ecs/components/draw/mask";
import type { OpacityComp } from "../ecs/components/draw/opacity";
import type { OutlineComp } from "../ecs/components/draw/outline";
import type {
    EmitterOpt,
    ParticlesComp,
    ParticlesOpt,
} from "../ecs/components/draw/particles";
import type { PictureComp } from "../ecs/components/draw/picture";
import type {
    PolygonComp,
    PolygonCompOpt,
} from "../ecs/components/draw/polygon";
import type { RectComp, RectCompOpt } from "../ecs/components/draw/rect";
import type { ShaderComp } from "../ecs/components/draw/shader";
import type { SpriteComp, SpriteCompOpt } from "../ecs/components/draw/sprite";
import type { TextComp, TextCompOpt } from "../ecs/components/draw/text";
import type { UVQuadComp } from "../ecs/components/draw/uvquad";
import type { VideoComp, VideoCompOpt } from "../ecs/components/draw/video";
import type { AgentComp, AgentCompOpt } from "../ecs/components/level/agent";
import type { LevelComp, LevelCompOpt } from "../ecs/components/level/level";
import type {
    PathfinderComp,
    PathfinderCompOpt,
} from "../ecs/components/level/pathfinder";
import type { PatrolComp, PatrolCompOpt } from "../ecs/components/level/patrol";
import type {
    SentryCandidates,
    SentryComp,
    SentryCompOpt,
} from "../ecs/components/level/sentry";
import type { TileComp, TileCompOpt } from "../ecs/components/level/tile";
import type {
    AnimateComp,
    AnimateCompOpt,
} from "../ecs/components/misc/animate";
import type {
    FakeMouseComp,
    FakeMouseOpt,
} from "../ecs/components/misc/fakeMouse";
import type { HealthComp } from "../ecs/components/misc/health";
import type { LifespanCompOpt } from "../ecs/components/misc/lifespan";
import type { NamedComp } from "../ecs/components/misc/named";
import type { StateComp } from "../ecs/components/misc/state";
import type { StayComp } from "../ecs/components/misc/stay";
import type { TextInputComp } from "../ecs/components/misc/textInput";
import type {
    TimerComp,
    TimerController,
    TweenController,
} from "../ecs/components/misc/timer";
import type { AreaComp, AreaCompOpt } from "../ecs/components/physics/area";
import type { BodyComp, BodyCompOpt } from "../ecs/components/physics/body";
import type { DoubleJumpComp } from "../ecs/components/physics/doubleJump";
import type {
    AreaEffectorComp,
    AreaEffectorCompOpt,
    BuoyancyEffectorComp,
    BuoyancyEffectorCompOpt,
    ConstantForceComp,
    ConstantForceCompOpt,
    PlatformEffectorComp,
    PlatformEffectorCompOpt,
    PointEffectorComp,
    PointEffectorCompOpt,
    SurfaceEffectorComp,
    SurfaceEffectorCompOpt,
} from "../ecs/components/physics/effectors";
import type { AnchorComp } from "../ecs/components/transform/anchor";
import type { constraint } from "../ecs/components/transform/constraint";
import type { FixedComp } from "../ecs/components/transform/fixed";
import type { FollowComp } from "../ecs/components/transform/follow";
import type { LayerComp } from "../ecs/components/transform/layer";
import type { MoveComp } from "../ecs/components/transform/move";
import type {
    OffScreenComp,
    OffScreenCompOpt,
} from "../ecs/components/transform/offscreen";
import type { PosComp } from "../ecs/components/transform/pos";
import type { RotateComp } from "../ecs/components/transform/rotate";
import type { ScaleComp } from "../ecs/components/transform/scale";
import type { SkewComp } from "../ecs/components/transform/skew";
import type { ZComp } from "../ecs/components/transform/z";
import type { KeepFlags } from "../ecs/entity/GameObjRaw";
import type { SerializedGameObj } from "../ecs/entity/prefab";
import type { BoomOpt } from "../ecs/entity/premade/addKaboom";
import type { AddLevelOpt } from "../ecs/entity/premade/addLevel";
import type { Collision } from "../ecs/systems/Collision";
import type { SystemPhase } from "../ecs/systems/systems";
import type { GameObjEventNames, GameObjEvents } from "../events/eventMap";
import type { KEvent, KEventController, KEventHandler } from "../events/events";
import type { GameEventHandlers } from "../events/gameEventHandlers";
import type { AppScope, SceneScope } from "../events/scopes";
import type { SceneDef } from "../game/scenes";
import type { anchorPt } from "../gfx/anchor";
import type { DrawBezierOpt } from "../gfx/draw/drawBezier";
import type { DrawCanvasOpt } from "../gfx/draw/drawCanvas";
import type { DrawCircleOpt } from "../gfx/draw/drawCircle";
import type { DrawCurveOpt } from "../gfx/draw/drawCurve";
import type { DrawEllipseOpt } from "../gfx/draw/drawEllipse";
import type { FormattedText } from "../gfx/draw/drawFormattedText";
import type {
    DrawLineOpt,
    DrawLinesOpt,
    LineCap,
    LineJoin,
} from "../gfx/draw/drawLine";
import type { DrawPictureOpt, Picture } from "../gfx/draw/drawPicture";
import type { DrawPolygonOpt } from "../gfx/draw/drawPolygon";
import type { DrawRectOpt } from "../gfx/draw/drawRect";
import type { DrawSpriteOpt } from "../gfx/draw/drawSprite";
import type { DrawTextOpt } from "../gfx/draw/drawText";
import type { DrawTriangleOpt } from "../gfx/draw/drawTriangle";
import type { DrawUVQuadOpt } from "../gfx/draw/drawUVQuad";
import type { StyledTextInfo } from "../gfx/formatText";
import type { FrameBuffer } from "../gfx/FrameBuffer";
import type { DecisionNode, DecisionTree } from "../math/ai/decisiontree";
import type { Rule, RuleSystem } from "../math/ai/rulesystem";
import type { StateMachine } from "../math/ai/statemachine";
import type { Color, CSSColorKeywords } from "../math/color";
import type { EaseFunc, EaseFuncs } from "../math/easings";
import type { GjkCollisionResult } from "../math/gjk";
import type { LerpValue } from "../math/lerp";
import type { Mat4 } from "../math/Mat4";
import type {
    Circle,
    Ellipse,
    getSpriteOutline,
    Line,
    Mat2,
    Mat23,
    Point,
    Polygon,
    Quad,
    RaycastResult,
    Rect,
    RNG,
    StepPosition,
} from "../math/math";
import type { NavMesh } from "../math/navigationmesh";
import type { Quadtree, ResizingQuadtree } from "../math/spatial/quadtree";
import type { Vec2 } from "../math/Vec2";
import {
    type Anchor,
    type BlendMode,
    type Canvas,
    type Comp,
    type CompList,
    type Cursor,
    type EmptyComp,
    type GameObj,
    type GetOpt,
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type Key,
    type KGamepad,
    type KGamepadButton,
    type KGamepadStick,
    type LoadFontOpt,
    type Mask,
    type MouseButton,
    type MusicData,
    type QueryOpt,
    type RNGValue,
    type Shape,
    type Tag,
} from "../types";
import type { TupleWithoutFirst } from "../utils/types";
import type { Engine } from "./engine";
import type { OptionalString } from "./taf";

/**
 * Context handle that contains every KAPLAY function.
 *
 * @template TButtonDef - The button map
 * @template TButton - The button type
 *
 * @group Start
 */
export interface KAPLAYCtx {
    /**
     * Internal data that should not be accessed directly.
     *
     * @ignore
     *
     * @readonly
     * @group Misc
     */
    _k: Engine & { k: KAPLAYCtx };
    /**
     * End everything.
     *
     * @since v2000.0
     * @group Start
     */
    quit(): void;
    /**
     * Throws a new error and show up the Blue Screen.
     *
     * @param msg - The message for showing in the Blue Screen.
     *
     * @since v4000.0
     * @group Start
     */
    throwError(msg: string): void;
    /**
     * Assemble a game object from a list of components, and add it to the game,
     *
     * @param comps - List of components to add to the game object.
     *
     * @example
     * ```js
     * const player = add([
     *     // List of components, each offers a set of functionalities
     *     sprite("mark"),
     *     pos(100, 200),
     *     area(),
     *     body(),
     *     health(8),
     *     // Plain strings are tags, a quicker way to let us define behaviors for a group
     *     "player",
     *     "friendly",
     *     // Components are just plain objects, you can pass an object literal as a component.
     *     {
     *         dir: LEFT,
     *         dead: false,
     *         speed: 240,
     *     },
     * ]);
     *
     * // .jump is provided by body()
     * player.jump();
     * // .moveTo is provided by pos()
     * player.moveTo(300, 200);
     *
     * // .onUpdate() is on every game object, it registers an event that runs every frame
     * player.onUpdate(() => {
     *     // .move() is provided by pos()
     *     player.move(player.dir.scale(player.speed));
     * });
     *
     * // .onCollide is provided by area()
     * player.onCollide("tree", () => {
     *     destroy(player);
     * });
     * ```
     *
     * @returns The added game object that contains all properties and methods each component offers.
     * @group Game Obj
     */
    add<T extends CompList<unknown>>(comps?: [...T]): GameObj<T[number]>;
    /**
     * Assemble a game object from a prefab asset loaded with {@link loadPrefab `loadPrefab()`} or using {@link createPrefab `createPrefab()`}.
     *
     * @example
     * ```js
     * loadPrefab("bean", "/prefabs/bean.kaprefab")
     *
     * addPrefab("bean", [
     *     pos(40, 40)
     * ]);
     * ```
     *
     * @returns The added game object that contains all properties and methods each component offers.
     * @group Game Obj
     */
    addPrefab<T extends CompList<unknown>>(
        nameOrObject: SerializedGameObj | string,
        compList?: [...T],
    ): GameObj<T[number]>;
    /**
     * Serialize a game object and register it (like {@link loadPrefab `loadPrefab()`} does).
     *
     * @param name - Name to register the prefab.
     * @param obj - The game object to serialize.
     *
     * @example
     * ```js
     * const beanObj = add([ sprite("bean") ]);
     * createPrefab("bean", beanObj);
     *
     * addPrefab("bean"); // Now you can use as prefab
     * ```
     *
     * @returns The serialized game object.
     * @since v4000.0
     * @group Game Obj
     */
    createPrefab(name: string, obj: GameObj): SerializedGameObj;
    /**
     * Serialize a game object.
     *
     * @param obj - The game object to serialize.
     *
     * @example
     * ```js
     * const beanObj = add([ sprite("bean") ]);
     * const beanPrefab = createPrefab(beanObj);
     *
     * addPrefab(beanPrefab); // Now you can use as prefab
     * ```
     *
     * @returns The serialized game object.
     * @since v4000.0
     * @group Game Obj
     * @subgroup Prefabs
     */
    createPrefab(obj: GameObj): SerializedGameObj;
    /**
     * Remove and re-add the game obj, without triggering add / destroy events.
     *
     * @param obj - The game object to re-add.
     *
     * @example
     * ```js
     * // Common way to use this is to have one sprite overlap another sprite, and use readd() to have the bottom sprite on top of the other.
     *
     * // Create two sprites.
     * const greenBean = add([
     *     sprite("bean"),
     *     pos(200,140),
     *     color(255, 255, 255),
     *     area(),
     * ]);
     *
     * // This bean will overlap the green bean.
     * const purpleBean = add([
     *     sprite("bean"),
     *     pos(230,140),
     *     color(255, 0, 255),
     *     area(),
     * ]);
     *
     * // Example 1: simply call readd() on the target you want on top.
     * readd(greenBean);
     *
     * // Example 2: using onClick() or other functions with readd().
     * // If you comment out the first example, and use this readd() with a function like onClick(), you
     * can keep switching which sprite is above the other ( click on edge of face ).
     *
     * purpleBean.onClick(() => {
     *     readd(greenBean);
     * });
     *
     * greenBean.onClick(() => {
     *     readd(purpleBean);
     * });
     * ```
     *
     * @returns The re-added game object.
     * @since v3001.0
     * @group Game Obj
     */
    readd(obj: GameObj): GameObj;
    /**
     * Retrieves all objects within the given rectangle
     *
     * @since v4000
     * @group Game Obj
     */
    retrieve(rect: Rect, retrieveCb: (obj: GameObj<AreaComp>) => void): void;
    /**
     * Get a list of all game objs with certain tag.
     *
     * @param tag - The tag to search for. Use "*" to get all objects.
     * @param opts - Additional options.
     *
     * @example
     * ```js
     * // get a list of all game objs with tag "bomb"
     * const allBombs = get("bomb");
     *
     * // To get all objects use "*"
     * const allObjs = get("*");
     *
     * // Recursively get all children and descendents
     * const allObjs = get("*", { recursive: true });
     *
     * // Get a live query which updates in real-time
     * const allObjs = get("*", { liveUpdate: true });
     * ```
     *
     * @returns A list of game objects that have the tag.
     * @since v2000.0
     * @group Game Obj
     */
    get<T = any>(tag: Tag | Tag[], opts?: GetOpt): GameObj<T>[];
    /**
     * Get a list of game objects in an advanced way.
     *
     * @param opt - The query options.
     *
     * @example
     * ```js
     * const bean = k.add(["friend", "bean"]);
     * const bean2 = k.add(["friend", "bean"]);
     * const bag = k.add(["friend", "bag"]);
     *
     * // get bean
     * query({
     *     include: "bean",
     * }) // will return [bean, bean2];
     *
     * // get all friends excluding bean
     * query({
     *     include: "friend",
     *     exclude: "bean",
     * }); // will return [bag]
     *
     * // get all visible friends
     * query({
     *     include: "friend",
     *     visible: true,
     * });
     *
     * // get all friends less than 150 pixels from bean
     * bean.query({
     *     include: "friend",
     *     distance: 150,
     * });
     *
     * ```
     *
     * @group Game Obj
     */
    query(opt: QueryOpt): GameObj[];
    /**
     * Remove the game obj.
     *
     * @param obj - The game object to remove.
     *
     * @example
     * ```js
     * // every time bean collides with anything with tag "fruit", remove it
     * bean.onCollide("fruit", (fruit) => {
     *     destroy(fruit);
     * });
     * ```
     *
     * @group Game Obj
     */
    destroy(obj: GameObj): void;
    /**
     * Remove all game objs with certain tag.
     *
     * @param tag - The tag to search for.
     *
     * @example
     * ```js
     * // destroy all objects with tag "bomb" when you click one
     * onClick("bomb", () => {
     *     destroyAll("bomb");
     * });
     * ```
     *
     * @group Game Obj
     */
    destroyAll(tag: Tag): void;
    // #region Transform Comps
    /**
     * Set the position of a Game Object, relative to its parent.
     *
     * @param x - The x position to set.
     * @param y - The y position to set.
     *
     * @example
     * ```js
     * // This game object will draw a "bean" sprite at (100, 200)
     * let bean =add([
     *     pos(100, 200),
     *     sprite("bean"),
     * ]);
     *
     * // This game object will draw a rectangle at (105, 205) world coordinate.
     * // The position will be 5 pixels to the right and 5 pixels down from the parent bean.
     * let rect = bean.add([
     *     pos(5, 5),
     *     rect(100, 100),
     * ])
     * ```
     *
     * @returns The position comp.
     * @since v2000.0
     * @group Components
     * @subgroup Transform
     */
    pos(x: number, y: number): PosComp;
    pos(xy: number): PosComp;
    pos(p: Vec2): PosComp;
    pos(): PosComp;
    /**
     * Set the scale of a Game Object.
     *
     * @param x - The x scale to set.
     * @param y - The y scale to set.
     *
     * @example
     * ```js
     * // scale uniformly with one value
     * add([
     *     sprite("bean"),
     * 	   scale(3),
     * ]);
     *
     * // scale with x & y values. In this case, scales more horizontally.
     * add([
     *     sprite("bean"),
     * 	   scale(3, 1),
     * ]);
     *
     *  // scale with vec2(x,y).
     * bean.scale = vec2(2,4);
     *
     * ```
     *
     * @returns The scale comp.
     * @since v2000.0
     * @group Components
     * @subgroup Transform
     */
    scale(x: number, y: number): ScaleComp;
    scale(xy: number): ScaleComp;
    scale(s: Vec2): ScaleComp;
    scale(): ScaleComp;
    /**
     * Rotates a Game Object (in degrees).
     *
     * @param a - The angle to rotate by. Defaults to 0.
     *
     * @example
     * ```js
     * let bean = add([
     *     sprite("bean"),
     *     rotate(),
     * ])
     *
     * // bean will be upside down!
     * bean.angle = 180
     * ```
     *
     * @returns The rotate comp.
     * @since v2000.0
     * @group Components
     * @subgroup Transform
     */
    rotate(a?: number): RotateComp;
    /**
     * Set the skew of a Game Object.
     *
     * @param x - The x skew to set.
     * @param y - The y skew to set.
     *
     * @example
     * ```js
     * // skew x
     * add([
     *     sprite("bean"),
     * 	   skew(45, 0),
     * ]);
     * ```
     *
     * @returns The skew comp.
     * @since v4000.0
     * @group Components
     * @subgroup Transform
     */
    skew(x: number, y: number): SkewComp;
    skew(s: Vec2): SkewComp;
    // #endregion
    /**
     * Sets the color of a Game Object (rgb 0-255).
     *
     * @param r - The red value to set.
     * @param g - The green value to set.
     * @param b - The blue value to set.
     *
     * @example
     * ```js
     * // blue frog
     * add([
     *     sprite("bean"),
     *     color(0, 0, 255),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(r: number, g: number, b: number): ColorComp;
    /**
     * Sets the color of a Game Object using a previously created Color Object.
     *
     * @param c - The color to clone and set.
     *
     * @example
     * ```js
     * // blue frog
     * const blue = rgb(0, 0, 255);
     *
     * add([
     *     sprite("bean"),
     *     color(blue),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(c: Color): ColorComp;
    /**
     * Sets the color of a Game Object using an array (rgb 0-255).
     *
     * @param rgb - The color array to set [r, g, b].
     *
     * @example
     * ```js
     * // blue frog
     * add([
     *     sprite("bean"),
     *     color([0, 0, 255]),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(rgb: [number, number, number]): ColorComp;
    /**
     * Sets the color of a Game Object using a CSS color keywords or hexadecimal string.
     *
     * @param c - The CSS color keyword or hexadecimal code to set.
     *
     * @example
     * ```js
     * // blue frog (HEX)
     * add([
     *     sprite("bean"),
     *     color("#0000ff"),
     * ]);
     *
     * // red cheese (CSS)
     * add([
     *     sprite("mark"),
     *     color("red"),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(c: OptionalString<CSSColorKeywords>): ColorComp;
    /**
     * Sets the color of a Game Object using a hexadecimal literal number.
     *
     * @param c - The hexadecimal literal number.
     *
     * @example
     * ```js
     * // blue frog
     * add([
     *     sprite("bean"),
     *     color(0x0000ff),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(c: number): ColorComp;
    /**
     * Sets the color of a Game Object to white (no effect).
     *
     * @example
     * ```js
     * // normal frog
     * add([
     *     sprite("bean"),
     *     color(),
     * ]);
     * ```
     *
     * @returns The color comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    color(): ColorComp;
    /**
     * Sets the blend mode of a Game Object.
     *
     * @example
     * ```js
     * // light
     * add([
     *     sprite("light"),
     *     blend(BlendMode.Add),
     * ]);
     * ```
     *
     * @returns The blend comp.
     * @since v4000.0
     * @group Components
     * @subgroup Rendering
     */
    blend(blend: BlendMode): BlendComp;
    /**
     * Sets the opacity of a Game Object (0.0 - 1.0).
     *
     * @param o - The opacity value to set.
     *
     * @example
     * ```js
     * const bean = add([
     *     sprite("bean"),
     *     opacity(0.5) // Make bean 50% transparent
     * ])
     *
     * // Make bean invisible
     * bean.opacity = 0
     *
     * // Make bean fully visible
     * bean.opacity = 1
     * ```
     *
     * @returns The opacity comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    opacity(o?: number): OpacityComp;
    /**
     * Attach and render a sprite to a Game Object.
     *
     * @param spr - The sprite to render.
     * @param opt - Options for the sprite component. See {@link SpriteCompOpt `SpriteCompOpt`}.
     *
     * @example
     * ```js
     * // minimal setup
     * add([
     *     sprite("bean"),
     * ])
     *
     * // with options
     * const bean = add([
     *     sprite("bean", {
     *         // start with animation "idle"
     *         anim: "idle",
     *     }),
     * ])
     *
     * // play / stop an anim
     * bean.play("jump")
     * bean.stop()
     *
     * // manually setting a frame
     * bean.frame = 3
     * ```
     *
     * @returns The sprite comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    sprite(
        spr: string | SpriteData | Asset<SpriteData>,
        opt?: SpriteCompOpt,
    ): SpriteComp;
    /**
     * Attach and render a text to a Game Object.
     *
     * @param txt - The text to display.
     * @param opt - Options for the text component. See {@link TextCompOpt}.
     *
     * @example
     * ```js
     * // a simple score counter
     * const score = add([
     *     text("Score: 0"),
     *     pos(24, 24),
     *     { value: 0 },
     * ])
     *
     * player.onCollide("coin", () => {
     *     score.value += 1
     *     score.text = "Score:" + score.value
     * })
     *
     * // with options
     * add([
     *     pos(24, 24),
     *     text("ohhi", {
     *         size: 48, // 48 pixels tall
     *         width: 320, // it'll wrap to next line when width exceeds this value
     *         font: "sans-serif", // specify any font you loaded or browser built-in
     *     }),
     * ])
     * ```
     *
     * @returns The text comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    text(txt?: string, opt?: TextCompOpt): TextComp;
    /**
     * Attach and render a polygon to a Game Object.
     *
     * @param pts - The points to render the polygon.
     * @param opt - Options for the polygon component. See {@link PolygonCompOpt `PolygonCompOpt`}.
     *
     * @example
     * ```js
     * // Make a square the hard way
     * add([
     *     pos(80, 120),
     *     polygon([vec2(0,0), vec2(50,0), vec2(50,50), vec2(0,50)]),
     *     outline(4),
     *     area(),
     * ])
     * ```
     *
     * @returns The polygon comp.
     * @since v3001.0
     * @group Components
     * @subgroup Rendering
     */
    polygon(pts: Vec2[], opt?: PolygonCompOpt): PolygonComp;
    /**
     * Create an outline in the form of a polygon from a sprite object
     *
     * @param asset - The name of the sprite you want to generate an outline for
     * @param frame - The frame of the sprite that the outline should be taken from
     * @param RDP - Should the function return a simplified polygon
     * @param epsilon - The amount of the polygon that should be reduced
     *
     * @example
     * ```js
     * // Create a collider from the sprite
     * onLoad(() => {
     *     add([
     *         sprite("apple"),
     *         area({shape: getSpriteOutline("apple")}),
     *         pos(120, 80), // optional position
     *     ]);
     * });
     * ```
     *
     * @returns A polygon comp.
     * // TODO: add since, group and subgroup
     */
    getSpriteOutline(
        asset: string,
        frame?: number,
        RDP?: boolean,
        epsilon?: number,
    ): Polygon;
    /**
     * Attach and render a rectangle to a Game Object.
     *
     * @param w - The width of the rectangle.
     * @param h - The height of the rectangle.
     * @param opt - Options for the rectangle component. See {@link RectCompOpt `RectCompOpt`}.
     *
     * @example
     * ```js
     * const obstacle = add([
     *     pos(80, 120),
     *     rect(20, 40),
     *     outline(4),
     *     area(),
     * ])
     * ```
     *
     * @returns The rectangle component.
     * @group Components
     * @subgroup Rendering
     */
    rect(w: number, h: number, opt?: RectCompOpt): RectComp;
    /**
     * Attach and render a circle to a Game Object.
     *
     * @param radius - The radius of the circle.
     * @param opt - Options for the circle component. See {@link CircleCompOpt `CircleCompOpt`}.
     *
     * @example
     * ```js
     * add([
     *     pos(80, 120),
     *     circle(16),
     * ])
     * ```
     *
     * @returns The circle comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    circle(radius: number, opt?: CircleCompOpt): CircleComp;
    /**
     * Attach and render an ellipse to a Game Object.
     *
     * @param radiusX - The radius of the ellipse on the x-axis.
     * @param radiusY - The radius of the ellipse on the y-axis.
     *
     * @example
     * ```js
     * add([
     *     pos(80, 120),
     *     ellipse(16, 8),
     * ])
     * ```
     *
     * @returns The ellipse comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    ellipse(radiusX: number, radiusY: number): EllipseComp;
    /**
     * Attach and render a UV quad to a Game Object.
     *
     * @param w - The width of the quad.
     * @param h - The height of the quad.
     *
     * @example
     * ```js
     * add([
     *     uvquad(width(), height()),
     *     shader("spiral"),
     * ])
     * ```
     *
     * @returns The UV quad comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    uvquad(w: number, h: number): UVQuadComp;
    /**
     * Draws a video.
     *
     * @param url - The video to play. Needs to be on the same webserver due to CORS.
     * @param opt - The video component options
     *
     * @returns The video comp.
     * @since v4000.0
     * @group Components
     * @subgroup Rendering
     */
    video(url: string, opt?: VideoCompOpt): VideoComp;
    /**
     * Draws a picture, using the Picture API.
     *
     * @param picture - The picture to draw.
     *
     * @returns The picture comp.
     * @since v4000.0
     * @group Components
     * @subgroup Rendering
     */
    picture(picture: Picture): PictureComp;
    /**
     * Attach a collider area from shape and enables collision detection in a Game Object.
     *
     * @param opt - Options for the area component. See {@link AreaCompOpt `AreaCompOpt`}.
     *
     * @example
     * ```js
     * // Automatically generate area information from the shape of render
     * const player = add([
     *     sprite("bean"),
     *     area(),
     * ])
     *
     * // Die if player collides with another game obj with tag "tree"
     * player.onCollide("tree", () => {
     *     destroy(player)
     *     go("lose")
     * })
     *
     * // Check for collision manually every frame instead of registering an event
     * player.onUpdate(() => {
     *     if (player.isColliding(bomb)) {
     *         score += 1
     *     }
     * })
     * ```
     *
     * @returns The area comp.
     * @since v2000.0
     * @group Components
     * @subgroup Physics
     */
    area(opt?: AreaCompOpt): AreaComp;
    /**
     * Anchor point for render (default "topleft").
     *
     * @param o - The anchor point to set.
     *
     * @example
     * ```js
     * // set anchor to "center" so it'll rotate from center
     * add([
     *     rect(40, 10),
     *     rotate(45),
     *     anchor("center"),
     * ])
     * ```
     *
     * @returns The anchor comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    anchor(o: Anchor | Vec2): AnchorComp;
    /**
     * Determines the draw order for objects on the same layer. Object will be drawn on top if z value is bigger.
     *
     * @param z - The z value to set.
     *
     * @example
     * ```js
     * const bean = add([
     *    sprite("bean"),
     *    pos(100, 100),
     *    z(10), // Bean has a z value of 10
     * ])
     *
     * // Mark has a z value of 20, so he will always be drawn on top of bean
     * const mark = add([
     *   sprite("mark"),
     *   pos(100, 100),
     *   z(20),
     * ])
     *
     * bean.z = 30 // Bean now has a higher z value, so it will be drawn on top of mark
     * ```
     *
     * @returns The z comp.
     * @since v2000.0
     * @group Components
     * @subgroup Transform
     */
    z(z: number): ZComp;
    /**
     * Determines the layer for objects. Object will be drawn on top if the layer index is higher.
     *
     * @param name - The layer name to set.
     *
     * @example
     * ```js
     * // Define layers
     * layers(["background", "game", "foreground"], "game")
     *
     * const bean = add([
     *     sprite("bean"),
     *     pos(100, 100),
     *     layer("background"),
     * ])
     *
     * // Mark is in a higher layer, so he will be drawn on top of bean
     * const mark = add([
     *     sprite("mark"),
     *     pos(100, 100),
     *     layer("game"),
     * ])
     *
     * bean.layer("foreground") // Bean is now in the foreground layer and will be drawn on top of mark
     * ```
     *
     * @returns The layer comp.
     * @since v3001.0
     * @group Components
     * @subgroup Rendering
     */
    layer(name: string): LayerComp;
    /**
     * Give an object an outline. Doesn't support sprite or text components.
     *
     * @param width - The width of the outline.
     * @param color - The color of the outline.
     * @param opacity - The opacity of the outline.
     * @param join - -The line join style.
     * @param miterLimit - The miter limit ratio.
     * @param cap -The line cap style.
     *
     * @example
     * ```js
     * // Add an outline to a rectangle
     *
     * add([
     *    rect(40, 40),
     *    outline(4),
     * ]);
     * ```
     *
     * @returns The outline comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    outline(
        width?: number,
        color?: Color,
        opacity?: number,
        join?: LineJoin,
        miterLimit?: number,
        cap?: LineCap,
    ): OutlineComp;
    /**
     * Attach a particle emitter to a Game Object.
     *
     * @param popt - The options for the particles.
     * @param eopt - The options for the emitter.
     *
     * @example
     * ```js
     * // beansplosion
     *
     * // create the emitter
     * const emitter = add([
     *     pos(center()),
     *     particles({
     *         max: 100,
     *         speed: [75, 100],
     *         lifeTime: [0.75,1.0],
     *         angle: [0, 360],
     *         opacities: [1.0, 0.0],
     *         texture: getSprite("bean").tex,   // texture of a sprite
     *         quads: getSprite("bean").frames,  // frames of a sprite
     *     }, {
     *         direction: 0,
     *         spread: 360,
     *     }),
     * ])
     *
     * onUpdate(() => {
     *     emitter.emit(1)
     * })
     * ```
     *
     * @returns The particles comp.
     * @since v3001.0
     * @group Components
     * @subgroup Rendering
     */
    particles(popt: ParticlesOpt, eopt: EmitterOpt): ParticlesComp;
    /**
     * Physical body that responds to gravity. Requires "area" and "pos" comp. This also makes the object "solid".
     *
     * @param opt - Options for the body component. See {@link BodyCompOpt `BodyCompOpt`}.
     *
     * @example
     * ```js
     * // bean jumpy
     * const bean = add([
     *     sprite("bean"),
     *     // body() requires "pos" and "area" component
     *     pos(),
     *     area(),
     *     body(),
     * ])
     *
     * // when bean is grounded, press space to jump
     * // check out #BodyComp for more methods
     * onKeyPress("space", () => {
     *     if (bean.isGrounded()) {
     *         bean.jump()
     *     }
     * })
     *
     * // run something when bean falls and hits a ground
     * bean.onGround(() => {
     *     debug.log("oh no!")
     * })
     * ```
     *
     * @returns The body comp.
     * @since v2000.0
     * @group Components
     * @subgroup Physics
     */
    body(opt?: BodyCompOpt): BodyComp;
    /**
     * Applies a force on a colliding object in order to make it move along the collision tangent vector.
     * Good for conveyor belts.
     *
     * @param opt - Options for the surface effector component. See {@link SurfaceEffectorCompOpt `SurfaceEffectorCompOpt`}.
     *
     * @example
     * ```js
     * loadSprite("belt", "/sprites/jumpy.png")
     *
     * // conveyor belt
     * add([
     *     pos(center()),
     *     sprite("belt"),
     *     rotate(90),
     *     area(),
     *     body({ isStatic: true }),
     *     surfaceEffector({
     *         speed: 50,
     *     })
     * ])
     * ```
     *
     * @returns The surface effector comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    surfaceEffector(opt: SurfaceEffectorCompOpt): SurfaceEffectorComp;
    /**
     * Applies a force on a colliding object.
     * Good to apply anti-gravity, wind or water flow.
     *
     * @param opt - Options for the area effector component. See {@link AreaEffectorCompOpt `AreaEffectorCompOpt`}.
     *
     * @returns The area effector comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    areaEffector(opt: AreaEffectorCompOpt): AreaEffectorComp;
    /**
     * Applies a force on a colliding object directed towards this object's origin.
     * Good to apply magnetic attraction or repulsion.
     *
     * @param opt - Options for the point effector component. See {@link PointEffectorCompOpt `PointEffectorCompOpt`}.
     *
     * @returns The point effector comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    pointEffector(opt: PointEffectorCompOpt): PointEffectorComp;
    /**
     * The platform effector makes it easier to implement one way platforms
     * or walls. This effector is typically used with a static body, and it
     * will only be solid depending on the direction the object is traveling from.
     *
     * @param opt - Options for the platform effector component. See {@link PlatformEffectorCompOpt `PlatformEffectorCompOpt`}.
     *
     * @returns The platform effector comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    platformEffector(opt?: PlatformEffectorCompOpt): PlatformEffectorComp;
    /**
     * Applies an upwards force (force against gravity) to colliding objects depending on the fluid density and submerged area.
     * Good to apply constant thrust.
     *
     * @param opt - Options for the buoyancy effector component. See {@link BuoyancyEffectorCompOpt `BuoyancyEffectorCompOpt`}.
     *
     * @returns The buoyancy effector comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    buoyancyEffector(opt: BuoyancyEffectorCompOpt): BuoyancyEffectorComp;
    /**
     * Applies a constant force to the object.
     * Good to apply constant thrust.
     *
     * @param opt - Options for the constant force component. See {@link ConstantForceCompOpt `ConstantForceCompOpt`}.
     *
     * @returns The constant force comp.
     * @since v3001.0
     * @group Components
     * @subgroup Physics
     */
    constantForce(opt: ConstantForceCompOpt): ConstantForceComp;
    /**
     * Enables double jump.
     *
     * @param numJumps - The number of jumps allowed. Defaults to 1.
     *
     * @returns The double jump comp.
     * @since v3000.0
     * @group Components
     * @subgroup Physics
     *
     * @requires {@link body `body()`}
     */
    doubleJump(numJumps?: number): DoubleJumpComp;
    /**
     * Move towards a direction infinitely, and destroys when it leaves game view.
     *
     * @param dir - The direction to move towards.
     * @param speed - The speed to move at.
     *
     * @example
     * ```js
     * // enemy throwing feces at player
     * const projectile = add([
     *     sprite("feces"),
     *     pos(enemy.pos),
     *     area(),
     *     move(player.pos.angle(enemy.pos), 1200),
     *     offscreen({ destroy: true }),
     * ])
     * ```
     *
     * @returns The move comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     *
     * @requires {@link pos `pos()`}
     */
    move(dir: number | Vec2, speed: number): MoveComp;
    /**
     * Constraint components
     */
    constraint: typeof constraint;
    /**
     * Control the behavior of object when it goes out of view.
     *
     * @param opt - Options for the offscreen component. See {@link OffScreenCompOpt `OffScreenCompOpt`}.
     *
     * @example
     * ```js
     * add([
     *     pos(player.pos),
     *     sprite("bullet"),
     *     offscreen({ destroy: true }),
     *     "projectile",
     * ]);
     * ```
     *
     * @returns The offscreen comp.
     * @since v2000.2
     * @group Components
     * @subgroup Behaviour
     */
    offscreen(opt?: OffScreenCompOpt): OffScreenComp;
    /**
     * Follow another game obj's position.
     *
     * @param obj - The game obj to follow.
     * @param offset - The offset to follow at.
     *
     * @example
     * ```js
     * const bean = add(...)
     *
     * add([
     *     sprite("bag"),
     *     pos(),
     *     follow(bean) // Follow bean's position
     * ]);
     *
     * // Using offset
     * const target = add(...)
     *
     * const mark = add([
     *   sprite("mark"),
     *   pos(),
     *   follow(target, vec2(32, 32)) // Follow target's position with an offset
     * ])
     *
     * mark.follow.offset = vec2(64, 64) // Change the offset
     * ```
     *
     * @returns The follow comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     */
    follow(obj: GameObj | null, offset?: Vec2): FollowComp;
    /**
     * Custom shader to manipulate sprite.
     *
     * @param id - The shader id.
     * @param uniform - The uniform to pass to the shader.
     *
     * @returns The shader comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    shader(id: string, uniform?: Uniform | (() => Uniform)): ShaderComp;
    /**
     * Get input from the user and store it in the nodes text property, displaying it with the text component and allowing other functions to access it.
     *
     * @param hasFocus - Whether the text input should have focus.
     * @param maxInputLength - The maximum length of the input.
     *
     * @example
     * ```js
     * const obj = add([
     *     text(""),
     *     textInput(),
     * ])
     *
     * obj.hasFocus = false
     * debug.log(obj.text) // oh no i cant see my new text since it was disabled
     * ```
     *
     * @returns The text input comp.
     * @since v3001.0
     * @group Components
     * @subgroup UI
     */
    textInput(hasFocus?: boolean, maxInputLength?: number): TextInputComp;
    /**
     * Enable timer related functions like wait(), loop(), tween() on the game object.
     *
     * @param maxLoopsPerFrame - The maximum number of loops per frame.
     *
     * @example
     * ```js
     * const obj = add([
     *     timer(),
     * ])
     *
     * obj.wait(2, () => { ... })
     * obj.loop(0.5, () => { ... })
     * obj.tween(obj.pos, mousePos(), 0.5, (p) => obj.pos = p, easings.easeOutElastic)
     * ```
     *
     * @returns The timer comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     */
    timer(maxLoopsPerFrame?: number): TimerComp;
    /**
     * Make a game obj unaffected by camera or parent object transforms, and render at last.
     * Useful for UI elements.
     *
     * @param fixed - Default fixed value.
     *
     * @example
     * ```js
     * // this will be be fixed on top left and not affected by camera
     * const score = add([
     *     text(0),
     *     pos(12, 12),
     *     fixed(),
     * ])
     * ```
     *
     * @returns The fixed comp.
     * @since v2000.0
     * @group Components
     * @subgroup Rendering
     */
    fixed(fixed?: boolean): FixedComp;
    /**
     * Don't get destroyed on scene switch. Only works in objects attached to root.
     *
     * @param scenesToStay - The scenes to stay in. By default it stays in all scenes.
     *
     * @example
     * ```js
     * player.onCollide("bomb", () => {
     *     // spawn an explosion and switch scene, but don't destroy the explosion game obj on scene switch
     *     add([
     *         sprite("explosion", { anim: "burst", }),
     *         stay(),
     *         lifespan(1),
     *     ])
     *     go("lose", score)
     * })
     * ```
     *
     * @returns The stay comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     */
    stay(scenesToStay?: string[]): StayComp;
    /**
     * Handles health related logic and events.
     *
     * @param hp - The initial health points.
     * @param maxHP - The maximum health points.
     *
     * @example
     * ```js
     * const player = add([
     *     health(3),
     * ])
     *
     * player.onCollide("bad", (bad) => {
     *     player.hp--;
     *     bad.hp--;
     * })
     *
     * player.onCollide("apple", () => {
     *     player.hp++;
     * })
     *
     * player.onHurt(() => {
     *     play("ouch")
     * })
     *
     * // triggers when hp reaches 0
     * player.onDeath(() => {
     *     destroy(player)
     *     go("lose")
     * })
     * ```
     *
     * @returns The health comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     */
    health(hp: number, maxHP?: number): HealthComp;
    /**
     * Destroy the game obj after certain amount of time
     *
     * @param time - The time to live.
     * @param options - Options for the lifespan component. See {@link LifespanCompOpt `LifespanCompOpt`}.
     *
     * @example
     * ```js
     * // spawn an explosion, destroy after 1.5 seconds (time + fade)
     * add([
     *     sprite("explosion", { anim: "burst", }),
     *     lifespan(1, {
     *         fade: 0.5 // it start fading 0.5 second after time
     *     }),
     * ]);
     * ```
     *
     * @returns The lifespan comp.
     * @since v2000.0
     * @group Components
     * @subgroup Behaviour
     */
    lifespan(time: number, options?: LifespanCompOpt): EmptyComp;
    /**
     * Names an game obj.
     *
     * @param name - The name to set.
     *
     * @returns The named comp.
     * @since v3001.0
     * @group Components
     * @subgroup Behaviour
     */
    named(name: string): NamedComp;
    /**
     * Finite state machine.
     *
     * @param initialState - The initial state.
     * @param stateList - The list of states.
     *
     * @example
     * ```js
     * const enemy = add([
     *     pos(80, 100),
     *     sprite("robot"),
     *     state("idle", ["idle", "attack", "move"]),
     * ])
     *
     * // this callback will run once when enters "attack" state
     * enemy.onStateEnter("attack", () => {
     *     // enter "idle" state when the attack animation ends
     *     enemy.play("attackAnim", {
     *         // any additional arguments will be passed into the onStateEnter() callback
     *         onEnd: () => enemy.enterState("idle", rand(1, 3)),
     *     })
     *     checkHit(enemy, player)
     * })
     *
     * // this will run once when enters "idle" state
     * enemy.onStateEnter("idle", (time) => {
     *     enemy.play("idleAnim")
     *     wait(time, () => enemy.enterState("move"))
     * })
     *
     * // this will run every frame when current state is "move"
     * enemy.onStateUpdate("move", () => {
     *     enemy.follow(player)
     *     if (enemy.pos.dist(player.pos) < 16) {
     *         enemy.enterState("attack")
     *     }
     * })
     * ```
     *
     * @returns The state comp.
     * @since v2000.1
     * @group Components
     * @subgroup Behaviour
     */
    state<T extends string>(initialState: T, stateList?: T[]): StateComp<T>;
    /**
     * state() with pre-defined transitions.
     *
     * @param initialState - The initial state.
     * @param stateList - The list of states.
     * @param transitions - The transitions between states.
     *
     * @example
     * ```js
     * const enemy = add([
     *     pos(80, 100),
     *     sprite("robot"),
     *     state("idle", ["idle", "attack", "move"], {
     *         "idle": "attack",
     *         "attack": "move",
     *         "move": [ "idle", "attack" ],
     *     }),
     * ])
     *
     * // this callback will only run once when enter "attack" state from "idle"
     * enemy.onStateTransition("idle", "attack", () => {
     *     checkHit(enemy, player)
     * })
     * ```
     *
     * @returns The state comp.
     * @since v2000.2
     * @group Components
     * @subgroup Behaviour
     */
    state<T extends string>(
        initialState: T,
        stateList: T[],
        transitions: Record<T, T | T[]>,
    ): StateComp<T>;
    /**
     * @deprecated since v3001.0
     *
     * Fade object in.
     *
     * Uses opacity for finding what to fade into and to set opacity during fade animation.
     *
     * @returns An empty comp.
     * @since v3000.0
     * @group Components
     * @subgroup Behaviour
     *
     * @requires {@link opacity `opacity()`}
     */
    fadeIn(time: number): Comp;
    /**
     * Mask all children object render.
     *
     * @param maskType - The type of mask to use.
     *
     * @returns The mask comp.
     * @since v3001.0
     * @group Components
     * @subgroup Rendering
     */
    mask(maskType?: Mask): MaskComp;
    /**
     * Specifies the FrameBuffer the object should be drawn on.
     *
     * @param canvas - The FrameBuffer to draw on.
     *
     * @example
     * ```js
     * // Draw on another canvas
     * let canvas = makeCanvas(width(), height());
     *
     * let beanOnCanvas = add([
     *     sprite("bean"),
     *     drawon(canvas.fb),
     * ]);
     * ```
     *
     * @returns The drawon comp.
     * @since v3000.0
     * @group Components
     * @subgroup Rendering
     */
    drawon(canvas: FrameBuffer | Picture, opt?: DrawonCompOpt): DrawonComp;
    /**
     * A tile on a tile map.
     *
     * @param opt - Options for the tile component. See {@link TileCompOpt `TileCompOpt`}.
     *
     * @returns The tile comp.
     * @since v3000.0
     * @group Components
     * @subgroup Behaviour
     */
    tile(opt?: TileCompOpt): TileComp;
    /**
     * An agent which can finds it way on a tilemap.
     *
     * @param opt - Options for the agent component. See {@link AgentCompOpt `AgentCompOpt`}.
     *
     * @returns The agent comp.
     * @since v3000.0
     * @group Components
     * @subgroup Level
     */
    agent(opt?: AgentCompOpt): AgentComp;
    /**
     * A component to animate properties.
     * This component has an internal clock which starts the moment it is added to an object.
     *
     * @param opt - Options for the animate component. See {@link AnimateCompOpt `AnimateCompOpt`}.
     *
     * @example
     * ```js
     * // First example
     * let movingBean = add([
     *       sprite("bean"),
     *       pos(50, 150),
     *       anchor("center"),
     *       animate(),
     * ]);
     * // Moving right to left using ping-pong
     * movingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], {
     *     duration: 2,
     *     direction: "ping-pong",
     * });
     *
     * // Second example
     * const obj = add([
     *     area(),
     *     color("#FF0000"),
     *     animate(),
     * ]);
     * // The internal clock starts when the object is added.
     * // We need to reset the animation when the object is hovered.
     * obj.onHover(() => {
     *     obj.animation.seek(0); // reset the animation to the start
     *     obj.animate(
     *         "color",
     *         // We can use the current color property as the start value.
     *         // It doesn't make sense to have only one value in the array as it's a transition.
     *         [obj.color, Color.fromHex("#0000FF")],
     *         { duration: 0.5, loops: 1 },
     * });
     *
     * obj.onHoverEnd(() => {
     *     // We need to unanimate the color property to reset it to the original value.
     *     obj.unanimate("color");
     *     obj.color = Color.fromHex("#FF0000");
     * });
     * ```
     *
     * @returns The animate comp.
     * @since v3001.0
     * @group Components
     * @subgroup Behaviour
     */
    animate(opt?: AnimateCompOpt): AnimateComp;
    /**
     * A fake mouse that follows the mouse position and triggers events.
     *
     * [Guide about fake mouse](https://v4000.kaplayjs.com/guides/fake_mouse/)
     *
     * @param opt - Options for the fake mouse comp. See {@link FakeMouseOpt `FakeMouseOpt`}.
     *
     * @returns The fake mouse comp.
     * @since v3001.0
     * @group Components
     * @subgroup Behaviour
     */
    fakeMouse(opt?: FakeMouseOpt): FakeMouseComp;
    /**
     * Serializes the animation to plain objects
     *
     * @param obj - The game obj to serialize.
     *
     * @returns The serialized animation.
     * @since v3001.0
     * @group Components
     * @subgroup Component Serialization
     */
    serializeAnimation(obj: GameObj, name: string): Animation;
    /**
     * A sentry which reacts to objects coming into view.
     *
     * @returns The sentry comp.
     * @since v3001.0
     * @group Components
     * @subgroup Level
     */
    sentry(candidates: SentryCandidates, opt?: SentryCompOpt): SentryComp;
    /**
     * A patrol which can follow waypoints to a goal.
     *
     * @param opts - Options for the patrol component. See {@link PatrolCompOpt `PatrolCompOpt`}.
     *
     * @example
     * ```js
     * const bean = add([
     *     sprite("bean"),
     *     pos(40, 30),
     *     patrol({
     *         waypoints: [
     *             vec2(100, 100),
     *             vec2(120, 170),
     *             vec2(50, 50),
     *             vec2(300, 100),
     *         ],
     *     }),
     * ]);
     *
     * bean.onPatrolFinished(gb => {
     *     // Note that the position doesn't exactly match the last waypoint,
     *     // this is an approximation.
     *     debug.log(`Bean reached the end of the patrol at ${gb.pos.x}, ${gb.pos.y}`);
     * });
     * ```
     *
     * @returns The patrol comp.
     * @since v3001.0
     * @group Components
     * @subgroup Level
     */
    patrol(opts: PatrolCompOpt): PatrolComp;
    /**
     * A navigator pathfinder which can calculate waypoints to a goal.
     *
     * @since v3001.0
     * @group Components
     * @subgroup Level
     */
    pathfinder(opts: PathfinderCompOpt): PathfinderComp;
    /**
     * Construct a level based on symbols.
     *
     * @param map - The map data.
     * @param opt - The level options.
     * @param parent - The parent object of the level. Defaults to root.
     *
     * @example
     * ```js
     * const myLevel = add([
     *     level([
     *          "                          $",
     *          "                          $",
     *          "           $$         =   $",
     *          "  %      ====         =   $",
     *          "                      =    ",
     *          "       ^^      = >    =   &",
     *          "===========================",
     *     ], {
     *         // define the size of tile block
     *         tileWidth: 32,
     *         tileHeight: 32,
     *         // define what each symbol means, by a function returning a component list (what will be passed to add())
     *         tiles: {
     *             "=": () => [
     *                 sprite("floor"),
     *                 area(),
     *                 body({ isStatic: true }),
     *             ],
     *             "$": () => [
     *                 sprite("coin"),
     *                 area(),
     *                 pos(0, -9),
     *             ],
     *             "^": () => [
     *                 sprite("spike"),
     *                 area(),
     *                 "danger",
     *             ],
     *         }
     *     })
     * ])
     * ```
     *
     * @returns A game obj with the level.
     * @since v4000.0
     * @group Components
     * @subgroup Level
     */
    level(map: string[], opt?: LevelCompOpt): LevelComp;

    // #endregion
    /**
     * Create a raycast.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Raycast
     */
    raycast(origin: Vec2, direction: Vec2, exclude?: string[]): RaycastResult;
    /**
     * Trigger an event on all game objs with certain tag.
     *
     * @param tag - The tag to trigger to.
     * @param args - Arguments to pass to the `on()` functions
     *
     * @example
     * ```js
     * trigger("shoot", "target", 140);
     *
     * on("shoot", "target", (obj, score) => {
     *     obj.destroy();
     *     debug.log(140); // every bomb was 140 score points!
     * });
     * ```
     *
     * @since v3001.0.6
     * @group Events
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    trigger(event: string, tag: string, ...args: any): void;
    /**
     * Register an event on all game objs with certain tag.
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // a custom event defined by body() comp
     * // every time an obj with tag "bomb" hits the floor, destroy it and addKaboom()
     * on("ground", "bomb", (bomb) => {
     *     destroy(bomb)
     *     addKaboom(bomb.pos)
     * })
     *
     * // a custom event can be defined manually
     * // by passing an event name, a tag, and a callback function
     * // if you want any tag, use a tag of "*"
     * on("talk", "npc", (npc, message) => {
     *     npc.add([
     *         text(message),
     *         pos(0, -50),
     *         lifespan(2),
     *         opacity(),
     *     ])
     * });
     *
     * onKeyPress("space", () => {
     *     // the trigger method on game objs can be used to trigger a custom event
     *     npc.trigger("talk", "Hello, KAPLAY!");
     * });
     *
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    on<Ev extends GameObjEventNames | (string & {})>(
        event: Ev,
        tag: Tag,
        action: (
            obj: GameObj,
            ...args: TupleWithoutFirst<GameObjEvents[Ev]>
        ) => void,
    ): KEventController;
    /**
     * Register an event that runs at a fixed framerate.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onFixedUpdate(action: () => void): KEventController;
    onFixedUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag.
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // move every "tree" 120 pixels per second to the left, destroy it when it leaves screen
     * // there'll be nothing to run if there's no "tree" obj in the scene
     * onUpdate("tree", (tree) => {
     *     tree.move(-120, 0)
     *     if (tree.pos.x < 0) {
     *         destroy(tree)
     *     }
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second).
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // This will run every frame
     * onUpdate(() => {
     *     debug.log("ohhi")
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onDraw(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @example
     * ```js
     * onDraw(() => {
     *     drawLine({
     *         p1: vec2(0),
     *         p2: mousePos(),
     *         color: rgb(0, 0, 255),
     *     })
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onDraw(action: () => void): KEventController;
    /**
     * Register an event that runs when an object with the provided tag is added.
     *
     * @param tag - The tag to listen for.
     * @param action - The function that runs when an object is added.
     *
     * @example
     * ```js
     * // This will run when the object is added.
     * onAdd("player", () => {
     *     debug.log("ohhi");
     * });
     *
     * add([
     *     pos(),
     *     "player"
     * ]);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onAdd(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object is added
     *
     * @param action - The function that runs when an object is added.
     *
     * @example
     * ```js
     * // This will run when the object is added.
     * onAdd(() => {
     *     debug.log("ohhi");
     * });
     *
     * add([
     *     pos(),
     * ]);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onAdd(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object with the provided tag is destroyed.
     *
     * @param action - The function that runs when an object is destroyed.
     *
     * @example
     * ```js
     * // This will run when the tagged object is destroyed.
     * onDestroy("bean", () => {
     *     debug.log("ohbye");
     * });
     *
     * let player = add([
     *     pos(),
     *     "bean"
     * ])
     *
     * // Destroy the tagged object
     * destroy(player);
     * ```
     *
     * @returns The event controller.
     * @since v2000.0
     * @group Events
     */
    onDestroy(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object is destroyed.
     *
     * @param tag - The tag to match, only called for objects with a matching tag.
     * @param action - The function that runs when an object is destroyed.
     *
     * @example
     * ```js
     * // This will run when the object is destroyed.
     * onDestroy(() => {
     *     debug.log("ohbye");
     * });
     *
     * let ghosty = add([
     *     pos(),
     * ]);
     *
     * // Destroy the object
     * destroy(ghosty);
     * ```
     *
     * @returns The event controller.
     * @group Events
     */
    onDestroy(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when an object starts using a component.
     *
     * @param action - The function that runs when an object starts using component.
     * @param id - The id of the component that was added.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUse(action: (obj: GameObj, id: string) => void): KEventController;
    /**
     * Register an event that runs when an object stops using a component.
     *
     * @param action - The function that runs when an object stops using a component.
     * @param id - The id of the component that was removed.d
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUnuse(action: (obj: GameObj, id: string) => void): KEventController;
    /**
     * Register an event that runs when an object gains a tag.
     *
     * @param action - The function that runs when an object gains a tag.
     * @param tag - The tag which was added.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onTag(action: (obj: GameObj, tag: string) => void): KEventController;
    /**
     * Register an event that runs when an object loses a tag.
     *
     * @param action - The function that runs when an object loses a tag.
     * @param tag - The tag which was removed.
     *
     * @returns The event controller.
     * @since v3001.1
     * @group Events
     */
    onUntag(action: (obj: GameObj, tag: string) => void): KEventController;
    /**
     * Register an event that runs when all assets finished loading.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * const bean = add([
     *     sprite("bean"),
     * ]);
     *
     * // certain assets related data are only available when the game finishes loading
     * onLoad(() => {
     *     debug.log(bean.width)
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onLoad(action: () => void): KEventController | undefined;
    /**
     * Register an event that runs once for each asset that failed to load,
     * after all others have completed.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // this will not load
     * loadSprite("bobo", "notavalidURL");
     *
     * // process the error
     * // you decide whether to ignore it, or throw an error and halt the game
     * onLoadError((name, asset) => {
     *     debug.error(`${name} failed to load: ${asset.error}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Events
     */
    onLoadError(
        action: (name: string, failedAsset: Asset<any>) => void,
    ): KEventController | undefined;
    /**
     * Register an event that runs every frame when assets are initially loading. Can be used to draw a custom loading screen.
     *
     * @param action - The function that runs when assets are loading.
     *
     * @example
     * ```
     * // progress bar
     * onLoading((progress) => {
     *     // Background of the bar
     *     drawRect({
     *         width: 240,
     *         height: 40,
     *         pos: center().add(-120,0),
     *         color: BLACK,
     *         anchor: `left,
     *     });
     *     // Progress of the bar
     *     drawRect({
     *         width: map(progress, 0, 1, 0, 220),
     *         height: 32,
     *         pos: center().add(-116, 0),
     *         color: BLUE,
     *         anchor: `left
     *     });
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onLoading(action: (progress: number) => void): KEventController;
    /**
     * Register a custom error handler. Can be used to draw a custom error screen.
     *
     * @param action - The function that runs when the program errors.
     *
     * @example
     * ```js
     * // Create custom error handler
     * onError((err) => {
     *     drawRect({
     *         width: width(),
     *         height: height(),
     *         pos: center(),
     *         color: RED,
     *         anchor: `center,
     *     });
     *
     *     drawText({
     *         text: err.message,
     *         size: 48,
     *         width: width()/2,
     *         anchor: `center`,
     *         align: `center`,
     *         pos: center(),
     *         color: BLACK
     *     });
     * });
     *
     * // cause common error
     * let pos = add([
     *     pos()
     * ]);
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onError(action: (err: Error) => void): KEventController;
    /**
     * Register an event that runs when the canvas resizes.
     *
     * @param action - The function that runs when the canvas resizes.
     *
     * @example
     * ```js
     * // create a rectangle with screen size
     * let rectangle = add([
     *     rect(width(), height()),
     *     color(GREEN),
     * ]);
     *
     * // resize the rectangle to screen size
     * onResize(() => {
     *     debug.log(`Old Size: ${rectangle.width}x${rectangle.height}`);
     *     rectangle.width = width();
     *     rectangle.height = height();
     *     debug.log(`New Size: ${rectangle.width}x${rectangle.height}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onResize(action: () => void): KEventController;
    /**
     * Cleanup function to run when quit() is called.
     *
     * @param action - The function that runs when quit() is called.
     *
     * @example
     * ```js
     * // useful externally from KAPLAY
     * onCleanup(() => {
     *     console.log(`ohbye :(`);
     * });
     *
     * quit();
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onCleanup(action: () => void): void;
    /**
     * Register an event that runs once when 2 game objs with certain tags collides (required to have area() component).
     *
     * @param t1 - The tag of the first game obj.
     * @param t2 - The tag of the second game obj.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * onCollide("sun", "earth", () => {
     *     addExplosion()
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onCollide(
        t1: Tag,
        t2: Tag,
        action: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when 2 game objs with certain tags collides (required to have area() component).
     *
     * @param t1 - The tag of the first game obj.
     * @param t2 - The tag of the second game obj.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * onCollideUpdate("sun", "earth", () => {
     *     debug.log("okay this is so hot");
     * })l
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onCollideUpdate(
        t1: Tag,
        t2: Tag,
        action: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event that runs once frame when 2 game objs with certain tags stops colliding (required to have area() component).
     *
     * @param t1 - The tag of the first game obj.
     * @param t2 - The tag of the second game obj.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * onCollideEnd("bean", "earth", () => {
     *     debug.log("destroying world in 3... 2... 1...")
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onCollideEnd(
        t1: Tag,
        t2: Tag,
        action: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController;
    /**
     * Register an event that runs when game objs with certain tags are clicked (required to have the area() component).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // click on any "chest" to open
     * onClick("chest", (chest) => chest.open())
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Mouse
     */
    onClick(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs when users clicks.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // click on anywhere to go to "game" scene
     * onClick(() => go("game"));
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Events
     */
    onClick(action: () => void): KEventController;
    /**
     * Register an event that runs once when game objs with certain tags are hovered (required to have area() component).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onHover(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame when game objs with certain tags are hovered (required to have area() component).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // Rotate bean 90 degrees per second when hovered
     * onHoverUpdate("bean", (bean) => {
     *   bean.angle += dt() * 90
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onHoverUpdate(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs once when game objs with certain tags are unhovered (required to have area() component).
     *
     * @param tag - The tag to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onHoverEnd(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame when a key is held down.
     *
     * @param key - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // move left by SPEED pixels per frame every frame when left arrow key is being held down
     * onKeyDown("left", () => {
     *     bean.move(-SPEED, 0)
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyDown(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs every frame when any key is held down.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyDown(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys.
     *
     * @param k - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // .jump() once when "space" is just being pressed
     * onKeyPress("space", () => {
     *     bean.jump();
     * });
     *
     * onKeyPress(["up", "space"], () => {
     *     bean.jump();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPress(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses any key.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // Call restart() when player presses any key
     * onKeyPress((key) => {
     *     debug.log(`key pressed ${key}`);
     *     restart();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPress(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys (also fires repeatedly when the keys are being held down).
     *
     * @param k - The key(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // delete last character when "backspace" is being pressed and held
     * onKeyPressRepeat("backspace", () => {
     *     input.text = input.text.substring(0, input.text.length - 1);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyPressRepeat(
        k: Key | Key[],
        action: (k: Key) => void,
    ): KEventController;
    onKeyPressRepeat(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user release certain keys.
     *
     * @param k - = The key(s) to listen for. See {@link Key `Key`}.
     * @param action - The function that runs when a user releases certain keys
     *
     * @example
     * ```js
     * // release `a` or `b` keys
     * onKeyRelease([`a`, `b`], (k) => {
     *     debug.log(`Released the ${k} key...`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onKeyRelease(k: Key | Key[], action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user releases a key.
     *
     * @param action - The function that runs when a user releases a {@link Key `Key`}.
     *
     * @example
     * ```js
     * // release a key
     * onKeyRelease((k) => {
     *     debug.log(`Released the ${k} key...`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     */
    onKeyRelease(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user inputs text.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // type into input
     * onCharInput((ch) => {
     *     input.text += ch
     * })
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Keyboard
     */
    onCharInput(action: (ch: string) => void): KEventController;
    /**
     * Register an event that runs every frame when certain mouse buttons are being held down.
     *
     * @param btn - The mouse button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run when certain mouse buttons are being held down.
     *
     * @example
     * ```js
     * // count time with left mouse button down
     * let mouseTime = 0;
     * onMouseDown("left", () => {
     *     mouseTime += dt();
     *     debug.log(`Time with mouse down: ${mouseTime});
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseDown(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when any mouse button is being held down.
     *
     * @param action - The function that is run when any mouse button is being held down.
     *
     * @example
     * ```js
     * // count time with any mouse button down
     * let mouseTime = 0;
     * onMouseDown((m) => {
     *     mouseTime += dt();
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseDown(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user clicks mouse.
     *
     * @param action - The function that is run when user clicks a mouse button.
     *
     * @example
     * ```js
     * // gives cookies on left press, remove on right press
     * let cookies = 0;
     * onMousePress(["left", "right"], (m) => {
     *     if (m == "left") {
     *         cookies++;
     *     } else {
     *         cookies--;
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMousePress(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user clicks mouse.
     *
     * @param btn - The mouse button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run what the user clicks cetain mouse buttons.
     *
     * @example
     * ```js
     * // gives cookies on any mouse press
     * let cookies = 0;
     * onMousePress((m) => {
     *     cookies++;
     *     debug.log(`Cookies: ${cookies}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMousePress(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases mouse.
     *
     * @param action - The function that is run what the user clicks a provided mouse button.
     *
     * @example
     * ```js
     * // spawn bean where right mouse is released
     * onMouseRelease("right", (m) => {
     *     debug.log(`${m} released, spawning bean...`);
     *     add([
     *         pos(mousePos()),
     *         sprite("bean"),
     *         anchor("center"),
     *     ]);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseRelease(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user releases mouse.
     *
     * @param btn - The button(s) to listen for. See {@link MouseButton `MouseButton`}.
     * @param action - The function that is run what the user clicks a provided mouse button.
     *
     * @example
     * ```js
     * // spawn bean where right mouse is released
     * onMouseRelease((m) => {
     *     if (m == "right") {
     *         debug.log(`${m} released, spawning bean...`);
     *         add([
     *             pos(mousePos()),
     *             sprite("bean"),
     *             anchor("center"),
     *         ]);
     *     });
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Mouse
     */
    onMouseRelease(
        btn: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs whenever user moves the mouse.
     *
     * @param action - The function that is run what the user moves the mouse.
     *
     * @example
     * ```js
     * // runs when the mouse has moved
     * onMouseMove((p, d) => {
     *     bean.pos = p; // set bean position to mouse position
     * });
     * ```
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Mouse
     */
    onMouseMove(action: (pos: Vec2, delta: Vec2) => void): KEventController;
    /**
     * Register an event that runs when a touch starts.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchStart(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs whenever touch moves.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchMove(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when a touch ends.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v2000.1
     * @group Input
     * @subgroup Touch
     */
    onTouchEnd(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when mouse wheel scrolled.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @example
     * ```js
     * // Zoom camera on scroll
     * onScroll((delta) => {
     *     const zoom = delta.y / 500;
     *     camScale(camScale().add(zoom));
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Mouse
     */
    onScroll(action: (delta: Vec2) => void): KEventController;
    onHide: GameEventHandlers["onHide"];
    onShow: GameEventHandlers["onShow"];
    onTabShow: GameEventHandlers["onTabShow"];
    onTabHide: GameEventHandlers["onTabHide"];
    /**
     * Register an event that runs when a gamepad is connected.
     *
     * @param action - The function that runs when quit() is called.
     *
     * @example
     * ```js
     * // watch for a controller connecting
     * onGamepadConnect((gp) => {
     *     debug.log(`ohhi player ${gp.index + 1}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadConnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs when a gamepad is disconnected.
     *
     * @param action - The function that runs when quit() is called.
     *
     * @example
     * ```js
     * // watch for a controller disconnecting
     * onGamepadDisconnect((gp) => {
     *     debug.log(`ohbye player ${gp.index + 1}`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadDisconnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs every frame when certain gamepad buttons are held down.
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run while certain gamepad buttons are held down.
     *
     * @example
     * ```js
     * // when button is being held down
     * onGamepadButtonDown("rtrigger", (gp) => {
     *     car.addForce(Vec2.fromAngle(car.angle).scale(10));
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonDown(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when any gamepad buttons are held down.
     *
     * @param action - The function that is run while any gamepad buttons are held down.
     *
     * @example
     * ```js
     * // when button is being held down
     * onGamepadButtonDown((btn, gp) => {
     *     if (btn == "rtrigger") {
     *         car.addForce(Vec2.fromAngle(car.angle).scale(10));
     *     } else if (btn == "ltrigger") {
     *         car.addForce(Vec2.fromAngle(car.angle).scale(-5));
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonDown(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses certain gamepad button.
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run when certain gamepad buttons are pressed.
     *
     * @example
     * ```js
     * // when user presses button
     * onGamepadButtonPress("south", (btn, gp) => {
     *     player.jump(200);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonPress(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses any gamepad button.
     *
     * @param action - The function that is run when any gamepad buttons is pressed.
     *
     * @example
     * ```js
     * // when user presses button
     * onGamepadButtonPress((btn, gp) => {
     *     if (btn == "south") {
     *         player.jump(200);     // jump
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonPress(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases certain gamepad button
     *
     * @param btn - The button(s) to listen for. See {@link KGamepadButton `KGamepadButton`}.
     * @param action - The function that is run when certain gamepad buttons are released.
     *
     * @example
     * ```js
     * // charged attack
     * let chargeTime = 0
     * onGamepadButtonPress("west", (btn, gp) => {
     *     chargeTime = time();
     * });
     *
     * // when a gamepad button is released, this is run
     * onGamepadButtonRelease("west", (btn, gp) => {
     *     let chargedt = time() - chargeTime;
     *     debug.log(`Used ${chargedt * 1000} power!`);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonRelease(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases any gamepad button.
     *
     * @param action - The function that is run when any gamepad buttons are released.
     *
     * @example
     * ```js
     * // when a gamepad button is released, this is run
     * onGamepadButtonRelease((btn, gp) => {
     *     if (btn == "north") {
     *         player.jump(500);
     *     }
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadButtonRelease(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when the gamepad axis exists.
     *
     * @param button - The stick to listen for. See {@link KGamepadStick `GamepadStick`}.
     * @param action - The function that is run when a specific gamepad stick is moved.
     *
     * @example
     * ```js
     * // player move
     * let player = add([
     *     pos(center()),
     *     sprite(`bean`),
     * ]);
     *
     * // when left stick is moved
     * onGamepadStick("left", (stickVector, gp) => {
     *     player.move(stickVector.x, 0);
     * });
     * ```
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    onGamepadStick(
        stick: KGamepadStick,
        action: (value: Vec2, gameepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonPress(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonPress(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when user release a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonRelease(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonRelease(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to listen for.
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    onButtonDown(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonDown(action: (btn: string) => void): KEventController;
    /**
     * Register an event that runs when current scene ends.
     *
     * @param action - The function to run when the event is triggered.
     *
     * @returns The event controller.
     * @since v3000.0
     * @group Events
     */
    onSceneLeave(action: (newScene?: string) => void): KEventController;
    /**
     * Gets the name of the current scene. Returns null if no scene is active.
     *
     * @since v3001.0
     * @group Scenes
     */
    getSceneName(): string | null;
    // #region Loaders
    /**
     * Sets the root for all subsequent resource urls.
     *
     * This is useful when you want to load assets from a different domain, or setup
     * a base path for all assets.
     *
     * @param path - The root path.
     *
     * @example
     * ```js
     * loadRoot("https://myassets.com/");
     * loadSprite("bean", "sprites/bean.png"); // will resolve to "https://myassets.com/sprites/bean.png"
     *
     * loadRoot("./"); // useful for Itch.io
     * ```
     *
     * @group Assets
     * @subgroup Util
     */
    loadRoot(path?: string): string;
    /**
     * Load a sprite into asset manager, with name and resource url and optional config.
     *
     * @param name - The asset name.
     * @param src - The resource url.
     * @param opt - The optional config.
     *
     * @example
     * ```js
     * // due to browser policies you'll need a static file server to load local files
     * loadSprite("bean", "bean.png");
     * loadSprite("apple", "https://play.kaplayjs.com/sprites/apple.png");
     *
     * // slice a spritesheet and add anims manually
     * loadSprite("bean", "bean.png", {
     *     sliceX: 4,
     *     sliceY: 1,
     *     anims: {
     *         run: {
     *             from: 0,
     *             to: 3,
     *         },
     *         jump: {
     *             from: 3,
     *             to: 3,
     *         },
     *     },
     * });
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Sprites
     */
    loadSprite(
        name: string | null,
        src: LoadSpriteSrc | LoadSpriteSrc[],
        opt?: LoadSpriteOpt,
    ): Asset<SpriteData>;
    /**
     * Load sprites from a sprite atlas.
     *
     * @param src - The image resource url.
     * @param data - The sprite atlas data.
     *
     * @example
     * ```js
     * // See #SpriteAtlasData type for format spec
     * loadSpriteAtlas("sprites/dungeon.png", {
     *     "hero": {
     *         x: 128,
     *         y: 68,
     *         width: 144,
     *         height: 28,
     *         sliceX: 9,
     *         anims: {
     *             idle: { from: 0, to: 3 },
     *             run: { from: 4, to: 7 },
     *             hit: 8,
     *         },
     *     },
     * });
     *
     * const player = add([
     *     sprite("hero"),
     * ]);
     *
     * player.play("run");
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Sprites
     */
    loadSpriteAtlas(
        src: LoadSpriteSrc,
        data: SpriteAtlasData,
    ): Asset<Record<string, SpriteData>>;
    /**
     * Load sprites from a sprite atlas with URL.
     *
     * @param src - The image resource url.
     * @param url - The json resource url.
     *
     * @example
     * ```js
     * // Load from json file, see #SpriteAtlasData type for format spec
     * loadSpriteAtlas("sprites/dungeon.png", "sprites/dungeon.json")
     *
     * const player = add([
     *     sprite("hero"),
     * ])
     *
     * player.play("run")
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Sprites
     */
    loadSpriteAtlas(
        src: LoadSpriteSrc,
        url: string,
    ): Asset<Record<string, SpriteData>>;
    /**
     * Load a sprite with aseprite spritesheet json (should use "array" in the export options and have tags enabled, that way kaplay can load tagged frames as animations).
     *
     * @param name - The asset name.
     * @param imgSrc - The image resource url.
     *
     * @example
     * ```js
     * loadAseprite("car", "sprites/car.png", "sprites/car.json")
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Sprites
     */
    loadAseprite(
        name: string | null,
        imgSrc: LoadSpriteSrc,
        jsonSrc: string | AsepriteData,
    ): Asset<SpriteData>;
    /**
     * Load default sprite "bean".
     *
     * @param name - An optional name for bean.
     *
     * @example
     * ```js
     * loadBean();
     *
     * // use it right away
     * add([
     *     sprite("bean"),
     * ]);
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Sprites
     */
    loadBean(name?: string): Asset<SpriteData>;
    /**
     * Load default font "happy".
     *
     * @param name - Optional name for happy. Default to happy.
     * @param opt - Optional config for {@link loadBitmapFont `loadBitmapFont`}.
     *
     * @example
     * ```js
     * loadHappy();
     *
     * add([
     *     text("ohhi", { font: "happy" }),
     * ]);
     * ```
     *
     * @returns The asset data.
     * @since v4000.0
     * @group Assets
     * @subgroup Fonts
     */
    loadHappy(name?: string, opt?: LoadBitmapFontOpt): Asset<BitmapFontData>;
    /**
     * Load custom JSON data from url.
     *
     * @param name - The asset name.
     * @param url - The resource url.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Util
     */
    loadJSON(name: string | null, url: string): Asset<any>;
    /**
     * Load a sound into asset manager, with name and resource url.
     *
     * Supported formats: mp3, ogg, wav.
     *
     * @param name - The asset name.
     * @param src - The resource url.
     *
     * @example
     * ```js
     * loadSound("shoot", "/sounds/horse.ogg");
     * loadSound("shoot", "/sounds/squeeze.mp3");
     * loadSound("shoot", "/sounds/shoot.wav");
     * ```
     *
     * @returns  The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Audio
     */
    loadSound(
        name: string | null,
        src: string | ArrayBuffer | AudioBuffer,
    ): Asset<SoundData>;
    /**
     * Like loadSound(), but the audio is streamed and won't block loading. Use this for big audio files like background music.
     *
     * @param name - The asset name.
     * @param url - The resource url.
     *
     * @example
     * ```js
     * loadMusic("shoot", "/music/bossfight.mp3");
     * ```
     *
     * @returns The asset data.
     * @since v3001.0
     * @group Assets
     * @subgroup Audio
     */
    loadMusic(name: string | null, url: string): void;
    /**
     * Load a font (any format supported by the browser, e.g. ttf, otf, woff).
     *
     * @param name - The asset name.
     *
     * @example
     * ```js
     * // load a font from a .ttf file
     * loadFont("frogblock", "fonts/frogblock.ttf");
     * ```
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Fonts
     */
    loadFont(
        name: string,
        src: string | ArrayBuffer | ArrayBufferView,
        opt?: LoadFontOpt,
    ): Asset<FontData>;
    /**
     * Load a bitmap font into asset manager, with name and resource url and information on the layout of the bitmap.
     *
     * @param name - The asset name.
     * @param src - The resource url.
     * @param gridW - The width of each character on the bitmap.
     * @param gridH - The height of each character on the bitmap.
     * @param opt - The options for the bitmap font.
     *
     * @example
     * ```js
     * // load a bitmap font called "04b03", with bitmap "fonts/04b03.png"
     * // each character on bitmap has a size of (6, 8), and contains default ASCII_CHARS
     * loadBitmapFont("04b03", "fonts/04b03.png", 6, 8);
     *
     * // load a font with custom characters
     * loadBitmapFont("myfont", "myfont.png", 6, 8, { chars: "☺☻♥♦♣♠" });
     * ```
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Fonts
     */
    loadBitmapFont(
        name: string | null,
        src: string,
        gridW: number,
        gridH: number,
        opt?: LoadBitmapFontOpt,
    ): Asset<BitmapFontData>;
    /**
     * Define the frames of an existing sprite as characters that can be used as a font.
     *
     * This was primarily intended for use with {@link loadSpriteAtlas} because the sprite in
     * question usually isn't the whole image and so can't be also passed to {@link loadBitmapFont}
     * as its own font.
     *
     * This waits for the sprite to load before doing anything, but if the sprite doesn't load, the game
     * will transition to the error screen after a timeout (which is set by {@link KAPLAYOpt["loadTimeout"]|KAPLAYOpt.loadTimeout}).
     *
     * @param sprite - The ID of the sprite to use as a font. Must already have frames defined
     * @param chars - The characters that correspond to each of the frames in the sprite. You can't use
     * space or newline here because those are hard-coded to special behaviors in the text layout code.
     *
     * @returns The generated font data.
     * @group Assets
     * @subgroup Fonts
     *
     * @see {@link LoadSpriteOpt}
     */
    loadBitmapFontFromSprite(
        sprite: string,
        chars: string,
    ): Asset<BitmapFontData>;
    /**
     * Load a shader with vertex and fragment code.
     *
     * @param name - The asset name.
     * @param vert - The vertex shader code. Null if not needed.
     * @param frag - The fragment shader code. Null if not needed.
     *
     * @example
     * ```js
     * // default shaders and custom shader format
     * loadShader("outline",
     * `vec4 vert(vec2 pos, vec2 uv, vec4 color) {
     *     // predefined functions to get the default value by KAPLAY
     *     return def_vert();
     * }`,
     * `vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
     *     // turn everything blue-ish
     *     return def_frag() * vec4(0, 0, 1, 1);
     * }`, false)
     * ```
     *
     * @returns The asset data.
     * @since v2000.0
     * @group Assets
     * @subgroup Shaders
     */
    loadShader(
        name: string | null,
        vert?: string | null,
        frag?: string | null,
    ): Asset<ShaderData>;
    /**
     * Load a shader with vertex and fragment code file url.
     *
     * @param name - The name of the asset.
     * @param vert - The vertex shader code. Null if not needed.
     * @param frag - The fragment shader code. Null if not needed.
     *
     * @example
     * ```js
     * // load only a fragment shader from URL
     * loadShaderURL("outline", null, "/shaders/outline.glsl")
     * ```
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Shaders
     */
    loadShaderURL(
        name: string | null,
        vert?: string | null,
        frag?: string | null,
    ): Asset<ShaderData>;
    /**
     * Add a new loader to wait for before starting the game.
     *
     * @param l - The loader to wait for.
     *
     * @example
     * ```js
     * load(new Promise((resolve, reject) => {
     *     // anything you want to do that stalls the game in loading state
     *     resolve("ok")
     * }))
     * ```
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Util
     */
    load<T>(l: Promise<T>): Asset<T>;
    /**
     * Load a prefab.
     *
     * @since v4000.0.0
     * @group Assets
     * @subgroup Util
     * @experimental
     */
    loadPrefab: (name: string, url: string) => Asset<SerializedGameObj>;
    // #endregion
    /**
     * Get the global asset loading progress (0.0 - 1.0).
     *
     * @returns The loading progress.
     * @since v3000.0
     * @group Assets
     * @subgroup Util
     */
    loadProgress(): number;
    /**
     * Get SpriteData from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getSprite(name: string): Asset<SpriteData> | null;
    /**
     * Get SoundData from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getSound(name: string): Asset<SoundData> | null;
    /**
     * Get FontData from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getFont(name: string): Asset<FontData> | null;
    /**
     * Get BitmapFontData from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getBitmapFont(name: string): Asset<BitmapFontData> | null;
    /**
     * Get ShaderData from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getShader(name: string): Asset<ShaderData> | null;
    /**
     * Get custom data from name.
     *
     * @param name - The asset name.
     *
     * @returns The asset data.
     * @since v3000.0
     * @group Assets
     * @subgroup Getters
     */
    getAsset(name: string): Asset<any> | null;
    /**
     * The asset data.
     *
     * @group Assets
     * @subgroup Data
     */
    Asset: typeof Asset;
    /**
     * The sprite data.
     *
     * @group Assets
     * @subgroup Data
     */
    SpriteData: typeof SpriteData;
    /**
     * @group Assets
     * @subgroup Data
     */
    SoundData: typeof SoundData;
    /**
     * Get the width of game.
     *
     * @returns The width of the game.
     * @since v2000.0
     * @group Info
     */
    width(): number;
    /**
     * Get the root of all objects.
     *
     * @returns The root object.
     * @since v2000.0
     * @group Game Obj
     */
    getTreeRoot(): GameObj;
    /**
     * Get the height of game.
     *
     * @returns The height of the game.
     * @since v2000.0
     * @group Info
     */
    height(): number;
    /**
     * Get the center point of view.
     *
     * @example
     * ```js
     * // add bean to the center of the screen
     * add([
     *     sprite("bean"),
     *     pos(center()),
     *     // ...
     * ])
     * ```
     *
     * @returns The center point of the view.
     * @since v2000.0
     * @group Info
     */
    center(): Vec2;
    /**
     * Get the delta time since last frame.
     *
     * @example
     * ```js
     * // rotate bean 100 deg per second
     * bean.onUpdate(() => {
     *     bean.angle += 100 * dt()
     * })
     * ```
     *
     * @since v2000.0
     * @group Info
     */
    dt(): number;
    /**
     * Get the delta time for the fixed-update loop. This
     * only changes when you call {@link setFixedSpeed}.
     *
     * @since v3000.0
     * @group Info
     */
    fixedDt(): number;
    /**
     * Get the rest delta time since last frame.
     *
     * @since v3000.0
     * @group Info
     */
    restDt(): number;
    /**
     * Change the speed that the fixed update loop runs at.
     * The options (and caveats) are described at {@link KAPLAYOpt["fixedUpdateMode"]|KAPLAYOpt.fixedUpdateMode}.
     *
     * @group Physics
     * @experimental
     */
    setFixedSpeed(speed: FixedSpeedOption): void;
    /**
     * Get the total time since beginning.
     *
     * @since v3001
     * @group Info
     */
    time(): number;
    /**
     * If the game canvas is currently focused.
     *
     * @returns true if focused.
     * @since v2000.1
     * @group Info
     */
    isFocused(): boolean;
    /**
     * Is currently on a touch screen device.
     *
     * @returns true if on a touch screen device.
     * @since v3000.0
     * @group Input
     * @subgroup Touch
     */
    isTouchscreen(): boolean;
    /**
     * Get current mouse position (without camera transform).
     *
     * @returns The current mouse position.
     * @since v2000.0
     * @group Input
     * @subgroup Mouse
     */
    mousePos(): Vec2;
    /**
     * How much mouse moved last frame.
     *
     * @returns The delta mouse position.
     * @since v2000.0
     * @group Input
     * @subgroup Mouse
     */
    mouseDeltaPos(): Vec2;
    /**
     * If any or certain key(s) are currently down.
     *
     * @param k - The key(s) to check.
     *
     * @example
     * ```js
     * // Any key down
     *
     * let lastKeyTime = time()
     * let triedToWakeUp = false
     *
     * onUpdate(() => {
     *     if (isKeyDown()) {
     *         lastKeyTime = time()
     *         triedToWakeUp = false
     *         return
     *     }
     *
     *     if (triedToWakeUp || time() - lastKeyTime < 5) return
     *
     *     debug.log("Wake up!")
     *     triedToWakeUp = true
     * })
     *
     * // Certain key down
     * // equivalent to the calling bean.move() in an onKeyDown("left")
     *
     * onUpdate(() => {
     *     if (isKeyDown("left")) {
     *         bean.move(-SPEED, 0)
     *     }
     * })
     *
     * // Certain keys down
     *
     * let isMoving = false
     *
     * onUpdate(() => {
     *     isMoving = isKeyDown(["left", "right"])
     * })
     * ```
     *
     * @since v2000.0
     * @group Input
     * @subgroup Keyboard
     */
    isKeyDown(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just pressed last frame.
     *
     * @param k - The key(s) to check.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *     if (!isKeyPressed()) return // early return as no key was pressed
     *
     *     if (isKeyPressed("space")) debug.log("Pressed the jump key")
     *     if (isKeyPressed(["left", "right"])) debug.log("Pressed any of the move keys")
     * })
     * ```
     *
     * @since v2000.0
     * @group Input
     * @subgroup Keyboard
     */
    isKeyPressed(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just pressed last frame (also fires repeatedly when the keys are being held down).
     *
     * @param k - The key(s) to check.
     *
     * @example
     * ```js
     * let heldKeys = new Set()
     *
     * onUpdate(() => {
     *     if (isKeyPressedRepeat("space")) {
     *         pressedOrHeld(["space"], 'the jump key')
     *     } else if (isKeyPressedRepeat(["left", "right"])) {
     *         pressedOrHeld(["left", "right"], 'any of the move keys')
     *     } else if (isKeyPressedRepeat()) {
     *         pressedOrHeld(["any"], 'any key')
     *     }
     * })
     *
     * onKeyRelease((key) => wait(0.1, () => {
     *     heldKeys.delete(key)
     *     heldKeys.delete("any")
     * }))
     *
     * // log message if pressed only or held as well
     * function pressedOrHeld(keys, string) {
     *     debug.log(`Pressed${keys.some(key => heldKeys.has(key)) ? ' and held' : ''} ${string}`)
     *     keys.forEach((key) => {
     *         if (key == "any" || isKeyDown(key)) heldKeys.add(key)
     *     })
     * }
     * ```
     *
     * @since v2000.0
     * @group Input
     * @subgroup Keyboard
     */
    isKeyPressedRepeat(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just released last frame.
     *
     * @param k - The key(s) to check.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *     if (!isKeyReleased()) return // early return as no key was released
     *
     *     if (isKeyReleased("space")) debug.log("Released the jump key")
     *     if (isKeyReleased(["left", "right"])) debug.log("Released any of the move keys")
     * })
     * ```
     *
     * @since v2000.0
     * @group Input
     * @subgroup Keyboard
     */
    isKeyReleased(k?: Key | Key[]): boolean;
    /**
     * If mouse buttons are currently down.
     *
     * @param btn - The button(s) to check.
     *
     * @since v2000.0
     * @group Input
     * @subgroup Mouse
     */
    isMouseDown(btn?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse buttons are just clicked last frame
     *
     * @param btn - The button(s) to check.
     *
     * @since v2000.0
     * @group Input
     * @subgroup Mouse
     */
    isMousePressed(btn?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse buttons are just released last frame.
     *
     * @param btn - The button(s) to check.
     *
     * @since v2000.0
     * @group Input
     * @subgroup Mouse
     */
    isMouseReleased(btn?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse moved last frame.
     *
     * @since v2000.1
     * @group Input
     * @subgroup Mouse
     */
    isMouseMoved(): boolean;
    /**
     * If certain gamepad buttons are just pressed last frame
     *
     * @param btn - The button(s) to check.
     *
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    isGamepadButtonPressed(btn?: KGamepadButton | KGamepadButton[]): boolean;
    /**
     * If certain gamepad buttons are currently held down.
     *
     * @param btn - The button(s) to check.
     *
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    isGamepadButtonDown(btn?: KGamepadButton | KGamepadButton): boolean;
    /**
     * If certain gamepad buttons are just released last frame.
     *
     * @param btn - The button(s) to check.
     *
     * @since v3000.0
     * @group Input
     * @subgroup Gamepad
     */
    isGamepadButtonReleased(btn?: KGamepadButton | KGamepadButton[]): boolean;
    /**
     * If any or certain bound button(s) are just pressed last frame on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to check.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *     if (!isButtonPressed()) return // early return as no button was pressed
     *
     *     if (isButtonPressed("jump")) debug.log("Player jumped")
     *     if (isButtonPressed(["left", "right"])) debug.log("Player moved")
     * })
     * ```
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    isButtonPressed(btn?: string | string[]): boolean;
    /**
     * If any or certain bound button(s) are currently held down on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to check.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *     if (!isButtonDown()) return // early return as no button is held down
     *
     *     if (isButtonDown("jump")) debug.log("Player is jumping")
     *     if (isButtonDown(["left", "right"])) debug.log("Player is moving")
     * })
     * ```
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    isButtonDown(btn?: string | []): boolean;
    /**
     * If any or certain bound button(s) are just released last frame on any input (keyboard, gamepad).
     *
     * @param btn - The button(s) to check.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *     if (!isButtonReleased()) return // early return as no button was released
     *
     *     if (isButtonReleased("jump")) debug.log("Player stopped jumping")
     *     if (isButtonReleased(["left", "right"])) debug.log("Player stopped moving")
     * })
     * ```
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    isButtonReleased(btn?: string | string[]): boolean;
    /**
     * Get a input binding from a button name.
     *
     * @param btn - The button to get binding for.
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    getButton(btn: string): ButtonBinding;
    /**
     * Get all the input bindings.
     *
     * @returns The button definition.
     * @since v4000.0
     * @group Input
     * @subgroup Buttons API
     */
    getButtons(): ButtonsDef;
    /**
     * Set a input binding for a button name.
     *
     * @param btn - The button to set binding for.
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    setButton(btn: string, def: ButtonBinding): void;
    /**
     * Press a button virtually.
     *
     * @param btn - The button to press.
     *
     * @example
     * ```js
     * // press "jump" button
     * pressButton("jump"); // triggers onButtonPress, starts onButtonDown
     * releaseButton("jump"); // triggers onButtonRelease, stops onButtonDown
     * ```
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    pressButton(btn: string): void;
    /**
     * Release a button virtually.
     *
     * @param btn - The button to release.
     *
     * @example
     * ```js
     * // press "jump" button
     * pressButton("jump"); // triggers onButtonPress, starts onButtonDown
     * releaseButton("jump"); // triggers onButtonRelease, stops onButtonDown
     * ```
     *
     * @since v3001.0
     * @group Input
     * @subgroup Buttons API
     */
    releaseButton(btn: string): void;
    /**
     * Get stick axis values from a gamepad.
     *
     * @param stick - The stick to get values from.
     *
     * @returns The stick axis Vec2.
     * @since v3001.0
     * @group Input
     * @subgroup Gamepad
     */
    getGamepadStick(stick: KGamepadStick): Vec2;
    /**
     * Get analog button values from a gamepad.
     *
     * @param b - The button to read the analog value from.
     *
     * @returns The button analog value.
     * @since v4000.0
     * @group Input
     * @subgroup Gamepad
     */
    getGamepadAnalogButton(b: KGamepadButton): number;
    /**
     * Get the latest input device type that triggered the input event.
     *
     * @returns The last input device type, or null if no input event has been triggered.
     * @since v3001.0
     * @group Input
     * @subgroup Util
     */
    getLastInputDeviceType(): ButtonBindingDevice | null;
    /**
     * List of characters inputted since last frame.
     *
     * @returns An array of characters inputted.
     * @since v3000.0
     * @group Input
     * @subgroup Keyboard
     */
    charInputted(): string[];
    /**
     * Set camera position.
     *
     * @param pos - The position to set the camera to.
     *
     * @example
     * ```js
     * // move camera to (100, 100)
     * setCamPos(100, 100);
     * setCamPos(vec2(100, 100));
     * setCamPos(100); // x and y are the same
     * ```
     *
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    setCamPos(pos: Vec2): void;
    setCamPos(x: number, y: number): void;
    setCamPos(xy: number): void;
    /**
     * Get camera position.
     *
     * @returns The current camera position.
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    getCamPos(): Vec2;
    /**
     * Set camera scale.
     *
     * @param scale - The scale to set the camera to.
     *
     * @example
     * ```js
     * // set camera scale to (2, 2)
     * setCamScale(2, 2);
     * setCamScale(vec2(2, 2));
     * setCamScale(2); // x and y are the same
     * ```
     *
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    setCamScale(scale: Vec2): void;
    setCamScale(x: number, y: number): void;
    setCamScale(xy: number): void;
    /**
     * Get camera scale.
     *
     * @returns The current camera scale.
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    getCamScale(): Vec2;
    /**
     * Set camera rotation.
     *
     * @param angle - The angle to rotate the camera.
     *
     * @example
     * ```js
     * // rotate camera 90 degrees
     * setCamRot(90);
     * ```
     *
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    setCamRot(angle: number): void;
    /**
     * Get camera rotation.
     *
     * @returns The current camera rotation.
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    getCamRot(): number;
    /**
     * Get camera transform.
     *
     * @returns The current camera transform.
     * @since v3001.1
     * @group Rendering
     * @subgroup Camera
     */
    getCamTransform(): Mat23;
    /**
     * Camera shake.
     *
     * @param intensity - The intensity of the shake. Default to 12.
     *
     * @example
     * ```js
     * // shake intensively when bean collides with a "bomb"
     * bean.onCollide("bomb", () => {
     *     shake(120)
     * })
     * ```
     *
     * @since v3000.0
     * @group Rendering
     * @subgroup Camera
     */
    shake(intensity?: number): void;
    /**
     * Camera flash.
     *
     * @param flashColor - The color of the flash.
     * @param fadeOutTime - The time it takes for the flash to fade out.
     *
     * @example
     * ```js
     * onClick(() => {
     *     // flashed
     *     flash(WHITE, 0.5);
     * });
     * ```
     *
     * @returns A timer controller.
     * @since v3001.0
     * @group Rendering
     * @subgroup Camera
     */
    flash(flashColor: Color, fadeOutTime: number): TimerController;
    // #region DEPRECATED CAMERA METHODS ---------------------------------------
    /**
     * @deprecated Use {@link setCamPos} and {@link getCamPos} instead.
     *
     * Get / set camera position.
     *
     * @param pos - The position to set the camera to.
     *
     * @example
     * ```js
     * // camera follows player
     * player.onUpdate(() => {
     *     camPos(player.pos)
     * })
     * ```
     *
     * @returns The current camera position.
     * @since v2000.0
     * @group Rendering
     * @subgroup Camera
     */
    camPos(pos: Vec2): Vec2;
    /** @deprecated */
    camPos(x: number, y: number): Vec2;
    /** @deprecated */
    camPos(xy: number): Vec2;
    /** @deprecated */

    camPos(): Vec2;
    /**
     * @deprecated Use {@link setCamScale} and {@link getCamScale} instead.
     *
     * Get / set camera scale.
     *
     * @param scale - The scale to set the camera to.
     *
     * @returns The current camera scale.
     * @since v2000.0
     * @group Rendering
     * @subgroup Camera
     */
    camScale(scale: Vec2): Vec2;
    /** @deprecated */
    camScale(x: number, y: number): Vec2;
    /** @deprecated */
    camScale(xy: number): Vec2;
    /** @deprecated */
    camScale(): Vec2;
    /**
     * @deprecated Use {@link setCamRot} and {@link getCamRot} instead.
     *
     * Get / set camera rotation.
     *
     * @param angle - The angle to rotate the camera.
     *
     * @returns The current camera rotation.
     * @since v2000.0
     * @group Rendering
     * @subgroup Camera
     */
    camRot(angle?: number): number;
    /**
     * @deprecated use {@link flash} instead.
     *
     * Flash the camera.
     *
     * @param flashColor - The color of the flash.
     * @param fadeOutTime - The time it takes for the flash to fade out.
     *
     * @example
     * ```js
     * onClick(() => {
     *     // flashed
     *     camFlash(WHITE, 0.5)
     * })
     * ```
     *
     * @returns A timer controller.
     * @since v3001.0
     * @group Rendering
     * @subgroup Camera
     */
    camFlash(flashColor: Color, fadeOutTime: number): TimerController;
    /**
     * @deprecated use {@link getCamTransform} instead.
     *
     * Get camera transform.
     *
     * @group Rendering
     * @subgroup Camera
     */
    camTransform(): Mat23;
    // #endregion DEPRECATED CAMERA METHODS ------------------------------------
    /**
     * Transform a point from world position (relative to the root) to screen position (relative to the screen).
     *
     * @param p - The point to transform.
     *
     * @since v3001.0
     * @group Rendering
     * @subgroup Camera
     */
    toScreen(p: Vec2): Vec2;
    /**
     * Transform a point from screen position (relative to the screen) to world position (relative to the root).
     *
     * @param p - The point to transform.
     *
     * @since v3001.0
     * @group Rendering
     * @subgroup Camera
     */
    toWorld(p: Vec2): Vec2;
    /**
     * Set gravity.
     *
     * @param g - The gravity to set.
     *
     * @since v2000.0
     * @group Physics
     */
    setGravity(g: number): void;
    /**
     * Get gravity.
     *
     * @since v3001.0
     * @group Physics
     */
    getGravity(): number;
    /**
     * Set gravity direction.
     *
     * @since v3001.0
     * @group Physics
     */
    setGravityDirection(d: Vec2): void;
    /**
     * Get gravity direction.
     *
     * @returns The gravity direction.
     * @since v3001.0
     * @group Physics
     */
    getGravityDirection(): Vec2;
    /**
     * An object containing the data for when two objects with area()s
     * overlap or collide with each other.
     *
     * @since v4000.0
     * @group Physics
     */
    Collision: typeof Collision;
    /**
     * Set background color.
     *
     * @since v3000.0
     * @group Info
     */
    setBackground(color: Color): void;
    setBackground(color: Color, alpha: number): void;
    setBackground(r: number, g: number, b: number): void;
    setBackground(r: number, g: number, b: number, alpha: number): void;
    /**
     * Get background color.
     *
     * @returns The background color.
     * @since v3000.0
     * @group Info
     */
    getBackground(): Color | null;
    /**
     * Get connected gamepads.
     *
     * @returns An array of connected gamepads.
     * @since v3000.0
     * @group Info
     */
    getGamepads(): KGamepad[];
    /**
     * Set cursor style.
     *
     * @param style - The cursor style.
     *
     * @example
     * ```js
     * // Change between cursor styles
     *
     * // Reset cursor to default at start of every frame
     * onUpdate(() => setCursor("default"));
     *
     * button.onHover((c) => {
     *    // change cursor to pointer when hovering over button
     *     setCursor("pointer")
     * })
     *
     * // Hide the only cursor at start (useful for fakeMouse)
     * setCursor("none");
     * ```
     *
     * @since v2000.0
     * @group Info
     */
    setCursor(style: Cursor): void;
    /**
     * Get current cursor style.
     *
     * @returns The current cursor style.
     * @since v2000.0
     * @group Info
     */
    getCursor(): Cursor;
    /**
     * Lock / unlock cursor. Note that you cannot lock cursor within 1 second after user unlocking the cursor with the default unlock gesture (typically the esc key) due to browser policy.
     *
     * @since v2000.0
     * @group Info
     */
    setCursorLocked(locked: boolean): void;
    /**
     * Get if cursor is currently locked.
     *
     * @returns true if locked, false otherwise.
     * @since v2000.0
     * @group Info
     */
    isCursorLocked(): boolean;
    /**
     * Enter / exit fullscreen mode. (note: mouse position is not working in fullscreen mode at the moment)
     *
     * @example
     * ```js
     * // toggle fullscreen mode on "f"
     * onKeyPress("f", (c) => {
     *     setFullscreen(!isFullscreen());
     * });
     * ```
     *
     * @since v2000.0
     * @group Info
     */
    setFullscreen(f?: boolean): void;
    /**
     * If currently in fullscreen mode.
     *
     * @returns true if fullscreen, false otherwise.
     * @since v2000.0
     * @group Info
     */
    isFullscreen(): boolean;
    /**
     * Run the function after n seconds.
     *
     * @param n - The time to wait in seconds.
     * @param action - The function to run.
     *
     * @example
     * ```js
     * // 3 seconds until explosion! Runnn!
     * wait(3, () => {
     *     explode()
     * })
     *
     * // wait() returns a PromiseLike that can be used with await
     * await wait(1)
     * ```
     *
     * @returns A timer controller.
     * @since v2000.0
     * @group Timer
     */
    wait(n: number, action?: () => void): TimerController;
    /**
     * Run the function every n seconds.
     *
     * @param n - The time to wait in seconds.
     * @param action - The function to run.
     * @param maxLoops - The maximum number of loops to run. If not provided, it will run forever.
     * @param waitFirst - Whether to wait for the first loop to start.
     *
     * @example
     * ```js
     * // spawn a butterfly at random position every 1 second
     * loop(1, () => {
     *     add([
     *         sprite("butterfly"),
     *         pos(rand(vec2(width(), height()))),
     *         area(),
     *         "friend",
     *     ])
     * })
     * ```
     *
     * @returns A timer controller.
     * @since v2000.0
     * @group Timer
     */
    loop(
        t: number,
        action: () => void,
        maxLoops?: number,
        waitFirst?: boolean,
    ): TimerController;
    /**
     * Play a piece of audio.
     *
     * @example
     * ```js
     * // play a one off sound
     * play("wooosh")
     *
     * // play a looping soundtrack (check out AudioPlayOpt for more options)
     * const music = play("OverworldlyFoe", {
     *     volume: 0.8,
     *     loop: true
     * })
     *
     * // using the handle to control (check out AudioPlay for more controls / info)
     * music.paused = true
     * music.speed = 1.2
     * ```
     *
     * @returns A control handle.
     * @since v2000.0
     * @group Audio
     */
    play(
        src:
            | string
            | SoundData
            | Asset<SoundData>
            | MusicData
            | Asset<MusicData>,
        options?: AudioPlayOpt,
    ): AudioPlay;
    /**
     * Yep. Plays a burp sound.
     *
     * @returns A control handle.
     * @since v2000.0
     * @group Audio
     */
    burp(options?: AudioPlayOpt): AudioPlay;
    /**
     * Set the global volume.
     *
     * @param v - The volume to set.
     *
     * @example
     * ```js
     * setVolume(0.5)
     * ```
     *
     * @since v3001.1
     * @group Audio
     */
    setVolume(v: number): void;
    /**
     * Get the global volume.
     *
     * @returns The current volume.
     * @since v3001.1
     * @group Audio
     */
    getVolume(): number;
    /**
     * @deprecated Use {@link setVolume} and {@link getVolume} instead.
     *
     * Sets global volume.
     *
     * @example
     * ```js
     * // makes everything quieter
     * volume(0.5)
     * ```
     *
     * @returns The new volume or the current volume.
     * @since v2000.0
     * @group Audio
     */
    volume(v?: number): number;
    /**
     * Get the underlying browser AudioContext.
     *
     * @since v2000.0
     * @group Audio
     */
    audioCtx: AudioContext;
    /**
     * Get a random value between the given bound.
     *
     * @param a - The lower bound. If not upper bound, this is the upper bound and the lower bound is 0.
     * @param b - The upper bound.
     *
     * @example
     * ```js
     * // a random number between 0 - 8
     * rand(8)
     *
     * // a random point on screen
     * rand(vec2(width(), height()))
     *
     * // a random color
     * rand(rgb(255, 255, 255))
     *
     * // a random number between 50 - 100
     * rand(50, 100);
     *
     * // a random point on screen with x between 20 - 100 and y between 20 - 100
     * rand(vec2(20), vec2(100));
     *
     * // spawn something on the right side of the screen but with random y value within screen height
     * add([
     *     pos(width(), rand(0, height())),
     * ]);
     * ```
     *
     * @since v2000.0
     * @group Math
     * @subgroup Random
     */
    rand<T = RNGValue>(a?: T, b?: T): T;
    /**
     * rand() but floored to integer. If not arguments, returns 0 or 1.
     *
     * @param a - The lower bound. If not upper bound, this is the upper bound.
     * @param b - The upper bound.
     *
     * @example
     * ```js
     * randi(); // returns either 0 or 1
     * randi(10); // returns a random integer between 0 and 9
     * randi(10, 20); // returns a random integer between 10 and 19
     * ```
     *
     * @returns A random integer between 0 and 1.
     * @since v2000.0
     * @group Math
     * @subgroup Random
     */
    randi(a?: number, b?: number): number;
    /**
     * Get / set the random number generator seed.
     *
     * @param seed - The seed to set.
     *
     * @example
     * ```js
     * randSeed(Date.now())
     * ```
     *
     * @returns The new seed.
     * @since v2000.0
     * @group Math
     * @subgroup Random
     */
    randSeed(seed?: number): number;
    /**
     * Create a 2D vector.
     *
     * @example
     * ```js
     * // { x: 0, y: 0 }
     * vec2()
     *
     * // { x: 10, y: 10 }
     * vec2(10)
     *
     * // { x: 100, y: 80 }
     * vec2(100, 80)
     *
     * // move to 150 degrees direction with by length 10
     * player.pos = pos.add(Vec2.fromAngle(150).scale(10))
     * ```
     *
     * @returns The vector.
     * @since v2000.0
     * @group Math
     */
    vec2(x: number, y: number): Vec2;
    vec2(p: Vec2): Vec2;
    vec2(xy: number): Vec2;
    vec2(): Vec2;
    /**
     * Create a color from RGB values (0 - 255).
     *
     * @param r - The red value.
     * @param g - The green value.
     * @param b - The blue value.
     *
     * @example
     * ```js
     * // update the color of the sky to light blue
     * sky.color = rgb(0, 128, 255)
     * ```
     *
     * @returns The color.
     * @since v2000.0
     * @group Math
     */
    rgb(r: number, g: number, b: number): Color;
    /**
     * Create a color from hex string.
     *
     * @param hex - The hex string.
     *
     * @example
     * ```js
     * sky.color = rgb("#ef6360")
     * ```
     *
     * @returns The color.
     * @since v2000.0
     * @group Math
     */
    rgb(hex: string): Color;
    /**
     * Create a color from CSS keyword.
     *
     * @param cssColor - The CSS keyword.
     *
     * @example
     * ```js
     * sea.color = rgb("slateblue");
     * ```
     *
     * @returns The color.
     * @since v3001.0.10
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1.0
     */
    rgb(cssColor: CSSColorKeywords): Color;
    /**
     * Same as rgb(255, 255, 255).
     */
    rgb(): Color;
    /**
     * Convert HSL color (all values in 0.0 - 1.0 range) to RGB color.
     *
     * @param hue - The hue value.
     * @param saturation - The saturation value.
     * @param lightness - The lightness value.
     *
     * @example
     * ```js
     * // animate rainbow color
     * onUpdate("rainbow", (obj) => {
     *     obj.color = hsl2rgb(wave(0, 1, time()), 0.6, 0.6);
     * });
     * ```
     *
     * @returns The color.
     * @since v2000.1
     * @group Math
     * @subgroup Colors
     */
    hsl2rgb(hue: number, saturation: number, lightness: number): Color;
    /**
     * Rectangle area (0.0 - 1.0).
     *
     * @param x - The x position of the rectangle.
     * @param y - The y position of the rectangle.
     * @param w - The width of the rectangle.
     * @param h - The height of the rectangle.
     *
     * @returns A Quad object.
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    quad(x: number, y: number, w: number, h: number): Quad;
    /**
     * Choose a random item from a list.
     *
     * @param lst - The list to choose from.
     *
     * @example
     * ```js
     * // decide the best fruit randomly
     * const bestFruit = choose(["apple", "banana", "pear", "watermelon"]);
     * ```
     *
     * @returns A random item from the list.
     * @since v3001.0
     * @group Math
     * @subgroup Random
     */
    choose<T>(lst: T[]): T;
    /**
     * Choose multiple random items from a list.
     *
     * @param lst - The list to choose from.
     * @param count - The number of items to choose.
     *
     * @returns An array of random items from the list.
     * @since v3001.0
     * @group Math
     * @subgroup Random
     */
    chooseMultiple<T>(lst: T[], count: number): T[];
    /**
     * Shuffle an array.
     *
     * @param lst - The list to shuffle.
     *
     * @returns A shuffled array.
     * @since v3001.0
     * @group Math
     * @subgroup Random
     */
    shuffle<T>(lst: T[]): T[];
    /**
     * rand(1) <= p
     *
     * @example
     * ```js
     * // every frame all objs with tag "unlucky" have 50% chance die
     * onUpdate("unlucky", (o) => {
     *     if (chance(0.5)) {
     *         destroy(o)
     *     }
     * })
     * ```
     *
     * @group Math
     * @subgroup Random
     */
    chance(p: number): boolean;
    /**
     * Linear interpolation. Can take a number, vector, or color.
     *
     * @group Math
     * @subgroup Tween
     */
    lerp<V extends LerpValue>(from: V, to: V, t: number): V;
    /**
     * Tweeeeeeeening!
     *
     * @example
     * ```js
     * // tween bean to mouse position
     * tween(bean.pos, mousePos(), 1, (p) => bean.pos = p, easings.easeOutBounce)
     * ```
     *
     * @since v3000.0
     * @group Math
     * @subgroup Tween
     */
    tween<V extends LerpValue>(
        from: V,
        to: V,
        duration: number,
        setValue: (value: V) => void,
        easeFunc?: (t: number) => number,
    ): TweenController;
    /**
     * A collection of easing functions for tweening.
     *
     * @since v3000.0
     * @group Math
     * @subgroup Tween
     */
    easings: Record<EaseFuncs, EaseFunc>;
    /**
     * Steps easing. Eases in discontinious steps.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Tween
     */
    easingSteps(steps: number, position: StepPosition): (x: number) => number;
    /**
     * Linear easing with keyframes.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Tween
     */
    easingLinear(keys: Vec2[]): (x: number) => number;
    /**
     * Bezier easing. Both control points need x to be within 0 and 1.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Tween
     */
    easingCubicBezier(p1: Vec2, p2: Vec2): (x: number) => number;
    /**
     * Map a value from one range to another range.
     *
     * If the value overshoots, the source range, the result values will also do.
     *
     * For clamping check {@link mapc}
     *
     * @param v - The value the function will depend on.
     * @param l1 - The minimum value of the source range.
     * @param h1 - The minimum result value.
     * @param l2 - The maximum value of the source range.
     * @param h2 - The maximum result value.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *      // Redness will be 0 when the mouse is at the left edge and 255 when the mouse is at the right edge
     *      const redness = map(mousePos().x, 0, width(), 0, 255)
     *      setBackground(rgb(redness, 0, 0))
     * })
     * ```
     *
     * @returns The result value based on the source value.
     * @since v2000.0
     * @group Math
     */
    map(v: number, l1: number, h1: number, l2: number, h2: number): number;
    /**
     * Map a value from one range to another range, and clamp to the dest range.
     *
     * @param v - The value the function will depend on.
     * @param l1 - The minimum value of the source range.
     * @param h1 - The minimum result value.
     * @param l2 - The maximum value of the source range.
     * @param h2 - The maximum result value.
     *
     * @example
     * ```js
     * onUpdate(() => {
     *      // This variable will be 0 when the mouse is at the left edge and 255 when the mouse is at the right edge
     *      const redness = mapc(mousePos().x, 0, width(), 0, 255)
     *      setBackground(rgb(redness, 0, 0))
     * })
     * ```
     *
     * @returns The clamped result value based on the source value.
     * @since v2000.0
     * @group Math
     */
    mapc(v: number, l1: number, h1: number, l2: number, h2: number): number;
    /**
     * Interpolate back and forth between 2 values.
     *
     * (Optionally takes a custom periodic function, which default to a sine wave.).
     *
     * @example
     * ```js
     * // bounce color between 2 values as time goes on
     * onUpdate("colorful", (c) => {
     *     c.color.r = wave(0, 255, time())
     *     c.color.g = wave(0, 255, time() + 1)
     *     c.color.b = wave(0, 255, time() + 2)
     * })
     * ```
     *
     * @group Math
     */
    wave<V extends LerpValue>(
        lo: V,
        hi: V,
        t: number,
        func?: (x: number) => number,
    ): V;
    /**
     * Convert degrees to radians.
     *
     * @group Math
     * @subgroup Angle
     */
    deg2rad(deg: number): number;
    /**
     * Convert radians to degrees.
     *
     * @group Math
     * @subgroup Angle
     */
    rad2deg(rad: number): number;
    /**
     * Return a value clamped to an inclusive range of min and max.
     *
     * @group Math
     */
    clamp(n: number, min: number, max: number): number;
    /**
     * Evaluate the quadratic Bezier at the given t.
     *
     * @group Math
     * @subgroup Advanced
     */
    evaluateQuadratic(pt1: Vec2, pt2: Vec2, pt3: Vec2, t: number): Vec2;
    /**
     * Evaluate the first derivative of a quadratic bezier at the given t.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateQuadraticFirstDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the second derivative of a quadratic bezier at the given t
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateQuadraticSecondDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the cubic Bezier at the given t.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateBezier(pt1: Vec2, pt2: Vec2, pt3: Vec2, pt4: Vec2, t: number): Vec2;
    /**
     * Evaluate the first derivative of a cubic Bezier at the given t.
     *
     * @group Math
     * @subgroup Advanced
     */
    evaluateBezierFirstDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the second derivative of a cubic bezier at the given t.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateBezierSecondDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the Catmull-Rom spline at the given t.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateCatmullRom(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the first derivative of a Catmull-Rom spline at the given t.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    evaluateCatmullRomFirstDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Returns a function.
     * entries is the amount of entries in the LUT.
     * detail is the sampling granularity of each segment recorded in the LUT.
     * This new function either returns the length for a given t, or t for a given length, depending on the inverse parameter.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    curveLengthApproximation(
        curve: (t: number) => Vec2,
        entries: number,
        detail: number,
    ): (t: number, inverse: boolean) => number;
    /**
     * Returns a new curve which is normalized. This new curve has constant speed
     * curve is any curve in t (non-constant between 0 and 1)
     * returns a curve in s (constant between 0 and 1)
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    normalizedCurve(curve: (t: number) => Vec2): (s: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 1D Hermite curve.
     *
     * @param pt1 - First point.
     * @param m1 - First control point (tangent).
     * @param m2 - Second control point (tangent).
     * @param pt2 - Second point.
     *
     * @returns A function which gives the value on the 1D Hermite curve at t.
     * @group Math
     * @subgroup Advanced
     */
    hermite(
        pt1: number,
        m1: number,
        m2: number,
        pt2: number,
    ): (t: number) => number;
    /**
     * A second order function returning an evaluator for the given 2D Cardinal curve.
     *
     * @param pt1 - Previous point.
     * @param pt2 - First point.
     * @param pt3 - Second point.
     * @param pt4 - Next point.
     * @param tension - The tension of the curve, [0..1] from round to tight.
     *
     * @returns A function which gives the value on the 2D Cardinal curve at t.
     * @group Math
     * @subgroup Advanced
     */
    cardinal(
        pt1: Vec2,
        m1: Vec2,
        m2: Vec2,
        pt2: Vec2,
        tension: number,
    ): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D Catmull-Rom curve.
     *
     * @param pt1 - Previous point.
     * @param pt2 - First point.
     * @param pt3 - Second point.
     * @param pt4 - Next point.
     *
     * @returns A function which gives the value on the 2D Catmull-Rom curve at t.
     * @group Math
     * @subgroup Advanced
     */
    catmullRom(pt1: Vec2, m1: Vec2, m2: Vec2, pt2: Vec2): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D quadratic Bezier curve.
     *
     * @param pt1 - First point.
     * @param pt2 - First control point.
     * @param pt3 - Second control point.
     * @param pt4 - Second point.
     *
     * @returns A function which gives the value on the 2D quadratic Bezier curve at t.
     * @group Math
     * @subgroup Advanced
     */
    bezier(pt1: Vec2, pt2: Vec2, pt3: Vec2, pt4: Vec2): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D Kochanek–Bartels curve.
     *
     * @param pt1 - Previous point.
     * @param pt2 - First point.
     * @param pt3 - Second point.
     * @param pt4 - Next point.
     * @param tension - The tension of the curve, [-1..1] from round to tight.
     * @param continuity - The continuity of the curve, [-1..1] from box corners to inverted corners.
     * @param bias - The bias of the curve, [-1..1] from pre-shoot to post-shoot.
     *
     * @returns A function which gives the value on the 2D Kochanek–Bartels curve at t
     * @group Math
     * @subgroup Advanced
     */
    kochanekBartels(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        tension: number,
        continuity: number,
        bias: number,
    ): (t: number) => Vec2;
    createRegularPolygon(
        radius: number,
        sides: number,
        startAngle: number,
    ): Vec2[];
    createStarPolygon(
        radius1: number,
        radius2: number,
        sides: number,
        startAngle: number,
    ): Vec2[];
    createCogPolygon(
        radius1: number,
        radius2: number,
        sides: number,
        startAngle: number,
    ): Vec2[];
    /**
     * Check if a line and a point intersect.
     *
     * @param l - The line.
     * @param pt - The point.
     *
     * @returns true if the line and point intersects.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testLinePoint(l: Line, pt: Vec2): boolean;
    /**
     * Check if 2 lines intersects, if yes returns the intersection point.
     *
     * @param l1 - The first line.
     * @param l2 - The second line.
     *
     * @returns The intersection point, or null if the lines are parallel.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testLineLine(l1: Line, l2: Line): Vec2 | null;
    /**
     * Check if a line and a circle intersect.
     *
     * @param l - The line.
     * @param c - The circle.
     *
     * @returns true if the line and circle intersects.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testLineCircle(l: Line, c: Circle): boolean;
    /**
     * Check if 2 rectangle overlaps.
     *
     * @param r1 - The first rectangle.
     * @param r2 - The second rectangle.
     *
     * @returns true if the rectangles overlap.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testRectRect(r1: Rect, r2: Rect): boolean;
    /**
     * Check if a line and a rectangle overlaps.
     *
     * @param l - The line.
     * @param r - The rectangle.
     *
     * @returns true if the line and rectangle overlaps.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testRectLine(r: Rect, l: Line): boolean;
    /**
     * Check if a point is inside a rectangle.
     *
     * @param r - The rectangle.
     * @param pt - The point.
     *
     * @returns true if the point is inside the rectangle.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testRectPoint(r: Rect, pt: Vec2): boolean;
    /**
     * Check if a circle and polygon intersect linewise.
     *
     * @param c - The circle.
     * @param p - The polygon.
     *
     * @returns true if the circle and polygon intersect linewise.
     * @since v2000.0
     * @group Math
     * @subgroup Advanced
     */
    testCirclePolygon(c: Circle, p: Polygon): boolean;
    /**
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    clipLineToRect(r: Rect, l: Line, result: Line): boolean;
    /**
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    clipLineToCircle(c: Circle, l: Line, result: Line): boolean;
    /**
     * Returns a vector representing the anchor coordinates relative to the object's half-width, half-height, and center.
     *
     * For example: `anchorToVec2("right")` returns `vec2(1, 0)`, which means
     * the anchor is fully to the right horizontally (1), and in-line with the
     * centerpoint vertically (0).
     *
     * Or, `anchorToVec2("botleft")` returns `vec2(-1, 1)`, which means fully to the
     * left (-1), and fully to the bottom (1).
     *
     * @since v4000.0
     * @group Math
     * @subgroup Vectors
     */
    anchorToVec2: typeof anchorPt;
    /**
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    gjkShapeIntersects(shapeA: Shape, shapeB: Shape): boolean;
    /**
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    gjkShapeIntersection(
        shapeA: Shape,
        shapeB: Shape,
    ): GjkCollisionResult | null;
    /**
     * @returns true if the given polygon is convex
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    isConvex(pts: Vec2[]): boolean;
    /**
     * @returns 1 if over the edge, 0 otherwise
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    step(edge: number, x: number): number;
    /**
     * @returns 1 if over edge1, 0 if under edge0, a smooth hermite curve value otherwise
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    smoothstep(edge0: number, edge1: number, x: number): number;
    /**
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    triangulate(pts: Vec2[]): Vec2[][];
    /**
     * Sorts the array in-place using {@link https://en.wikipedia.org/wiki/Insertion_sort insertion sort}.
     * This is useful when you have a persistent (not per-frame) array of objects and they change
     * on each frame but not by much, but the list must remain sorted. (For example, the list could
     * be returned by {@link get `get`} with the `liveUpdate` option enabled, and then stored somewhere.)
     *
     * @param compare - returns true if `[left, right]` is the correct order, false if `[right, left]` is the correct order.
     *
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    insertionSort<T>(array: T[], compare: (left: T, right: T) => boolean): void;
    /**
     * A Navigation Mesh.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    NavMesh: typeof NavMesh;
    /**
     * A point.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Shapes
     */
    Point: typeof Point;
    /**
     * A line shape.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Shapes
     */
    Line: typeof Line;
    /**
     * A rectangle shape.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Shapes
     */
    Rect: typeof Rect;
    /**
     * A circle shape.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Shapes
     */
    Circle: typeof Circle;
    /**
     * A ellipse shape.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Shapes
     */
    Ellipse: typeof Ellipse;
    /**
     * A polygon shape.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Shapes
     */
    Polygon: typeof Polygon;
    /**
     * A 2D vector.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Vectors
     */
    Vec2: typeof Vec2;
    /**
     * A color.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Vectors
     */
    Color: typeof Color;
    /**
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    Mat4: typeof Mat4;
    /**
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    Mat2: typeof Mat2;
    /**
     * @since v4000.0
     * @group Math
     * @subgroup Advanced
     */
    Mat23: typeof Mat23;
    /**
     * A 2D quad.
     *
     * @since v3001.0
     * @group Math
     * @subgroup Advanced
     */
    Quad: typeof Quad;
    /**
     * A quadtree
     *
     * @since 4000
     * @group Math
     * @subgroup Advanced
     */
    Quadtree: typeof Quadtree;
    /**
     * Make a new quadtree
     *
     * @param pos - The position of the top level node
     * @param width - The width of the top level node
     * @param height - The height of the top level node
     * @param maxObjects - The maximum amount of objects per node before splitting
     * @param maxLevels - The maximum amount of levels
     */
    makeQuadtree(
        pos: Vec2,
        width: number,
        height: number,
        maxObjects: number,
        maxLevels: number,
        resizing: boolean,
    ): Quadtree | ResizingQuadtree;
    /**
     * The Random Number Generator.
     *
     * @since v2000.0
     * @group Math
     * @subgroup Random
     */
    RNG: typeof RNG;
    /**
     * A rule in a rule system for AI. Note that this is only for advanced scenarios where the default rules are inadequate.
     *
     * @since v4000.0
     * @group Math
     * @subgroup AI
     */
    Rule: typeof Rule;
    /**
     * A rule system for AI.
     *
     * @since v4000.0
     * @group Math
     * @subgroup AI
     */
    RuleSystem: typeof RuleSystem;
    /**
     * A node in a decision tree for AI.
     *
     * @since v4000.0
     * @group Math
     * @subgroup AI
     */
    DecisionNode: typeof DecisionNode;
    /**
     * A decision tree for AI.
     *
     * @since v4000.0
     * @group Math
     * @subgroup AI
     */
    DecisionTree: typeof DecisionTree;
    /**
     * A state machine for AI.
     *
     * @since v4000.0
     * @group Math
     * @subgroup AI
     */
    StateMachine: typeof StateMachine;
    /**
     * This object serves 2 purposes:
     *
     * * When called as a function, it defines a new scene with the
     *   name and the initializer function.
     * * It can also be used to register scene-local event handlers
     *   that will be automatically cancelled when the scene is left.
     *
     * @param name - The scene name.
     * @param def - The scene definition.
     *
     * @example
     * ```js
     * // define a scene
     * scene("game", () => {
     *     // ...
     * });
     * // get options
     * scene("game", (opts) => {
     *     debug.log(opts.level);
     * });
     * ```
     * @example
     * ```js
     * scene("pauseMenu", () => {
     *     scene.onKeyPress("tab", () => {
     *         debug.log("go to next menu item");
     *     });
     *     scene.onKeyPress("esc", () => {
     *         // go back to game and cancel menu events
     *         popScene();
     *     });
     * });
     * ```
     *
     * @group Scenes
     */
    scene: SceneScope;
    /**
     * Go to a scene, passing all rest args to scene callback.
     *
     * @param name - The scene name.
     * @param args - The rest args to pass to the scene callback.
     *
     * @example
     * ```js
     * // go to "game" scene
     * go("game");
     *
     * // go with options
     * go("game", { level: 1 });
     * ```
     *
     * @since v2000.0
     * @group Scenes
     */
    go(name: string, ...args: any): void;

    /**
     * Push the current active scene to a stack and then goes to the new scene
     *
     * @param id - The scene name.
     * @param args - The args passed to the scene definition.
     *
     * @example
     * ```js
     * scene("mainScene", () => {
     *     add([
     *         text("this is the first scene", { size: 32 }),
     *         pos(center()),
     *     ]);
     * });
     * scene("otherScene", () => {
     *     add([
     *         sprite("bean"),
     *         pos(center()),
     *     ]);
     * });
     *
     * pushScene("mainScene")
     * ```
     *
     * @since v3001.1
     * @group Scenes
     *
     * @see {@link popScene}
     */
    pushScene(id: string, ...args: unknown[]): void;

    /**
     * Pops the scene from the stack and set as current active scene.
     *
     * Only works if the current scene was entered using {@link pushScene}.
     *
     * @example
     * ```js
     * scene("mainScene", () => {
     *     add([
     *         text("this is the first scene", { size: 32 }),
     *         pos(center()),
     *     ]);
     * });
     * scene("otherScene", () => {
     *     add([
     *         sprite("bean"),
     *         pos(center()),
     *     ]);
     * });
     *
     * pushScene("mainScene");
     * popScene(); // return to the current scene
     * ```
     *
     * @since v3001.1
     * @group Scenes
     */
    popScene(): void;
    /**
     * Define the layer names. Should be called before any objects are made.
     *
     * @param layers - The layer names.
     * @param defaultLayer - The default layer name.
     *
     * @example
     * ```js
     * layers(["bg", "obj", "ui"], "obj")
     *
     * // no layer specified, will be added to "obj"
     * add([
     *      sprite("bean"),
     * ]);
     *
     * // add to "bg" layer
     * add([
     *     sprite("bg"),
     *     layer("bg"),
     * ]);
     * ```
     *
     * @since v3001.1
     * @group Rendering
     * @subgroup Layers
     */
    setLayers(layers: string[], defaultLayer: string): void;
    /**
     * Get the layer names.
     *
     * @returns The layer names or null if not set.
     * @since v3001.1
     * @group Rendering
     * @subgroup Layers
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1
     */
    getLayers(): string[] | null;
    /**
     * Get the default layer name.
     *
     * @returns The default layer name or null if not set.
     * @since v3001.0.5
     * @group Rendering
     * @subgroup Layers
     * @experimental This feature is in experimental phase, it will be fully released in v3001.1
     */
    getDefaultLayer(): string | null;
    /**
     * @deprecated Use {@link setLayers} instead.
     *
     * Define the layer names. Should be called before any objects are made.
     *
     * @param layers - The layer names.
     * @param defaultLayer - The default layer name.
     *
     * @example
     * ```js
     * setLayers(["bg", "obj", "ui"], "obj")
     *
     * // no layer specified, will be added to "obj"
     * add([
     *      sprite("bean"),
     * ]);
     *
     * // add to "bg" layer
     * add([
     *     sprite("bg"),
     *     layer("bg"),
     * ]);
     * ```
     *
     * @since v3001.0
     * @group Rendering
     * @subgroup Layers
     */
    layers(layers: string[], defaultLayer: string): void;
    /**
     * Construct a level based on symbols.
     *
     * @param map - The map data.
     * @param opt - The level options.
     * @param parent - The parent object of the level. Defaults to root.
     *
     * @example
     * ```js
     * addLevel([
     *     "                          $",
     *     "                          $",
     *     "           $$         =   $",
     *     "  %      ====         =   $",
     *     "                      =    ",
     *     "       ^^      = >    =   &",
     *     "===========================",
     * ], {
     *     // define the size of tile block
     *     tileWidth: 32,
     *     tileHeight: 32,
     *     // define what each symbol means, by a function returning a component list (what will be passed to add())
     *     tiles: {
     *         "=": () => [
     *             sprite("floor"),
     *             area(),
     *             body({ isStatic: true }),
     *         ],
     *         "$": () => [
     *             sprite("coin"),
     *             area(),
     *             pos(0, -9),
     *         ],
     *         "^": () => [
     *             sprite("spike"),
     *             area(),
     *             "danger",
     *         ],
     *     }
     * })
     * ```
     *
     * @returns A game obj with the level.
     * @since v2000.0
     * @group Game Obj
     *
     * @see {@link LevelComp `LevelComp`} The level component for more information in level methods.
     */
    addLevel(
        map: string[],
        opt: AddLevelOpt,
        parent?: GameObj,
    ): GameObj<PosComp | LevelComp>;
    /**
     * Get data from local storage, if not present can set to a default value.
     *
     * @param key - The key to get data from.
     * @param def - The default value to set if not found.
     *
     * @returns The data or null if not found.
     * @since v2000.0
     * @group Data
     */
    getData<T>(key: string, def?: T): T | null;
    /**
     * Set data from local storage.
     *
     * @param key - The key to set data to.
     * @param data - The data to set.
     *
     * @since v2000.0
     * @group Data
     */
    setData(key: string, data: any): void;
    /**
     * Draw a sprite.
     *
     * @param opt - The draw sprite options.
     *
     * @example
     * ```js
     * drawSprite({
     *     sprite: "bean",
     *     pos: vec2(100, 200),
     *     frame: 3,
     * });
     * ```
     *
     * @since v2000.0
     * @group Draw
     */
    drawSprite(opt: DrawSpriteOpt): void;
    /**
     * Draw a piece of text.
     *
     * @param opt - The draw text options.
     *
     * @example
     * ```js
     * drawText({
     *     text: "oh hi",
     *     size: 48,
     *     font: "sans-serif",
     *     width: 120,
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v2000.0
     * @group Draw
     */
    drawText(opt: DrawTextOpt): void;
    /**
     * Draw a rectangle.
     *
     * @param opt - The draw rect options.
     *
     * @example
     * ```js
     * drawRect({
     *     width: 120,
     *     height: 240,
     *     pos: vec2(20, 20),
     *     color: YELLOW,
     *     outline: { color: BLACK, width: 4 },
     * });
     * ```
     *
     * @since v2000.0
     * @group Draw
     */
    drawRect(opt: DrawRectOpt): void;
    /**
     * Draw a line.
     *
     * @param opt - The draw line options.
     *
     * @example
     * ```js
     * drawLine({
     *     p1: vec2(0),
     *     p2: mousePos(),
     *     width: 4,
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v3000.0
     * @group Draw
     */
    drawLine(opt: DrawLineOpt): void;
    /**
     * Draw lines.
     *
     * @param opt - The draw lines options.
     *
     * @example
     * ```js
     * drawLines({
     *     pts: [ vec2(0), vec2(0, height()), mousePos() ],
     *     width: 4,
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v3000.0
     * @group Draw
     */
    drawLines(opt: DrawLinesOpt): void;
    /**
     * Draw a curve.
     *
     * @example
     * ```js
     * drawCurve(t => evaluateBezier(a, b, c, d, t)
     * {
     *     width: 2,
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v3001.0
     * @group Draw
     */
    drawCurve(curve: (t: number) => Vec2, opt: DrawCurveOpt): void;
    /**
     * Draw a cubic Bezier curve.
     *
     * @param opt - The draw cubic bezier options.
     *
     * @example
     * ```js
     * drawBezier({
     *     pt1: vec2(100, 100),
     *     pt2: vec2(200, 100),
     *     pt3: vec2(200, 200),
     *     pt4: vec2(100, 200),
     *     width: 2,
     *     color: GREEN
     * });
     * ```
     *
     * @since v3001.0
     * @group Draw
     */
    drawBezier(opt: DrawBezierOpt): void;
    /**
     * Draw a triangle.
     *
     * @param opt - The draw triangle options.
     *
     * @example
     * ```js
     * drawTriangle({
     *     p1: vec2(0),
     *     p2: vec2(0, height()),
     *     p3: mousePos(),
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v3001.0
     * @group Draw
     */
    drawTriangle(opt: DrawTriangleOpt): void;
    /**
     * Draw a circle.
     *
     * @param opt - The draw circle options.
     *
     * @example
     * ```js
     * drawCircle({
     *     pos: vec2(100, 200),
     *     radius: 120,
     *     color: rgb(255, 255, 0),
     * });
     * ```
     *
     * @since v2000.0
     * @group Draw
     */
    drawCircle(opt: DrawCircleOpt): void;
    /**
     * Draw an ellipse.
     *
     * @param opt - The draw ellipse options.
     *
     * @example
     * ```js
     * drawEllipse({
     *     pos: vec2(100, 200),
     *     radiusX: 120,
     *     radiusY: 120,
     *     color: rgb(255, 255, 0),
     * });
     * ```
     *
     * @since v3000.0
     * @group Draw
     */
    drawEllipse(opt: DrawEllipseOpt): void;
    /**
     * Draw a convex polygon from a list of vertices.
     *
     * @param opt - The draw polygon options.
     *
     * @example
     * ```js
     * drawPolygon({
     *     pts: [
     *         vec2(-12),
     *         vec2(0, 16),
     *         vec2(12, 4),
     *         vec2(0, -2),
     *         vec2(-8),
     *     ],
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * });
     * ```
     *
     * @since v3000.0
     * @group Draw
     */
    drawPolygon(opt: DrawPolygonOpt): void;
    /**
     * Draw a rectangle with UV data.
     *
     * @param opt - The draw rect with UV options.
     *
     * @since v2000.0
     * @group Draw
     */
    drawUVQuad(opt: DrawUVQuadOpt): void;
    /**
     * Draw a piece of formatted text from formatText().
     *
     * @param text - The formatted text object.
     *
     * @example
     * ```js
     * // text background
     * const txt = formatText({
     *     text: "oh hi",
     * });
     *
     * drawRect({
     *     width: txt.width,
     *     height: txt.height,
     * });
     *
     * drawFormattedText(txt);
     * ```
     *
     * @since v2000.2
     * @group Draw
     */
    drawFormattedText(text: FormattedText): void;
    /**
     * Whatever drawn in content will only be drawn if it's also drawn in mask (mask will not be rendered).
     *
     * @since v3000.0
     * @group Draw
     */
    drawMasked(content: () => void, mask: () => void): void;
    /**
     * Subtract whatever drawn in content by whatever drawn in mask (mask will not be rendered).
     *
     * @since v3000.0
     * @group Draw
     */
    drawSubtracted(content: () => void, mask: () => void): void;
    /**
     * The exported Picture class to KAPLAY Context.
     *
     * @example
     * ```js
     * const k = kaplay();
     *
     * // You can use Picture class
     * new k.Picture()
     * ```
     *
     * @group Draw
     * @subgroup Picture
     */
    Picture: typeof Picture;
    /**
     * Selects the picture for drawing, erases existing data.
     *
     * @param picture - The picture to write drawing data to.
     *
     * @since v4000.0
     * @group Draw
     * @subgroup Picture
     */
    beginPicture(picture?: Picture): void;
    /**
     * Selects the picture for drawing, keeps existing data.
     *
     * @param picture - The picture to write drawing data to.
     *
     * @since v4000.0
     * @group Draw
     * @subgroup Picture
     */
    appendToPicture(picture?: Picture): void;
    /**
     * Deselects the current picture for drawing, returning the picture.
     *
     * @returns The picture which was previously selected.
     * @since v4000.0
     * @group Draw
     * @subgroup Picture
     */
    endPicture(): Picture;
    /**
     * Draws a picture to the screen. This function can not be used to draw recursively to a picture.
     *
     * @param picture - The picture to draw
     * @param opt - Drawing
     *
     * @since v4000.0
     * @group Draw
     * @subgroup Picture
     */
    drawPicture(picture: Picture, opt: DrawPictureOpt): void;
    /**
     * Push current transform matrix to the transform stack.
     *
     * @example
     * ```js
     * pushTransform();
     *
     * // These transforms will affect every render until popTransform()
     * pushTranslate(120, 200);
     * pushRotate(time() * 120);
     * pushScale(6);
     *
     * drawSprite("bean");
     * drawCircle(vec2(0), 120);
     *
     * // Restore the transformation stack to when last pushed
     * popTransform();
     * ```
     *
     * @since v2000.0
     * @group Rendering
     * @subgroup Stack
     */
    pushTransform(): void;
    /**
     * Pop the topmost transform matrix from the transform stack.
     *
     * @since v2000.0
     * @group Rendering
     * @subgroup Stack
     */
    popTransform(): void;
    /**
     * Translate all subsequent draws.
     *
     * @example
     * ```js
     * pushTranslate(100, 100)
     *
     * // this will be drawn at (120, 120)
     * drawText({
     *     text: "oh hi",
     *     pos: vec2(20, 20),
     * })
     * ```
     *
     * @since v2000.0
     * @group Rendering
     * @subgroup Stack
     */
    pushTranslate(t?: Vec2): void;
    /**
     * Scale all subsequent draws.
     *
     * @since v2000.0
     * @group Rendering
     * @subgroup Stack
     */
    pushScale(s?: Vec2): void;
    /**
     * Rotate all subsequent draws.
     *
     * @since v2000.0
     * @group Rendering
     * @subgroup Stack
     */
    pushRotate(angle?: number): void;
    /**
     * Apply a transform matrix, ignore all prior transforms.
     *
     * @since v3000.0
     * @group Rendering
     * @subgroup Stack
     */
    pushMatrix(mat?: Mat23): void;
    /**
     * Apply a post process effect from a shader name.
     *
     * @example
     * ```js
     * loadShader("invert", null, `
     * vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
     *     vec4 c = def_frag();
     *     return vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
     * }
     * `)
     *
     * usePostEffect("invert")
     * ```
     *
     * @since v3000.0
     * @group Rendering
     * @subgroup Shaders
     */
    usePostEffect(name: string, uniform?: Uniform | (() => Uniform)): void;
    /**
     * Format a piece of text without drawing (for getting dimensions, etc).
     *
     * @example
     * ```js
     * // text background
     * const txt = formatText({
     *     text: "oh hi",
     * });
     *
     * drawRect({
     *     width: txt.width,
     *     height: txt.height,
     * });
     *
     * drawFormattedText(txt);
     * ```
     *
     * @returns The formatted text object.
     * @since v2000.2
     * @group Rendering
     * @subgroup Text
     */
    formatText(options: DrawTextOpt): FormattedText;
    /**
     * Parses the text that has formatting tags, and returns the unstyled text
     * (the actual characters that will be displayed) as well as which styles are
     * active on each character.
     *
     * @since v4000
     * @group Rendering
     * @subgroup Text
     */
    compileStyledText(text: any): StyledTextInfo;
    /**
     * Create a canvas to draw stuff offscreen.
     *
     * @returns The canvas object.
     * @since v3001.0
     * @group Rendering
     * @subgroup Canvas
     */
    makeCanvas(w: number, h: number): Canvas;
    /**
     * Draw a canvas.
     *
     * @param opt - The canvas object.
     *
     * @since v4000.0
     * @group Draw
     */
    drawCanvas(opt: DrawCanvasOpt): void;
    /**
     * The Debug interface for debugging stuff.
     *
     * @example
     * ```js
     * // pause the whole game
     * debug.paused = true
     *
     * // enter inspect mode
     * debug.inspect = true
     * ```
     *
     * @returns The debug interface.
     * @since v2000.0
     * @group Debug
     */
    debug: Debug;
    /**
     * The app scope for creating global events that won't be automatically cancelled
     * when the scene is changed.
     *
     * @example
     * ```js
     * app.onKeyPress("f", () => {
     *     debug.log("i run in every scene from now on");
     * });
     *
     * // will NOT cancel the event
     * go("someScene");
     * ```
     */
    app: AppScope;
    /**
     * Import a plugin.
     *
     * @param plugin - The plugin to import.
     *
     * @returns The updated context with the plugin.
     * @since v2000.0
     * @group Plugins
     */
    plug<T extends Record<string, any>>(plugin: KAPLAYPlugin<T>): KAPLAYCtx & T;
    /**
     * Runs a system at the specified events in the pipeline
     *
     * @param name - The name of the system. Overwrites an existing system if the name has been used before.
     * @param cb - The function to run.
     * @param when - When to run the function. See {@link SystemPhase} for more info on the 6 phases when the system can be run.
     *
     * @since v4000.0
     * @group Plugins
     */
    system(name: string, cb: () => void, when: SystemPhase[]): void;
    /**
     * This enum defines the 6 places where a new system can hook into in KAPLAY's update loop.
     *
     * * `BeforeUpdate` and `AfterUpdate` - run once at the start of the frame, before and after all objects' `update()` hooks are run
     * * `BeforeDraw` and `AfterDraw` - run once per frame while the graphics context is setup, before and after all objects' `draw()` hooks are run
     * * `BeforeFixedUpdate` and `AfterFixedUpdate` - run 50 times per second independent of graphics/update framerate, before and after all objects' `fixedUpdate()` hooks are run
     *
     * @group Plugins
     */
    SystemPhase: typeof SystemPhase;
    /**
     * Take a screenshot and get the PNG data url of the image.
     *
     * @returns The dataURL of the PNG image.
     * @since v2000.0
     * @group Debug
     */
    screenshot(): string;
    /**
     * Take a screenshot and get the PNG data as a blob.
     *
     * @returns The blob of the image.
     * @since v4000.0
     * @group Debug
     */
    screenshotToBlob(): Promise<Blob>;
    /**
     * Trigger a file download from a url.
     *
     * @since v3000.0
     * @group Data
     */
    download(filename: string, dataurl: string): void;
    /**
     * Trigger a text file download.
     *
     * @since v3000.0
     * @group Data
     */
    downloadText(filename: string, text: string): void;
    /**
     * Trigger a json download from a .
     *
     * @since v3000.0
     * @group Data
     */
    downloadJSON(filename: string, data: any): void;
    /**
     * Trigger a file download from a blob.
     *
     * @since v3000.0
     * @group Data
     */
    downloadBlob(filename: string, blob: Blob): void;
    /**
     * Start recording the canvas into a video.
     *
     * Note: This relies on the browser's support using the `MediaRecorder`
     * API, and support is buggy at best from my (@dragoncoder047)'s testing.
     * The best results I have gotten are with explicitly specifying `video/webm`
     * and 60 FPS.
     *
     * Results with the default values are usually no good and even if both MIME
     * type and framerate are specified, dropped frames, truncated videos,
     * audio desynchronization, and even completely corrupted files have been gotten
     * from this. `video/mp4` is technically supported by some browsers but I can't
     * recommend it as MP4 has produced glitched and/or corrupted files much more often
     * than WebM in my testing.
     *
     * If your players want to get a nice clean recording it's probably a better
     * idea to point them to an external screen-recording program such as
     * [OBS](https://obsproject.com).
     *
     * @param frameRate - Target frame rate for the output video.
     * If framerate is not specified, a new frame will be captured each
     * time the canvas changes.
     * @param mimeTypes - A list of MIME types such as `video/mp4`, `video/webm`.
     * The browser will select the first one it can do when the recording is started.
     * If none are supported, an error will be thrown.
     *
     * @returns A control handle.
     * @since v2000.1
     * @group Debug
     */
    record(frameRate?: number, mimeTypes?: string[]): Recording;
    /**
     * Add an explosion effect.
     *
     * @param pos - The position of the explosion.
     * @param opt - The options for the explosion.
     *
     * @example
     * ```js
     * onMousePress(() => {
     *     addKaboom(mousePos());
     * });
     * ```
     *
     * @returns The explosion object.
     * @since v2000.0
     * @group Game Obj
     */
    addKaboom(pos: Vec2, opt?: BoomOpt): GameObj;
    /**
     * All chars in ASCII.
     *
     * @since v2000.0
     * @group Constants
     */
    ASCII_CHARS: string;
    /**
     * Left directional vector vec2(-1, 0).
     *
     * @since v2000.0
     * @group Constants
     */
    LEFT: Vec2;
    /**
     * Right directional vector vec2(1, 0).
     *
     * @since v2000.0
     * @group Constants
     */
    RIGHT: Vec2;
    /**
     * Up directional vector vec2(0, -1).
     *
     * @since v2000.0
     * @group Constants
     */
    UP: Vec2;
    /**
     * Down directional vector vec2(0, 1).
     *
     * @since v2000.0
     * @group Constants
     */
    DOWN: Vec2;
    /**
     * Red color.
     *
     * @since v2000.0
     * @group Constants
     */
    RED: Color;
    /**
     * Green color.
     *
     * @since v2000.0
     * @group Constants
     */
    GREEN: Color;
    /**
     * Blue color.
     *
     * @since v2000.0
     * @group Constants
     */
    BLUE: Color;
    /**
     * Yellow color.
     *
     * @since v2000.0
     * @group Constants
     */
    YELLOW: Color;
    /**
     * Cyan color.
     *
     * @since v2000.0
     * @group Constants
     */
    MAGENTA: Color;
    /**
     * Cyan color.
     *
     * @since v2000.0
     * @group Constants
     */
    CYAN: Color;
    /**
     * White color.
     *
     * @since v2000.0
     * @group Constants
     */
    WHITE: Color;
    /**
     * Black color.
     *
     * @since v2000.0
     * @group Constants
     */
    BLACK: Color;
    /**
     * The canvas DOM KAPLAY is currently using.
     *
     * @since v2000.0
     * @group Info
     */
    canvas: HTMLCanvasElement;
    /**
     * EventHandler for one single event.
     *
     * @since v3000.0
     * @group Events
     */
    KEvent: typeof KEvent;
    /**
     * EventHandler for multiple events.
     *
     * @since v3000.0
     * @group Events
     */
    KEventHandler: typeof KEventHandler;
    /**
     * The object that can pause or cancel an event.
     *
     * @since v3000.0
     * @group Events
     */
    KEventController: typeof KEventController;
    /**
     * Cancels the event by returning the cancel symbol.
     *
     * @example
     * ```js
     * onKeyPress((key) => {
     *     if (key === "q") return cancel();
     * });
     * ```
     *
     * @returns The cancel event symbol.
     * @since v4000.0
     * @group Events
     */
    cancel: () => Symbol;
    /**
     * Flags indicating which transform components to keep. When used, the aspect of the transform will not change visually
     * even if the parent transform is different. For example a sprite pointing west, will keep pointing west, even if the
     * parent transform applies a rotation with an angle different from 0. This is only applied once, during switching parents.
     *
     * @since v3000.0
     * @group Game Obj
     * @subgroup Types
     */
    KeepFlags: typeof KeepFlags;
    /**
     * BlendMode.Normal Normal alpha blending
     * BlendMode.Add Additive blending
     * BlendMode.Multiply multiplicative blending
     * BlendMode.Screen Screen blending
     *
     * @since v4000.0
     * @group Constants
     */
    BlendMode: typeof BlendMode;
    /**
     * Current KAPLAY library version.
     *
     * @since v3000.0
     * @group Info
     */
    VERSION: string;
}
