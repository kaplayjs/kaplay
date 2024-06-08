kaplay();

add([
    pos(20, 20),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "steps",
]);

onClick("steps", (square) => {
    this.tween(
        WHITE,
        BLACK,
        2,
        (value) => {
            square.color = value;
        },
        easingSteps(5, "jump-none"),
    );
});

add([
    pos(80, 20),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "stepsmove",
]);

onClick("stepsmove", (square) => {
    this.tween(
        80,
        400,
        2,
        (value) => {
            square.pos.x = value;
        },
        easingSteps(5, "jump-none"),
    );
});

add([
    pos(20, 120),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "linear",
]);

onClick("linear", (square) => {
    this.tween(
        WHITE,
        BLACK,
        2,
        (value) => square.color = value,
        easingLinear([vec2(0, 0), vec2(0.5, 0.25), vec2(1, 1)]),
    );
});

add([
    pos(80, 120),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "linearmove",
]);

onClick("linearmove", (square) => {
    this.tween(
        80,
        400,
        2,
        (value) => {
            square.pos.x = value;
        },
        easingLinear([vec2(0, 0), vec2(0.5, 0.25), vec2(1, 1)]),
    );
});

add([
    pos(20, 220),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "bezier",
]);

onClick("bezier", (square) => {
    this.tween(
        WHITE,
        BLACK,
        2,
        (value) => square.color = value,
        easingCubicBezier(vec2(.17, .67), vec2(.77, .71)),
    );
});

add([
    pos(80, 220),
    rect(50, 50),
    color(WHITE),
    timer(),
    area(),
    "beziermove",
]);

onClick("beziermove", (square) => {
    this.tween(
        80,
        400,
        2,
        (value) => {
            square.pos.x = value;
        },
        easingCubicBezier(vec2(.17, .67), vec2(.77, .71)),
    );
});
