// @ts-check

// How to make custom components kaplay
kaplay();

loadBean();

// Components are just function that returns a js object that follows a certain format
// This object contains certain properties which then become available in your object to use
function funky() {
    // Can use local closed variables to store component state
    let isFunky = false;

    return {
        // ------------------
        // Special properties that controls the behavior of the component (all optional)

        // These properties (id and require specially id) are handled by kaplay, id is the name of the component
        // If you want to get all objects with this component you can do get("funky")
        // Be careful to tag objects with what might be the id of a component

        id: "funky", // The name of the component
        require: ["scale", "color"], // If this component depend on any other components
        // If the you put components in require and attach this component to an object that doesn't have these components
        // The game will throw an error

        // Runs when the host object is added to the game
        add() {
            // E.g. Register some events from other components, do some bookkeeping, etc.
        },

        // Runs every frame as long as the host object exists
        update() {
            if (!isFunky) return;

            // "this" in all component methods refers to the the game object this component is attached to
            // Here we're updating some properties provided by other components
            this.color = rgb(rand(0, 255), rand(0, 255), rand(0, 255));
            this.scale = vec2(rand(1, 2));
        },

        // Runs every frame (after update) as long as the host object exists
        draw() {
            // E.g. Custom drawXXX() operations.
        },

        // Runs when the host object is destroyed
        destroy() {
            // E.g. Clean up event handlers, etc.
        },

        // When you press F1 you can get a list of inspect properties a component might provide for an object
        // Here you can provide custom ones
        inspect() {
            return "funky: " + isFunky;
        },

        // ------------------
        // All other properties and methods are directly assigned to the host object

        // This means that the object is getting funky, not that you're getting the property funky lol!
        getFunky() {
            isFunky = true;
        },
    };
}

// Adds an object with the funky component
const bean = add([
    sprite("bean"),
    pos(center()),
    anchor("center"),
    scale(1),
    color(),
    area(),
    // Use our component here
    funky(),
    // Tags are empty components, it's equivalent to a { id: "friend" }
    "friend",
    // Plain objects here are components too and work the same way, except unnamed
    {
        coolness: 100,
        friends: [],
    },
]);

onKeyPress("space", () => {
    // .coolness is from our plain object 'unnamed component'
    if (bean.coolness >= 100) {
        // We can use .getFunky() provided by the funky() component now
        bean.getFunky();
    }
});

onKeyPress("r", () => {
    // .use() is on every game object, it adds a component at runtime
    bean.use(rotate(rand(0, 360)));
});

onKeyPress("escape", () => {
    // .unuse() removes a component from the game object
    // The tag is the one that appears on the id
    bean.unuse("funky");
});

// Adds a text object
add([
    text("Press space to get funky", { width: width() }),
    pos(12, 12),
]);
