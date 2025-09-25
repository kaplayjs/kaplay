import { toWorld } from "../../../game/camera";
import { drawFormattedText } from "../../../gfx/draw/drawFormattedText";
import { drawRect } from "../../../gfx/draw/drawRect";
import { drawSprite } from "../../../gfx/draw/drawSprite";
import { formatText } from "../../../gfx/formatText";
import { clamp } from "../../../math/clamp";
import { Color, rgb } from "../../../math/color";
import { Rect, vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { isFixed } from "../../entity/utils";
import { ui, type UIComp } from "./ui";

const hoverColor = rgb(80, 80, 255);
const backgroundColor = rgb(144, 163, 174);

export interface ButtonComp extends Comp {
    width: number;
    height: number;
    value: boolean;

    renderArea(): Rect;
};

export function button(label: string): ButtonComp {
    let _shape: Rect | undefined;
    let formattedText = label ? formatText({
        pos: vec2(2, 2),
        text: label,
        size: 20,
        color: Color.BLACK
    }) : null;
    let _width = formattedText ? formattedText.width + 4 : 100;
    let _height = formattedText ? formattedText.height + 4 : 25;
    let _value = false;
    return {
        id: "button",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        get value() { return _value || (this as unknown as UIComp).isPressed },
        set value(value: boolean) { _value = value; },
        add(this: GameObj<ButtonComp>) {
            if (!this.has("ui")) {
                this.use(ui({ canFocus: true }));
            }
        },
        draw(this: GameObj<ButtonComp | UIComp>) {
            if (this.has("ui-visual")) {
                return;
            }
            // Draw button bg
            drawSprite({
                sprite: this.value ? "buttonpressed" : "button",
                width: this.width,
                height: this.height
            });
            // If label, draw label
            if (formattedText) {
                drawFormattedText(formattedText);
            }
            if (this.isFocus) {
                drawRect({
                    pos: vec2(0, -1),
                    width: this.width + 1,
                    height: this.height + 1,
                    fill: false,
                    outline: {
                        width: 1,
                        color: hoverColor,
                    }
                });
            }
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    }
}

export function checkbox(label: string): ButtonComp {
    let _shape: Rect | undefined;
    let formattedText = label ? formatText({
        pos: vec2(2 + 16, 2),
        text: label,
        size: 20,
        color: Color.BLACK
    }) : null;
    let _width = formattedText ? formattedText.width + 4 + 16 : 100;
    let _height = formattedText ? formattedText.height + 4 : 25;
    let _value = false;
    return {
        id: "checkbox",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        get value() { return _value || (this as unknown as UIComp).isPressed },
        set value(value: boolean) { _value = value; },
        add(this: GameObj<ButtonComp | UIComp>) {
            if (!this.has("ui")) {
                this.use(ui({ canFocus: true }));
            }
            this.onInvoke(() => _value = !_value);
        },
        draw(this: GameObj<ButtonComp | UIComp>) {
            if (this.has("ui-visual")) {
                return;
            }
            // Draw button bg
            drawSprite({
                pos: vec2(2, this.height / 2 - 8),
                sprite: "ui",
                frame: this.value ? 1 : 0,
            });
            // If label, draw label
            if (formattedText) {
                drawFormattedText(formattedText);
            }
            if (this.isFocus) {
                drawRect({
                    pos: vec2(0, -1),
                    width: this.width + 1,
                    height: this.height + 1,
                    fill: false,
                    outline: {
                        width: 1,
                        color: hoverColor,
                    }
                });
            }
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    }
}

export interface RadioComp extends ButtonComp {
    group: string;
};

export function radio(label: string, group: string): RadioComp {
    let _shape: Rect | undefined;
    let formattedText = label ? formatText({
        pos: vec2(2 + 16, 2),
        text: label,
        size: 20,
        color: Color.BLACK
    }) : null;
    let _width = formattedText ? formattedText.width + 4 + 16 : 100;
    let _height = formattedText ? formattedText.height + 4 : 25;
    let _value = false;
    return {
        id: "radio",
        group: group,
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        get value() { return _value || (this as unknown as UIComp).isPressed },
        set value(value: boolean) {
            if (value) {
                const that = this as unknown as GameObj<ButtonComp | UIComp>;
                that.parent!.get(this.group).forEach(obj => {
                    if (obj != that) {
                        obj.value = false;
                    }
                });
            }
            _value = value;
        },
        add(this: GameObj<ButtonComp | UIComp>) {
            if (!this.has("ui")) {
                this.use(ui({ canFocus: true }));
            }
            this.onInvoke(() => this.value = true);
        },
        draw(this: GameObj<ButtonComp | UIComp>) {
            if (this.has("ui-visual")) {
                return;
            }
            // Draw button bg
            drawSprite({
                pos: vec2(2, this.height / 2 - 8),
                sprite: "ui",
                frame: this.value ? 3 : 2,
            });
            // If label, draw label
            if (formattedText) {
                drawFormattedText(formattedText);
            }
            if (this.isFocus) {
                drawRect({
                    pos: vec2(0, -1),
                    width: this.width + 1,
                    height: this.height + 1,
                    fill: false,
                    outline: {
                        width: 1,
                        color: hoverColor,
                    }
                });
            }
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    }
}

export type UIOrientation = "horizontal" | "vertical";

export type SliderCompOpt = {
    position?: Vec2,
    size?: Vec2,
    label?: string,
    orientation?: UIOrientation
};

export interface SliderComp extends Comp {
    width: number;
    height: number;
    value: number;

    renderArea(): Rect;
}

export function slider(opt: SliderCompOpt): SliderComp {
    let _shape: Rect | undefined;
    let formattedText = opt.label ? formatText({
        pos: vec2(2, 2),
        text: opt.label,
        size: 20,
        color: Color.BLACK
    }) : null;
    let _width = formattedText ? formattedText.width + 100 + 4 : 100;
    let _height = formattedText ? formattedText.height + 4 : 20;
    let _value = 0;
    let _sliderRect = new Rect(vec2(_width - 100, 0), 100, _height);
    let _gutterRect = opt.orientation === "vertical" ?
        new Rect(_sliderRect.pos.add(_width / 2 - 2, 0), 4, _height) :
        new Rect(_sliderRect.pos.add(0, _height / 2 - 2), 100, 4);
    let _thumbRect = new Rect(vec2(_sliderRect.pos.x + 2, _sliderRect.pos.y + 2), 10, _height - 4);
    let _grabPos: Vec2 | null = null;
    return {
        id: "slider",
        get width() {
            return _width;
        },
        set width(value) {
            _width = value;
            if (_shape) _shape.width = value;
        },
        get height() {
            return _height;
        },
        set height(value) {
            _height = value;
            if (_shape) _shape.height = value;
        },
        get value() { return _value },
        set value(value: number) {
            _value = value;
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
        },
        update(this: GameObj<SliderComp | UIComp>) {
            if (_grabPos && _k.k.isMouseDown()) {
                let pt = _k.k.mousePos();
                pt = isFixed(this) ? pt : toWorld(pt);
                this.transform.inverse.transformPointV(pt, pt);
                if (opt.orientation === "vertical") {
                    const minY = _gutterRect.pos.y + 2;
                    const maxY = _gutterRect.pos.y + _gutterRect.height - _thumbRect.height - 2;
                    _thumbRect.pos.y = clamp(pt.y - _grabPos.y, minY, maxY);
                    _value = (_thumbRect.pos.y - minY) / (maxY - minY);
                }
                else {
                    const minX = _gutterRect.pos.x + 2;
                    const maxX = _gutterRect.pos.x + _gutterRect.width - _thumbRect.width - 2;
                    _thumbRect.pos.x = clamp(pt.x - _grabPos.x, minX, maxX);
                    _value = (_thumbRect.pos.y - minX) / (maxX - minX);
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
            // Draw slider bg
            drawSprite({
                pos: _gutterRect.pos,
                sprite: "buttonpressed",
                width: _gutterRect.width,
                height: _gutterRect.height
            });
            // Draw slider thumb
            drawSprite({
                pos: _thumbRect.pos,
                sprite: "button",
                width: _thumbRect.width,
                height: _thumbRect.height
            });
            if (this.isFocus) {
                drawRect({
                    pos: vec2(0, -1),
                    width: this.width + 1,
                    height: this.height + 1,
                    fill: false,
                    outline: {
                        width: 1,
                        color: hoverColor,
                    }
                });
            }
        },
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    }
}