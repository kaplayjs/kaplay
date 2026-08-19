// Test if the video is rendered as a black rectangle before it is played
// Test if the video color is working when video is loaded and played

kaplay({ scale: 2, background: "#a32858", font: "happy" });

loadHappy();

const vid = add([
    pos(center()),
    video("/videos/dance.mp4", {
        width: 320,
        height: 200,
    }),
    anchor("center"),
    // Changing the color to test if it is rendered properly
    color(rgb(100, 100, 255)),
]);

// Events

let playing = false;
onMousePress(() => {
    playing = !playing;
    console.log(playing);
    if (playing) {
        vid.play();
    }
    else {
        vid.pause();
    }
});

add([
    pos(center().x, 50),
    text("click to play/pause the video", {
        size: 20,
    }),
    anchor("center"),
]);
