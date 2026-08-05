/**
 * @file Look Towards the Mouse
 * @description Use lerpAngle to rotate an object towards a point
 * @difficulty 1
 * @tags animation, tween
 * @minver 3001.0
 * @category concepts
 * @group lerp
 * @groupOrder 1
 */

const k = kaplay({ background: "#873e84" });

loadSprite("bean", "/crew/bean.png");
loadSprite("beant", "/crew/beant.png");
loadSprite("zombean", "/crew/zombean.png");
loadBitmapFont("monospace", "/crew/happy-o.png", 36, 45);

/*
    Angles go from 180 to -180 degrees

    If we want to animate angle, it needs to be clamped
    Below is a comparison between lerpAngle() and lerp() functions
    Move your mouse up and down on the left side of the beans to see

    Use lerpAngle() (v4000+) when doing angle transitions to prevent
    360 spins after reaching 180 degrees, or check out workaround
*/

const beans = [
    // lerpAngle() clamps angle to go from 180 to -180 the shorter path
    ["bean", "lerpAngle"],

    // lerp() will go the long way around from 180 to -180, doing 360 spin
    ["beant", "lerp"],

    // workaround using Vec2 spherical lerp, but with a lot of conversions
    ["zombean", function workaround(a, b, t) {
        return Vec2.fromAngle(a).slerp(Vec2.fromAngle(b), t).angle();
    }],
].map(([spriteName, lerpMethod], i, a) =>
    add([
        anchor("center"),
        sprite(spriteName),
        pos(center().add((-220 * (a.length - 1)) / 2 + 220 * i, 0)),
        rotate(0),
        fixed(),
        scale(3),
        {
            toAngle: null,
            lerpMethod: k[lerpMethod] || lerpMethod,
            txt: typeof lerpMethod === "string"
                ? lerpMethod + (!k[lerpMethod] ? "\nunsupported" : "")
                : (lerpMethod.name || "customFn"),
            add() {
                onMouseMove(() => {
                    const toAngle = mousePos().sub(this.pos).angle();

                    // Flip initial direction/angle if mouse enters from the left side
                    if (this.toAngle === null && Math.abs(toAngle) > 90) {
                        this.flipY = true;
                        this.angle = -180;
                    }

                    this.toAngle = toAngle;
                    // If you don't want to animate, you could skip the whole toAngle thing
                    // by assigning this.angle = mousePos().sub(this.pos).angle(); right away
                    // and move this.flipY from update() here as well
                    // Although, animation would be still nicer when mouse enters canvas
                    // for the first time, at the very least :)
                });
            },
            update() {
                if (this.toAngle === null) return;
                if (typeof this.lerpMethod !== "function") return; // for demo purposes

                // lerpAngle(), lerp(), or custom fn called here for demo purposes
                // lerpAngle() would be preferred
                this.angle = this.lerpMethod(this.angle, this.toAngle, 0.12);
                this.flipY = Math.abs(this.angle) > 90; // never go upside down
            },
        },
    ])
);

onDraw(() =>
    beans.forEach(b =>
        drawText({
            text: b.txt,
            size: 28,
            align: "center",
            anchor: "top",
            pos: b.pos.add(0, 100),
            letterSpacing: -4,
            width: b.width * b.scale.x + 24,
        })
    )
);
