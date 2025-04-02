kaplay();

add([
    text("this text should not be moving", {
        transform(i) {
            return { pos: vec2(0, wave(-10, 10, time() + i)) };
        },
    }),
    pos(100, 100),
]).paused = true;
