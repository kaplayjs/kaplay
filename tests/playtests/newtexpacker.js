kaplay();

const beanData = loadBean();

onLoad(() => {
    onDraw(() => {
        drawRect({
            width: 2048,
            height: 2048,
        });

        drawUVQuad({
            width: 2048,
            height: 2048,
            tex: beanData.data.tex,
        });
    });

    onKeyPressRepeat("b", () => {
        loadBean("XD");
    });

    onKeyPressRepeat("g", () => {
        loadSprite("gigagantrum", "/sprites/gigagantrum.png");
    });
});
