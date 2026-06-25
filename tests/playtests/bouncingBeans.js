/**
 * @file Bouncing beans using proxied pos
 * @description After making pos use a proxy PR #1109
 * @minver 4000.0.0-alpha.28
 */

kaplay({
    width: 1000,
    height: 800,
    font: "happy-o",
});

loadBitmapFont("happy-o", "/crew/happy-o.png", 36, 45);
loadBean();

// Try to find the highest number of objects your PC can handle at your stable
// monitor refresh rate for the best FPS drop observation
const OBJ_COUNT = 1000;

onLoad(() => {
    for (let i = 0; i < OBJ_COUNT; i++) {
        const bean = add([
            sprite("bean"),
            pos(randi(0, width() - 64), randi(0, height() - 64)),
            { dir: vec2((randi() * 2 - 1) * 45, (randi() * 2 - 1) * 45) },
        ]);

        bean.onUpdate(() => {
            if (bean.pos.x <= 0 || bean.pos.x + bean.width >= width()) {
                bean.dir.x *= -1;
            }
            if (bean.pos.y <= 0 || bean.pos.y + bean.height >= height()) {
                bean.dir.y *= -1;
            }

            bean.pos.x += bean.dir.x * dt();
            bean.pos.y += bean.dir.y * dt();

            // Comparable alternatives
            // bean.move(bean.dir);
            // bean.moveBy(bean.dir.x * dt(), bean.dir.y * dt());
            // bean.pos = bean.pos.add(bean.dir.scale(dt()));
            // bean.pos = bean.pos.add(bean.dir.x * dt(), bean.dir.y * dt());

            if (i === 0) debug.log(bean.pos);
        });
    }

    add([
        pos(10, 10),
        text("fps"),
        z(10000),
        {
            update() {
                this.text = `fps: ${debug.fps().toFixed(2)}`;
            },
        },
    ]);
});
