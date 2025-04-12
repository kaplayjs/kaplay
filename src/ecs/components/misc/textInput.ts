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
     * Enable the text input array to be modified by user input.
     *
     * Setting this to true is the same as calling focus(), and will
     * clear focus on all other active textInput objects.
     */
    hasFocus: boolean;
    /**
     * The "real" text that the user typed, without any escaping.
     */
    typedText: string;
    /**
     * Focuses this text input so that it will receive input, and
     * removes focus from all other text inputs.
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

const allTextInputs: Set<GameObj<TextInputComp>> = new Set();

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
                allTextInputs.forEach(i => {
                    // @ts-ignore
                    if (i !== this) {
                        i.hasFocus = false;
                    }
                });
            }
            else if (origText !== this.typedText) {
                (this as any as GameObj).trigger("change");
            }
        },
        require: ["text"],
        typedText: "",
        add(this: GameObj<TextComp & TextInputComp>) {
            allTextInputs.add(this);
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
                    if ((_k.k.isKeyDown("shift") !== _k.app.state.capsOn)) {
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
        destroy(this: GameObj<TextInputComp>) {
            charEv.cancel();
            backEv.cancel();
            allTextInputs.delete(this);
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
