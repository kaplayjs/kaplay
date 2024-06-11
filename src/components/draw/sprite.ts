// TODO: accept canvas

import type { Texture } from "@/gfx";
import { getInternalContext, getKaboomContext } from "@/kaboom";
import { Quad, quad, Vec2, vec2 } from "@/math";
import type {
    Asset,
    GameObj,
    SpriteAnimPlayOpt,
    SpriteComp,
    SpriteCompOpt,
    SpriteCurAnim,
    SpriteData,
} from "@/types";
import { Event, EventController } from "@/utils";

// TODO: clean
export function sprite(
    src: string | SpriteData | Asset<SpriteData>,
    opt: SpriteCompOpt = {},
): SpriteComp {
    const k = getKaboomContext(this);
    const internal = getInternalContext(k);

    let spriteData: SpriteData | null = null;
    let curAnim: SpriteCurAnim | null = null;
    // 1  - from small index to large index
    // -1 - reverse
    let curAnimDir: -1 | 1 | null = null;
    const spriteLoadedEvent = new Event<[SpriteData]>();

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
        } else if (w) {
            scale.x = w / (tex.width * q.w);
            scale.y = scale.x;
        } else if (h) {
            scale.y = h / (tex.height * q.h);
            scale.x = scale.y;
        }
        return scale;
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
                    internal.drawTexture(
                        Object.assign(internal.getRenderProps(this), {
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
            } else {
                internal.drawTexture(
                    Object.assign(internal.getRenderProps(this), {
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
            const setSpriteData = (spr) => {
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

                this.width = spr.tex.width * q.w * scale.x;
                this.height = spr.tex.height * q.h * scale.y;

                if (opt.anim) {
                    this.play(opt.anim);
                }

                spriteData = spr;
                spriteLoadedEvent.trigger(spriteData);
            };

            const spr = internal.resolveSprite(src);

            if (spr) {
                spr.onLoad(setSpriteData);
            } else {
                k.onLoad(() => setSpriteData(internal.resolveSprite(src).data));
            }
        },

        update(this: GameObj<SpriteComp>) {
            if (!curAnim) {
                return;
            }

            const anim = spriteData.anims[curAnim.name];

            if (typeof anim === "number") {
                this.frame = anim;
                return;
            }

            if (anim.speed === 0) {
                throw new Error("Sprite anim speed cannot be 0");
            }

            curAnim.timer += k.dt() * this.animSpeed;

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
                        } else {
                            this.frame = anim.from;
                        }
                    } else {
                        if (curAnim.pingpong) {
                            const isForward = curAnimDir
                                === Math.sign(anim.to - anim.from);
                            if (isForward) {
                                this.frame = anim.to;
                                curAnimDir *= -1;
                                this.frame += curAnimDir;
                            } else {
                                this.frame = anim.from;
                                curAnim.onEnd();
                                this.stop();
                            }
                        } else {
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

        onAnimEnd(
            this: GameObj<SpriteComp>,
            action: (name: string) => void,
        ): EventController {
            return this.on("animEnd", action);
        },

        onAnimStart(
            this: GameObj<SpriteComp>,
            action: (name: string) => void,
        ): EventController {
            return this.on("animStart", action);
        },

        renderArea() {
            return new k.Rect(vec2(0), this.width, this.height);
        },

        inspect() {
            if (typeof src === "string") {
                return `"${src}"`;
            }
        },
    };
}
