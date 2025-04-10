import type { KEventController } from "../../../events/events";
import { _k } from "../../../kaplay";
import type { Comp, GameObj, KAPLAYCtx } from "../../../types";
import type { TextComp } from "../draw/text";

/**
 * The {@link textInput `textInput()`} component.
 *
 * @group Component Types
 */
export interface TextInputComp extends Comp {
    /**
     * Enable the text input array from being modified by user input.
     */
    hasFocus: boolean;
    /**
     * The "real" text that the user typed, without any escaping.
     */
    typedText: string;
    /**
     * Focuses this text input so that it will receive input.
     */
    focus(): void;
    /**
     * Event that runs when the text input gains focus.
     */
    onFocus(cb: () => void): KEventController;
    /**
     * Event that runs when the text input loses focus.
     */
    onBlur(cb: () => void): KEventController;
    /**
     * Event that runs when the user types any character in the text input
     * and causes its value to change.
     * 
     * This runs *after* the display text is updated with the escaped version
     * of the typed text, so in the event handler you can override the
     * displayed text with another version (like if you want to add syntax
     * highlighting or something). See also {@link TextComp.text}.
     */
    onInput(cb: () => void): KEventController;
    /**
     * Runs immediately after onBlur if the value has changed while the text
     * input has been focused.
     */
    onChange(cb: () => void): KEventController;
}

export function textInput(
    this: KAPLAYCtx,
    hasFocus: boolean = true,
    maxInputLength?: number,
): TextInputComp {
    let charEv: KEventController;
    let backEv: KEventController;
    let origText: string = "";
    return {
        id: "textInput",
        get hasFocus() {
            return hasFocus;
        },
        set hasFocus(newValue) {
            if (hasFocus === newValue) return;
            hasFocus = newValue;
            (this as any as GameObj).trigger(hasFocus ? "focus" : "blur");
            if (hasFocus) {
                origText = this.typedText;
            }
            else if (origText !== this.typedText) {
                (this as any as GameObj).trigger("change");
            }
        },
        require: ["text"],
        typedText: "",
        add(this: GameObj<TextComp & TextInputComp>) {
            const flip = () => {
                this.text = this.typedText.replace(/([\[\\])/g, "\\$1");
                this.trigger("input");
            };

            charEv = _k.k.onCharInput((character) => {
                if (
                    this.hasFocus
                    && (!maxInputLength
                        || this.typedText.length < maxInputLength)
                ) {
                    if (_k.k.isKeyDown("shift")) {
                        this.typedText += character.toUpperCase();
                    }
                    else {
                        this.typedText += character;
                    }
                    flip();
                }
            });

            backEv = _k.k.onKeyPressRepeat("backspace", () => {
                if (this.hasFocus) {
                    this.typedText = this.typedText.slice(0, -1);
                }
                flip();
            });
        },
        destroy() {
            charEv.cancel();
            backEv.cancel();
        },
        focus() {
            this.hasFocus = true;
        },
        onFocus(this: GameObj, cb) {
            return this.on("focus", cb);
        },
        onBlur(this: GameObj, cb) {
            return this.on("blur", cb);
        },
        onInput(this: GameObj, cb) {
            return this.on("input", cb);
        },
        onChange(this: GameObj, cb) {
            return this.on("change", cb);
        },
    };
}
