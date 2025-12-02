/**
 * @file Dependencies inside comp.add hooks
 * @description Test dependency between two components where the dependant is added in the add hook
 */
kaplay();

function comp1() {
    return {
        id: "comp1",
        require: ["comp2"],
        add() {
            this.use(comp2());
        },
    };
}

function comp2() {
    return {
        id: "comp2",
        add() {
            debug.log("hi");
        },
    };
}

add([
    comp1(),
]);
