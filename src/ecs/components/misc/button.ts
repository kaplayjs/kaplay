import type { Asset } from "../../../assets/asset";
import type { SpriteData } from "../../../assets/sprite";
import type { KEventController } from "../../../events/events";
import { drawFormattedText } from "../../../gfx/draw/drawFormattedText";
import { drawRect } from "../../../gfx/draw/drawRect";
import { drawSprite } from "../../../gfx/draw/drawSprite";
import { formatText } from "../../../gfx/formatText";
import { Color, rgb } from "../../../math/color";
import { Rect, vec2 } from "../../../math/math";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { ui, type UIComp } from "./ui";

export type Theme = {
    hoverColor: Color;
    backgroundColor: Color;
    fontColor: Color;
    fontSize: number;
    button: {
        padding?: Vec2;
        normal: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
        pressed: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
    };
    checkbox: {
        padding?: Vec2;
        spacing?: Vec2;
        normal: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
        pressed: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
    };
    radio: {
        padding?: Vec2;
        spacing?: Vec2;
        normal: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
        pressed: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
    };
    slider: {
        padding?: Vec2;
        spacing?: Vec2;
        gutter: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
        gutterfill?: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
        thumb: {
            sprite: string | SpriteData | Asset<SpriteData>;
            frame?: number;
        };
    };
};

export const DefaultTheme: Theme = {
    hoverColor: rgb(80, 80, 255),
    backgroundColor: rgb(144, 163, 174),
    fontColor: rgb(0, 0, 0),
    fontSize: 20,
    button: {
        padding: vec2(2),
        normal: {
            sprite: "button",
        },
        pressed: {
            sprite: "buttonpressed",
        },
    },
    checkbox: {
        padding: vec2(2),
        spacing: vec2(2),
        normal: {
            sprite: "ui",
            frame: 0,
        },
        pressed: {
            sprite: "ui",
            frame: 1,
        },
    },
    radio: {
        padding: vec2(2),
        spacing: vec2(2),
        normal: {
            sprite: "ui",
            frame: 2,
        },
        pressed: {
            sprite: "ui",
            frame: 3,
        },
    },
    slider: {
        padding: vec2(2),
        spacing: vec2(2),
        gutter: {
            sprite: "buttonpressed",
        },
        thumb: {
            sprite: "button",
        },
    },
};

const hoverColor = rgb(80, 80, 255);
const backgroundColor = rgb(144, 163, 174);

export let _theme = DefaultTheme;

export type ButtonCompOpt = {
    width?: number;
    height?: number;
    value?: boolean;
};

export interface ButtonComp extends Comp {
    width: number;
    height: number;
    value: boolean;
    onValueChanged(cb: (value: boolean) => void): KEventController;

    renderArea(): Rect;
}

export function button(label: string, opt?: ButtonCompOpt): ButtonComp {
    const _padding = _theme.button.padding ?? vec2();
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: _padding,
            text: label,
            size: _theme.fontSize,
            color: _theme.fontColor,
        })
        : null;
    const contentWidth = formattedText ? formattedText.width : _theme.fontSize;
    const contentHeight = formattedText
        ? formattedText.height
        : _theme.fontSize;
    let _width = opt?.width ?? contentWidth + _padding.x * 2;
    let _height = opt?.height ?? contentHeight + _padding.y * 2;
    let _value = opt?.value ?? false;
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
        get value() {
            return _value || (this as unknown as UIComp).isPressed;
        },
        set value(value: boolean) {
            _value = value;
        },
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
                sprite: this.value
                    ? _theme.button.pressed.sprite
                    : _theme.button.normal.sprite,
                width: this.width,
                height: this.height,
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
                    },
                });
            }
        },
        onValueChanged(this: GameObj, cb: (value: boolean) => void) {
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

export function checkbox(label: string, opt?: ButtonComp): ButtonComp {
    const _padding = _theme.checkbox.padding ?? vec2();
    const _spacing = _theme.checkbox.spacing ?? vec2();
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: _padding.add(16 + _spacing.x, 0),
            text: label,
            size: 20,
            color: _theme.fontColor,
        })
        : null;
    const contentWidth = 16
        + (formattedText ? formattedText.width + _spacing.x : 0);
    const contentHeight = formattedText ? formattedText.height : 16;
    let _width = opt?.width ?? contentWidth + _padding.x * 2;
    let _height = opt?.height ?? contentHeight + _padding.y * 2;
    let _value = opt?.value ?? false;
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
        get value() {
            return _value || (this as unknown as UIComp).isPressed;
        },
        set value(value: boolean) {
            _value = value;
        },
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
                sprite: this.value
                    ? _theme.checkbox.pressed.sprite
                    : _theme.checkbox.normal.sprite,
                frame: this.value
                    ? _theme.checkbox.pressed.frame
                    : _theme.checkbox.normal.frame,
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
                    },
                });
            }
        },
        onValueChanged(this: GameObj, cb: (value: boolean) => void) {
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

export interface RadioComp extends ButtonComp {
    group: string;
}

export function radio(
    label: string,
    group: string,
    opt?: ButtonCompOpt,
): RadioComp {
    const _padding = _theme.radio.padding ?? vec2();
    const _spacing = _theme.radio.spacing ?? vec2();
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: _padding.add(16 + _spacing.x, 0),
            text: label,
            size: 20,
            color: _theme.fontColor,
        })
        : null;
    const contentWidth = 16
        + (formattedText ? formattedText.width + _spacing.x : 0);
    const contentHeight = formattedText ? formattedText.height : 16;
    let _width = opt?.width ?? contentWidth + _padding.x * 2;
    let _height = opt?.height ?? contentHeight + _padding.y * 2;
    let _value = opt?.value ?? false;
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
        get value() {
            return _value || (this as unknown as UIComp).isPressed;
        },
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
                sprite: this.value
                    ? _theme.radio.pressed.sprite
                    : _theme.radio.normal.sprite,
                frame: this.value
                    ? _theme.radio.pressed.frame
                    : _theme.radio.normal.frame,
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
                    },
                });
            }
        },
        onValueChanged(this: GameObj, cb: (value: boolean) => void) {
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
