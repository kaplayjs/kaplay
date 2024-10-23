kaplay();

const pretty = {
    i: "am pretty",
    all: "own properties are shown",
    even: {
        nested: "objects",
    },
    "own toString is used": vec2(10, 10)
}

debug.log("Text in [brackets] doesn't cause issues");

debug.log(pretty);

debug.error("This is an error message");

