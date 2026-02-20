/**
 * @file Pretty Debug
 * @description Will see how pretty is our debug log
 * @difficulty 3
 * @tags debug
 * @minver 3001.0
 */

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
debug.log(pretty); // recursive doesn't cause issues

debug.error("Woops! This is an error message", ":("); // errors in red
debug.warn("Hey! This is a warning message!", "(!)");
