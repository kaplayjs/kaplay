kaplay({
    doubleClickDelay: 0.25,
    font: "happy",
});

loadHappy();
loadBean();
loadSprite("apple", "/sprites/apple.png");
setBackground(BLUE.lighten(150));

// We are trying to simulate a desktop,
// So we'll make it so if you double click the bean
// A window will open with its face on it!
let doubleClickText = add([
    text("<- Double click to open!"),
    pos(200, 100),
    color("#1f102a"),
]);

// The icon to click
const bean = add([
    sprite("bean"),
    scale(2),
    pos(110, 100),
    area(),
    anchor("center"),
    {
        draw() {
            drawText({
                color: BLACK,
                text: "bean.png",
                anchor: "center",
                pos: vec2(0, 35),
                size: 15,
            });
        },
    },
]);

let windowOpen = false;

bean.onMousePress(() => {
    // This line exists so the code below only runs when bean.isHovering() is true
    if (!bean.isHovering()) return;
    tween(2.2, 2, 0.15, (p) => bean.scale = vec2(p), easings.easeOutQuad);
});

// This piece of code will only run when there has been a double click!
// Also includes the boolean alternative: isMouseDoublePressed()
bean.onMouseDoublePress(() => {
    if (!bean.isHovering()) return;
    // Unless the window is closed nothing will happen
    if (windowOpen) return;

    windowOpen = true;

    // Open the window
    const window = add([
        color(WHITE),
        scale(),
        outline(8, Color.fromHex("#1f102a")),
        rect(650, 450, { radius: 10 }),
        // Prevent weird outline fringes on odd screen sizes
        pos(center().add(center().x % 2, center().y % 2)),
        anchor("center"),
        area(),
    ]);

    burp();

    window.add([
        rect(650, 50, { radius: 8 }),
        outline(8, Color.fromHex("#1f102a")),
        color(Color.fromHex("#6d80fa")),
        pos(-window.width / 2, -window.height / 2),
        {
            add() {
                this.add([
                    text("bean.png"),
                    color(WHITE),
                    pos(8),
                ]);
            },
        },
    ]);

    window.add([
        sprite("bean"),
        scale(4),
        pos(),
        area(),
        anchor("center"),
    ]);

    window.add([
        rect(50, 50, { radius: 8 }),
        outline(8, "#1f102a"),
        color("#cc425e"),
        pos(window.width / 2 - 50, -window.height / 2),
        area(),
        {
            add() {
                this.onClick(() => {
                    windowOpen = false;
                    tween(
                        window.scale,
                        vec2(0),
                        0.25,
                        (p) => window.scale = p,
                        easings.easeInBack,
                    );
                    this.area.scale = vec2(0);
                });

                this.add([
                    text("X"),
                    pos(10, 6),
                ]);
            },
        },
    ]);
});

// Now we can have a different functionality with the optional parameter in onMousePress()
// You can access 'clickCount'
// This will return the amount of clicks in a row
const apple = add([
    sprite("apple"),
    scale(2),
    pos(110, 250),
    area(),
    anchor("center"),
    {
        draw() {
            drawText({
                color: BLACK,
                text: "apple.png",
                anchor: "center",
                pos: vec2(0, 35),
                size: 15,
            });
        },
    },
]);

// Using an old regular onMousePress, we'll be able to check and count how many clicks have been given in a row
let clicksInARow = 0;
apple.onMouseMultiPress(1, (button, clickCount) => {
    if (!apple.isHovering()) return;
    tween(2.2, 2, 0.15, (p) => apple.scale = vec2(p), easings.easeOutQuad);
    clicksInARow = clickCount;

    // Add a number that shows how many clicks in a row
    const n = add([
        text(`(${clicksInARow})`),
        color("#1f102a"),
        opacity(),
        pos(apple.pos.sub(-50, 50)),
        {
            update() {
                // If the clicks in a row have been 3, we'll output a "triple!" text there
                if (clicksInARow == 3) this.text = `(${clicksInARow}) Triple!`;
            },
        },
    ]);
    n.fadeOut(0.25).onEnd(() => n.destroy());
});

let multipleClickText = add([
    text("<- Click fast to count!"),
    pos(200, apple.pos.y),
    color("#1f102a"),
]);
