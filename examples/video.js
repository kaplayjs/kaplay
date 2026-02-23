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

onMousePress(() => {
    vid.play();
});

/* 🥊 Challenge #1 🥊
Videos are cool! Try replacing the video url by this one:

//videos/3d.mp4

And see how your mind blows
*/

// Other visual elements

add([
    pos(center().x, 50),
    text("click to play video"),
    anchor("center"),
]);
