/**
 * @file Text Click
 * @description How to detect where the user is clicking on text.
 * @difficulty 1
 * @tags basics, ui
 * @minver 4000.0
 * @category input
 */

kaplay({ background: "black", font: "happy" });
loadHappy();

let menuText = "";

function registerSceneNumber(number, happy) {
    scene(`scene${number}`, () => {
        add([
            pos(center()),
            text(
                `you went to scene ${number}!\n\n[small]${happy}\n\n\nclick anywhere to go back[/small]`,
                {
                    align: "center",
                    size: 70,
                    styles: {
                        small: {
                            scale: 0.6,
                            stretchInPlace: false,
                        },
                    },
                },
            ),
            anchor("center"),
        ]);
        onMousePress(() => popScene());
    });

    menuText +=
        `\n[go=scene${number}][goArrow=scene${number}]> [/goArrow]go to scene ${number}[goArrow=scene${number}] <[/goArrow][/go]`;
}

registerSceneNumber(1, "good job!");
registerSceneNumber(2, "you came back for more!");
registerSceneNumber(3, "three's company!");
registerSceneNumber(4, "you're still coming?");
registerSceneNumber(5, "oh, wow, you're\nreally into this...");
registerSceneNumber(6, "like seriously do you\nlike scenes this much?");

scene("menu", () => {
    let willGo;
    const t = add([
        pos(center()),
        text(`click text below\nto go to the scene\n\n${menuText}`, {
            align: "center",
            size: 50,
            styles: {
                large: {
                    scale: 3,
                    stretchInPlace: false,
                },
                go(_, __, goScene) {
                    if (willGo === goScene) {
                        return {
                            color: Color.fromHSL((time() * 2) % 1, 1, 0.5),
                        };
                    }
                    else {
                        return {};
                    }
                },
                goArrow(_, __, goScene) {
                    return {
                        opacity: willGo === goScene ? 1 : 0,
                    };
                },
            },
        }),
        anchor("center"),
        area(),
    ]);
    onMouseMove(() => {
        t.onHoverUpdate(() => {
            const index = t.pointToCharacter(t.fromScreen(mousePos()));
            willGo = t.formattedText().chars[index]?.styles.find(pair =>
                pair[0] === "go"
            )?.[1];
        });
        t.onHoverEnd(() => {
            willGo = undefined;
        });
        t.onClick(() => {
            if (willGo !== undefined) pushScene(willGo);
        });
        return cancel();
    });
});
go("menu");
