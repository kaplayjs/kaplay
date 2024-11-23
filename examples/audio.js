// @ts-check
// Playing audio and controlling it

kaplay({
    // This makes it so the audio doesn't pause when the tab is changed
    backgroundAudio: true,
    background: "5ba675",
});

// Loads the bell sound
loadSound("bell", "/examples/sounds/bell.mp3");
// Load the music, it makes it being streamed, so loading is faster
loadMusic("OtherworldlyFoe", "/examples/sounds/OtherworldlyFoe.mp3");
loadSprite("bag", "/sprites/bag.png");

// Adjust global volume
volume(0.5);

// We use the play() function to play audio
onKeyPress("enter", () => {
    play("bell", {
        volume: 1,
        speed: 1,
    });
});

// For our mobile friends
onTouchStart(() => {
    play("bell", {
        volume: 1,
        speed: 1,
    });
});

// We can also play music, and control it
const music = play("OtherworldlyFoe", {
    loop: true,
    paused: true,
});

const label = add([
    text(),
    pos(10, 10),
]);

// See below for the function
updateText();

// Update text every frame
onUpdate(() => {
    updateText();
});

// Adjust music properties through input
onKeyPress("space", () => music.paused = !music.paused);
onKeyPressRepeat("up", () => music.volume += 0.1);
onKeyPressRepeat("down", () => music.volume -= 0.1);
onKeyPressRepeat("left", () => music.speed -= 0.1);
onKeyPressRepeat("right", () => music.speed += 0.1);
onKeyPress("m", () => music.seek(4.24));

// Piano
// We store some keys in a string
const keyboard = "awsedftgyhujk";

// Simple piano with "bell" sound and the second row of a QWERTY keyboard
for (let i = 0; i < keyboard.length; i++) {
    onKeyPress(keyboard[i], () => {
        play("bell", {
            // The original "bell" sound is F, -500 will make it C for the first key
            detune: i * 100 - 500,
        });
    });
}

// Draw music progress bar
onDraw(() => {
    if (!music.duration()) return;
    const h = 16;
    drawRect({
        pos: vec2(0, height() - h),
        width: music.time() / music.duration() * width(),
        height: h,
    });
});

// The rotating bag
const bag = add([
    sprite("bag"),
    pos(center()),
    anchor("center"),
    rotate(0),
    scale(2),
]);

bag.onUpdate(() => {
    if (music.paused) return;

    bag.angle += dt() * 100;
});

// Create text guide
function updateText() {
    label.text = `
${music.paused ? "Paused" : "Playing"}
Time: ${music.time().toFixed(2)}
Volume: ${music.volume.toFixed(2)}
Speed: ${music.speed.toFixed(2)}

\\[space] play/pause
[up/down] volume
[left/right] speed
[a...k] piano
	`.trim();
}
