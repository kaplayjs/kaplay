/**
 * @file Singleton Tags
 * @description How to make tags unique
 * @difficulty 1
 * @tags basics, gobj
 * @minver 4000.0
 * @category concepts
 */

// Singleton tags are unique tags that guarantee that only one object
// will have a given tag at a time (the last one tagged)

kaplay({
    background: "#261c2b",
    // To make tags singleton, define them like this:
    // (you can also addSingletonTag() or removeSingletonTag() later)
    singletonTags: ["selected", "just-added", "(f)avorite"],
    topMostOnlyActivate: true,
    pixelDensity: Math.min(devicePixelRatio, 2),
});

// Another way to set them later is using the helper:
// setSingletonTags(["selected", "just-added", "(f)avorite"]);

// Example mostly uses the nature of singleton tags to automatically switch the
// "selected" object, or have multiple "selected" once we removeSingletonTag()
// without having to do multiple queries and manual (un)tagging

scene("main", () => {
    // We can use regular get() to get an always up-to-date array that will
    // contain only selected object(s)
    const selectedObjs = get("selected", { recursive: true, liveUpdate: true });
    let blocksCounter = 1;

    // Just a help text how to interact with the example :)
    const help = add([
        pos(16),
        text(
            [
                "(Space/Right-click) to add · (Click) to select · Hold (Shift) to multiselect",
                "(Delete/D) selected · (F) to set only favorite · (S) to make singleton",
                "(R) to reset",
            ].join("\n"),
            {
                size: 16,
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
            const updateText = () => this.text = this.tags.slice(2).join("\n");
            updateText();
            this.onTag(updateText);
            this.onUntag(updateText);

            // Select
            this.onClick(() => {
                // We will support multiple drag&drop at the same time, this will ensure
                // that we revert to one block selected only if we weren't just moving them
                let moved = false;
                const m = this.onMouseMove(() => {
                    moved = true;
                    return cancel();
                });
                this.onMouseRelease(() => {
                    if (moved) return cancel();
                    // We will support multiselect, this makes sure there will be only
                    // one selected block again when not doing multiselect
                    if (!isKeyDown("shift")) addSingletonTag("selected", this);
                    m.cancel();
                    return cancel();
                });

                // We allow unselect when clicked again during multiselect
                if (
                    isKeyDown("shift") && this.is("selected")
                    && selectedObjs.length > 1
                ) this.untag("selected");
                else this.tag("selected");

                get("z", { only: "comps" }).forEach(o => o.unuse("z"));
                this.use(z(1));
            });

            // Drag & drop
            let drag;
            let dragEnd;
            this.onClick(() => {
                if (!isMousePressed("left")) return;
                drag = this.onMouseMove((_, d) => {
                    selectedObjs.forEach(o => o.moveBy(d));
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
            text("block-1", { size: 20, lineSpacing: 4 }),
            area({ isSensor: true, collisionIgnore: ["block"] }),
            z(1),
            "block",
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
    const createBlock = (p) => {
        // Makes sure the new added is the only selected
        // Wouldn't be necessary if there was no multiselect
        addSingletonTag("selected");
        addBlock([
            pos(
                p ?? rand(
                    vec2(16, offsetY),
                    vec2(width() - 200, height() - 200),
                ),
            ),
            `block-${++blocksCounter}`,
            // This one is to show you can make tag a singleton later on when you press "s"
            "to-(s)ingleton",
            // Safe with the same singleton tags each time as well, only the last added
            // block will have these thanks to singletonTags:
            "just-added",
            "selected",
        ]);
    };
    onKeyPress("space", () => createBlock());
    onMousePress("right", () => createBlock(mousePos()));

    // Block actions
    onKeyPress(
        "f",
        () => selectedObjs?.[selectedObjs.length - 1]?.tag("(f)avorite"),
    );
    onKeyPress(["d", "delete"], () => {
        // Since selectedObjs is a live array, it would get modified on each destroy
        // so we would end up removing only every second obj, we must make a copy first
        [...selectedObjs].forEach(o => o.destroy());
    });
    onKeyPress("s", () => {
        const block = selectedObjs?.[selectedObjs.length - 1];
        // Makes additional tag a singleton, will disappear from the other objects.
        // We can check if it's a singleton tag already, but not necessary for addSingletonTag()
        // as it wouldn't add twice, but just to show the possible API use case as an example.
        if (!isSingletonTag("to-(s)ingleton")) {
            // When adding a singleton tag, you can specify which already existing object
            // with a tag remains tagged instead of the last occurrence in the object tree
            addSingletonTag("to-(s)ingleton", block);
        }
        // Just to show singleton works when tagging again
        // Selected block will be tagged, other existing untagged as intended
        else block?.tag("to-(s)ingleton");
    });

    // We can support multiselect by removing singleton tag on "shift"
    onKeyDown("shift", () => {
        // Early return if multiselect is already in progress
        if (selectedObjs.length > 2) return;

        removeSingletonTag("selected");
        // You could see earlier we check if "shift" is held down to revert it otherwise,
        // but if we haven't selected more blocks right away, we can revert it already.
        // Otherwise, we let the held check do it to not unselect before any other action.
        onKeyRelease("shift", () => {
            if (selectedObjs.length < 2) addSingletonTag("selected");
            return cancel();
        });
    });
    // Although, we will unselect when clicking outside
    onMousePress("left", () => {
        // Get only the nearest objs to mouse pos to check if we haven't clicked on any
        let isOutside = true;
        retrieve(new Rect(toWorld(mousePos()), 1, 1), o => {
            if (!isOutside) return;
            isOutside = !o.hasPoint(toWorld(mousePos()));
        });

        // Unselect, once again easily thanks to singleton tag
        if (selectedObjs.length && isOutside && !isKeyDown("shift")) {
            addSingletonTag("selected");
            // addSingletonTag() untags all except the last occurence
            // if we want to deselect all, untag that once as well
            selectedObjs[0].untag("selected");
        }

        // We are good to start desktop-like selection
        if (isOutside) selection();
    });

    // Bonus, creates desktop-like selection
    function selection() {
        let init;
        let move;
        let sel;
        // We init the selection and logic only once mouse moves
        init = onMouseMove(() => {
            const p = mousePos();
            let w = 0;
            let h = 0;

            // Allow multiple selected
            removeSingletonTag("selected");

            // Selection rect obj
            sel = add([
                pos(p),
                anchor("topleft"),
                rect(w, h, { fill: false }),
                area({ isSensor: true }),
                outline(1, BLUE.lighten(120)),
                z(9999),
                {
                    add() {
                        // Tag & untag if inside of rect selection
                        this.onCollide(o => o.tag("selected"));
                        this.onCollideEnd(o => o.untag("selected"));
                    },
                    draw() {
                        drawRect({
                            anchor: this.anchor,
                            width: this.width,
                            height: this.height,
                            color: BLUE.lighten(120),
                            opacity: 0.2,
                        });
                    },
                },
            ]);

            // Smart way to deal with negative delta is to change anchor instead
            // based on resulting width and height to draw rect the other way :)
            const a = [
                ["topleft", "topright"],
                ["botleft", "botright"],
            ];

            // Resizes selection rect
            move = onMouseMove((_, d) => {
                w += d.x;
                h += d.y;
                sel.width = Math.abs(w);
                sel.height = Math.abs(h);
                sel.anchor = a[+(h < 0)][+(w < 0)];
            });

            return cancel();
        });

        // On selection end
        onMouseRelease(() => {
            // If we haven't selected multiple, revert singleton tag back
            if (selectedObjs.length < 2) addSingletonTag("selected");

            // Cancel and destroy
            init?.cancel();
            move?.cancel();
            sel?.destroy();
            return cancel();
        });
    }

    // Reset scene
    onKeyPress("r", () => {
        // Reset the tag that wasn't initially a singleton tag
        removeSingletonTag("to-(s)ingleton");
        go("main");
    });

    // Logging of selected live get query, defined in the very top
    const logSelected = () =>
        debug.log(
            selectedObjs?.[selectedObjs.length - 1]?.text
                ?.replaceAll("\n", " "),
        );
    onTag(() => logSelected());
    onAdd((o) => o.is("selected") && nextFrame(logSelected));
});

onLoad(() => go("main"));
