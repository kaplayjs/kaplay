/**
 * @file Render Components
 * @description Learn about components that render something
 * @difficulty 0
 * @tags basics, comps
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 60
 */

// All basic rendering related components. This include rendering shapes,
// sprites and text and also modifying their properties, with color(), outline()
// and opacity().

kaplay({
    font: "happy",
    background: ["#873e84"],
});

loadSprite("bean", "/sprites/bean.png");
// load a bitmap font
loadBitmapFont("happy", "/fonts/happy_28x36.png", 28, 36);

// Basic Rendering Components

// sprite() is a component that renders a sprite.
add([
    sprite("bean"),
    pos(10, 10),
]);

// rect() is a component that renders a rectangle.
add([
    rect(60, 60),
    pos(110, 10),
    // add an outline to the shape.
    outline(4),
    // set the color
    color(109, 128, 250), // r g b
]);

// circle() is a component that renders a circle.
add([
    circle(30),
    pos(210, 10),
    outline(4),
    // set the pivot point, as default is center for circle()
    anchor("topleft"),
    // set the opacity
    opacity(0.5),
]);

// text() is a component that renders a text.
add([
    text("hi!"),
    pos(310, 10),
]);

// polygon() is a component that renders a polygon.
add([
    polygon([vec2(5, 0), vec2(50, 5), vec2(50, 50), vec2(0, 20)]),
    pos(410, 10),
    outline(4),
    color("#d46eb3"), // hex colors!
]);
