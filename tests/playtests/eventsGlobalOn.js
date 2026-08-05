kaplay();

loadBean();

const ev = on("bark", "dog", () => {
    console.log("woof!");
});

const bean = add([
    sprite("bean"),
    "dog",
]);

bean.trigger("bark");

bean.destroy();

console.log(ev);
