kaplay();

loadSprite("dino", "/sprites/dungeon-dino.png", {
    sliceX: 9,
    anims: {
        idle: {
            from: 0,
            to: 3,
            speed: 5,
        },
        run: {
            from: 4,
            to: 7,
            speed: 10,
        },
    },
});

const s = add([
    sprite("dino"),
    pos(100, 100),
    scale(10),
]);

function anim() {
    s.play("idle", {
        onEnd() {
            s.play("run", { onEnd: anim });
        },
    });
}
anim();
