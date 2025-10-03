import type { Asset } from "../../../assets/asset";
import type { SpriteData } from "../../../assets/sprite";
import { drawFormattedText } from "../../../gfx/draw/drawFormattedText";
import { drawRect } from "../../../gfx/draw/drawRect";
import { drawSprite } from "../../../gfx/draw/drawSprite";
import { formatText } from "../../../gfx/formatText";
import { Color, rgb } from "../../../math/color";
import { Rect, vec2 } from "../../../math/math";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { ui, type UIComp } from "./ui";

export type Theme = {
    hoverColor: Color;
    backgroundColor: Color;
    button: {
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
        gutter: {
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
    button: {
        normal: {
            sprite: "button",
        },
        pressed: {
            sprite: "buttonpressed",
        },
    },
    checkbox: {
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

export interface ButtonComp extends Comp {
    width: number;
    height: number;
    value: boolean;

    renderArea(): Rect;
}

export function button(label: string): ButtonComp {
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: vec2(2, 2),
            text: label,
            size: 20,
            color: Color.BLACK,
        })
        : null;
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
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    };
}

export function checkbox(label: string): ButtonComp {
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: vec2(2 + 16, 2),
            text: label,
            size: 20,
            color: Color.BLACK,
        })
        : null;
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

export function radio(label: string, group: string): RadioComp {
    let _shape: Rect | undefined;
    let formattedText = label
        ? formatText({
            pos: vec2(2 + 16, 2),
            text: label,
            size: 20,
            color: Color.BLACK,
        })
        : null;
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
        renderArea() {
            if (!_shape) {
                _shape = new Rect(vec2(0), _width, _height);
            }
            return _shape;
        },
    };
}
