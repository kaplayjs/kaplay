// Adding game objects to screen

// Start a kaboom game
kaplay();

// Load a sprite asset from "sprites/bean.png", with the name "bean"
loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

// A "Game Object" is the basic unit of entity in kaboom
// Game objects are composed from components
// Each component gives a game object certain capabilities

// add() assembles a game object from a list of components and add to game, returns the reference of the game object
const player = add([
    sprite("bean"), // sprite() component makes it render as a sprite
    pos(120, 80), // pos() component gives it position, also enables movement
    rotate(0), // rotate() component gives it rotation
    anchor("center"), // anchor() component defines the pivot point (defaults to "topleft")
]);

// .onUpdate() is a method on all game objects, it registers an event that runs every frame
player.onUpdate(() => {
    // .angle is a property provided by rotate() component, here we're incrementing the angle by 120 degrees per second, dt() is the time elapsed since last frame in seconds
    player.angle += 120 * dt();
});

// Make sure all sprites have been loaded
onLoad(() => {
    // Get the texture and uv for ghosty
    const data = getSprite("ghosty").data;
    const tex = data.tex;
    const quad = data.frames[0];
    // Add multiple game objects
    for (let i = 0; i < 3; i++) {
        // generate a random point on screen
        // width() and height() gives the game dimension
        const x = rand(0, width());
        const y = rand(0, height());

        add([
            pos(x, y),
            {
                q: quad.clone(),
                pts: [
                    vec2(-32, -32),
                    vec2(32, -32),
                    vec2(32, 32),
                    vec2(-32, 32),
                ],
                // Draw the polygon
                draw() {
                    const q = this.q;
                    drawPolygon({
                        pts: pts,
                        uv: [
                            vec2(q.x, q.y),
                            vec2(q.x + q.w, q.y),
                            vec2(q.x + q.w, q.y + q.h),
                            vec2(q.x, q.y + q.h),
                        ],
                        tex: tex,
                    });
                },
                // Update the vertices each frame
                update() {
                    pts = [
                        vec2(-32, -32),
                        vec2(32, -32),
                        vec2(32, 32),
                        vec2(-32, 32),
                    ].map((p, index) =>
                        p.add(
                            5 * Math.cos((time() + index * 0.25) * Math.PI),
                            5 * Math.sin((time() + index * 0.25) * Math.PI),
                        )
                    );
                },
            },
        ]);
    }
});
