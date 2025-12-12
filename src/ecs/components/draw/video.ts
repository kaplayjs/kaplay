import { getRenderProps } from "../../../game/utils";
import { drawRect } from "../../../gfx/draw/drawRect";
import { drawUVQuad } from "../../../gfx/draw/drawUVQuad";
import { Texture } from "../../../gfx/gfx";
import { Rect, vec2 } from "../../../math/math";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { nextRenderAreaVersion } from "../physics/area";
import type { PosComp } from "../transform/pos";

export interface VideoComp extends Comp {
    width: number;
    height: number;
    currentTime: number;
    duration: number;
    play(): void;
    pause(): void;
    mute: boolean;
    renderArea(): Rect;
}

export type VideoCompOpt = {
    width: number;
    height: number;
};

// region video
export function video(
    url: string,
    opt: VideoCompOpt,
): VideoComp & { _renderAreaVersion: number } {
    const _video: HTMLVideoElement = document.createElement("video");
    let _playing = false;
    let _timeupdate = false;
    let _canCopyVideo = false;
    let _texture = new Texture(_k.gfx.ggl, opt.width, opt.height);
    let _shape: Rect | undefined;
    let _width = opt.width;
    let _height = opt.height;
    return {
        id: "video",
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
        get currentTime() {
            return _video.currentTime;
        },
        set currentTime(value) {
            _video.currentTime = value;
        },
        get duration() {
            return _video.duration;
        },
        play() {
            _video.play();
        },
        pause() {
            _video.pause();
        },
        get mute() {
            return _video.muted;
        },
        set mute(value) {
            _video.muted = value;
        },
        add() {
            _video.playsInline = true;
            // _video.muted = true; Don't use this, sound will not work
            _video.loop = true;
            _video.autoplay = false;
            _video.crossOrigin = "anonymous";

            _video.addEventListener(
                "playing",
                () => {
                    _playing = true;
                    updateCopyFlag();
                },
                true,
            );

            _video.addEventListener(
                "timeupdate",
                () => {
                    _timeupdate = true;
                    updateCopyFlag();
                },
                true,
            );

            if (url.startsWith("http")) { // Make sure redirects work
                // console.log(`Fetching ${url}`);

                fetch(url, {
                    method: "HEAD",
                    mode: "no-cors",
                }).then((response) => {
                    _video.src = response.url ? response.url : url;
                });
            }
            else {
                // console.log(`Not fetching ${url}`);

                _video.src = url;
            }

            function updateCopyFlag() {
                // console.log(`${_playing} ${_timeupdate}`);

                if (_playing && _timeupdate) {
                    _canCopyVideo = true;
                }
            }
        },
        update() {
            if (_canCopyVideo) {
                const gl = _k.gfx.ggl.gl;
                _texture.bind();
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    _video,
                );
                _texture.unbind();

                // console.log(`${this.currentTime}/${this.duration}`);
            }
        },
        draw(this: GameObj<PosComp | VideoComp>) {
            if (_canCopyVideo) {
                drawUVQuad(Object.assign(getRenderProps(this), {
                    width: this.width,
                    height: this.height,
                    tex: _texture,
                }));
            }
            else {
                drawRect(Object.assign(getRenderProps(this), {
                    width: this.width,
                    height: this.height,
                }));
            }
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
                this._renderAreaVersion = nextRenderAreaVersion();
            }
            return _shape;
        },
        _renderAreaVersion: 0,
    };
}
