// TODO: accept canvas

import { dt } from "../../app";
import type { Asset, SpriteAnim, SpriteData } from "../../assets";
import { resolveSprite } from "../../assets/sprite";
import { onLoad } from "../../game";
import { getRenderProps } from "../../game/utils";
import { drawTexture, type Texture } from "../../gfx";
import { Quad, quad, Rect, Vec2, vec2 } from "../../math";
import type {
    Comp,
    GameObj,
    SpriteAnimPlayOpt,
    SpriteCurAnim,
} from "../../types";
import { KEvent, KEventController } from "../../utils/";

/**
 * The {@link sprite `sprite()`} component.
 *
 * @group Component Types
 */
export interface SpriteComp extends Comp {
    draw: Comp["draw"];
    /**
     * Name of the sprite.
     */
    sprite: string;
    /**
     * Width for sprite.
     */
    width: number;
    /**
     * Height for sprite.
     */
    height: number;
    /**
     * Current frame in the entire spritesheet.
     */
    frame: number;
    /**
     * Current frame in relative to the animation that is currently playing.
     */
    animFrame: number;
    /**
     * The rectangular area of the texture to render.
     */
    quad: Quad;
    /**
     * Play a piece of anim.
     */
    play(anim: string, options?: SpriteAnimPlayOpt): void;
    /**
     * Stop current anim.
     */
    stop(): void;
    /**
     * Get total number of frames.
     */
    numFrames(): number;
    /**
     * Get the current animation data.
     *
     * @since v3001.0
     */
    getCurAnim(): SpriteCurAnim | null;
    /**
     * Get current anim name.
     *
     * @deprecated Use `getCurAnim().name` instead.
     */
    curAnim(): string | undefined;
    /**
     * Check if object's sprite has an animation.
     */
    hasAnim(name: string): boolean;
    /**
     * Get an animation.
     */
    getAnim(name: string): SpriteAnim | null;
    /**
     * Speed multiplier for all animations (for the actual fps for an anim use .play("anim", { speed: 10 })).
     */
    animSpeed: number;
    /**
     * Flip texture horizontally.
     */
    flipX: boolean;
    /**
     * Flip texture vertically.
     */
    flipY: boolean;
    /**
     * Register an event that runs when an animation is played.
     */
    onAnimStart(action: (anim: string) => void): KEventController;
    /**
     * Register an event that runs when an animation is ended.
     */
    onAnimEnd(action: (anim: string) => void): KEventController;
    /**
     * @since v3000.0
     */
    renderArea(): Rect;
}

/**
 * Options for the {@link sprite `sprite()`} component.
 *
 * @group Component Types
 */
export interface SpriteCompOpt {
    /**
     * If the sprite is loaded with multiple frames, or sliced, use the frame option to specify which frame to draw.
     */
    frame?: number;
    /**
     * If provided width and height, don't stretch but instead render tiled.
     */
    tiled?: boolean;
    /**
     * Stretch sprite to a certain width.
     */
    width?: number;
    /**
     * Stretch sprite to a certain height.
     */
    height?: number;
    /**
     * Play an animation on start.
     */
    anim?: string;
    /**
     * Speed multiplier for all animations (for the actual fps for an anim use .play("anim", { speed: 10 })).
     */
    animSpeed?: number;
    /**
     * Flip texture horizontally.
     */
    flipX?: boolean;
    /**
     * Flip texture vertically.
     */
    flipY?: boolean;
    /**
     * The rectangular sub-area of the texture to render, default to full texture `quad(0, 0, 1, 1)`.
     */
    quad?: Quad;
    /**
     * If fill the sprite (useful if you only want to render outline with outline() component).
     */
    fill?: boolean;
}

