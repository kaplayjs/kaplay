/**
 * @file Slice-9 Tiled
 * @description How to use tileMode with 9-slice sprites for tiling edges and center.
 * @difficulty 1
 * @tags animation, draw
 * @minver 3001.0
 * @category concepts
 */

kaplay({ scale: 3 });

const TILE_MODE = "all";

const spriteConfigs = {
    "1x3": {
        path: "/sprites/9slice_1x3.png",
        left: 8,
        right: 8,
        top: 24,
        bottom: 24,
    },
    "3x1": {
        path: "/sprites/9slice_3x1.png",
        left: 24,
        right: 24,
        top: 8,
        bottom: 8,
    },
    "3x3": {
        path: "/sprites/9slice_3x3.png",
        left: 25,
        right: 25,
        top: 25,
        bottom: 25,
    },
};

Object.entries(spriteConfigs).forEach(([name, config]) => {
    loadSprite(name, config.path, {
        slice9: {
            left: config.left,
            right: config.right,
            top: config.top,
            bottom: config.bottom,
            tileMode: TILE_MODE,
        },
    });
});

const cases = [
    { name: "3x1", scaleWidth: true, scaleHeight: false },
    { name: "1x3", scaleWidth: false, scaleHeight: true },
    { name: "3x3", scaleWidth: true, scaleHeight: true },
];

const panels = [];
const spacing = width() / 3;

cases.forEach((c, i) => {
    const x = spacing * i + spacing / 2;
    const config = spriteConfigs[c.name];

    const panel = add([
        pos(x, center().y),
        sprite(c.name),
        anchor("center"),
        { caseData: c, config: config },
    ]);

    panels.push(panel);
});

onUpdate(() => {
    const t = time();
    panels.forEach((panel) => {
        const c = panel.caseData;
        const config = panel.config;
        const minW = config.left + config.right + 10;
        const minH = config.top + config.bottom + 10;
        const maxW = minW + 80;
        const maxH = minH + 80;

        if (c.scaleWidth) {
            panel.width = Math.round(
                minW + (Math.sin(t * 2) + 1) / 2 * (maxW - minW),
            );
        }
        else {
            panel.width = minW;
        }

        if (c.scaleHeight) {
            panel.height = Math.round(
                minH + (Math.sin(t * 2) + 1) / 2 * (maxH - minH),
            );
        }
        else {
            panel.height = minH;
        }
    });
});
