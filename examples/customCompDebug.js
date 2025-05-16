/**
 * @file Custom Components Debug
 * @description How to display custom properties in custom components
 * @difficulty 0
 * @tags comps, debug
 * @minver 3001.0
 * @category concepts
 */

// Press F1 to enable debug mode and see how custom properties appear in the
// inspect box

kaplay({ scale: 2 });

loadBean();

// Our custom component
function customComp() {
    return {
        id: "compy",
        customing: true,
        inspect() {
            return `customing: ${this.customing}`;
        },
    };
}

const bean = add([
    sprite("bean"),
    anchor("center"),
    pos(center()),
    area(),
    customComp(),
]);

bean.onClick(() => {
    bean.customing = !bean.customing;
});
