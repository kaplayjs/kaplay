/**
 * @file Lerp
 * @description How to use lerp to make simple tweenings
 * @difficulty 0
 * @tags basics, animation
 * @minver 3001.0
 * @category concepts
 */

kaplay({
    background: [141, 183, 255],
});

loadHappy();
loadBean();

onLoad(() => {
    // We'll create a bean with position, opacity and scale
    const bean = add([
        sprite("bean"),
        pos(center()),
        anchor("center"),
        opacity(),
        area(),
        scale(),
    ]);

    // And a text to tell the user how to switch modes
    const numberMode = add([
        text("Press 1 or 2 to switch modes", { font: "happy", size: 25 }),
        scale(1),
        pos(25),
        anchor("left"),
        color(BLACK),
    ]);

    // Then we'll define the light and dark colors
    const lightColor = rgb(141, 183, 255);
    const darkColor = rgb(74, 48, 82);

    let backgroundColor = lightColor; // Is the variable that defines the intended background color
    let mode = 1; // Defines what "mode" we're in

    // Lerp takes an "initial value", an "ending value" and a number from 0 to 1
    // This number determines wheter it will return the initial value or the ending value
    onUpdate(() => {
        // This makes it so the background always follows the intended background color
        // Creating an effect similar to a tweening, but much more simple
        // The 0.5 will determine how "fast" or how closely the initial value will follow the ending value
        // Being 0 not follow at all and 1 being instant
        const newColor = lerp(getBackground(), backgroundColor, 0.5);
        setBackground(newColor);

        if (mode == 1) {
            backgroundColor = lightColor;

            // These lines make it so bean now follows the mouse position very slowly
            // And the color of our text to turn from the current color to the dark color
            bean.pos = lerp(bean.pos, mousePos(), 0.1);
            bean.opacity = lerp(bean.opacity, 1, 0.5);
            numberMode.color = lerp(numberMode.color, darkColor, 0.5);
        }
        else if (mode == 2) {
            backgroundColor = darkColor;

            // These lines make it so bean now follows center and makes its scale always 1
            bean.pos = lerp(bean.pos, center(), 0.5);
            bean.scale = lerp(bean.scale, vec2(1), 0.5);
            numberMode.color = lerp(numberMode.color, lightColor, 0.5);

            // When bean is being hovered, now its opacity will follow 1, highlighting it on hover
            if (bean.isHovering()) {
                bean.opacity = lerp(bean.opacity, 1, 0.1);
                // If we press click, its scale will go to 2, and since it's following a scale of 1, it wil go back to that
                if (isMousePressed("left")) {
                    bean.scale = vec2(2);
                }
            }
            // When bean is not being followed, its opacity follows 0.1 very slowly
            else {
                bean.opacity = lerp(bean.opacity, 0.1, 0.1);
            }
        }

        if (isKeyPressed("1")) mode = 1;
        else if (isKeyPressed("2")) mode = 2;
    });
});
