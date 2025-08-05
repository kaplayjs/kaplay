const k = kaplay();

k.loadBean();

k.quit();

k.add([
    text("hi"),
]);

k.add([
    sprite("bean"),
]);

const k2 = kaplay();

k2.loadBean();

k2.add([
    text("hi how are you?"),
]);

k2.add([
    sprite("bean"),
]);
