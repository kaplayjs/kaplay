import type { ButtonBinding, ButtonBindingDevice, ButtonsDef } from "./app";
import type {
    AsepriteData,
    Asset,
    BitmapFontData,
    LoadBitmapFontOpt,
    LoadSpriteOpt,
    LoadSpriteSrc,
    ShaderData,
    SoundData,
    SpriteAtlasData,
    SpriteData,
    Uniform,
} from "./assets";
import type { FontData } from "./assets/font";
import type { AudioPlay, AudioPlayOpt } from "./audio";
import type {
    AgentComp,
    AgentCompOpt,
    AnchorComp,
    AnimateComp,
    AnimateCompOpt,
    AreaComp,
    AreaCompOpt,
    AreaEffectorComp,
    AreaEffectorCompOpt,
    BodyComp,
    BodyCompOpt,
    BuoyancyEffectorComp,
    BuoyancyEffectorCompOpt,
    CircleComp,
    CircleCompOpt,
    ColorComp,
    ConstantForceComp,
    ConstantForceCompOpt,
    DoubleJumpComp,
    FakeMouseComp,
    FakeMouseOpt,
    FixedComp,
    FollowComp,
    HealthComp,
    LayerComp,
    LifespanCompOpt,
    MaskComp,
    NamedComp,
    OffScreenComp,
    OffScreenCompOpt,
    OpacityComp,
    OutlineComp,
    PathfinderComp,
    PathfinderCompOpt,
    PatrolComp,
    PatrolCompOpt,
    PlatformEffectorComp,
    PlatformEffectorCompOpt,
    PointEffectorComp,
    PointEffectorCompOpt,
    PolygonComp,
    PolygonCompOpt,
    PosComp,
    RectComp,
    RectCompOpt,
    RotateComp,
    ScaleComp,
    SentryCandidates,
    SentryComp,
    SentryCompOpt,
    ShaderComp,
    SpriteComp,
    SpriteCompOpt,
    StateComp,
    StayComp,
    SurfaceEffectorComp,
    SurfaceEffectorCompOpt,
    TextComp,
    TextCompOpt,
    TextInputComp,
    TileComp,
    TileCompOpt,
    TimerComp,
    UVQuadComp,
    ZComp,
} from "./components/";
import type { EllipseComp } from "./components/draw/ellipse";
import type {
    EmitterOpt,
    ParticlesComp,
    ParticlesOpt,
} from "./components/draw/particles";
import type {
    BoomOpt,
    GameObjEventMap,
    GameObjEventNames,
    LevelOpt,
    SceneDef,
    SceneName,
    TupleWithoutFirst,
} from "./game";
import type {
    DrawBezierOpt,
    DrawCircleOpt,
    DrawCurveOpt,
    DrawLineOpt,
    DrawLinesOpt,
    DrawRectOpt,
    DrawSpriteOpt,
    DrawTextOpt,
    DrawTriangleOpt,
    FormattedText,
    FrameBuffer,
    LineCap,
    LineJoin,
    Texture,
} from "./gfx";
import type { GjkCollisionResult } from "./math";
import type { Color, RGBAValue, RGBValue } from "./math/color";
import type {
    Circle,
    Ellipse,
    Line,
    Mat23,
    Mat4,
    Point,
    Polygon,
    Quad,
    RaycastResult,
    Rect,
    RNG,
    StepPosition,
    Vec2,
    Vec2Args,
} from "./math/math";
import type { NavMesh } from "./math/navigationmesh";
import type { KEvent, KEventController, KEventHandler } from "./utils/";

/**
 * Context handle that contains every kaboom function.
 *
 * @group Start
 */
export interface KAPLAYCtx<
    TButtonDef extends ButtonsDef = {},
    TButton extends string = string,
