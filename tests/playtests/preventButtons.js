/**
 * @file Prevent Buttons
 * @description Bound buttons use preventDefault()
 * @minver 4000.0
 */

kaplay({
    background: "black",
    buttons: {
        "save": {
            keyboard: "control+s",
        },
        "find": {
            keyboard: "control+f",
        },
    },
    pixelDensity: Math.min(devicePixelRatio, 2),
    texFilter: "linear",
});

const README = `
Bound buttons prevent default actions:
${
    Object.entries(getButtons())
        .map(([k, v]) => `- ${k} (${v.keyboard})`)
        .join("\n")
}

Other automatically prevented keys:
- if debug is allowed, keys like F1 (chrome help page)
- when inputs are captured, like focused input
    - focus & try pressing (control+r)
      (just "r" is typed instead of reloading the page)
`.trim();

const txt = add([
    pos(32),
    text(README, { size: 18, lineSpacing: 12 }),
]);

onButtonPress(btn => debug.log(`${btn} pressed`));

add([
    {
        draw() {
            drawRect({
                pos: vec2(-8, -6),
                width: (this.width || 10) + 16,
                height: (this.height || 18) + 12,
                color: rgb("#222222"),
                radius: 8,
                outline: this?.hasFocus
                    ? {
                        width: 2,
                        color: WHITE,
                    }
                    : false,
            });
        },
    },
    pos(txt.pos.add(0, txt.height + 36)),
    text("Click to focus...", { size: 18, lineSpacing: 12 }),
    textInput(false),
    area(),
    {
        placeHolder: "",
        add() {
            this.placeHolder = this.text;

            this.onClick(() => {
                if (this.hasFocus) return;
                this.hasFocus = true;

                const mc = onMousePress(() => {
                    if (this.isClicked()) return;
                    this.hasFocus = false;
                    kc?.cancel();
                    return cancel();
                });

                const kc = onKeyPress(["escape", "enter"], () => {
                    this.hasFocus = false;
                    mc?.cancel();
                    return cancel();
                });
            });

            this.onInput(() => this.text = this.text || this.placeHolder);
        },
    },
]);
