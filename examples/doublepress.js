kaplay({
    // We can set custom double click delay, default is 0.5
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

bean.onClick(() => {
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

// There is also onMouseMultiClick() where you can check for custom click count, even 1
// We can also use area() version of the function instead where we don't have to check for hover first
apple.onMultiClick(1, (button, clickCount) => {
    tween(2.2, 2, 0.15, (p) => apple.scale = vec2(p), easings.easeOutQuad);

    // Add a number that shows how many clicks in a row
    const n = add([
        text(`(${clickCount})`),
        color("#1f102a"),
        opacity(),
        pos(apple.pos.sub(-50, 50)),
        {
            update() {
                // If the clicks in a row equals 3, we'll output a "Triple!" text there
                if (clickCount == 3) this.text = `(${clickCount}) Triple!`;
                // Or each consecutive 3rd click counts as a combo!
                else if (clickCount > 3 && clickCount % 3 == 0) {
                    this.text = `(${clickCount}) Triple x${clickCount / 3}!`;
                }
            },
        },
    ]);
    n.fadeOut(0.25).onEnd(() => n.destroy());
}, "right");

let multipleClickText = add([
    text("<- Click fast to count!"),
    pos(200, apple.pos.y),
    color("#1f102a"),
]);
