"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TexPacker = void 0;
var math_1 = require("../math/math");
var Vec2_1 = require("../math/Vec2");
var gfx_1 = require("./gfx");
var TexPacker = /** @class */ function() {
    function TexPacker(gfx, w, h, padding) {
        this.lastTextureId = 0;
        this.textures = [];
        this.bigTextures = [];
        this.texturesPosition = new Map();
        this.x = 0;
        this.y = 0;
        this.curHeight = 0;
        this.gfx = gfx;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.textures = [gfx_1.Texture.fromImage(gfx, this.canvas)];
        this.bigTextures = [];
        this.padding = padding;
        var context2D = this.canvas.getContext("2d");
        if (!context2D) {
            throw new Error("Failed to get 2d context");
        }
        this.c2d = context2D;
    }
    // create a image with a single texture
    TexPacker.prototype.addSingle = function(img) {
        var tex = gfx_1.Texture.fromImage(this.gfx, img);
        this.bigTextures.push(tex);
        return [tex, new math_1.Quad(0, 0, 1, 1), 0];
    };
    TexPacker.prototype.add = function(img) {
        var paddedWidth = img.width + this.padding * 2;
        var paddedHeight = img.height + this.padding * 2;
        if (
            paddedWidth > this.canvas.width || paddedHeight > this.canvas.height
        ) {
            return this.addSingle(img);
        }
        // next row
        if (this.x + paddedWidth > this.canvas.width) {
            this.x = 0;
            this.y += this.curHeight;
            this.curHeight = 0;
        }
        // next texture
        if (this.y + paddedHeight > this.canvas.height) {
            this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.textures.push(gfx_1.Texture.fromImage(this.gfx, this.canvas));
            this.x = 0;
            this.y = 0;
            this.curHeight = 0;
        }
        var curTex = this.textures[this.textures.length - 1];
        var pos = new Vec2_1.Vec2(this.x + this.padding, this.y + this.padding);
        this.x += paddedWidth;
        if (paddedHeight > this.curHeight) {
            this.curHeight = paddedHeight;
        }
        if (img instanceof ImageData) {
            this.c2d.putImageData(img, pos.x, pos.y);
        }
        else {
            this.c2d.drawImage(img, pos.x, pos.y);
        }
        curTex.update(this.canvas);
        this.texturesPosition.set(this.lastTextureId, {
            position: pos,
            size: new Vec2_1.Vec2(img.width, img.height),
            texture: curTex,
        });
        this.lastTextureId++;
        return [
            curTex,
            new math_1.Quad(
                pos.x / this.canvas.width,
                pos.y / this.canvas.height,
                img.width / this.canvas.width,
                img.height / this.canvas.height,
            ),
            this.lastTextureId - 1,
        ];
    };
    TexPacker.prototype.free = function() {
        for (var _i = 0, _a = this.textures; _i < _a.length; _i++) {
            var tex = _a[_i];
            tex.free();
        }
        for (var _b = 0, _c = this.bigTextures; _b < _c.length; _b++) {
            var tex = _c[_b];
            tex.free();
        }
    };
    TexPacker.prototype.remove = function(packerId) {
        var tex = this.texturesPosition.get(packerId);
        if (!tex) {
            throw new Error("Texture with packer id not found");
        }
        this.c2d.clearRect(
            tex.position.x,
            tex.position.y,
            tex.size.x,
            tex.size.y,
        );
        tex.texture.update(this.canvas);
        this.texturesPosition.delete(packerId);
        this.x -= tex.size.x;
    };
    return TexPacker;
}();
exports.TexPacker = TexPacker;
