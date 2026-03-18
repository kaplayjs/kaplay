kaplay();

loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("ghostiny", "/sprites/ghostiny.png");
loadSprite("bobo", "/sprites/bobo.png");
loadSprite("zombean", "/sprites/zombean.png");
loadSprite("mark", "/sprites/mark.png");

const obj = add([
    sprite("mark"),
    pos(center()),
    anchor("center"),
]);
obj.hidden = true;

const button = add([
    text("Press to gacha"),
    pos(center().add(0, 100)),
    anchor("center"),
    area(),
]);

button.onClick(() => {
    const result = gacha([
        ["bean", 20],
        ["ghosty", 10],
        ["ghostiny", 2],
        ["bobo", 5],
        ["zombean", 15],
        ["mark", 1],
    ]);
    obj.sprite = result;
    obj.hidden = false;
    debug.log(`You got ${result}`);
});
