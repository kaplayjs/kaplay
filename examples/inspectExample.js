kaplay();

// # will delete this file when changes get merged/declined i don't intend this to be an actual example
function customComponent() {
    return {
        id: "compy",
        customing: true,
        // if it didn't have an inspect function it would appear as "compy"
        inspect() {
            return `customing: ${this.customing}`;
        },
    };
}

loadBean();

let bean = add([
    sprite("bean"),
    area(),
    opacity(),
    pos(center()),
    scale(4),
    customComponent(),
]);

bean.onClick(() => {
    bean.customing = !bean.customing;
});

// # check sprite.ts and the other components in the object
// now the inspect function says eg: `sprite: ${src}` instead of `${src}`
