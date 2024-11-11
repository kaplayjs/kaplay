import { _k } from "../../kaplay";
import type { Comp, GameObj, KAPLAYCtx } from "../../types";
import type { KEventController } from "../../utils";
import type { TextComp } from "../draw/text";

/**
 * The {@link stay `stay()`} component.
 *
 * @group Component Types
 */
export interface TextInputComp extends Comp {
    /**
     * Enable the text input array from being modified by user input.
     */
    hasFocus: boolean;
}

export function textInput(
    this: KAPLAYCtx,
    hasFocus: boolean = true,
    maxInputLength?: number,
): TextInputComp {
    let charEv: KEventController;
    let backEv: KEventController;
    let typedText: string = "";
    return {
        id: "textInput",
        hasFocus: hasFocus,
        require: ["text"],
        add(this: GameObj<TextComp & TextInputComp>) {
            const flip = () => {
                this.text = typedText.replace(/([\[\\])/g, "\\$1");
            };

            charEv = _k.k.onCharInput((character) => {
                if (
                    this.hasFocus
                    && (!maxInputLength || typedText.length < maxInputLength)
                ) {
                    if (_k.k.isKeyDown("shift")) {
                        typedText += character.toUpperCase();
                    }
                    else {
                        typedText += character;
                    }
                    flip();
                }
            });

            backEv = _k.k.onKeyPressRepeat("backspace", () => {
                if (this.hasFocus) {
                    typedText = typedText.slice(0, -1);
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
