kaplay({ background: "black" });

add([
    pos(100, 100),
    text(`this is [b]bold[/b] and this is [i]italicized[/i] woo!
[b][i]have some of both![/i][/b]
[o]and some oblique text[/o]`, {
        styles: {
            b: {
                color: WHITE,
                override: true,
            },
            i: {
                skew: 20,
            },
            o: {
                color: RED,
                skew: -20,
                override: true,
            }
        },
        transform: {
            color: rgb("gray"),
        },
    }),
]);
