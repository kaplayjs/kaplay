/**
 * @file Singleton Tags
 * @description How to make tags unique
 * @difficulty 0
 * @tags basics, gobj
 * @minver 4000.0
 * @category concepts
 */

// Singleton tags are unique tags
// Only one object will have a given tag at a time (the last one tagged)

kaplay({
    background: "#261c2b",
    // To make tags singleton, define them like this:
    // (you can also addSingletonTag() or removeSingletonTag() later)
    singletonTags: ["selected", "just-added", "(f)avorite"],
    topMostOnlyActivate: true,
});

// Another way to set them later is using helper:
// setSingletonTags(["selected", "just-added", "(f)avorite"]);

scene("main", () => {
    // We can use regular get() to get an always up-to-date array that will contain only a selected object
    const selectedObj = get("selected", { recursive: true, liveUpdate: true });
    let blocksCounter = 1;

    // Just a help text how to interact with the example :)
    const help = add([
        pos(16),
        text(
            [
                "(Space/Right-click) to add · (Click) to select · (R) to reset",
                "(Delete/D) selected · (F) to set only favorite · (S) to make singleton",
            ].join("\n"),
            {
                size: 18,
                width: width() - 32,
                lineSpacing: 8,
            },
        ),
        color("pink"),
        opacity(0.6),
    ]);
    const offsetY = 22 + help.pos.y + help.height;

    // Custom block component that prints obj's tags
    const block = () => ({
        id: "block",
        requires: ["pos", "text", "area"],
        add() {
            this.moveBy(8, 6);

            // Text handling
            const updateText = () => this.text = this.tags.slice(1).join("\n");
            updateText();
            this.onTag(updateText);
            this.onUntag(updateText);

            // Select
            this.onClick(() => {
                this.tag("selected");
                get("z", { only: "comps" }).forEach(o => o.unuse("z"));
                this.use(z(1));
            });

            // Drag & drop
            let drag;
            let dragEnd;
            this.onClick(() => {
                if (!isMousePressed("left")) return;
                const dragOffset = mousePos()
                    .scale(1 / getCamScale().x).sub(this.pos);
                drag = this.onMouseDown(() => {
                    this.pos = mousePos()
                        .scale(1 / getCamScale().x).sub(dragOffset);
                });
                dragEnd = this.onMouseRelease(() => {
                    drag?.cancel();
                    return cancel();
                });
            });
        },
        draw() {
            // Block background
            drawRect({
                pos: vec2(-12, -10),
                width: (this.width + 24) ?? 0,
                height: (this.height + 20) ?? 0,
                radius: 12,
                color: rgb(this.is("selected") ? "#c97373" : "#462d39"),
                opacity: 0.9,
                outline: {
                    join: "miter",
                    width: 4,
                    color: getBackground(),
                },
            });
        },
    });

    // Factory function for obj with block
    const addBlock = (comps) =>
        add([
            pos(16, offsetY),
            block(),
            text("block-1", { size: 22 }),
            area(),
            z(1),
            ...comps,
        ]);

    // Create the first block obj manually (just for custom tags order)
    addBlock([
        "block-1",
        "just-added",
        "to-(s)ingleton",
        "(f)avorite",
        "selected",
    ]);

    // Blocks creating
    // Safe with the same singleton tags each time as well
    // The last added block will be the only one with "just-added" and "selected" thanks to singletonTags
    // "to-(s)ingleton" tag is to show you can make tag a singleton later on when you press "s"
    const createBlock = (p) =>
        addBlock([
            pos(
                p ?? rand(
                    vec2(16, offsetY),
                    vec2(width() - 200, height() - 200),
                ),
            ),
            `block-${++blocksCounter}`,
            "just-added",
            "to-(s)ingleton",
            "selected",
        ]);
    onKeyPress("space", () => createBlock());
    onMousePress("right", () => createBlock(mousePos()));

    // Block actions
    onKeyPress(["d", "delete"], () => selectedObj?.[0]?.destroy());
    onKeyPress("f", () => selectedObj?.[0]?.tag("(f)avorite"));
    onKeyPress("s", () => {
        const block = selectedObj?.[0];
        // Makes additional tag a singleton, will disappear from the other objects
        // Can check if singleton tag already, not necessary for addSingletonTag as it wouldn't add twice,
        // but to show the possible API use case as an exmaple
        if (!isSingletonTag("to-(s)ingleton")) {
            // When adding a singleton tag, you can specify which already existing object
            // with a tag remains tagged instead of the last occurrence in the object tree
            addSingletonTag("to-(s)ingleton", block);
        }
        // Just to show singleton works when tagging again
        // Selected block will be tagged, other existing untagged as intended
        else block?.tag("to-(s)ingleton");
    });

    // Reset scene
    onKeyPress("r", () => {
        // Reset the tag that wasn't initially a singleton tag
        removeSingletonTag("to-(s)ingleton");
        go("main");
    });

    // Logging of selected live get query, defined in the very top
    const logSelected = () =>
        debug.log(selectedObj?.[0]?.text?.replaceAll("\n", " "));
    onTag(() => logSelected());
    onAdd(() => nextFrame(logSelected));
});

onLoad(() => go("main"));
