/**
 * @file BBCode Formatting
 * @description How to parameterize text formatting codes.
 * @difficulty 2
 * @tags text
 * @minver 4000.0
 * @category concepts
 */

kaplay({ background: "black" });

add([
    pos(100, 100),
    text("[color=red]These[/color] [color=orange]colored[/color] [color=yellow]words[/color] [color=green]are[/color] [color=blue]all[/color] [color=purple]the[/color] [color=tan]same[/color] [color=brown]tag![/color]", {
        styles: {
            color(i, ch, param) {
                return {
                    color: rgb(param)
                }
            }
        },
        size: 32,
        width: 500
    })
]);
