kaplay();

onUpdate(() => {
    add([
        pos(100, 100),
        rect(100, 100),
        // area(),
        {
            add() {
                this.use(area());
            }
        }
    ]).destroy();
    debug.log(debug.fps());
});
