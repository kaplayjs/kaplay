/**
 * @file Pretty Debug
 * @description Will see how pretty is our debug log
 * @difficulty 1
 * @tags debug
 * @minver 4000.0
 */

kaplay({ logMax: 50, logTime: 10 });

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

debug.warn("Hey! This is a warning message!", "(!)");

// Errors log in all modes
debug.error("Woops! This is an error message", ":("); // errors in red
debug.log(new Error("Another error"));
debug.log(
    new Error(
        "Okay, so many errors today, but making mistakes is fine, you're valid and good :)",
    ),
);
