import { k } from "../../kaboom";
import type {
    Comp,
    GameObj,
    KaboomCtx,
    KEventController,
    TextComp,
} from "../../types";

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
    this: KaboomCtx,
    hasFocus: boolean = true,
    maxInputLength?: number,
): TextInputComp {
    let charEv: KEventController;
    let backEv: KEventController;

    return {
        id: "textInput",
        hasFocus: hasFocus,
        require: ["text"],
        add(this: GameObj<TextComp & TextInputComp>) {
            charEv = k.onCharInput((character) => {
                if (
                    this.hasFocus
                    && (!maxInputLength || this.text.length < maxInputLength)
                ) {
                    if (k.isKeyDown("shift")) {
                        this.text += character.toUpperCase();
                    } else {
                        this.text += character;
                    }
                }
            });

            backEv = k.onKeyPress("backspace", () => {
                if (this.hasFocus) {
                    this.text = this.text.slice(0, -1);
                }
            });
        },
        destroy() {
            charEv.cancel();
            backEv.cancel();
        },
    };
}
