kaplay({ topMostOnlyActivate: true });

const rect1 = add([pos(), rect(100, 100), area(), color(BLUE)]);
const rect2 = add([pos(50, 50), rect(100, 100), area(), color(GREEN)]);
const rect0 = add([pos(0, 50), rect(100, 100), area(), color(CYAN), z(-1)]);

rect0.onClick(() => {
    debug.log("rect0");
});
rect1.onClick(() => {
    debug.log("rect1");
});
rect2.onClick(() => {
    debug.log("rect2");
});
