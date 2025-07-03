"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.video = video;
var utils_1 = require("../../../game/utils");
var drawRect_1 = require("../../../gfx/draw/drawRect");
var drawUVQuad_1 = require("../../../gfx/draw/drawUVQuad");
var gfx_1 = require("../../../gfx/gfx");
var math_1 = require("../../../math/math");
var shared_1 = require("../../../shared");
// region video
function video(url, opt) {
    var _video = document.createElement("video");
    var _playing = false;
    var _timeupdate = false;
    var _canCopyVideo = false;
    var _texture = new gfx_1.Texture(shared_1._k.gfx.ggl, opt.width, opt.height);
    var _shape;
    var _width = opt.width;
    var _height = opt.height;
    return {
        id: "video",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape)
                _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape)
                _shape.height = value;
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
        play: function () {
            _video.play();
        },
        pause: function () {
            _video.pause();
        },
        get mute() {
            return _video.muted;
        },
        set mute(value) {
            _video.muted = value;
        },
        add: function () {
            _video.playsInline = true;
            // _video.muted = true; Don't use this, sound will not work
            _video.loop = true;
            _video.autoplay = false;
            _video.crossOrigin = "anonymous";
            _video.addEventListener("playing", function () {
                _playing = true;
                updateCopyFlag();
            }, true);
            _video.addEventListener("timeupdate", function () {
                _timeupdate = true;
                updateCopyFlag();
            }, true);
            if (url.startsWith("http")) { // Make sure redirects work
                // console.log(`Fetching ${url}`);
                fetch(url, {
                    method: "HEAD",
                    mode: "no-cors",
                }).then(function (response) {
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
        update: function () {
            if (_canCopyVideo) {
                var gl = shared_1._k.gfx.ggl.gl;
                _texture.bind();
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _video);
                _texture.unbind();
                // console.log(`${this.currentTime}/${this.duration}`);
            }
        },
        draw: function () {
            if (_canCopyVideo) {
                (0, drawUVQuad_1.drawUVQuad)(Object.assign((0, utils_1.getRenderProps)(this), {
                    width: this.width,
                    height: this.height,
                    tex: _texture,
                }));
            }
            else {
                (0, drawRect_1.drawRect)(Object.assign((0, utils_1.getRenderProps)(this), {
                    width: this.width,
                    height: this.height,
                }));
            }
        },
        renderArea: function () {
            if (!_shape) {
                _shape = new math_1.Rect((0, math_1.vec2)(0), _width, _height);
            }
            return _shape;
        },
    };
}