// TODO: clean
export function sprite(
    src: string | SpriteData | Asset<SpriteData>,
    opt: SpriteCompOpt = {},
): SpriteComp {
    let spriteData: SpriteData | null = null;
    let curAnim: SpriteCurAnim | null = null;
    // 1  - from small index to large index
    // -1 - reverse
    let curAnimDir: -1 | 1 | null = null;
    const spriteLoadedEvent = new KEvent<[SpriteData]>();

    if (!src) {
        throw new Error(
            "Please pass the resource name or data to sprite()",
        );
    }

    const calcTexScale = (
        tex: Texture,
        q: Quad,
        w?: number,
        h?: number,
    ): Vec2 => {
        const scale = vec2(1, 1);
        if (w && h) {
            scale.x = w / (tex.width * q.w);
            scale.y = h / (tex.height * q.h);
        }
        else if (w) {
            scale.x = w / (tex.width * q.w);
            scale.y = scale.x;
        }
        else if (h) {
            scale.y = h / (tex.height * q.h);
            scale.x = scale.y;
        }
        return scale;
    };

    const setSpriteData = (
        obj: GameObj<SpriteComp>,
        spr: SpriteData | null,
    ) => {
        if (!spr) return;

        let q = spr.frames[0].clone();

        if (opt.quad) {
            q = q.scale(opt.quad);
        }

        const scale = calcTexScale(
            spr.tex,
            q,
            opt.width,
            opt.height,
        );

        obj.width = spr.tex.width * q.w * scale.x;
        obj.height = spr.tex.height * q.h * scale.y;

        if (opt.anim) {
            obj.play(opt.anim);
        }

        spriteData = spr;
        spriteLoadedEvent.trigger(spriteData);
    };

    return {
        id: "sprite",
        // TODO: allow update
        width: 0,
        height: 0,
        frame: opt.frame || 0,
        quad: opt.quad || new Quad(0, 0, 1, 1),
        animSpeed: opt.animSpeed ?? 1,
        flipX: opt.flipX ?? false,
        flipY: opt.flipY ?? false,

        get sprite() {
            return src.toString();
        },

        set sprite(src) {
            const spr = resolveSprite(src);

            if (spr) {
                spr.onLoad(spr =>
                    setSpriteData(this as unknown as GameObj<SpriteComp>, spr)
                );
            }
        },

        get animFrame() {
            if (!spriteData || !curAnim || curAnimDir === null) {
                return this.frame;
            }

            const anim = spriteData.anims[curAnim.name];

            if (typeof anim === "number") {
                return anim;
            }

            return this.frame - Math.min(anim.from, anim.to);
        },

        draw(this: GameObj<SpriteComp>) {
            if (!spriteData) return;

            const q = spriteData.frames[this.frame ?? 0];

            if (!q) {
                throw new Error(`Frame not found: ${this.frame ?? 0}`);
            }

            if (spriteData.slice9) {
                // TODO: tile
                // TODO: use scale or width / height, or both?
                const { left, right, top, bottom } = spriteData.slice9;
                const tw = spriteData.tex.width * q.w;
                const th = spriteData.tex.height * q.h;
                const iw = this.width - left - right;
                const ih = this.height - top - bottom;
                const w1 = left / tw;
                const w3 = right / tw;
                const w2 = 1 - w1 - w3;
                const h1 = top / th;
                const h3 = bottom / th;
                const h2 = 1 - h1 - h3;
                const quads = [
                    // uv
                    quad(0, 0, w1, h1),
                    quad(w1, 0, w2, h1),
                    quad(w1 + w2, 0, w3, h1),
                    quad(0, h1, w1, h2),
                    quad(w1, h1, w2, h2),
                    quad(w1 + w2, h1, w3, h2),
                    quad(0, h1 + h2, w1, h3),
                    quad(w1, h1 + h2, w2, h3),
                    quad(w1 + w2, h1 + h2, w3, h3),
                    // transform
                    quad(0, 0, left, top),
                    quad(left, 0, iw, top),
                    quad(left + iw, 0, right, top),
                    quad(0, top, left, ih),
                    quad(left, top, iw, ih),
                    quad(left + iw, top, right, ih),
                    quad(0, top + ih, left, bottom),
                    quad(left, top + ih, iw, bottom),
                    quad(left + iw, top + ih, right, bottom),
                ];
                for (let i = 0; i < 9; i++) {
                    const uv = quads[i];
                    const transform = quads[i + 9];
                    drawTexture(
                        Object.assign(getRenderProps(this), {
                            pos: transform.pos(),
                            tex: spriteData.tex,
                            quad: q.scale(uv),
                            flipX: this.flipX,
                            flipY: this.flipY,
                            tiled: opt.tiled,
                            width: transform.w,
                            height: transform.h,
                        }),
                    );
                }
            }
            else {
                drawTexture(
                    Object.assign(getRenderProps(this), {
                        tex: spriteData.tex,
                        quad: q.scale(this.quad ?? new Quad(0, 0, 1, 1)),
                        flipX: this.flipX,
                        flipY: this.flipY,
                        tiled: opt.tiled,
                        width: this.width,
                        height: this.height,
                    }),
                );
            }
        },

        add(this: GameObj<SpriteComp>) {
            const spr = resolveSprite(src);

            if (spr) {
                // The sprite exists
                spr.onLoad(spr => setSpriteData(this, spr));
            }
            else {
                // The sprite may be loaded later in the script, check again when all resources have been loaded
                onLoad(() => setSpriteData(this, resolveSprite(src)!.data));
            }
        },

        update(this: GameObj<SpriteComp>) {
            if (!spriteData || !curAnim || curAnimDir === null) {
                return;
            }

            const anim = spriteData!.anims[curAnim.name];

            if (typeof anim === "number") {
                this.frame = anim;
                return;
            }

            if (anim.speed === 0) {
                throw new Error("Sprite anim speed cannot be 0");
            }

            curAnim.timer += dt() * this.animSpeed;

            if (curAnim.timer >= (1 / curAnim.speed)) {
                curAnim.timer = 0;
                this.frame += curAnimDir;

                if (
                    this.frame < Math.min(anim.from, anim.to)
                    || this.frame > Math.max(anim.from, anim.to)
                ) {
                    if (curAnim.loop) {
                        if (curAnim.pingpong) {
                            this.frame -= curAnimDir;
                            curAnimDir *= -1;
                            this.frame += curAnimDir;
                        }
                        else {
                            this.frame = anim.from;
                        }
                    }
                    else {
                        if (curAnim.pingpong) {
                            const isForward = curAnimDir
                                === Math.sign(anim.to - anim.from);
                            if (isForward) {
                                this.frame = anim.to;
                                curAnimDir *= -1;
                                this.frame += curAnimDir;
                            }
                            else {
                                this.frame = anim.from;
                                curAnim.onEnd();
                                this.stop();
                            }
                        }
                        else {
                            this.frame = anim.to;
                            curAnim.onEnd();
                            this.stop();
                        }
                    }
                }
            }
        },

        play(
            this: GameObj<SpriteComp>,
            name: string,
            opt: SpriteAnimPlayOpt = {},
        ) {
            if (!spriteData) {
                spriteLoadedEvent.add(() => this.play(name, opt));
                return;
            }

            const anim = spriteData.anims[name];

            if (anim === undefined) {
                throw new Error(`Anim not found: ${name}`);
            }

            if (curAnim) {
                this.stop();
            }

            curAnim = typeof anim === "number"
                ? {
                    name: name,
                    timer: 0,
                    loop: false,
                    pingpong: false,
                    speed: 0,
                    onEnd: () => {},
                }
                : {
                    name: name,
                    timer: 0,
                    loop: opt.loop ?? anim.loop ?? false,
                    pingpong: opt.pingpong ?? anim.pingpong ?? false,
                    speed: opt.speed ?? anim.speed ?? 10,
                    onEnd: opt.onEnd ?? (() => {}),
                };

            curAnimDir = typeof anim === "number"
                ? null
                : anim.from < anim.to
                ? 1
                : -1;

            this.frame = typeof anim === "number"
                ? anim
                : anim.from;

            this.trigger("animStart", name);
        },

        stop(this: GameObj<SpriteComp>) {
            if (!curAnim) {
                return;
            }
            const prevAnim = curAnim.name;
            curAnim = null;
            this.trigger("animEnd", prevAnim);
        },

        numFrames() {
            return spriteData?.frames.length ?? 0;
        },

        getCurAnim() {
            return curAnim;
        },

        curAnim() {
            return curAnim?.name;
        },

        getAnim(name) {
            return spriteData?.anims[name] ?? null;
        },

        hasAnim(name) {
            return Boolean(this.getAnim(name));
        },

        onAnimEnd(
            this: GameObj<SpriteComp>,
            action: (name: string) => void,
        ): KEventController {
            return this.on("animEnd", action);
        },

        onAnimStart(
            this: GameObj<SpriteComp>,
            action: (name: string) => void,
        ): KEventController {
            return this.on("animStart", action);
        },

        renderArea() {
            return new Rect(vec2(0), this.width, this.height);
        },

        inspect() {
            if (typeof src === "string") {
                return `sprite: "${src}"`;
            }
            return null;
        },
    };
}
