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
        "bean",
        "ghosty",
        "ghostiny",
        "bobo",
        "zombean",
        "mark",
    ], [20, 10, 2, 5, 15, 1]);
    obj.sprite = result;
    obj.hidden = false;
    debug.log(`You got ${result}`);
});
