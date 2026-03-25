// Starts a new game
kaplay();

// Load a bean
loadBean();
loadShader(
    "3D",
    `
    attribute vec3 a_pos;
    attribute vec2 a_uv;

    uniform float width;
    uniform float height;
    uniform mat4 transform;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 v_uv;

    void main(void) {
        gl_Position = uProjectionMatrix * transform * uModelViewMatrix * vec4(a_pos, 1);
        v_uv = a_uv;
    }
    `,
    `
    varying highp vec2 v_uv;

    uniform sampler2D u_tex;

    void main(void) {
        gl_FragColor = texture2D(u_tex, v_uv);
    }
    `,
    true,
);

onLoad(() => {
    const uv = getSprite("bean").data.frames[0].q;

    const format = [
        { name: "a_pos", size: 3 },
        { name: "a_uv", size: 2 },
    ];

    const vertices = [
        -61 / 2,
        53,
        -height() / 2,
        uv.x,
        uv.y + uv.h, /*1, 1, 1, 1,*/
        -61 / 2,
        0,
        -height() / 2,
        uv.x,
        uv.y, /*1, 1, 1, 1,*/
        61 / 2,
        0,
        -height() / 2,
        uv.x + uv.w,
        uv.y, /*1, 1, 1, 1,*/
        61 / 2,
        53,
        -height() / 2,
        uv.x + uv.w,
        uv.y + uv.h, /*1, 1, 1, 1,*/
    ];

    const indices = [
        0,
        1,
        3,
        1,
        2,
        3,
    ];

    const projection = Mat4.perspective(
        -width() / 2,
        width() / 2,
        -height() / 2,
        height() / 2,
        0.01,
        2000,
        height() / 2,
    );

    add([
        pos(vec2(61, 0)),
        mesh({ mesh: makeMesh(format, vertices, indices) }),
        shader("3D", () => ({
            uModelViewMatrix: Mat4.translate3(vec3(0, 0, -height()))
                .mult(Mat4.rotateY(time() * 180))
                .mult(Mat4.scale3(vec3(4, 4, 1)))
                .mult(Mat4.translate3(vec3(0, 0, height() / 2))),
            uProjectionMatrix: projection,
        })),
    ]);
    add([
        pos(vec2(-61, 0)),
        mesh({ mesh: makeMesh(format, vertices, indices) }),
        shader("3D", () => ({
            uModelViewMatrix: Mat4.translate3(vec3(0, 0, -height()))
                .mult(Mat4.rotateY(time() * 180))
                .mult(Mat4.scale3(vec3(4, 4, 1)))
                .mult(Mat4.translate3(vec3(0, 0, height() / 2))),
            uProjectionMatrix: projection,
        })),
    ]);
    /*onDraw(() => {
        drawMesh({
            mesh, shader: "3D", uniform: {
                uModelViewMatrix: Mat4.translate3(vec3(0, 0, -height()))
                    .mult(Mat4.rotateY(time() * 180))
                    .mult(Mat4.scale3(vec3(4, 4, 1)))
                    .mult(Mat4.translate3(vec3(0, 0, height() / 2))),
                uProjectionMatrix: projection,
            }
        });
    });*/
});
