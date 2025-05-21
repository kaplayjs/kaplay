kaplay();

loadBean();

loadShader(
    "invert",
    null,
    `
uniform float u_time;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	vec4 c = def_frag();
	float t = (sin(u_time * 4.0) + 1.0) / 2.0;
	return mix(c, vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a), t);
}
`,
);

onLoad(() => {
    const canvas = makeCanvas(width(), height());

    const cached = add([
        drawon(canvas.fb, { childrenOnly: true, refreshOnly: true }),
        {
            draw() {
                drawCanvas({
                    canvas,
                    shader: "invert",
                    uniform: { "u_time": time() },
                });
            },
        },
        shader("invert"),
    ]);

    const screen = new Rect(vec2(100, 100), width() - 200, height() - 200);

    function addBean() {
        const bean = cached.add([
            pos(screen.random()),
            sprite("bean"),
        ]);
        cached.refresh();
    }

    addBean();

    onKeyPress("space", addBean);
});
