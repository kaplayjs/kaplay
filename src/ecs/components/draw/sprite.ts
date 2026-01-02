// TODO: accept canvas

import type { Asset } from "../../../assets/asset";
import {
    resolveSprite,
    type SpriteAnim,
    type SpriteData,
} from "../../../assets/sprite";
import { DEF_ANCHOR } from "../../../constants/general";
import { KEvent, type KEventController } from "../../../events/events";
import { onLoad } from "../../../events/globalEvents";
import { getRenderProps } from "../../../game/utils";
import { anchorPt } from "../../../gfx/anchor";
import { drawTexture } from "../../../gfx/draw/drawTexture";
import type { Texture } from "../../../gfx/gfx";
import { Quad, quad, Rect, vec2 } from "../../../math/math";
import { type Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj, SpriteAnimPlayOpt } from "../../../types";
import { warn } from "../../../utils/log";
import { nextRenderAreaVersion } from "../physics/area";

/**
 * The serialized {@link sprite `sprite()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export type SerializedSpriteComp = SpriteCompOpt & {
    sprite: string;
};

/**
 * Current animation data.
 */
export interface SpriteCurAnim {
    name: string;
    timer: number;
    loop: boolean;
    speed: number;
    /**
     * The current index relative to the start of the
     * associated `frames` array for this animation.
     * This may be greater than the number of frames
     * in the sprite.
     */
    frameIndex: number;
    pingpong: boolean;
    onEnd: () => void;
}

