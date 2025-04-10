import type { KAPLAYOpt } from "../types";

export const createCanvas = (gopt: KAPLAYOpt) => {
    const root = gopt.root ?? document.body;
    const gscale = gopt.scale ?? 1;
    const pixelDensity = gopt.pixelDensity || 1;

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
    const canvas = gopt.canvas
        ?? root.appendChild(document.createElement("canvas"));

    // canvas css styles
    const styles = [
        "outline: none",
        "cursor: default",
    ];

    // Adjust canvas size according to user viewport settings
    if (
        // check if isFixed
        gopt.width && gopt.height && !gopt.letterbox
    ) {
        canvas.width = gopt.width * gscale;
        canvas.height = gopt.height * gscale;
        styles.push(`width: ${canvas.width}px`);
        styles.push(`height: ${canvas.height}px`);
    }
    else {
        canvas.width = canvas.parentElement!.offsetWidth;
        canvas.height = canvas.parentElement!.offsetHeight;
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
