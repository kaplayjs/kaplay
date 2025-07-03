"use strict";
// Make is the entity factory function
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInternal = makeInternal;
exports.make = make;
var events_1 = require("../../events/events");
var math_1 = require("../../math/math");
var shared_1 = require("../../shared");
var GameObjRaw_1 = require("./GameObjRaw");
/*
Order of making a game object:

1. We receive an array of components and tags from add([])
2. We create the GameObjRaw object using our prototype
3. We call .use() or .tag() on elements in the compAndTags array
*/
/*
We use makeInternal() to create the root game object, and make() to create
the rest of the game objects.
*/
function makeInternal(compsAndTags, id) {
    var addCompIdsToTags = id == 0
        ? false
        : shared_1._k.globalOpt.tagsAsComponents;
    // The game object from the prototype
    var obj = Object.create(GameObjRaw_1.GameObjRawPrototype);
    // Shadow individual properties
    obj._parent = null;
    obj._onCurCompCleanup = null;
    obj.children = [];
    obj._cleanups = {};
    obj._compStates = new Map();
    obj._compsIds = new Set();
    obj._anonymousCompStates = [];
    obj._tags = new Set("*");
    obj._events = new events_1.KEventHandler();
    obj._updateEvents = new events_1.KEvent();
    obj._fixedUpdateEvents = new events_1.KEvent();
    obj._drawEvents = new events_1.KEvent();
    obj._inputEvents = [];
    obj.paused = false;
    obj.hidden = false;
    obj.id = id;
    obj.transform = new math_1.Mat23();
    // We only need to modify the prototype the first time, when we know App
    // state is available (at the moment of create the root game object)
    if (id == 0) {
        (0, GameObjRaw_1.attachAppToGameObjRaw)();
    }
    // Adding components passed from add([]);
    // We register here: The objects, because you can also pass tags to add().
    var comps = [];
    var tagList = [];
    for (
        var _i = 0, compsAndTags_1 = compsAndTags;
        _i < compsAndTags_1.length;
        _i++
    ) {
        var compOrTag = compsAndTags_1[_i];
        if (typeof compOrTag == "string") {
            tagList.push(compOrTag);
        }
        else {
            var compId = compOrTag.id;
            if (compId) {
                obj._compsIds.add(compId);
                if (addCompIdsToTags) {
                    tagList.push(compId);
                }
            }
            comps.push(compOrTag);
        }
    }
    // Using .use and .tag we trigger onUse and onTag events correctly
    for (var _a = 0, comps_1 = comps; _a < comps_1.length; _a++) {
        var comp = comps_1[_a];
        obj.use(comp);
    }
    for (var _b = 0, tagList_1 = tagList; _b < tagList_1.length; _b++) {
        var tag = tagList_1[_b];
        obj.tag(tag);
    }
    // We cast the type as .use() doesn't add the types
    return obj;
}
function make(compsAndTags) {
    var obj = makeInternal(compsAndTags, shared_1._k.game.gameObjLastId);
    shared_1._k.game.gameObjLastId++;
    return obj;
}