> {
    /**
     * Assemble a game object from a list of components, and add it to the game
     *
     * @returns The added game object that contains all properties and methods each component offers.
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
     * ])
     *
     * // .jump is provided by body()
     * player.jump()

     * // .moveTo is provided by pos()
     * player.moveTo(300, 200)
     *
     * // .onUpdate() is on every game object, it registers an event that runs every frame
     * player.onUpdate(() => {
     *     // .move() is provided by pos()
     *     player.move(player.dir.scale(player.speed))
     * })
     *
     * // .onCollide is provided by area()
     * player.onCollide("tree", () => {
     *     destroy(player)
     * })
     * ```
     *
     * @group Game Obj
     */
    add<T>(comps?: CompList<T> | GameObj<T>): GameObj<T>;
    /**
     * Create a game object like add(), but not adding to the scene.
     *
     * @since v3000.1
     *
     * @example
     * ```js
     * const label = make([
     *     rect(100, 20),
     * ]);
     *
     * // Add a new text to the label
     * label.add([
     *     text("Hello, world!"),
     * ]);
     *
     * // Add game object to the scene
     * // Now it will render
     * add(label);
     * ```
     *
     * @group Game Obj
     */
    make<T>(comps?: CompList<T>): GameObj<T>;
    /**
     * Remove and re-add the game obj, without triggering add / destroy events.
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
     *     readd(greenBean)
     * });
     *
     * greenBean.onClick(() => {
     *     readd(purpleBean)
     * });
     * ```
     *
     * @group Game Obj
     */
    readd(obj: GameObj): void;
    /**
     * Get a list of all game objs with certain tag.
     *
     * @example
     * ```js
     * // get a list of all game objs with tag "bomb"
     * const allBombs = get("bomb")
     *
     * // To get all objects use "*"
     * const allObjs = get("*")
     *
     * // Recursively get all children and descendents
     * const allObjs = get("*", { recursive: true })
     * ```
     *
     * @group Game Obj
     */
    get<T = any>(tag: Tag | Tag[], opts?: GetOpt): GameObj<T>[];
    /**
     * Get a list of game objects in an advanced way.
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
     * ```
     *
     * @group Game Obj
     */
    query(opt: QueryOpt): GameObj[];
    /**
     * Remove the game obj.
     *
     * @example
     * ```js
     * // every time bean collides with anything with tag "fruit", remove it
     * bean.onCollide("fruit", (fruit) => {
     *     destroy(fruit)
     * })
     * ```
     *
     * @group Game Obj
     */
    destroy(obj: GameObj): void;
    /**
     * Remove all game objs with certain tag.
     *
     * @example
     * ```js
     * // destroy all objects with tag "bomb" when you click one
     * onClick("bomb", () => {
     *     destroyAll("bomb")
     * })
     * ```
     *
     * @group Game Obj
     */
    destroyAll(tag: Tag): void;
    /**
     * Set the position of a Game Object.
     *
     * @example
     * ```js
     * // This game object will draw a "bean" sprite at (100, 200)
     * add([
     *     pos(100, 200),
     *     sprite("bean"),
     * ])
     * ```
     *
     * @group Components
     */
    pos(x: number, y: number): PosComp;
    pos(xy: number): PosComp;
    pos(p: Vec2): PosComp;
    pos(): PosComp;
    /**
     * Set the scale of a Game Object.
     *
     * @example
     * ```js
     * // scale uniformly with one value
     * add([
     *     sprite("bean"),
     * 	   scale(3),
     * ])
     * // scale with x & y values. In this case, scales more horizontally.
     * add([
     *     sprite("bean"),
     * 	   scale(3, 1),
     * ])
     *  // scale with vec2(x,y).
     * bean.scale = vec2(2,4)
     *
     * ```
     *
     * @group Components
     */
    scale(x: number, y: number): ScaleComp;
    scale(xy: number): ScaleComp;
    scale(s: Vec2): ScaleComp;
    scale(): ScaleComp;
    /**
     * Rotates a Game Object (in degrees).
     *
     * @param a The angle to rotate by. Defaults to 0.
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

    * @group Components
     */
    rotate(a?: number): RotateComp;
    /**
     * Sets the color of a Game Object (rgb 0-255).
     *
     * @example
     * ```js
     * // blue frog
     * add([
     *     sprite("bean"),
     *     color(0, 0, 255)
     * ])
     * ```
     *
     * @group Components
     */
    color(r: number, g: number, b: number): ColorComp;
    color(c: Color): ColorComp;
    color(rgb: [number, number, number]): ColorComp;
    color(c: string): ColorComp;
    color(): ColorComp;
    /**
     * Sets the opacity of a Game Object (0.0 - 1.0).
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
     * @group Components
     */
    opacity(o?: number): OpacityComp;
    /**
     * Attach and render a sprite to a Game Object.
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
     * @group Components
     */
    sprite(
        spr: string | SpriteData | Asset<SpriteData>,
        options?: SpriteCompOpt,
    ): SpriteComp;
    /**
     * Attach and render a text to a Game Object.
     *
     * @param txt The text to display.
     * @param options Options for the text component. See {@link TextCompOpt}.
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
     * @group Components
     */
    text(txt?: string, options?: TextCompOpt): TextComp;
    /**
     * Attach and render a polygon to a Game Object.
     *
     * @since v3001.0
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
     * @group Components
     */
    polygon(pts: Vec2[], opt?: PolygonCompOpt): PolygonComp;
    /**
     * Attach and render a rectangle to a Game Object.
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
     * @group Components
     */
    rect(w: number, h: number, opt?: RectCompOpt): RectComp;
    /**
     * Attach and render a circle to a Game Object.
     *
     * @example
     * ```js
     * add([
     *     pos(80, 120),
     *     circle(16),
     * ])
     * ```
     *
     * @group Components
     */
    circle(radius: number, opt?: CircleCompOpt): CircleComp;
    /**
     * Attach and render an ellipse to a Game Object.
     *
     * @example
     * ```js
     * add([
     *     pos(80, 120),
     *     ellipse(16, 8),
     * ])
     * ```
     *
     * @group Components
     */
    ellipse(radiusX: number, radiusY: number): EllipseComp;
    /**
     * Attach and render a UV quad to a Game Object.
     *
     * @example
     * ```js
     * add([
     *     uvquad(width(), height()),
     *     shader("spiral"),
     * ])
     * ```
     *
     * @since v4000.0
     * @group Components
     */
    uvquad(w: number, h: number): UVQuadComp;
    /**
     * Attach a collider area from shape and enables collision detection in a Game Object.
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
     * @group Components
     */
    area(): AreaComp;
    area(options: AreaCompOpt): AreaComp;
    /**
     * Anchor point for render (default "topleft").
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
     * @group Components
     */
    anchor(o: Anchor | Vec2): AnchorComp;
    /**
     * Determines the draw order for objects on the same layer. Object will be drawn on top if z value is bigger.
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
     * @group Components
     */
    z(z: number): ZComp;
    /**
     * Determines the layer for objects. Object will be drawn on top if the layer index is higher.
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
     *
     * @group Components
     */
    layer(name: string): LayerComp;
    /**
     * Give obj an outline.
     *
     * @group Components
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
     * @param popt The options for the particles.
     * @param eopt The options for the emitter.
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
     * @group Components
     * @since v3001.0
     */
    particles(popt: ParticlesOpt, eopt: EmitterOpt): ParticlesComp;
    /**
     * Physical body that responds to gravity. Requires "area" and "pos" comp. This also makes the object "solid".
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
     * @group Components
     */
    body(options?: BodyCompOpt): BodyComp;
    /**
     * Applies a force on a colliding object in order to make it move along the collision tangent vector.
     * Good for conveyor belts.
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
     * @since v3001.0
     * @group Components
     */
    surfaceEffector(options: SurfaceEffectorCompOpt): SurfaceEffectorComp;
    /**
     * Applies a force on a colliding object.
     * Good to apply anti-gravity, wind or water flow.
     *
     * @since v3001.0
     * @group Components
     */
    areaEffector(options: AreaEffectorCompOpt): AreaEffectorComp;
    /**
     * Applies a force on a colliding object directed towards this object's origin.
     * Good to apply magnetic attraction or repulsion.
     *
     * @since v3001.0
     * @group Components
     */
    pointEffector(options: PointEffectorCompOpt): PointEffectorComp;
    /**
     * The platform effector makes it easier to implement one way platforms
     * or walls. This effector is typically used with a static body, and it
     * will only be solid depending on the direction the object is traveling from.
     *
     * @since v3001.0
     * @group Components
     */
    platformEffector(options?: PlatformEffectorCompOpt): PlatformEffectorComp;
    /**
     * Applies an upwards force (force against gravity) to colliding objects depending on the fluid density and submerged area.
     * Good to apply constant thrust.
     *
     * @since v3001.0
     * @group Components
     */
    buoyancyEffector(options: BuoyancyEffectorCompOpt): BuoyancyEffectorComp;
    /**
     * Applies a constant force to the object.
     * Good to apply constant thrust.
     *
     * @since v3001.0
     * @group Components
     */
    constantForce(opts: ConstantForceCompOpt): ConstantForceComp;
    /**
     * Enables double jump. Requires "body" component.
     *
     * @since v3000.0
     * @group Components
     */
    doubleJump(numJumps?: number): DoubleJumpComp;
    /**
     * Move towards a direction infinitely, and destroys when it leaves game view. Requires "pos" component.
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
     * @group Components
     */
    move(direction: number | Vec2, speed: number): EmptyComp;
    /**
     * Control the behavior of object when it goes out of view.
     *
     * @since v2000.2
     *
     * @example
     * ```js
     * add([
     *     pos(player.pos),
     *     sprite("bullet"),
     *     offscreen({ destroy: true }),
     *     "projectile",
     * ])
     * ```
     *
     * @group Components
     */
    offscreen(opt?: OffScreenCompOpt): OffScreenComp;
    /**
     * Follow another game obj's position.
     *
     * @example
     * ```js
     * const bean = add(...)
     *
     * add([
     *   sprite("bag"),
     *   pos(),
     *   follow(bean) // Follow bean's position
     * ])
     * ```
     *
     * @example
     * ```js
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
     * @group Components
     */
    follow(obj: GameObj | null, offset?: Vec2): FollowComp;
    /**
     * Custom shader to manipulate sprite.
     *
     * @group Components
     */
    shader(id: string, uniform?: Uniform | (() => Uniform)): ShaderComp;
    /**
     * Get input from the user and store it in the nodes text property, displaying it with the text component and allowing other functions to access it.
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
     * @group Components
     */
    textInput(hasFocus?: boolean, maxInputLength?: number): TextInputComp;
    /**
     * Enable timer related functions like wait(), loop(), tween() on the game object.
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
     * @group Components
     */
    timer(): TimerComp;
    /**
     * Make object unaffected by camera or parent object transforms, and render at last.
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
     * @group Components
     */
    fixed(): FixedComp;
    /**
     * Don't get destroyed on scene switch. Only works in objects attached to root.
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
     * @group Components
     */
    stay(scenesToStay?: string[]): StayComp;
    /**
     * Handles health related logic and events.
     *
     * @example
     * ```js
     * const player = add([
     *     health(3),
     * ])
     *
     * player.onCollide("bad", (bad) => {
     *     player.hurt(1)
     *     bad.hurt(1)
     * })
     *
     * player.onCollide("apple", () => {
     *     player.heal(1)
     * })
     *
     * player.on("hurt", () => {
     *     play("ouch")
     * })
     *
     * // triggers when hp reaches 0
     * player.on("death", () => {
     *     destroy(player)
     *     go("lose")
     * })
     * ```
     *
     * @group Components
     */
    health(hp: number, maxHP?: number): HealthComp;
    /**
     * Destroy the game obj after certain amount of time
     *
     * @example
     * ```js
     * // spawn an explosion, destroy after 1 seconds, start fading away after 0.5 second
     * add([
     *     sprite("explosion", { anim: "burst", }),
     *     lifespan(1, { fade: 0.5 }),
     * ])
     * ```
     *
     * @group Components
     */
    lifespan(time: number, options?: LifespanCompOpt): EmptyComp;
    /**
     * Names an object.
     *
     * @since v3001.0
     * @group Components
     */
    named(name: string): NamedComp;
    /**
     * Finite state machine.
     *
     * @since v2000.1
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
     * @group Components
     */
    state(initialState: string, stateList?: string[]): StateComp;
    /**
     * state() with pre-defined transitions.
     *
     * @since v2000.2
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
     * @group Components
     */
    state(
        initialState: string,
        stateList: string[],
        transitions: Record<string, string | string[]>,
    ): StateComp;
    /**
     * Fade object in.
     *
     * Uses opacity for finding what to fade into and to set opacity during fade animation.
     *
     * @since v3000.0
     * @group Components
     * @deprecated since v3001.0
     */
    fadeIn(time: number): Comp;
    /**
     * Mask all children object render.
     *
     * @since v3001.0
     * @group Components
     */
    mask(maskType?: Mask): MaskComp;
    /**
     * Specifies the FrameBuffer the object should be drawn on.
     *
     * @example
     * ```js
     * // Draw on another canvas
     * let canvas = makeCanvas(width(), height())
     *
     * let beanOnCanvas = add([
     *     sprite("bean"),
     *     drawon(canvas.fb),
     * ])
     * ```
     *
     * @param canvas
     */
    drawon(canvas: FrameBuffer): Comp;
    /**
     * A tile on a tile map.
     *
     * @since v3000.0
     * @group Components
     */
    tile(opt?: TileCompOpt): TileComp;
    /**
     * An agent which can finds it way on a tilemap.
     *
     * @since v3000.0
     * @group Components
     */
    agent(opt?: AgentCompOpt): AgentComp;
    /**
     * A component to animate properties.
     *
     * @example
     * ```js
     * let movingBean = add([
     *       sprite("bean"),
     *       pos(50, 150),
     *       anchor("center"),
     *       animate(),
     * ]);
     *
     * // Moving right to left using ping-pong
     * movingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], {
     *     duration: 2,
     *     direction: "ping-pong",
     * });
     * ```
     *
     * @since v3001.0
     * @group Components
     */
    animate(opt?: AnimateCompOpt): AnimateComp;
    /**
     * A fake mouse that follows the mouse position and triggers events.
     *
     * [Guide about fake mouse](https://kaplayjs.com/guides/fake-mouse)
     */
    fakeMouse(opt?: FakeMouseOpt): FakeMouseComp;
    /**
     * Serializes the animation to plain objects
     */
    serializeAnimation(obj: GameObj, name: string): Animation;
    /**
     * A sentry which reacts to objects coming into view.
     *
     * @since v3001.0
     * @group Components
     */
    sentry(candidates: SentryCandidates, opt?: SentryCompOpt): SentryComp;
    /**
     * A patrol which can follow waypoints to a goal.
     *
     * @since v3001.0
     * @group Components
     */
    patrol(opts: PatrolCompOpt): PatrolComp;
    /**
     * A navigator pathfinder which can calculate waypoints to a goal.
     *
     * @since v3001.0
     * @group Components
     */
    pathfinder(opts: PathfinderCompOpt): PathfinderComp;
    /**
     * @group Math
     */
    raycast(origin: Vec2, direction: Vec2, exclude?: string[]): RaycastResult;
    /**
     * Register an event on all game objs with certain tag.
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
     * // by passing a name and a callback function
     * on("talk", (message, posX, posY) => {
     *     add([
     *      text(message),
     *      pos(posX, posY - 100)
     *     ])
     * })
     * onKeyPress("space", () => {
     *    // the trigger method on game objs can be used to trigger a custom event
     *    npc.trigger("talk", "Hello World!", npc.pos.x, npc.pos.y)
     * })
     *
     * ```
     * @group Events
     */
    on<Ev extends GameObjEventNames | (string & {})>(
        event: Ev,
        tag: Tag,
        action: (
            obj: GameObj,
            ...args: TupleWithoutFirst<GameObjEventMap[Ev]>
        ) => void,
    ): KEventController;
    /**
     * Register an event that runs at a fixed framerate.
     *
     * @since v3000.1
     */
    onFixedUpdate(cb: () => void): KEventController;
    onFixedUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag.
     *
     * @since v2000.1
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
     * @group Events
     */
    onUpdate(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second).
     *
     * @since v2000.1
     *
     * @example
     * ```js
     * // This will run every frame
     * onUpdate(() => {
     *     debug.log("ohhi")
     * })
     * ```
     * @group Events
     */
    onUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) for all game objs with certain tag (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @since v2000.1
     * @group Events
     */
    onDraw(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame (~60 times per second) (this is the same as onUpdate but all draw events are run after update events, drawXXX() functions only work in this phase).
     *
     * @since v2000.1
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
     * @group Events
     */
    onDraw(action: () => void): KEventController;
    /**
     * @group Events
     */
    onAdd(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * @group Events
     */
    onAdd(action: (obj: GameObj) => void): KEventController;
    /**
     * @group Events
     */
    onDestroy(tag: Tag, action: (obj: GameObj) => void): KEventController;
    /**
     * @group Events
     */
    onDestroy(action: (obj: GameObj) => void): KEventController;
    /**
     * Register an event that runs when all assets finished loading.
     *
     * @since v2000.1
     *
     * @example
     * ```js
     * const bean = add([
     *     sprite("bean"),
     * ])
     *
     * // certain assets related data are only available when the game finishes loading
     * onLoad(() => {
     *     debug.log(bean.width)
     * })
     * ```
     * @group Events
     */
    onLoad(action: () => void): KEventController | undefined;
    /**
     * Register an event that runs every frame when assets are initially loading. Can be used to draw a custom loading screen.
     *
     * @since v3000.0
     * @group Events
     */
    onLoading(action: (progress: number) => void): KEventController;
    /**
     * Register a custom error handler. Can be used to draw a custom error screen.
     *
     * @since v3000.0
     * @group Events
     */
    onError(action: (err: Error) => void): KEventController;
    /**
     * Register an event that runs when the canvas resizes.
     *
     * @since v3000.0
     * @group Events
     */
    onResize(action: () => void): KEventController;
    /**
     * Cleanup function to run when quit() is called.
     *
     * @since v3000.0
     * @group Events
     */
    onCleanup(action: () => void): void;
    /**
     * Register an event that runs when a gamepad is connected.
     *
     * @since v3000.0
     * @group Input
     */
    onGamepadConnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs when a gamepad is disconnected.
     *
     * @since v3000.0
     * @group Input
     */
    onGamepadDisconnect(action: (gamepad: KGamepad) => void): KEventController;
    /**
     * Register an event that runs once when 2 game objs with certain tags collides (required to have area() component).
     *
     * @since v2000.1
     *
     * @example
     * ```js
     * onCollide("sun", "earth", () => {
     *     addExplosion()
     * })
     * ```
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
     * @since v3000.0
     *
     * @example
     * ```js
     * onCollideUpdate("sun", "earth", () => {
     *     runWorldEndTimer()
     * })
     * ```
     *
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
     * @since v3000.0
     *
     * @example
     * ```js
     * onCollideEnd("bean", "earth", () => {
     *     worldEnd()
     * })
     * ```
     *
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
     * @since v2000.1
     *
     * @example
     * ```js
     * // click on any "chest" to open
     * onClick("chest", (chest) => chest.open())
     * ```
     *
     * @group Input
     */
    onClick(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs when users clicks.
     *
     * @example
     * ```js
     * // click on anywhere to go to "game" scene
     * onClick(() => go("game"))
     * ```
     *
     * @since v2000.1
     */
    onClick(action: () => void): KEventController;
    /**
     * Register an event that runs once when game objs with certain tags are hovered (required to have area() component).
     *
     * @since v3000.0
     * @group Events
     */
    onHover(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame when game objs with certain tags are hovered (required to have area() component).
     *
     * @example
     * ```js
     * // Rotate bean 90 degrees per second when hovered
     * onHoverUpdate("bean", (bean) => {
     *   bean.angle += dt() * 90
     * })
     * ```
     *
     * @since v3000.0
     * @group Events
     */
    onHoverUpdate(tag: Tag, onHover: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs once when game objs with certain tags are unhovered (required to have area() component).
     *
     * @since v3000.0
     * @group Events
     */
    onHoverEnd(tag: Tag, action: (a: GameObj) => void): KEventController;
    /**
     * Register an event that runs every frame when a key is held down.
     *
     * @example
     * ```js
     * // move left by SPEED pixels per frame every frame when left arrow key is being held down
     * onKeyDown("left", () => {
     *     bean.move(-SPEED, 0)
     * })
     * ```
     *
     * @since v2000.1
     * @group Input
     */
    onKeyDown(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs every frame when any key is held down.
     *
     * @since v2000.1
     * @group Input
     */
    onKeyDown(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys.
     *
     * @example
     * ```js
     * // .jump() once when "space" is just being pressed
     * onKeyPress("space", () => {
     *     bean.jump()
     * });
     *
     * onKeyPress(["up", "space"], () => {
     *     bean.jump()
     * });
     * ```
     *
     * @since v2000.1
     * @group Input
     */
    onKeyPress(key: Key | Key[], action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses any key.
     *
     * @example
     * ```js
     * // Call restart() when player presses any key
     * onKeyPress((key) => {
     *     debug.log(`key pressed ${key}`)
     *     restart()
     * })
     * ```
     *
     * @since v3001.0
     * @group Input
     */
    onKeyPress(action: (key: Key) => void): KEventController;
    /**
     * Register an event that runs when user presses certain keys (also fires repeatedly when the keys are being held down).
     *
     * @example
     * ```js
     * // delete last character when "backspace" is being pressed and held
     * onKeyPressRepeat("backspace", () => {
     *     input.text = input.text.substring(0, input.text.length - 1)
     * })
     * ```
     *
     * @since v3000.1
     * @group Input
     */
    onKeyPressRepeat(
        k: Key | Key[],
        action: (k: Key) => void,
    ): KEventController;
    onKeyPressRepeat(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user release certain keys.
     *
     * @since v2000.1
     * @group Input
     */
    onKeyRelease(k: Key | Key[], action: (k: Key) => void): KEventController;
    onKeyRelease(action: (k: Key) => void): KEventController;
    /**
     * Register an event that runs when user inputs text.
     *
     * @since v2000.1
     *
     * @example
     * ```js
     * // type into input
     * onCharInput((ch) => {
     *     input.text += ch
     * })
     * ```
     * @group Input
     */
    onCharInput(action: (ch: string) => void): KEventController;
    /**
     * Register an event that runs every frame when certain mouse buttons are being held down.
     *
     * @since v3001.0
     * @group Input
     */
    onMouseDown(
        button: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    onMouseDown(action: (m: MouseButton) => void): KEventController;
    /**
     * Register an event that runs when user clicks mouse.
     *
     * @since v3001.0
     * @group Input
     */
    onMousePress(action: (m: MouseButton) => void): KEventController;
    onMousePress(
        button: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases mouse.
     *
     * @since v3001.0
     * @group Input
     */
    onMouseRelease(action: (m: MouseButton) => void): KEventController;
    onMouseRelease(
        button: MouseButton | MouseButton[],
        action: (m: MouseButton) => void,
    ): KEventController;
    /**
     * Register an event that runs whenever user move the mouse.
     *
     * @since v2000.1
     * @group Input
     */
    onMouseMove(action: (pos: Vec2, delta: Vec2) => void): KEventController;
    /**
     * Register an event that runs when a touch starts.
     *
     * @since v2000.1
     * @group Input
     */
    onTouchStart(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs whenever touch moves.
     *
     * @since v2000.1
     * @group Input
     */
    onTouchMove(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when a touch ends.
     *
     * @since v2000.1
     * @group Input
     */
    onTouchEnd(action: (pos: Vec2, t: Touch) => void): KEventController;
    /**
     * Register an event that runs when mouse wheel scrolled.
     *
     * @example
     * ```js
     * // Zoom camera on scroll
     * onScroll((delta) => {
     *     const zoom = delta.y / 500
     *     camScale(camScale().add(zoom))
     * })
     * ```
     *
     * @since v3000.0
     * @group Input
     */
    onScroll(action: (delta: Vec2) => void): KEventController;
    /**
     * Register an event that runs when tab is hidden.
     *
     * @since v3001.0
     * @group Events
     */
    onHide(action: () => void): KEventController;
    /**
     * Register an event that runs when tab is shown.
     *
     * @since v3001.0
     * @group Events
     */
    onShow(action: () => void): KEventController;
    /**
     * Register an event that runs every frame when certain gamepad buttons are held down.
     *
     * @since v3001.0
     * @group Input
     */
    onGamepadButtonDown(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs every frame when any gamepad buttons are held down.
     *
     * @since v3001.0
     * @group Input
     */
    onGamepadButtonDown(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses certain gamepad button.
     *
     * @since v3001.0
     * @group Input
     */
    onGamepadButtonPress(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user presses any gamepad button.
     *
     * @since v3001.0
     * @group Input
     */
    onGamepadButtonPress(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases certain gamepad button
     *
     * @since v3001.0
     * @group Input
     */
    onGamepadButtonRelease(
        btn: KGamepadButton | KGamepadButton[],
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user releases any gamepad button.
     *
     * @since v3000.0
     * @group Input
     */
    onGamepadButtonRelease(
        action: (btn: KGamepadButton, gamepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when the gamepad axis exists.
     *
     * @since v3000.0
     * @group Input
     */
    onGamepadStick(
        stick: GamepadStick,
        action: (value: Vec2, gameepad: KGamepad) => void,
    ): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @since v3001.0
     * @group Input
     */
    onButtonPress(
        btn: TButton | TButton[],
        action: (btn: TButton) => void,
    ): KEventController;
    /**
     * Register an event that runs when user release a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @since v3001.0
     * @group Input
     */
    onButtonRelease(
        btn: TButton | TButton[],
        action: (btn: TButton) => void,
    ): KEventController;
    onButtonRelease(action: (btn: TButton) => void): KEventController;
    /**
     * Register an event that runs when user press a defined button
     * (like "jump") on any input (keyboard, gamepad).
     *
     * @since v3001.0
     * @group Input
     */
    onButtonDown(
        btn: TButton | TButton[],
        action: (btn: TButton) => void,
    ): KEventController;
    onButtonDown(action: (btn: TButton) => void): KEventController;
    /**
     * Register an event that runs when current scene ends.
     *
     * @since v3000.0
     * @group Events
     */
    onSceneLeave(action: (newScene?: string) => void): KEventController;
    /**
     * Gets the name of the current scene. Returns null if no scene is active.
     *
     * @since v3001.0
     * @group Scene
     */
    getSceneName(): string | null;
    /**
     * Sets the root for all subsequent resource urls.
     *
     * @example
     * ```js
     * loadRoot("https://myassets.com/")
     * loadSprite("bean", "sprites/bean.png") // will resolve to "https://myassets.com/sprites/bean.png"
     * ```
     *
     * @group Assets
     */
    loadRoot(path?: string): string;
    /**
     * Load a sprite into asset manager, with name and resource url and optional config.
     *
     * @example
     * ```js
     * // due to browser policies you'll need a static file server to load local files
     * loadSprite("bean", "bean.png")
     * loadSprite("apple", "https://kaboomjs.com/sprites/apple.png")
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
     * })
     * ```
     *
     * @group Assets
     */
    loadSprite(
        name: string | null,
        src: LoadSpriteSrc | LoadSpriteSrc[],
        options?: LoadSpriteOpt,
    ): Asset<SpriteData>;
    /**
     * Load sprites from a sprite atlas.
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
     * })
     *
     * const player = add([
     *     sprite("hero"),
     * ])
     *
     * player.play("run")
     * ```
     *
     * @group Assets
     */
    loadSpriteAtlas(
        src: LoadSpriteSrc,
        data: SpriteAtlasData,
    ): Asset<Record<string, SpriteData>>;
    /**
     * Load sprites from a sprite atlas with URL.
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
     * @group Assets
     */
    loadSpriteAtlas(
        src: LoadSpriteSrc,
        url: string,
    ): Asset<Record<string, SpriteData>>;
    /**
     * Load a sprite with aseprite spritesheet json (should use "array" in the export options).
     *
     * @example
     * ```js
     * loadAseprite("car", "sprites/car.png", "sprites/car.json")
     * ```
     *
     * @group Assets
     */
    loadAseprite(
        name: string | null,
        imgSrc: LoadSpriteSrc,
        jsonSrc: string | AsepriteData,
    ): Asset<SpriteData>;
    /**
     * @group Assets
     */
    loadPedit(name: string | null, src: string): Asset<SpriteData>;
    /**
     * Load default sprite "bean".
     *
     * @example
     * ```js
     * loadBean()
     *
     * // use it right away
     * add([
     *     sprite("bean"),
     * ])
     * ```
     *
     * @group Assets
     */
    loadBean(name?: string): Asset<SpriteData>;
    /**
     * Load custom JSON data from url.
     *
     * @since v3000.0
     * @group Assets
     */
    loadJSON(name: string | null, url: string): Asset<any>;
    /**
     * Load a sound into asset manager, with name and resource url.
     *
     * @example
     * ```js
     * loadSound("shoot", "/sounds/horse.ogg")
     * loadSound("shoot", "/sounds/squeeze.mp3")
     * loadSound("shoot", "/sounds/shoot.wav")
     * ```
     *
     * @group Assets
     */
    loadSound(
        name: string | null,
        src: string | ArrayBuffer | AudioBuffer,
    ): Asset<SoundData>;
    /**
     * Like loadSound(), but the audio is streamed and won't block loading. Use this for big audio files like background music.
     *
     * @example
     * ```js
     * loadMusic("shoot", "/music/bossfight.mp3")
     * ```
     * @group Assets
     */
    loadMusic(name: string | null, url: string): void;
    /**
     * Load a font (any format supported by the browser, e.g. ttf, otf, woff).
     *
     * @since v3000.0
     *
     * @example
     * ```js
     * // load a font from a .ttf file
     * loadFont("frogblock", "fonts/frogblock.ttf")
     * ```
     * @group Assets
     */
    loadFont(
        name: string,
        src: string | BinaryData,
        opt?: LoadFontOpt,
    ): Asset<FontData>;
    /**
     * Load a bitmap font into asset manager, with name and resource url and information on the layout of the bitmap.
     *
     * @since v3000.0
     *
     * @example
     * ```js
     * // load a bitmap font called "04b03", with bitmap "fonts/04b03.png"
     * // each character on bitmap has a size of (6, 8), and contains default ASCII_CHARS
     * loadBitmapFont("04b03", "fonts/04b03.png", 6, 8)
     *
     * // load a font with custom characters
     * loadBitmapFont("myfont", "myfont.png", 6, 8, { chars: "☺☻♥♦♣♠" })
     * ```
     *
     * @group Assets
     */
    loadBitmapFont(
        name: string | null,
        src: string,
        gridWidth: number,
        gridHeight: number,
        options?: LoadBitmapFontOpt,
    ): Asset<BitmapFontData>;
    /**
     * Load a shader with vertex and fragment code.
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
     * @group Assets
     */
    loadShader(
        name: string | null,
        vert?: string | null,
        frag?: string | null,
    ): Asset<ShaderData>;
    /**
     * Load a shader with vertex and fragment code file url.
     *
     * @since v3000.0
     *
     * @example
     * ```js
     * // load only a fragment shader from URL
     * loadShader("outline", null, "/shaders/outline.glsl", true)
     * ```
     *
     * @group Assets
     */
    loadShaderURL(
        name: string | null,
        vert?: string | null,
        frag?: string | null,
    ): Asset<ShaderData>;
    /**
     * Add a new loader to wait for before starting the game.
     *
     * @example
     * ```js
     * load(new Promise((resolve, reject) => {
     *     // anything you want to do that stalls the game in loading state
     *     resolve("ok")
     * }))
     * ```
     *
     * @group Assets
     */
    load<T>(l: Promise<T>): Asset<T>;
    /**
     * Get the global asset loading progress (0.0 - 1.0).
     *
     * @since v3000.0
     * @group Assets
     */
    loadProgress(): number;
    /**
     * Get SpriteData from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getSprite(name: string): Asset<SpriteData> | null;
    /**
     * Get SoundData from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getSound(name: string): Asset<SoundData> | null;
    /**
     * Get FontData from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getFont(name: string): Asset<FontData> | null;
    /**
     * Get BitmapFontData from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getBitmapFont(name: string): Asset<BitmapFontData> | null;
    /**
     * Get ShaderData from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getShader(name: string): Asset<ShaderData> | null;
    /**
     * Get custom data from name.
     *
     * @since v3000.0
     * @group Assets
     */
    getAsset(name: string): Asset<any> | null;
    /**
     * The asset data.
     * @group Assets
     */
    Asset: typeof Asset;
    /**
     * The sprite data.
     * @group Assets
     */
    SpriteData: typeof SpriteData;
    /**
     * @group Assets
     */
    SoundData: typeof SoundData;
    /**
     * Get the width of game.
     *
     * @group Info
     */
    width(): number;
    /**
     * Get the root of all objects.
     *
     * @group Info
     */
    getTreeRoot(): GameObj;
    /**
     * Get the height of game.
     *
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
     * @group Info
     */
    dt(): number;
    /**
     * Get the fixed delta time since last frame.
     *
     * @group Info
     */
    fixedDt(): number;
    /**
     * Get the rest delta time since last frame.
     *
     * @group Info
     */
    restDt(): number;
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
     * @since v2000.1
     * @group Info
     */
    isFocused(): boolean;
    /**
     * Is currently on a touch screen device.
     *
     * @since v3000.0
     * @group Input
     */
    isTouchscreen(): boolean;
    /**
     * Get current mouse position (without camera transform).
     *
     * @group Input
     */
    mousePos(): Vec2;
    /**
     * How much mouse moved last frame.
     *
     * @group Input
     */
    mouseDeltaPos(): Vec2;
    /**
     * If any or certain key(s) are currently down.
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
     * @since v3001.0
     * @group Input
     */
    isKeyDown(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just pressed last frame.
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
     * @since v3001.0
     * @group Input
     */
    isKeyPressed(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just pressed last frame (also fires repeatedly when the keys are being held down).
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
     * @since v3001.0
     * @group Input
     */
    isKeyPressedRepeat(k?: Key | Key[]): boolean;
    /**
     * If any or certain key(s) are just released last frame.
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
     * @since v3001.0
     * @group Input
     */
    isKeyReleased(k?: Key | Key[]): boolean;
    /**
     * If mouse buttons are currently down.
     *
     * @since v3001.0
     * @group Input
     */
    isMouseDown(button?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse buttons are just clicked last frame.
     *
     * @since v3001.0
     * @group Input
     */
    isMousePressed(button?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse buttons are just released last frame.
     *
     * @since v3001.0
     * @group Input
     */
    isMouseReleased(button?: MouseButton | MouseButton[]): boolean;
    /**
     * If mouse moved last frame.
     *
     * @since v2000.1
     * @group Input
     */
    isMouseMoved(): boolean;
    /**
     * If certain gamepad buttons are just pressed last frame
     *
     * @since v3000.0
     * @group Input
     */
    isGamepadButtonPressed(btn?: KGamepadButton | KGamepadButton[]): boolean;
    /**
     * If certain gamepad buttons are currently held down.
     *
     * @since v3000.0
     * @group Input
     */
    isGamepadButtonDown(btn?: KGamepadButton | KGamepadButton): boolean;
    /**
     * If certain gamepad buttons are just released last frame.
     *
     * @since v3000.0
     * @group Input
     */
    isGamepadButtonReleased(btn?: KGamepadButton | KGamepadButton[]): boolean;
    /**
     * If any or certain bound button(s) are just pressed last frame on any input (keyboard, gamepad).
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
     */
    isButtonPressed(button?: TButton | TButton[]): boolean;
    /**
     * If any or certain bound button(s) are currently held down on any input (keyboard, gamepad).
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
     */
    isButtonDown(button?: TButton | TButton[]): boolean;
    /**
     * If any or certain bound button(s) are just released last frame on any input (keyboard, gamepad).
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
     */
    isButtonReleased(button?: TButton | TButton[]): boolean;
    /**
     * Get a input binding from a button name.
     *
     * @since v3001.0
     * @group Input
     */
    getButton(button: keyof TButtonDef): ButtonBinding;
    /**
     * Set a input binding for a button name.
     *
     * @since v3001.0
     * @group Input
     */
    setButton(button: string, def: ButtonBinding): void;
    /**
     * Press a button virtually.
     *
     * @since v3001.0
     * @group Input
     *
     * @example
     * ```js
     * // press "jump" button
     * pressButton("jump"); // triggers onButtonPress, starts onButtonDown
     * releaseButton("jump"); // triggers onButtonRelease, stops onButtonDown
     * ```
     */
    pressButton(button: TButton): void;
    /**
     * Release a button virtually.
     *
     * @since v3001.0
     * @group Input
     *
     * @example
     * ```js
     * // press "jump" button
     * pressButton("jump"); // triggers onButtonPress, starts onButtonDown
     * releaseButton("jump"); // triggers onButtonRelease, stops onButtonDown
     * ```
     */
    releaseButton(button: TButton): void;
    /**
     * Get stick axis values from a gamepad.
     *
     * @since v3001.0
     * @group Input
     */
    getGamepadStick(stick: GamepadStick): Vec2;
    /**
     * Get the latest input device type that triggered the input event.
     *
     * @returns The last input device type, or null if no input event has been triggered.
     * @since v3001.0
     */
    getLastInputDeviceType(): ButtonBindingDevice | null;
    /**
     * List of characters inputted since last frame.
     *
     * @since v3000.0
     * @group Input
     */
    charInputted(): string[];
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
     * @group Info
     */
    shake(intensity?: number): void;
    /**
     * Get / set camera position.
     *
     * @example
     * ```js
     * // camera follows player
     * player.onUpdate(() => {
     *     camPos(player.pos)
     * })
     * ```
     *
     * @group Info
     */
    camPos(pos: Vec2): Vec2;
    camPos(x: number, y: number): Vec2;
    camPos(xy: number): Vec2;
    camPos(): Vec2;
    /**
     * Get / set camera scale.
     *
     * @group Info
     */
    camScale(scale: Vec2): Vec2;
    camScale(x: number, y: number): Vec2;
    camScale(xy: number): Vec2;
    camScale(): Vec2;
    /**
     * Get / set camera rotation.
     *
     * @group Info
     */
    camRot(angle?: number): number;
    /**
     * Flash the camera.
     *
     * @example
     * ```js
     * onClick(() => {
     *     // flashed
     *     camFlash(WHITE, 0.5)
     * })
     * ```
     *
     * @group Info
     */
    camFlash(flashColor: Color, fadeOutTime: number): TimerController;
    /**
     * Get camera transform.
     *
     * @group Info
     */
    camTransform(): Mat23;
    /**
     * Transform a point from world position (relative to the root) to screen position (relative to the screen).
     * @since v3001.0
     *
     * @group Info
     */
    toScreen(p: Vec2): Vec2;
    /**
     * Transform a point from screen position (relative to the screen) to world position (relative to the root).
     *
     * @group Info
     */
    toWorld(p: Vec2): Vec2;
    /**
     * Set gravity.
     *
     * @group Info
     */
    setGravity(g: number): void;
    /**
     * Get gravity.
     *
     * @group Info
     */
    getGravity(): number;
    /**
     * Set gravity direction.
     */
    setGravityDirection(d: Vec2): void;
    /**
     * Get gravity direction.
     */
    getGravityDirection(): Vec2;
    /**
     * Set background color.
     *
     * @group Info
     */
    setBackground(color: Color): void;
    setBackground(color: Color, alpha: number): void;
    setBackground(r: number, g: number, b: number): void;
    setBackground(r: number, g: number, b: number, alpha: number): void;
    /**
     * Get background color.
     *
     * @group Info
     */
    getBackground(): Color | null;
    /**
     * Get connected gamepads.
     *
     * @since v3000.0
     * @group Info
     */
    getGamepads(): KGamepad[];
    /**
     * Set cursor style.
     *
     * @since v3000.0
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
     * @group Info
     */
    setCursor(style: Cursor): void;
    /**
     * Get current cursor style.
     *
     * @since v3000.0
     * @group Info
     */
    getCursor(): Cursor;
    /**
     * Lock / unlock cursor. Note that you cannot lock cursor within 1 second after user unlocking the cursor with the default unlock gesture (typically the esc key) due to browser policy.
     *
     * @since v3000.0
     * @group Info
     */
    setCursorLocked(locked: boolean): void;
    /**
     * Get if cursor is currently locked.
     *
     * @since v3000.0
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
     *     setFullscreen(!isFullscreen())
     * })
     * ```
     * @group Info
     */
    setFullscreen(f?: boolean): void;
    /**
     * If currently in fullscreen mode.
     *
     * @group Info
     */
    isFullscreen(): boolean;
    /**
     * Run the callback after n seconds.
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
     * @group Timer
     */
    wait(n: number, action?: () => void): TimerController;
    /**
     * Run the callback every n seconds.
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
     * @group Timer
     */
    loop(t: number, action: () => void): KEventController;
    /**
     * Play a piece of audio.
     *
     * @returns A control handle.
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
     * @group Audio
     */
    burp(options?: AudioPlayOpt): AudioPlay;
    /**
     * Sets global volume.
     *
     * @example
     * ```js
     * // makes everything quieter
     * volume(0.5)
     * ```
     *
     * @group Audio
     */
    volume(v?: number): number;
    /**
     * Get the underlying browser AudioContext.
     *
     * @group Audio
     */
    audioCtx: AudioContext;
    /**
     * Get a random number between 0 - 1.
     *
     * @group Math
     */
    rand(): number;
    /**
     * Get a random value between 0 and the given value.
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
     * ```
     *
     * @group Math
     */
    rand<T = RNGValue>(n: T): T;
    /**
     * Get a random value between the given bound.
     *
     * @example
     * ```js
     * rand(50, 100)
     * rand(vec2(20), vec2(100))
     *
     * // spawn something on the right side of the screen but with random y value within screen height
     * add([
     *     pos(width(), rand(0, height())),
     * ])
     * ```
     *
     * @group Math
     */
    rand<T = RNGValue>(a: T, b: T): T;
    /**
     * rand() but floored to integer.
     *
     * @example
     * ```js
     * randi(10) // returns 0 to 9
     * ```
     *
     * @group Math
     */
    randi(n: number): number;
    /**
     * rand() but floored to integer.
     *
     * @example
     * ```js
     * randi(0, 3) // returns 0, 1, or 2
     * ```
     *
     * @group Math
     */
    randi(a: number, b: number): number;
    /**
     * rand() but floored to integer.
     *
     * @example
     * ```js
     * randi() // returns either 0 or 1
     * ```
     *
     * @group Math
     */
    randi(): number;
    /**
     * Get / set the random number generator seed.
     *
     * @example
     * ```js
     * randSeed(Date.now())
     * ```
     *
     * @group Math
     */
    randSeed(seed?: number): number;
    /**
     * Create a 2d vector.
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
     * @group Math
     */
    vec2(x: number, y: number): Vec2;
    vec2(p: Vec2): Vec2;
    vec2(xy: number): Vec2;
    vec2(): Vec2;
    /**
     * Create a color from RGB values (0 - 255).
     *
     * @example
     * ```js
     * // update the color of the sky to light blue
     * sky.color = rgb(0, 128, 255)
     * ```
     *
     * @group Math
     */
    rgb(r: number, g: number, b: number): Color;
    /**
     * Create a color from hex string.
     *
     * @since v3001.0
     *
     * @example
     * ```js
     * sky.color = rgb("#ef6360")
     *
     * @group Math
     */
    rgb(hex: string): Color;
    /**
     * Same as rgb(255, 255, 255).
     *
     * @group Math
     */
    rgb(): Color;
    /**
     * Convert HSL color (all values in 0.0 - 1.0 range) to RGB color.
     *
     * @since v2000.1
     *
     * @example
     * ```js
     * // animate rainbow color
     * onUpdate("rainbow", (obj) => {
     *     obj.color = hsl2rgb(wave(0, 1, time()), 0.6, 0.6)
     * })
     * ```
     *
     * @group Math
     */
    hsl2rgb(hue: number, saturation: number, lightness: number): Color;
    /**
     * Rectangle area (0.0 - 1.0).
     *
     * @group Math
     */
    quad(x: number, y: number, w: number, h: number): Quad;
    /**
     * Choose a random item from a list.
     *
     * @example
     * ```js
     * // decide the best fruit randomly
     * const bestFruit = choose(["apple", "banana", "pear", "watermelon"])
     * ```
     *
     * @group Math
     */
    choose<T>(lst: T[]): T;
    /**
     * Choose multiple random items from a list.
     *
     * @since v3001.0
     * @group Math
     */
    chooseMultiple<T>(lst: T[], count: number): T[];
    /**
     * Shuffle an array.
     *
     * @since v3001.0
     * @group Math
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
     */
    chance(p: number): boolean;
    /**
     * Linear interpolation.
     *
     * @group Math
     */
    lerp<V extends LerpValue>(from: V, to: V, t: number): V;
    /**
     * Tweeeeeeeening!
     *
     * @since v3000.0
     *
     * @example
     * ```js
     * // tween bean to mouse position
     * tween(bean.pos, mousePos(), 1, (p) => bean.pos = p, easings.easeOutBounce)
     *
     * // tween() returns a then-able that can be used with await
     * await tween(bean.opacity, 1, 0.5, (val) => bean.opacity = val, easings.easeOutQuad)
     * ```
     *
     * @group Math
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
     */
    easings: Record<EaseFuncs, EaseFunc>;
    /**
     * Steps easing. Eases in discontinious steps.
     *
     * @since v3001.0
     * @group Math
     */
    easingSteps(steps: number, position: StepPosition): (x: number) => number;
    /**
     * Linear easing with keyframes
     *
     * @since v3001.0
     * @group Math
     */
    easingLinear(keys: Vec2[]): (x: number) => number;
    /**
     * Bezier easing. Both control points need x to be within 0 and 1.
     *
     * @since v3001.0
     * @group Math
     */
    easingCubicBezier(p1: Vec2, p2: Vec2): (x: number) => number;
    /**
     * Map a value from one range to another range.
     *
     * @group Math
     */
    map(v: number, l1: number, h1: number, l2: number, h2: number): number;
    /**
     * Map a value from one range to another range, and clamp to the dest range.
     *
     * @group Math
     */
    mapc(v: number, l1: number, h1: number, l2: number, h2: number): number;
    /**
     * Interpolate between 2 values (Optionally takes a custom periodic function, which default to Math.sin).
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
    wave(
        lo: number,
        hi: number,
        t: number,
        func?: (x: number) => number,
    ): number;
    /**
     * Convert degrees to radians.
     *
     * @group Math
     */
    deg2rad(deg: number): number;
    /**
     * Convert radians to degrees.
     *
     * @group Math
     */
    rad2deg(rad: number): number;
    /**
     * Return a value clamped to an inclusive range of min and max.
     *
     * @group Math
     */
    clamp(n: number, min: number, max: number): number;
    /**
     * Evaluate the quadratic Bezier at the given t
     *
     * @group Math
     */
    evaluateQuadratic(pt1: Vec2, pt2: Vec2, pt3: Vec2, t: number): Vec2;
    /**
     * Evaluate the first derivative of a quadratic bezier at the given t
     *
     * @since v3001.0
     * @group Math
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
     */
    evaluateQuadraticSecondDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the cubic Bezier at the given t
     *
     * @since v3001.0
     * @group Math
     */
    evaluateBezier(pt1: Vec2, pt2: Vec2, pt3: Vec2, pt4: Vec2, t: number): Vec2;
    /**
     * Evaluate the first derivative of a cubic Bezier at the given t
     *
     * @group Math
     */
    evaluateBezierFirstDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the second derivative of a cubic bezier at the given t
     *
     * @since v3001.0
     * @group Math
     */
    evaluateBezierSecondDerivative(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the Catmull-Rom spline at the given t
     *
     * @since v3001.0
     * @group Math
     */
    evaluateCatmullRom(
        pt1: Vec2,
        pt2: Vec2,
        pt3: Vec2,
        pt4: Vec2,
        t: number,
    ): Vec2;
    /**
     * Evaluate the first derivative of a Catmull-Rom spline at the given t
     *
     * @since v3001.0
     * @group Math
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
     */
    normalizedCurve(curve: (t: number) => Vec2): (s: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 1D Hermite curve
     * @param pt1 First point
     * @param m1 First control point (tangent)
     * @param m2 Second control point (tangent)
     * @param pt2 Second point
     * @returns A function which gives the value on the 1D Hermite curve at t
     */
    hermite(
        pt1: number,
        m1: number,
        m2: number,
        pt2: number,
    ): (t: number) => number;
    /**
     * A second order function returning an evaluator for the given 2D Cardinal curve
     * @param pt1 Previous point
     * @param pt2 First point
     * @param pt3 Second point
     * @param pt4 Next point
     * @param tension The tension of the curve, [0..1] from round to tight.
     * @returns A function which gives the value on the 2D Cardinal curve at t
     */
    cardinal(
        pt1: Vec2,
        m1: Vec2,
        m2: Vec2,
        pt2: Vec2,
        tension: number,
    ): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D Catmull-Rom curve
     * @param pt1 Previous point
     * @param pt2 First point
     * @param pt3 Second point
     * @param pt4 Next point
     * @returns A function which gives the value on the 2D Catmull-Rom curve at t
     */
    catmullRom(pt1: Vec2, m1: Vec2, m2: Vec2, pt2: Vec2): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D quadratic Bezier curve
     * @param pt1 First point
     * @param pt2 First control point
     * @param pt3 Second control point
     * @param pt4 Second point
     * @returns A function which gives the value on the 2D quadratic Bezier curve at t
     */
    bezier(pt1: Vec2, pt2: Vec2, pt3: Vec2, pt4: Vec2): (t: number) => Vec2;
    /**
     * A second order function returning an evaluator for the given 2D Kochanek–Bartels curve
     * @param pt1 Previous point
     * @param pt2 First point
     * @param pt3 Second point
     * @param pt4 Next point
     * @param tension The tension of the curve, [-1..1] from round to tight.
     * @param continuity The continuity of the curve, [-1..1] from box corners to inverted corners.
     * @param bias The bias of the curve, [-1..1] from pre-shoot to post-shoot.
     * @returns A function which gives the value on the 2D Kochanek–Bartels curve at t
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
    /**
     * Check if a line and a point intersect.
     *
     * @group Math
     */
    testLinePoint(l: Line, pt: Vec2): boolean;
    /**
     * Check if 2 lines intersects, if yes returns the intersection point.
     *
     * @group Math
     */
    testLineLine(l1: Line, l2: Line): Vec2 | null;
    /**
     * Check if a line and a circle intersect.
     *
     * @group Math
     */
    testLineCircle(l: Line, circle: Circle): boolean;
    /**
     * Check if 2 rectangle overlaps.
     *
     * @group Math
     */
    testRectRect(r1: Rect, r2: Rect): boolean;
    /**
     * Check if a line and a rectangle overlaps.
     *
     * @group Math
     */
    testRectLine(r: Rect, l: Line): boolean;
    /**
     * Check if a point is inside a rectangle.
     *
     * @group Math
     */
    testRectPoint(r: Rect, pt: Vec2): boolean;
    /**
     * Check if a circle and polygon intersect linewise.
     * @group Math
     */
    /**
     * @group Math
     */
    testCirclePolygon(c: Circle, p: Polygon): boolean;
    /**
     * @since v4000.0
     * @group Math
     */
    clipLineToRect(r: Rect, l: Line, result: Line): boolean;
    /**
     * @since v4000.0
     * @group Math
     */
    clipLineToCircle(c: Circle, l: Line, result: Line): boolean;
    /**
     * @since v4000.0
     * @group Math
     */
    gjkShapeIntersects(shapeA: Shape, shapeB: Shape): boolean;
    /**
     * @since v4000.0
     * @group Math
     */
    gjkShapeIntersection(
        shapeA: Shape,
        shapeB: Shape,
    ): GjkCollisionResult | null;
    /**
     * @group Math
     */
    isConvex(pts: Vec2[]): boolean;
    /**
     * @group Math
     */
    triangulate(pts: Vec2[]): Vec2[][];
    /**
     * @group Math
     */
    NavMesh: typeof NavMesh;
    /**
     * @group Math
     */
    Point: typeof Point;
    /**
     * @group Math
     */
    Line: typeof Line;
    /**
     * @group Math
     */
    Rect: typeof Rect;
    /**
     * @group Math
     */
    Circle: typeof Circle;
    /**
     * @group Math
     */
    Ellipse: typeof Ellipse;
    /**
     * @group Math
     */
    Polygon: typeof Polygon;
    /**
     * @group Math
     */
    Vec2: typeof Vec2;
    /**
     * @group Math
     */
    Color: typeof Color;
    /**
     * @group Math
     */
    Mat4: typeof Mat4;
    /**
     * @group Math
     */
    Mat23: typeof Mat23;
    /**
     * @group Math
     */
    Quad: typeof Quad;
    /**
     * @group Math
     */
    RNG: typeof RNG;
    /**
     * Define a scene.
     *
     * @group Scene
     */
    scene(id: SceneName, def: SceneDef): void;
    /**
     * Go to a scene, passing all rest args to scene callback.
     *
     * @group Scene
     */
    go(id: SceneName, ...args: any): void;
    /**
     * Define the layer names. Should be called before any objects are made.
     *
     * @group Scene
     */
    layers(layers: string[], defaultLayer: string): void;
    /**
     * Construct a level based on symbols.
     *
     * @group Level
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
     */
    addLevel(map: string[], options: LevelOpt): GameObj;
    /**
     * Get data from local storage, if not present can set to a default value.
     *
     * @group Data
     */
    getData<T>(key: string, def?: T): T | null;
    /**
     * Set data from local storage.
     *
     * @group Data
     */
    setData(key: string, data: any): void;
    /**
     * Draw a sprite.
     *
     * @example
     * ```js
     * drawSprite({
     *     sprite: "bean",
     *     pos: vec2(100, 200),
     *     frame: 3,
     * })
     * ```
     *
     * @group Draw
     */
    drawSprite(options: DrawSpriteOpt): void;
    /**
     * Draw a piece of text.
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
     * })
     * ```
     *
     * @group Draw
     */
    drawText(options: DrawTextOpt): void;
    /**
     * Draw a rectangle.
     *
     * @example
     * ```js
     * drawRect({
     *     width: 120,
     *     height: 240,
     *     pos: vec2(20, 20),
     *     color: YELLOW,
     *     outline: { color: BLACK, width: 4 },
     * })
     * ```
     *
     * @group Draw
     */
    drawRect(options: DrawRectOpt): void;
    /**
     * Draw a line.
     *
     * @example
     * ```js
     * drawLine({
     *     p1: vec2(0),
     *     p2: mousePos(),
     *     width: 4,
     *     color: rgb(0, 0, 255),
     * })
     * ```
     * @group Draw
     */
    drawLine(options: DrawLineOpt): void;
    /**
     * Draw lines.
     *
     * @example
     * ```js
     * drawLines({
     *     pts: [ vec2(0), vec2(0, height()), mousePos() ],
     *     width: 4,
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * })
     * ```
     *
     * @group Draw
     */
    drawLines(options: DrawLinesOpt): void;
    /**
     * Draw a curve.
     *
     * @example
     * ```js
     * drawCurve(t => evaluateBezier(a, b, c, d, t)
     * {
     *     width: 2,
     *     color: rgb(0, 0, 255),
     * })
     * ```
     *
     * @group Draw
     */
    drawCurve(curve: (t: number) => Vec2, opt: DrawCurveOpt): void;
    /**
     * Draw a cubic Bezier curve.
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
     * })
     * ```
     *
     * @group Draw
     */
    drawBezier(opt: DrawBezierOpt): void;
    /**
     * Draw a triangle.
     *
     * @example
     * ```js
     * drawTriangle({
     *     p1: vec2(0),
     *     p2: vec2(0, height()),
     *     p3: mousePos(),
     *     pos: vec2(100, 200),
     *     color: rgb(0, 0, 255),
     * })
     * ```
     *
     * @group Draw
     */
    drawTriangle(options: DrawTriangleOpt): void;
    /**
     * Draw a circle.
     *
     * @example
     * ```js
     * drawCircle({
     *     pos: vec2(100, 200),
     *     radius: 120,
     *     color: rgb(255, 255, 0),
     * })
     * ```
     *
     * @group Draw
     */
    drawCircle(options: DrawCircleOpt): void;
    /**
     * Draw an ellipse.
     *
     * @example
     * ```js
     * drawEllipse({
     *     pos: vec2(100, 200),
     *     radiusX: 120,
     *     radiusY: 120,
     *     color: rgb(255, 255, 0),
     * })
     * ```
     *
     * @group Draw
     */
    drawEllipse(options: DrawEllipseOpt): void;
    /**
     * Draw a convex polygon from a list of vertices.
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
     * })
     * ```
     *
     * @group Draw
     */
    drawPolygon(options: DrawPolygonOpt): void;
    /**
     * Draw a rectangle with UV data.
     *
     * @group Draw
     */
    drawUVQuad(options: DrawUVQuadOpt): void;
    /**
     * Draw a piece of formatted text from formatText().
     *
     * @since v2000.2
     *
     * @example
     * ```js
     * // text background
     * const txt = formatText({
     *     text: "oh hi",
     * })
     *
     * drawRect({
     *     width: txt.width,
     *     height: txt.height,
     * })
     *
     * drawFormattedText(txt)
     * ```
     *
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
     * Push current transform matrix to the transform stack.
     *
     * @example
     * ```js
     * pushTransform()
     *
     * // these transforms will affect every render until popTransform()
     * pushTranslate(120, 200)
     * pushRotate(time() * 120)
     * pushScale(6)
     *
     * drawSprite("bean")
     * drawCircle(vec2(0), 120)
     *
     * // restore the transformation stack to when last pushed
     * popTransform()
     * ```
     *
     * @group Draw
     */
    pushTransform(): void;
    /**
     * Pop the topmost transform matrix from the transform stack.
     *
     * @group Draw
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
     * @group Draw
     */
    pushTranslate(t?: Vec2): void;
    /**
     * Scale all subsequent draws.
     *
     * @group Draw
     */
    pushScale(s?: Vec2): void;
    /**
     * Rotate all subsequent draws.
     *
     * @group Draw
     */
    pushRotate(angle?: number): void;
    /**
     * Apply a transform matrix, ignore all prior transforms.
     *
     * @since v3000.0
     * @group Draw
     */
    pushMatrix(mat?: Mat23): void;
    /**
     * Apply a post process effect from a shader name.
     *
     * @since v3000.0
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
     * @group Draw
     */
    usePostEffect(name: string, uniform?: Uniform | (() => Uniform)): void;
    /**
     * Format a piece of text without drawing (for getting dimensions, etc).
     *
     * @since v2000.2
     *
     * @example
     * ```js
     * // text background
     * const txt = formatText({
     *     text: "oh hi",
     * })
     *
     * drawRect({
     *     width: txt.width,
     *     height: txt.height,
     * })
     *
     * drawFormattedText(txt)
     * ```
     *
     * @group Draw
     */
    formatText(options: DrawTextOpt): FormattedText;
    /**
     * Create a canvas to draw stuff offscreen.
     *
     * @since v3001.0
     * @group Draw
     */
    makeCanvas(w: number, h: number): Canvas;
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
     * @group Debug
     */
    debug: Debug;
    /**
     * Import a plugin.
     *
     * @group Plugins
     */
    plug<T extends Record<string, any>>(plugin: KAPLAYPlugin<T>): KAPLAYCtx & T;
    /**
     * Take a screenshot and get the data url of the image.
     *
     * @returns The dataURL of the image.
     * @group Data
     */
    screenshot(): string;
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
     * Start recording the canvas into a video. If framerate is not specified, a new frame will be captured each time the canvas changes.
     *
     * @returns A control handle.
     *
     * @since v2000.1
     * @group Data
     */
    record(frameRate?: number): Recording;
    /**
     * Add an explosion
     *
     * @group Misc
     */
    addKaboom(pos: Vec2, opt?: BoomOpt): GameObj;
    /**
     * All chars in ASCII.
     *
     * @group Constants
     */
    ASCII_CHARS: string;
    /**
     * Left directional vector vec2(-1, 0).
     *
     * @group Constants
     */
    LEFT: Vec2;
    /**
     * Right directional vector vec2(1, 0).
     *
     * @group Constants
     */
    RIGHT: Vec2;
    /**
     * Up directional vector vec2(0, -1).
     *
     * @group Constants
     */
    UP: Vec2;
    /**
     * Down directional vector vec2(0, 1).
     *
     * @group Constants
     */
    DOWN: Vec2;
    /**
     * Red color.
     *
     * @group Constants
     */
    RED: Color;
    /**
     * Green color.
     *
     * @group Constants
     */
    GREEN: Color;
    /**
     * Blue color.
     *
     * @group Constants
     */
    BLUE: Color;
    /**
     * Yellow color.
     *
     * @group Constants
     */
    YELLOW: Color;
    /**
     * Cyan color.
     *
     * @group Constants
     */
    MAGENTA: Color;
    /**
     * Cyan color.
     *
     * @group Constants
     */
    CYAN: Color;
    /**
     * White color.
     *
     * @group Constants
     */
    WHITE: Color;
    /**
     * Black color.
     *
     * @group Constants
     */
    BLACK: Color;
    /**
     * The canvas DOM KAPLAY is currently using.
     *
     * @group Info
     */
    canvas: HTMLCanvasElement;
    /**
     * End everything.
     *
     * @group Start
     */
    quit: () => void;
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
     * Current KAPLAY library version.
     *
     * @since v3000.0
     * @group Info
     */
    VERSION: string;
}

export type Tag = string;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void ? I
    : never;
type Defined<T> = T extends any
    ? Pick<T, { [K in keyof T]-?: T[K] extends undefined ? never : K }[keyof T]>
    : never;
type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
export type MergeObj<T> = Expand<UnionToIntersection<Defined<T>>>;
/**
 * A type to merge the components of a game object, omitting the default component properties.
 *
 * @group Component Types
 */
export type MergeComps<T> = Omit<MergeObj<T>, keyof Comp>;
export type MergePlugins<T extends PluginList<any>> = MergeObj<
    ReturnType<T[number]>
>;

/**
 * A component list.
 *
 * @group Component Types
 */
export type CompList<T> = Array<T | Tag>;
export type PluginList<T> = Array<T | KAPLAYPlugin<any>>;

/**
 * A key.
 *
 * @group Input
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
 * A mouse button.
 *
 * @group Input
 */
export type MouseButton = "left" | "right" | "middle" | "back" | "forward";

/**
 * A gamepad button.
 *
 * @group Input
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
    | "capture";

/**
 * A gamepad stick.
 *
 * @group Input
 */
export type GamepadStick = "left" | "right";

/**
 * A gamepad definition.
 */
export type GamepadDef = {
    buttons: Record<string, KGamepadButton>;
    sticks: Partial<Record<GamepadStick, { x: number; y: number }>>;
};

/** A KAPLAY gamepad */
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
    getStick(stick: GamepadStick): Vec2;
};

/**
 * Inspect info for a game object.
 */
export type GameObjInspect = Record<Tag, string | null>;

/**
 * KAPLAY configurations.
 *
 * @group Start
 */
export interface KAPLAYOpt<
    TPlugin extends PluginList<any> = any,
    TButtonDef extends ButtonsDef = any,
> {
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
     * If stretch canvas to container when width and height is specified
     */
    stretch?: boolean;
    /**
     * When stretching if keep aspect ratio and leave black bars on remaining spaces.
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
     * Disable antialias and enable sharp pixel display.
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
    buttons?: TButtonDef;
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
    plugins?: TPlugin;
    /**
     * Enter burp mode.
     */
    burp?: boolean;
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
 * Base interface of all game objects.
 *
 * @group Game Obj
 */
export interface GameObjRaw {
    /**
     * Add a child.
     *
     * @since v3000.0
     */
    add<T>(comps?: CompList<T> | GameObj<T>): GameObj<T>;
    /**
     * Remove and re-add the game obj, without triggering add / destroy events.
     */
    readd<T>(obj: GameObj<T>): GameObj<T>;
    /**
     * Remove a child.
     *
     * @since v3000.0
     */
    remove(obj: GameObj): void;
    /**
     * Remove all children with a certain tag.
     *
     * @since v3000.0
     */
    removeAll(tag: Tag): void;
    /**
     * Remove all children.
     *
     * @since v3000.0
     */
    removeAll(): void;
    /**
     * Get a list of all game objs with certain tag.
     *
     * @since v3000.0
     */
    get<T = any>(tag: Tag | Tag[], opts?: GetOpt): GameObj<T>[];
    /**
     * Get a list of all game objs with certain properties.
     *
     * @since v3001.0
     */
    query(opt: QueryOpt): GameObj[];
    /**
     * Get the parent game obj, if have any.
     *
     * @since v3000.0
     */
    parent: GameObj | null;
    /**
     * Get all children game objects.
     *
     * @since v3000.0
     */
    children: GameObj[];
    /**
     * Get the tags of a game object.
     *
     * @since v3001.0
     */
    tags: string[];
    /**
     * Update this game object and all children game objects.
     *
     * @since v3001.0
     */
    fixedUpdate(): void;
    /**
     * Update this game object and all children game objects.
     *
     * @since v3000.0
     */
    update(): void;
    /**
     * Draw this game object and all children game objects.
     *
     * @since v3000.0
     */
    draw(): void;
    /**
     * Draw debug info in inspect mode
     *
     * @since v3000.0
     */
    drawInspect: () => void;
    clearEvents: () => void;
    /**
     * If there's certain tag(s) on the game obj.
     */
    is(tag: Tag | Tag[]): boolean;
    // TODO: update the GameObj type info
    /**
     * Add a component or tag.
     */
    use(comp: Comp | Tag): void;
    // TODO: update the GameObj type info
    /**
     * Remove a tag or a component with its id.
     */
    unuse(comp: Tag): void;
    /**
     * Register an event.
     */
    on(event: string, action: (...args: any) => void): KEventController;
    /**
     * Trigger an event.
     */
    trigger(event: string, ...args: any): void;
    /**
     * Remove the game obj from scene.
     */
    destroy(): void;
    /**
     * Get state for a specific comp.
     */
    c(id: Tag): Comp | null;
    /**
     * Gather debug info of all comps.
     */
    inspect(): GameObjInspect;
    /**
     * Register an event that runs when the game obj is added to the scene.
     */
    onAdd(action: () => void): KEventController;
    /**
     * Register an event that runs every frame as long as the game obj exists.
     *
     * @since v2000.1
     */
    onUpdate(action: () => void): KEventController;
    /**
     * Register an event that runs every frame as long as the game obj exists (this is the same as `onUpdate()`, but all draw events are run after all update events).
     *
     * @since v2000.1
     */
    onDraw(action: () => void): KEventController;
    /**
     * Register an event that runs when the game obj is destroyed.
     *
     * @since v2000.1
     */
    onDestroy(action: () => void): KEventController;
    /**
     * If game obj is attached to the scene graph.
     */
    exists(): boolean;
    /**
     * Check if is an ancestor (recursive parent) of another game object
     *
     * @since v3000.0
     */
    isAncestorOf(obj: GameObj): boolean;
    /**
     * Calculated transform matrix of a game object.
     *
     * @since v3000.0
     */
    transform: Mat23;
    /**
     * If draw the game obj (run "draw" event or not).
     */
    hidden: boolean;
    /**
     * If update the game obj (run "update" event or not).
     */
    paused: boolean;
    /**
     * A unique number ID for each game object.
     */
    id: GameObjID | null;
    /**
     * The canvas to draw this game object on
     *
     * @since v3001.0
     */
    canvas: FrameBuffer | null;
    onKeyDown: KAPLAYCtx["onKeyDown"];
    onKeyPress: KAPLAYCtx["onKeyPress"];
    onKeyPressRepeat: KAPLAYCtx["onKeyPressRepeat"];
    onKeyRelease: KAPLAYCtx["onKeyRelease"];
    onCharInput: KAPLAYCtx["onCharInput"];
    onMouseDown: KAPLAYCtx["onMouseDown"];
    onMousePress: KAPLAYCtx["onMousePress"];
    onMouseRelease: KAPLAYCtx["onMouseRelease"];
    onMouseMove: KAPLAYCtx["onMouseMove"];
    onTouchStart: KAPLAYCtx["onTouchStart"];
    onTouchMove: KAPLAYCtx["onTouchMove"];
    onTouchEnd: KAPLAYCtx["onTouchEnd"];
    onScroll: KAPLAYCtx["onScroll"];
    onGamepadButtonDown: KAPLAYCtx["onGamepadButtonDown"];
    onGamepadButtonPress: KAPLAYCtx["onGamepadButtonPress"];
    onGamepadButtonRelease: KAPLAYCtx["onGamepadButtonRelease"];
    onGamepadStick: KAPLAYCtx["onGamepadStick"];
    onButtonDown: KAPLAYCtx["onButtonDown"];
    onButtonPress: KAPLAYCtx["onButtonPress"];
    onButtonRelease: KAPLAYCtx["onButtonRelease"];
}

/**
 * The basic unit of object in KAPLAY. The player, a butterfly, a tree, or even a piece of text.
 *
 * @group Game Obj
 */
export type GameObj<T = any> = GameObjRaw & MergeComps<T>;

/**
 * @group Options
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
};

/**
 * @group Options
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
 * Screen recording control handle.
 *
 * @group Data
 */
export interface Recording {
    /**
     * Pause the recording.
     */
    pause(): void;
    /**
     * Resume the recording.
     */
    resume(): void;
    /**
     * Stop the recording and get the video data as mp4 Blob.
     *
     * @since v3000.0
     */
    stop(): Promise<Blob>;
    /**
     * Stop the recording and downloads the file as mp4. Trying to resume later will lead to error.
     */
    download(filename?: string): void;
}

/**
 * Sprite animation configuration when playing.
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
     * Runs when this animation ends.
     */
    onEnd?: () => void;
}

export type MusicData = string;

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

export type TextureOpt = {
    filter?: TexFilter;
    wrap?: TexWrap;
};

export type ImageSource = Exclude<TexImageSource, VideoFrame>;

export type Canvas = {
    width: number;
    height: number;
    toImageData(): ImageData;
    toDataURL(): string;
    clear(): void;
    draw(action: () => void): void;
    free(): void;
};

export interface Vertex {
    pos: Vec2;
    uv: Vec2;
    color: Color;
    opacity: number;
}

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
    color?: Color;
    opacity?: number;
    fixed?: boolean;
    shader?: string | ShaderData | Asset<ShaderData> | null;
    uniform?: Uniform | null;
    outline?: Outline;
}

export type DrawTextureOpt = RenderProps & {
    tex: Texture;
    width?: number;
    height?: number;
    tiled?: boolean;
    flipX?: boolean;
    flipY?: boolean;
    quad?: Quad;
    anchor?: Anchor | Vec2;
};

export type DrawUVQuadOpt = RenderProps & {
    /**
     * Width of the UV quad.
     */
    width: number;
    /**
     * Height of the UV quad.
     */
    height: number;
    /**
     * If flip the texture horizontally.
     */
    flipX?: boolean;
    /**
     * If flip the texture vertically.
     */
    flipY?: boolean;
    /**
     * The texture to sample for this quad.
     */
    tex?: Texture;
    /**
     * The texture sampling area.
     */
    quad?: Quad;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
};

/**
 * How the ellipse should look like.
 */
export type DrawEllipseOpt = RenderProps & {
    /**
     * The horizontal radius.
     */
    radiusX: number;
    /**
     * The vertical radius.
     */
    radiusY: number;
    /**
     * Starting angle.
     */
    start?: number;
    /**
     * Ending angle.
     */
    end?: number;
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * Use gradient instead of solid color.
     *
     * @since v3000.0
     */
    gradient?: [Color, Color];
    /**
     * Multiplier for circle vertices resolution (default 1)
     */
    resolution?: number;
    /**
     * The anchor point, or the pivot point. Default to "topleft".
     */
    anchor?: Anchor | Vec2;
};

/**
 * How the polygon should look like.
 */
export type DrawPolygonOpt = RenderProps & {
    /**
     * The points that make up the polygon
     */
    pts: Vec2[];
    /**
     * If fill the shape with color (set this to false if you only want an outline).
     */
    fill?: boolean;
    /**
     * Manual triangulation.
     */
    indices?: number[];
    /**
     * The center point of transformation in relation to the position.
     */
    offset?: Vec2;
    /**
     * The radius of each corner.
     */
    radius?: number | number[];
    /**
     * The color of each vertex.
     *
     * @since v3000.0
     */
    colors?: Color[];
    /**
     * The uv of each vertex.
     *
     * @since v3001.0
     */
    uv?: Vec2[];
    /**
     * The texture if uv are supplied.
     *
     * @since v3001.0
     */
    tex?: Texture;
    /**
     * Triangulate concave polygons.
     *
     * @since v3001.0
     */
    triangulate?: boolean;
};

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
 * @group Draw
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
 */
export type LerpValue = number | Vec2 | Color;

/**
 * @group Math
 */
export type RNGValue = number | Vec2 | Color;

/**
 * @group Components
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
     * Draw debug info in inspect mode
     *
     * @since v3000.0
     */
    drawInspect?: () => void;
}

/**
 * @group Game Obj
 */
export type GameObjID = number;

/**
 * A component without own properties.
 *
 * @group Component Types
 */
export type EmptyComp = { id: string } & Comp;

/**
 * Collision resolution data.
 *
 * @group Math
 */
export interface Collision {
    /**
     * The first game object in the collision.
     */
    source: GameObj;
    /**
     * The second game object in the collision.
     */
    target: GameObj;
    /**
     * The contact normal.
     */
    normal: Vec2;
    /**
     * The length of the displacement.
     */
    distance: Vec2;
    /**
     * The displacement source game object have to make to avoid the collision.
     */
    displacement: Vec2;
    /**
     * If the collision is resolved.
     */
    resolved: boolean;
    /**
     * Prevent collision resolution if not yet resolved.
     *
     * @since v3000.0
     */
    preventResolution(): void;
    /**
     * If the 2 objects have any overlap, or they're just touching edges.
     *
     * @since v3000.0
     */
    hasOverlap(): boolean;
    /**
     * Get a new collision with reversed source and target relationship.
     */
    reverse(): Collision;
    /**
     * If the collision happened (roughly) on the top side.
     */
    isTop(): boolean;
    /**
     * If the collision happened (roughly) on the bottom side.
     */
    isBottom(): boolean;
    /**
     * If the collision happened (roughly) on the left side.
     */
    isLeft(): boolean;
    /**
     * If the collision happened (roughly) on the right side.
     */
    isRight(): boolean;
}

/**
 * @group Draw
 */
export type Shape = Rect | Line | Point | Circle | Ellipse | Polygon;

/**
 * @group Debug
 */
export interface Debug {
    /**
     * Pause the whole game.
     */
    paused: boolean;
    /**
     * Draw bounding boxes of all objects with `area()` component, hover to inspect their states.
     */
    inspect: boolean;
    /**
     * Global time scale.
     */
    timeScale: number;
    /**
     * Show the debug log or not.
     */
    showLog: boolean;
    /**
     * Current frames per second.
     */
    fps(): number;
    /**
     * Total number of frames elapsed.
     *
     * @since v3000.0
     */
    numFrames(): number;
    /**
     * Number of draw calls made last frame.
     */
    drawCalls(): number;
    /**
     * Step to the next frame. Useful with pausing.
     */
    stepFrame(): void;
    /**
     * Clear the debug log.
     */
    clearLog(): void;
    /**
     * Log some text to on screen debug log.
     */
    log(...msg: any): void;
    /**
     * Log an error message to on screen debug log.
     */
    error(msg: any): void;
    /**
     * The recording handle if currently in recording mode.
     *
     * @since v2000.1
     */
    curRecording: Recording | null;
    /**
     * Get total number of objects.
     *
     * @since v3001.0
     */
    numObjects(): number;
}

export type Mask = "intersect" | "subtract";

/**
 * @group Math
 */
export type Edge = "left" | "right" | "top" | "bottom";

/**
 * @group Math
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

/**
 * A level component.
 *
 * @group Component Types
 */
export interface LevelComp extends Comp {
    tileWidth(): number;
    tileHeight(): number;
    numRows(): number;
    numColumns(): number;
    /**
     * Spawn a tile from a symbol defined previously.
     */
    spawn(sym: string, p: Vec2): GameObj | null;
    spawn(sym: string, x: number, y: number): GameObj | null;
    /**
     * Spawn a tile from a component list.
     *
     * @returns The spawned game object, or null if the obj hasn't components.
     */
    spawn<T>(obj: CompList<T>, p: Vec2): GameObj<T> | null;
    spawn<T>(sym: CompList<T>, x: number, y: number): GameObj<T> | null;
    /**
     * Total width of level in pixels.
     */
    levelWidth(): number;
    /**
     * Total height of level in pixels.
     */
    levelHeight(): number;
    /**
     * Get all game objects that's currently inside a given tile.
     */
    getAt(tilePos: Vec2): GameObj[];
    /**
     * Raycast all game objects on the given path.
     */
    raycast(origin: Vec2, direction: Vec2): RaycastResult;
    /**
     * Convert tile position to pixel position.
     */
    tile2Pos(tilePos: Vec2): Vec2;
    tile2Pos(x: number, y: number): Vec2;
    /**
     * Convert pixel position to tile position.
     */
    pos2Tile(pos: Vec2): Vec2;
    pos2Tile(x: number, y: number): Vec2;
    /**
     * Find the path to navigate from one tile to another tile.
     *
     * @returns A list of traverse points in tile positions.
     */
    getTilePath(from: Vec2, to: Vec2, opts?: PathFindOpt): Vec2[] | null;
    /**
     * Find the path to navigate from one tile to another tile.
     *
     * @returns A list of traverse points in pixel positions.
     */
    getPath(from: Vec2, to: Vec2, opts?: PathFindOpt): Vec2[] | null;
    getSpatialMap(): GameObj[][];
    onSpatialMapChanged(cb: () => void): KEventController;
    onNavigationMapInvalid(cb: () => void): KEventController;
    invalidateNavigationMap(): void;
    onNavigationMapChanged(cb: () => void): KEventController;
}

/**
 * @group Options
 */
export type PathFindOpt = {
    allowDiagonals?: boolean;
};

/**
 * The list of easing functions available.
 *
 * @group Math
 */
export type EaseFuncs =
    | "linear"
    | "easeInSine"
    | "easeOutSine"
    | "easeInOutSine"
    | "easeInQuad"
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeInQuart"
    | "easeOutQuart"
    | "easeInOutQuart"
    | "easeInQuint"
    | "easeOutQuint"
    | "easeInOutQuint"
    | "easeInExpo"
    | "easeOutExpo"
    | "easeInOutExpo"
    | "easeInCirc"
    | "easeOutCirc"
    | "easeInOutCirc"
    | "easeInBack"
    | "easeOutBack"
    | "easeInOutBack"
    | "easeInElastic"
    | "easeOutElastic"
    | "easeInOutElastic"
    | "easeInBounce"
    | "easeOutBounce"
    | "easeInOutBounce";

/**
 * A function that takes a time value and returns a new time value.
 *
 * @group Math
 */
export type EaseFunc = (t: number) => number;

// TODO: use PromiseLike or extend Promise?
/**
 * @group Timer
 */
export type TimerController = {
    /**
     * If the event handler is paused.
     */
    paused: boolean;
    /**
     * Cancel the event handler.
     */
    cancel(): void;
    /**
     * Register an event when finished.
     */
    onEnd(action: () => void): void;
    then(action: () => void): TimerController;
};

/**
 * Event controller for tween.
 *
 * @group Timer
 */
export type TweenController = TimerController & {
    /**
     * Finish the tween now and cancel.
     */
    finish(): void;
};

export interface SpriteCurAnim {
    name: string;
    timer: number;
    loop: boolean;
    speed: number;
    pingpong: boolean;
    onEnd: () => void;
}
