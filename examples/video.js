/**
 * @file Video
 * @description How to play videos
 * @difficulty 0
 * @tags animation
 * @minver 4000.0
 * @category concepts
 * @test
 */

// Playing videos (🥊 included)

kaplay({ scale: 2, background: "#a32858", font: "happy" });

loadHappy();

const vid = add([
    pos(center()),
    // video() fetches the resource, we have to pass URL
    video("/videos/dance.mp4", {
        width: 320,
        height: 200,
    }),
    anchor("center"),
]);

vid.onEnd(() => {
    console.log("Video ended");
});

/* 🥊 Challenge #1 🥊
Videos are cool! Try replacing the video url by this one:

//videos/3d.mp4

And see how your mind blows
*/

// Events

onMousePress(() => {
    vid.play();
});

onKeyPress("space", () => {
    vid.loop = !vid.loop;
    loopLabel.text = `loop: ${vid.loop}`;
});

onUpdate(() => {
    progressLabel.text = `${Math.round(vid.currentTime)}/${
        Math.round(vid.duration)
    }s`;
});

// Other visual elements

add([
    pos(center().x, 50),
    text("click to play video\nspace to toggle loop", {
        size: 20,
    }),
    anchor("center"),
]);

const loopLabel = add([
    pos(center().x, 100),
    text("loop: true", {
        size: 10,
    }),
    anchor("center"),
]);

const progressLabel = add([
    pos(center().x, 130),
    text("", {
        size: 10,
    }),
    anchor("center"),
]);
