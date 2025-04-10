/**
 * @file Post-Effect
 * @description How to use a post effect shader in KAPLAY.
 * @difficulty 1
 * @tags effects
 * @minver 3001.0
 */

// FIXME: Make this is a playtest

kaplay();

const pretty = {
    i: "am pretty",
    all: "own properties are shown",
    even: {
        nested: "objects",
    },
    arrays: ["show", "like", "you", "would", "write", "them"],
    "own toString is used": vec2(10, 10),
};

pretty.recursive = pretty;

debug.log("Text in [brackets] doesn't cause issues");

debug.log(pretty);

debug.error("This is an error message");
