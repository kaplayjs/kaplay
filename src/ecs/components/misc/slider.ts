import type { KEventController } from "../../../events/events";
import { toWorld } from "../../../game/camera";
import { drawFormattedText } from "../../../gfx/draw/drawFormattedText";
import { drawRect } from "../../../gfx/draw/drawRect";
import { drawSprite } from "../../../gfx/draw/drawSprite";
import { formatText } from "../../../gfx/formatText";
import { clamp } from "../../../math/clamp";
import { Color } from "../../../math/color";
import { Rect, vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { isFixed } from "../../entity/utils";
import { _theme } from "./button";
import { ui, type UIComp } from "./ui";

export type UIOrientation = "horizontal" | "vertical";

export type SliderCompOpt = {
    position?: Vec2;
    width?: number;
    height?: number;
    label?: string;
    orientation?: UIOrientation;
    scrollObject?: GameObj;
    value?: number;
    min?: number;
    max?: number;
    padding?: Vec2;
};

export interface SliderComp extends Comp {
    width: number;
    height: number;
    value: number;
    min: number;
    max: number;
    onValueChanged(cb: (value: number) => void): KEventController;

    renderArea(): Rect;
}

export function slider(opt: SliderCompOpt): SliderComp {
    const _localTheme = opt.scrollObject
        ? _theme.scrollbar ?? _theme.slider
        : _theme.slider;
    const _padding = opt.padding ?? _localTheme.padding ?? vec2();
    const _spacing = _localTheme.spacing ?? vec2();
    let _shape: Rect | undefined;
    let formattedText = opt.label
        ? formatText({
            pos: _padding,
            text: opt.label,
            size: _theme.fontSize,
            color: _theme.fontColor,
        })
        : null;
    const labelWidth = formattedText ? formattedText.width + _spacing.x : 0;
    let _width = opt.width
        ?? (opt.orientation === "vertical" ? _theme.fontSize : 100);
    const widthWithoutLabel = opt.orientation === "vertical"
        ? _theme.fontSize
        : _width - labelWidth - _padding.x * 2;

    let _height = opt.orientation === "vertical"
        ? (opt.height ?? 100)
        : formattedText
        ? formattedText.height
        : _theme.fontSize;
    let _value = opt.value ?? 0;
    let _sliderRect = new Rect(
        vec2(_padding.x + labelWidth, 0),
        widthWithoutLabel,
        _height,
    );
    const gutterThickness = opt.scrollObject
        ? (opt.orientation === "vertical" ? _width : _height)
        : 4;
    let _gutterRect = opt.orientation === "vertical"
        ? new Rect(
            _sliderRect.pos.add(_width / 2 - gutterThickness / 2, 0),
            gutterThickness,
            _sliderRect.height,
        )
        : new Rect(
            _sliderRect.pos.add(0, _height / 2 - gutterThickness / 2),
            _sliderRect.width,
            gutterThickness,
        );
    let _thumbRect = opt.orientation === "vertical"
        ? new Rect(
            vec2(_sliderRect.pos.x + 2, _sliderRect.pos.y + 2),
            _width - 4,
            10,
        )
        : new Rect(
            vec2(_sliderRect.pos.x + 2, _sliderRect.pos.y + 2),
            10,
            _height - 4,
        );
    let _min = opt.min ?? 0;
    let _max = opt.max ?? 1;
    let _scrollObject = opt.scrollObject ?? null;
    let _grabPos: Vec2 | null = null;
    function updateThumbWidth() {
        if (_scrollObject) {
            const totalWidth = _scrollObject.width;
            const visibleWidth = _scrollObject.parent!.width;
            _thumbRect.width = Math.round(
                (_gutterRect.width - 4) * visibleWidth
                    / totalWidth,
            );
        }
    }
    function updateThumbHeight() {
        if (_scrollObject) {
            const totalHeight = _scrollObject.height;
            const visibleHeight = _scrollObject.parent!.height;
            _thumbRect.height = Math.round(
                (_gutterRect.height - 4) * visibleHeight
                    / totalHeight,
            );
        }
    }
    function updateHScroll() {
        if (_scrollObject) {
            const totalWidth = _scrollObject.width;
            const visibleWidth = _scrollObject.parent!.width;
            _scrollObject.pos.x = -_value * (totalWidth - visibleWidth);
        }
    }
    function updateVScroll() {
        if (_scrollObject) {
            const totalHeight = _scrollObject.height;
            const visibleHeight = _scrollObject.parent!.height;
            _scrollObject.pos.y = -_value * (totalHeight - visibleHeight);
        }
    }
    return {
        id: "slider",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
            _sliderRect.width = _gutterRect.width = _width - labelWidth
                - _padding.x * 2;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        get value() {
            return _value * (_max - _min) + _min;
        },
        set value(value: number) {
            _value = (value - _min) / (_max - _min);
        },
        get min() {
            return _min;
        },
        set min(value: number) {
            _min = value;
        },
        get max() {
            return _max;
        },
        set max(value: number) {
            _max = value;
        },
        add(this: GameObj<SliderComp | UIComp>) {
            if (!this.has("ui")) {
                this.use(ui({ canFocus: true }));
            }
            this.onClick(() => {
                let pt = _k.k.mousePos();
                pt = isFixed(this) ? pt : toWorld(pt);
                this.transform.inverse.transformPointV(pt, pt);
                if (_thumbRect.contains(pt)) {
                    _grabPos = pt.sub(_thumbRect.pos);
                }
            });
            _k.k.onLoad(() => {
                if (opt.orientation === "vertical") {
                    updateThumbHeight();
                }
                else {
                    updateThumbWidth();
                }
            });
        },
        update(this: GameObj<SliderComp | UIComp>) {
            if (_grabPos && _k.k.isMouseDown()) {
                let pt = _k.k.mousePos();
                pt = isFixed(this) ? pt : toWorld(pt);
                this.transform.inverse.transformPointV(pt, pt);
                if (opt.orientation === "vertical") {
                    updateThumbHeight();
                    const minY = _gutterRect.pos.y + 2;
                    const maxY = _gutterRect.pos.y + _gutterRect.height
                        - _thumbRect.height - 2;
                    _thumbRect.pos.y = clamp(pt.y - _grabPos.y, minY, maxY);
                    _value = (_thumbRect.pos.y - minY) / (maxY - minY);
                    updateVScroll();
                    this.trigger("value", _value);
                }
                else {
                    updateThumbWidth();
                    const minX = _gutterRect.pos.x + 2;
                    const maxX = _gutterRect.pos.x + _gutterRect.width
                        - _thumbRect.width - 2;
                    _thumbRect.pos.x = clamp(pt.x - _grabPos.x, minX, maxX);
                    _value = (_thumbRect.pos.x - minX) / (maxX - minX);
                    updateHScroll();
                    this.trigger("value", _value);
                }
            }
            else if (_grabPos) {
                _grabPos = null;
            }
        },
        draw(this: GameObj<SliderComp | UIComp>) {
            // If label, draw label
            if (formattedText) {
                drawFormattedText(formattedText);
            }
            // Draw slider gutter
            if (_localTheme.gutterfill) {
                if (opt.orientation === "vertical") {
                    drawSprite({
                        pos: _gutterRect.pos,
                        sprite: _localTheme.gutter.sprite,
                        frame: _localTheme.gutter.frame,
                        width: _gutterRect.width,
                        height: _gutterRect.height * _value,
                    });
                    drawSprite({
                        pos: _gutterRect.pos.add(
                            0,
                            _gutterRect.height * _value,
                        ),
                        sprite: _localTheme.gutterfill.sprite,
                        frame: _localTheme.gutterfill.frame,
                        width: _gutterRect.width,
                        height: _gutterRect.height * (1 - _value),
                    });
                }
                else {
                    drawSprite({
                        pos: _gutterRect.pos,
                        sprite: _localTheme.gutterfill.sprite,
                        frame: _localTheme.gutterfill.frame,
                        width: _gutterRect.width * _value,
                        height: _gutterRect.height,
                    });
                    drawSprite({
                        pos: _gutterRect.pos.add(_gutterRect.width * _value, 0),
                        sprite: _localTheme.gutter.sprite,
                        frame: _localTheme.gutter.frame,
                        width: _gutterRect.width * (1 - _value),
                        height: _gutterRect.height,
                    });
                }
            }
            else {
                drawSprite({
                    pos: _gutterRect.pos,
                    sprite: _localTheme.gutter.sprite,
                    frame: _localTheme.gutter.frame,
                    width: _gutterRect.width,
                    height: _gutterRect.height,
                });
            }
            // Draw slider thumb
            drawSprite({
                pos: _thumbRect.pos,
                sprite: _localTheme.thumb.sprite,
                frame: _localTheme.thumb.frame,
                width: _thumbRect.width,
                height: _thumbRect.height,
            });
            if (this.isFocus) {
                drawRect({
                    pos: vec2(0, -1),
                    width: this.width + 1,
                    height: this.height + 1,
                    fill: false,
                    outline: {
                        width: 1,
                        color: _theme.hoverColor,
                    },
                });
            }
        },
        onValueChanged(this: GameObj, cb: (value: number) => void) {
            return this.on("value", this.value);
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    };
}

export type ScrollBarCompOpt = {
    position?: Vec2;
    width?: number;
    height?: number;
    label?: string;
    orientation?: UIOrientation;
    value?: number;
    min?: number;
    max?: number;
    padding?: Vec2;
};

export function scrollbar(scrollObject: GameObj, opt: ScrollBarCompOpt) {
    return slider({ ...opt, scrollObject });
}
