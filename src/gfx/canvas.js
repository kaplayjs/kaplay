"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvas = void 0;
var createCanvas = function (gopt) {
    var _a, _b;
    var root = (_a = gopt.root) !== null && _a !== void 0 ? _a : document.body;
    var pixelDensity = gopt.pixelDensity || 1;
    // If root is not defined (which falls back to <body>) we assume user is on a clean page,
    // and modify <body> to better fit a full screen canvas
    if (root === document.body) {
        document.body.style["width"] = "100%";
        document.body.style["height"] = "100%";
        document.body.style["margin"] = "0px";
        document.documentElement.style["width"] = "100%";
        document.documentElement.style["height"] = "100%";
    }
    // Create a <canvas> if user didn't provide one
    var canvas = (_b = gopt.canvas) !== null && _b !== void 0 ? _b : root.appendChild(document.createElement("canvas"));
    // canvas css styles
    var styles = [
        "outline: none",
        "cursor: default",
    ];
    // Adjust canvas size according to user viewport settings
    if (
    // check if isFixed
    gopt.width && gopt.height && !gopt.letterbox) {
        canvas.width = gopt.width * gopt.scale;
        canvas.height = gopt.height * gopt.scale;
        styles.push("width: ".concat(canvas.width, "px"));
        styles.push("height: ".concat(canvas.height, "px"));
    }
    else {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        styles.push("width: 100%");
        styles.push("height: 100%");
    }
    // Cripsing
    if (gopt.crisp) {
        // chrome only supports pixelated and firefox only supports crisp-edges
        styles.push("image-rendering: pixelated");
        styles.push("image-rendering: crisp-edges");
    }
    canvas.style.cssText = styles.join(";");
    canvas.width *= pixelDensity;
    canvas.height *= pixelDensity;
    // Makes canvas focusable
    canvas.tabIndex = 0;
    return canvas;
};
exports.createCanvas = createCanvas;
