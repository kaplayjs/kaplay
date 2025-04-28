/**
 * @file Drawon Component
 * @description How to use Frame Buffers
 * @difficulty 2
 * @tags draw
 * @minver 3001.0
 * @category concepts
 */

kaplay();

loadBean();

onLoad(() => {
    const pic = new Picture();

    const cached = add([
        drawon(pic, { childrenOnly: true, refreshOnly: true }),
        picture(pic),
        {
            draw() {
                console.log("draw parent");
            },
        },
    ]);

    const screen = new Rect(vec2(100, 100), width() - 200, height() - 200);

    function addBean() {
        const bean = cached.add([
            pos(screen.random()),
            sprite("bean"),
            {
                draw() {
                    console.log("draw child");
                },
            },
        ]);
        cached.refresh();
    }

    addBean();

    onKeyPress("space", addBean);
});
