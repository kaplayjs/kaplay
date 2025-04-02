kaplay({ background: "#000000" });

loadShaderURL("blink", null, "../../examples/shaders/blink.frag");

add([
    pos(100, 100),
    text("text [blink]i blink[/blink] text\n\n\n"
        + "why are the spaces so tall".replaceAll(" ", "[blink] [/blink]"), {
        styles:
        {
            blink: (i) => ({
                shader: "blink",
                uniform: {
                    u_time: time() - i / 20,
                    u_fore: WHITE,
                    u_back: BLACK,
                }
            })
        }
    }),
]);