/**
 * The {@link sprite `sprite()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
    serialize(): SerializedSpriteComp;
}

/**
 * Options for the {@link sprite `sprite()`} component.
 *
 * @group Components
 * @subgroup Component Types
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
): SpriteComp & { _renderAreaVersion: number } {
    let spriteData: SpriteData | null = null;
    let curAnim: SpriteCurAnim | null = null;
    // 1  - from small index to large index
    // -1 - reverse
    let curAnimDir: -1 | 1 | null = null;
    const spriteLoadedEvent = new KEvent<[SpriteData]>();

    if (!src) {
        throw new Error("Please pass the resource name or data to sprite()");
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

        const scale = calcTexScale(spr.tex, q, opt.width, opt.height);

        obj.width = spr.tex.width * q.w * scale.x;
        obj.height = spr.tex.height * q.h * scale.y;

        if (spr.anims) {
            for (let animName in spr.anims) {
                const anim = spr.anims[animName];
                if (typeof anim !== "number") {
                    anim.frames = createAnimFrames(anim);
                }
            }
        }

        spriteData = spr;
        spriteLoadedEvent.trigger(spriteData);

        if (opt.anim) {
            obj.play(opt.anim);
        }
    };

    const createAnimFrames = (anim: Exclude<SpriteAnim, number>) => {
        if (anim.frames) {
            return anim.frames;
        }
        const frames = [];
        if (anim.from === undefined || anim.to === undefined) {
            throw new Error(
                "Sprite anim 'from' and 'to' must be defined if 'frames' is not defined",
            );
        }
        const frameSeqLength = Math.abs(anim.to - anim.from) + 1;
        for (let i = 0; i < frameSeqLength; i++) {
            frames.push(anim.from + i * Math.sign(anim.to - anim.from));
        }
        if (anim.pingpong) {
            for (let i = frameSeqLength - 2; i > 0; i--) {
                frames.push(frames[i]);
            }
        }
        return frames;
    };

    let _shape: Rect | undefined;
    let _width = 0;
    let _height = 0;

    return {
        id: "sprite",
        // TODO: allow update
        get width() {
            return _width;
        },
        set width(value) {
            if (_width != value) {
                _width = value;
                if (_shape) _shape.width = value;
                this._renderAreaVersion = nextRenderAreaVersion();
            }
        },
        get height() {
            return _height;
        },
        set height(value) {
            if (_height != value) {
                _height = value;
                if (_shape) _shape.height = value;
                this._renderAreaVersion = nextRenderAreaVersion();
            }
        },
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
                spr.onLoad((spr) =>
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

            if (anim.from === undefined || anim.to === undefined) {
                return curAnim.frameIndex;
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
                // TODO: use scale or width / height, or both?
                const { left, right, top, bottom, tileMode } =
                    spriteData.slice9;

                if (opt.tiled) {
                    warn(
                        "sprite(): 'tiled' option is ignored for 9-slice sprites. Use 'tileMode' in slice9 config instead.",
                    );
                }

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
                const props = getRenderProps(this);
                const offset = anchorPt(props.anchor || DEF_ANCHOR);
                const offsetX = -(offset.x + 1) * 0.5 * this.width;
                const offsetY = -(offset.y + 1) * 0.5 * this.height;
                for (let i = 0; i < 9; i++) {
                    const uv = quads[i];
                    const transform = quads[i + 9];
                    if (transform.w == 0 || transform.h == 0) {
                        continue;
                    }
                    const isCenter = i === 4;
                    const isEdge = i === 1 || i === 3 || i === 5 || i === 7;
                    const shouldTile = isCenter
                        ? tileMode === "center" || tileMode === "all"
                        : isEdge
                        ? tileMode === "edges" || tileMode === "all"
                        : false;
                    drawTexture(
                        Object.assign(props, {
                            pos: transform.pos().add(offsetX, offsetY),
                            anchor: "topleft",
                            tex: spriteData.tex,
                            quad: q.scale(uv),
                            flipX: this.flipX,
                            flipY: this.flipY,
                            tiled: shouldTile,
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
                spr.onLoad((spr) => setSpriteData(this, spr));
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

            curAnim.timer += _k.app.dt() * this.animSpeed;

            if (curAnim.timer >= 1 / curAnim.speed) {
                curAnim.timer = 0;
                curAnim.frameIndex += curAnimDir;

                const frames = anim.frames!;
                if (curAnim.frameIndex >= frames.length) {
                    if (curAnim.pingpong && !anim.pingpong) {
                        curAnimDir = -1;
                        curAnim.frameIndex = frames.length - 2;
                    }
                    else if (curAnim.loop) {
                        curAnim.frameIndex = 0;
                    }
                    else {
                        this.frame = frames.at(-1)!;
                        const anim = curAnim;
                        this.stop();
                        anim.onEnd();
                        return;
                    }
                }
                else if (curAnim.frameIndex < 0) {
                    if (curAnim.pingpong && curAnim.loop) {
                        curAnimDir = 1;
                        curAnim.frameIndex = 1;
                    }
                    else if (curAnim.loop) {
                        curAnim.frameIndex = frames.length - 1;
                    }
                    else {
                        this.frame = frames[0];
                        const anim = curAnim;
                        this.stop();
                        anim.onEnd();
                        return;
                    }
                }

                this.frame = frames[curAnim.frameIndex];
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
                if (opt.preventRestart && curAnim.name === name) return;
                this.stop();
            }

            curAnim = typeof anim === "number"
                ? {
                    name: name,
                    timer: 0,
                    loop: false,
                    pingpong: false,
                    speed: 0,
                    frameIndex: 0,
                    onEnd: () => {},
                }
                : {
                    name: name,
                    timer: 0,
                    loop: opt.loop ?? anim.loop ?? false,
                    pingpong: opt.pingpong ?? anim.pingpong ?? false,
                    speed: opt.speed ?? anim.speed ?? 10,
                    frameIndex: 0,
                    onEnd: opt.onEnd ?? (() => {}),
                };

            curAnimDir = typeof anim === "number" ? null : 1;
            this.frame = typeof anim === "number" ? anim : anim.frames![0];

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
            return this.getAnim(name) !== null;
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
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },

        _renderAreaVersion: 0,

        inspect() {
            if (typeof src === "string") {
                return `sprite: "${src}"`;
            }
            return null;
        },

        serialize() {
            const data: any = { sprite: this.sprite };
            if (opt.frame) data.frame = opt.frame;
            if (opt.tiled) data.tiled = opt.tiled;
            if (opt.width) data.width = opt.width;
            if (opt.height) data.height = opt.height;
            if (opt.anim) data.anim = opt.anim;
            if (opt.animSpeed) data.animSpeed = opt.animSpeed;
            if (this.flipX) data.flipX = this.flipX;
            if (this.flipY) data.flipY = this.flipY;
            if (opt.quad) {
                data.quad = {
                    x: opt.quad.x,
                    y: opt.quad.y,
                    w: opt.quad.w,
                    h: opt.quad.h,
                };
            }
            return data;
        },
    };
}

export function spriteFactory(data: SerializedSpriteComp) {
    const opt: SpriteCompOpt = {};
    if (data.frame) opt.frame = data.frame;
    if (data.tiled) opt.tiled = data.tiled;
    if (data.width) opt.width = data.width;
    if (data.height) opt.height = data.height;
    if (data.anim) opt.anim = data.anim;
    if (data.animSpeed) opt.animSpeed = data.animSpeed;
    if (data.flipX) opt.flipX = data.flipX;
    if (data.flipY) opt.flipY = data.flipY;
    if (data.quad) {
        opt.quad = quad(data.quad.x, data.quad.y, data.quad.w, data.quad.h);
    }
    return sprite(data.sprite, opt);
}
