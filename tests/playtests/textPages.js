/**
 * @file Pages of text
 * @description Perf test of multiple text() comps with 6.3k chars total & styled
 * @minver 3001.0
 */

// Up to alpha-27 it would drop by ~30 FPS and make PC fans go into turbojet mode

kaplay({
    font: "outfit",
    pixelDensity: Math.min(2, devicePixelRatio),
});

debug.inspect = true;

loadFont(
    "outfit",
    "https://cdn.jsdelivr.net/fontsource/fonts/outfit@5.2.8/latin-300-normal.ttf",
    {
        size: 32 * _k.globalOpt.pixelDensity,
    },
);

loadFont(
    "darumadrop-one",
    "https://cdn.jsdelivr.net/fontsource/fonts/darumadrop-one@5.2.8/latin-400-normal.ttf",
    {
        size: 64 * _k.globalOpt.pixelDensity,
    },
);

const PAGE_COUNT = 3;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

setCamScale(Math.min(1, width() / (PAGE_COUNT * PAGE_WIDTH)));

const pages = Array.from({ length: PAGE_COUNT }, (_, i) => {
    const page = add([
        pos(
            Math.round(
                center().x - (PAGE_WIDTH * PAGE_COUNT) / 2
                    + (PAGE_WIDTH + 1) * i,
            ),
            Math.round(center().y - PAGE_HEIGHT / 2),
        ),
        rect(PAGE_WIDTH, PAGE_HEIGHT),
    ]);

    page.txt = page.add([
        pos(24),
        // 2100 chars
        text(
            `
[h1][i]Lorem ipsum[/i] dolor sit amet[/h1]

Consectetur adipiscing elit. Fusce turpis lacus, maximus eu malesuada in, laoreet in nibh. Nam quis diam blandit, bibendum quam at, efficitur ligula. Aenean tincidunt eget mi sit amet volutpat. Duis rutrum, tortor at porttitor dapibus, tellus lectus mollis mi, sed lacinia lorem dui vitae sapien. Morbi eget commodo augue. Fusce efficitur accumsan orci, at sollicitudin diam ornare eu. Pellentesque eget enim at ex vestibulum volutpat.

[i]Vivamus convallis tempus eros volutpat mattis. Quisque risus neque, commodo eget lacus ac, fringilla rutrum dolor.[/i] Curabitur vestibulum ut massa et tincidunt. Praesent sed suscipit felis, ac iaculis mi. Duis id iaculis ex. Pellentesque a molestie velit. Suspendisse potenti. Nulla sit amet nulla nec enim viverra dapibus bibendum sit amet erat. Mauris auctor aliquet malesuada. In eu ex quis dolor fermentum interdum. Morbi id placerat sem, at sodales sapien. Nam ornare, eros in faucibus imperdiet, ligula ipsum tincidunt velit, at tincidunt metus velit id tellus. Donec cursus, elit eu feugiat maximus, quam velit imperdiet urna, et vestibulum orci justo id erat. Donec hendrerit imperdiet pulvinar. Vestibulum iaculis magna ac posuere dapibus. Donec ex ligula, faucibus eu consequat eu, ullamcorper vitae lorem.

Phasellus lacus ipsum, pellentesque quis placerat a, dapibus et nibh. Integer nec ex tellus. Mauris fringilla, massa id ultrices congue, urna dolor tristique velit, vitae mattis felis dolor non risus. Donec et pellentesque libero, nec ullamcorper risus. Donec dictum velit justo, a commodo enim tincidunt eu. Integer viverra ac erat ac porta. Suspendisse potenti. Morbi vulputate arcu vel blandit vehicula. Morbi ut risus sed ex pulvinar ultrices.

[s]Pellentesque sit amet nisl dictum, commodo erat in, malesuada justo. Vestibulum non erat in lectus blandit ullamcorper ut ut mauris. In erat mauris, ullamcorper ut erat vel, accumsan scelerisque tellus. Nunc ligula tellus, vulputate ut pulvinar at, tristique eu libero. Donec sit amet pretium lectus. In vel tellus et justo efficitur ultrices et in tellus porttitor.[/s]
            `.trim(),
            {
                size: 16,
                lineSpacing: 8,
                width: page.width - 40,
                styles: {
                    "h1": {
                        font: "darumadrop-one",
                        pos: vec2(0, 8),
                        scale: vec2(2),
                        stretchInPlace: false,
                    },
                    "i": {
                        color: MAGENTA.darken(100),
                        skew: vec2(-8, 0),
                        override: true,
                    },
                    "s": {
                        scale: vec2(0.4),
                        color: BLACK.lighten(50),
                        stretchInPlace: false,
                        override: true,
                    },
                },
            },
        ),
        color(BLACK.lighten(25)),
    ]);

    return page;
});
