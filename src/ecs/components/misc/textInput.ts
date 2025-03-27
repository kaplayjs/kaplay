import { _k } from "../../../kaplay";
import type { Comp, GameObj, KAPLAYCtx } from "../../../types";
import type { KEventController } from "../../../utils";
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
}

export function textInput(
    this: KAPLAYCtx,
    hasFocus: boolean = true,
    maxInputLength?: number,
): TextInputComp {
    let charEv: KEventController;
    let backEv: KEventController;
    return {
        id: "textInput",
        hasFocus: hasFocus,
        require: ["text"],
        typedText: "",
        add(this: GameObj<TextComp & TextInputComp>) {
            const flip = () => {
                this.text = this.typedText.replace(/([\[\\])/g, "\\$1");
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
    };
}
