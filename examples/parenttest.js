/**
 * @file Parent Test
 * @description TBD.
 * @difficulty 1
 * @tags basics
 * @minver 4000.0
 * @locked
 */

kaplay();

loadBean();

const centerBean = add([
    pos(center()),
    anchor("center"),
    sprite("bean"),
    area(),
    rotate(0),
    scale(2),
    {
        update() {
            this.angle += 20 * dt();
        },
    },
]);

const orbitingBean = centerBean.add([
    pos(vec2(100, 0)),
    anchor("center"),
    sprite("bean"),
    area(),
    rotate(0),
    scale(1),
    color(),
    {
        update() {
            this.angle = -this.parent.transform.getRotation();
            if (this.isHovering()) {
                this.color = RED;
            }
            else {
                this.color = WHITE;
            }
        },
    },
]);

onMousePress(() => {
    if (orbitingBean.parent === centerBean /* && orbitingBean.isHovering()*/) {
        orbitingBean.setParent(getTreeRoot(), { keep: KeepFlags.All });
    }
});

onMouseMove((pos, delta) => {
    if (orbitingBean.parent !== centerBean) {
        orbitingBean.pos = orbitingBean.pos.add(delta);
    }
});

onMouseRelease(() => {
    if (orbitingBean.parent !== centerBean) {
        orbitingBean.setParent(centerBean, { keep: KeepFlags.All });
    }
});
