kaplay({ background: "#000000" });

add([
    pos(100, 100),
    text("No override: Hello [foo]styled[/foo] text", {
        transform: {
            color: WHITE.darken(200),
        },
        styles: {
            foo: {
                color: RED
            }
        }
    })
]);

add([
    pos(100, 150),
    text("With override: Hello [foo]styled[/foo] text", {
        transform: {
            color: WHITE.darken(200),
        },
        styles: {
            foo: {
                color: RED,
                override: true
            }
        }
    })
]);

add([
    pos(100, 200),
    text("With override and color(): Hello [foo]styled[/foo] text", {
        styles: {
            foo: {
                color: RED,
                override: true
            }
        }
    }),
    color(WHITE.darken(200)),
]);
