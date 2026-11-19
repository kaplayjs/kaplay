/**
 * @file Default Cursor
 * @description Set default cursor style and change it on hover
 * @difficulty 0
 * @tags basics
 * @minver 4000.0
 * @category basics
 */

kaplay({
    // Can be a simple CSS keyword value like "crosshair"
    // But can also use a custom image url with pointer coordinates and fallback
    // Tip: you can use "none" if you plan to use fakeMouse() instead
    defaultCursor: `url("/sprites/cursor_default.png") 8 6, default`,
    font: "happy",
    background: "#301f36",
});

loadBean();
loadHappy();

// You don't have to register obj area hover events and set them manually

// obj.onHover(() => setCursor("pointer"));
// obj.onHoverEnd(() => setCursor(getDefaultCursor()));

// You can use area({ cursor: value }) option instead:

const pointerTxt = add([
    anchor("center"),
    pos(center().sub(0, 36)),
    text("Pointer Hover", { align: "center" }),
    area({
        cursor: `url("/sprites/cursor_pointer.png") 8 4, pointer`,
    }),
]);

const crosshairTxt = add([
    pos(center().add(0, 36)),
    anchor("center"),
    text("Crosshair Hover", { align: "center" }),
    area({ cursor: "crosshair" }),
]);
