/**
 * @file Video
 * @description How to play videos.
 * @difficulty 0
 * @tags animation
 * @minver 4000.0
 */

kaplay({ scale: 2, background: "#4a3052", font: "happy" });

loadHappy();

const vid = add([
    pos(center()),
    // video() fetches the resource, we have to pass URL
    video("/examples/videos/dance.mp4", {
        width: 320,
        height: 200,
    }),
    anchor("center"),
]);

add([
    pos(center().x, 50),
    text("click to play video"),
    anchor("center"),
]);

onClick(() => {
    vid.play();
});
