kaplay();

const v = add([
    pos(100, 100),
    video("/examples/sprites/video.mp4",
        {
            width: 320,
            height: 200
        }),
]);

add([
    pos(100, 50),
    text("click to play"),
]);

onClick(() => v.play());
