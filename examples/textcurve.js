kaplay();

const pwc = piecewiseCatmullRom([
    vec2(50, 100),
    vec2(70, 50),
    vec2(90, 100),
    vec2(110, 50),
    vec2(130, 100),
    vec2(150, 50),
    vec2(170, 100),
]);

const exampleText = "Text on a curve";

add([
    pos(50, 50),
    text(exampleText, {
        transform: (idx, ch, string) => ({
            pos: pwc(idx / (exampleText.length - 1)),
            angle: pwc(idx / (exampleText.length - 1) + 0.01).sub(
                pwc(idx / (exampleText.length - 1)),
            ).angle(),
        }),
    }),
]);
