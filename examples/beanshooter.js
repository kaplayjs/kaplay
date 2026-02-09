kaplay({
    broadPhaseCollisionAlgorithm: "grid",
});
loadBean();
loadSprite("ghosty", "sprites/ghosty.png");
loadSprite("bag", "sprites/bag.png");
loadSprite("mark", "sprites/mark.png");

class BallGraph {
    constructor() {
        this.balls = get("ball", { liveUpdate: true });
    }

    getNeighbors(index) {
        const n = [];
        const b = this.balls[index];
        for (let i = 0; i < this.balls.length; i++) {
            if (i != index && b.pos.dist(this.balls[i].pos) < 60) {
                n.push(i);
            }
        }
        return n;
    }

    indexOf(ball) {
        return this.balls.indexOf(ball);
    }

    ballAt(index) {
        return this.balls[index];
    }

    floodFill(balls, predicate) {
        return floodFill(
            this,
            balls.map(b => this.indexOf(b)),
            index => predicate(this.ballAt(index)),
        ).map(index => this.ballAt(index));
    }
}

const ballGraph = new BallGraph();

function createBall(p, c) {
    return add([
        pos(p),
        circle(25),
        color(c),
        scale(),
        area({ isSensor: true }),
        offscreen({ destroy: true }), // For balls who fell down
        opacity(1), // In order to fade
        "ball",
        {
            acc: vec2(0),
            vel: vec2(0),
            add() {
                // Depending on color, we add a sprite inside
                let s = "bean";
                if (c.eq(RED)) s = "bag";
                if (c.eq(BLUE)) s = "ghosty";
                if (c.eq(YELLOW)) s = "mark";
                this.add([
                    sprite(s),
                    anchor("center"),
                    scale(0.5),
                    color(c),
                    opacity(1),
                ]);
            },
            update() {
                // Do physics step
                if (this.acc.y) {
                    this.vel = this.vel.add(this.acc.scale(dt()));
                    this.pos = this.pos.add(this.vel.scale(dt()));
                }
            },
        },
    ]);
}

for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 6; x++) {
        createBall(
            vec2(25 + x * 50 + (y & 1 ? 25 : 0), 25 + y * 50),
            choose([RED, GREEN, BLUE, YELLOW]),
        );
    }
}

function consolidateBalls(refBall) {
    // Look for all balls in the same color touching the reference ball or a ball touching the reference ball
    const fill = ballGraph.floodFill(
        [refBall],
        ball => ball.color.eq(refBall.color),
    );
    // If there are more balls than the reference ball itself, clear them
    if (fill.length == 1) return;
    for (i = 0; i < fill.length; i++) {
        const ball = fill[i];

        wait(0.15 * i, () => {
            tween(
                vec2(1),
                vec2(1.5),
                0.05,
                (p) => ball.scale = p,
                easings.easeOutQuad,
            ).onEnd(() => destroy(ball));
        });
    }
    // Balls not connected to the ceiling need to fall
    wait(1, () => {
        const balls = get("ball");
        const ceilingBalls = [];
        for (const b of balls) {
            if (b.pos.y < 26) {
                ceilingBalls.push(b);
            }
        }
        const fill = ballGraph.floodFill(ceilingBalls, ball => true);
        // Set gravity, aka acceleration, and clear the ball tag
        for (const b of new Set(balls).difference(new Set(fill))) {
            b.acc = vec2(0, 1000);
            b.untag("ball");
        }
        // Count the remaining balls to see if we won
        const remaining = get("ball");
        if (remaining.length == 0) {
            debug.log("You won");
        }
        // Check if we let balls come too low to see if we lost
        else if (remaining.some(b => b.pos.y > (25 + 6 * 50))) {
            debug.log("You lost");
        }
    });
}

const ballPos = vec2(25 + 3 * 50, 400);
function createShootingBall() {
    return add([
        pos(ballPos),
        circle(25),
        color(choose([RED, GREEN, BLUE, YELLOW])),
        area({ isSensor: true }),
        {
            vel: undefined,
            add() {
                this.onClick(() => {
                    shooting = true;
                });
                this.onCollide((obj, col) => {
                    if (!this.vel) return;
                    // Mark collision as resolved and clamp ball to its place
                    this.resolveCollision(obj);
                    this.clampPos();
                    this.vel = undefined;
                    // Create a clone which will represent the new ball
                    const clone = createBall(this.pos, this.color);
                    tween(
                        vec2(0.5),
                        vec2(1),
                        0.15,
                        (p) => clone.scale = p,
                        easings.easeOutQuad,
                    );
                    // If neighboring a similar color, remove all balls in same color
                    consolidateBalls(clone);
                    // Create a new ball to shoot with
                    ball = createShootingBall();
                    // Destroy the old one
                    destroy(this);
                });
            },
            update() {
                if (this.vel) {
                    // Add velocity
                    this.pos = this.pos.add(this.vel.scale(dt()));
                    // Left wall collision
                    if (this.pos.x < 25) {
                        this.vel.x *= -1;
                    }
                    // Right wall collision
                    else if (this.pos.x > 325) {
                        this.vel.x *= -1;
                    }
                    // Ceiling collision
                    if (this.pos.y < 25) {
                        this.clampPos();
                        createBall(this.pos, this.color);
                        ball = createShootingBall();
                        destroy(this);
                    }
                }
            },
            clampPos() {
                const y = Math.ceil((this.pos.y - 25) / 50);
                let x;
                if (y & 1) {
                    x = Math.round((this.pos.x - 50) / 50) * 50 + 25;
                }
                else {
                    x = Math.round((this.pos.x - 25) / 50) * 50;
                }
                this.pos = vec2(25 + x, 25 + y * 50);
            },
        },
    ]);
}

let nextRow = 1;
loop(
    5,
    () => {
        ballGraph.balls.forEach(ball => {
            ball.moveBy(0, 50);
        });
        for (let x = 0; x < 6; x++) {
            createBall(
                vec2(25 + x * 50 + (nextRow & 1 ? 25 : 0), 25),
                choose([RED, GREEN, BLUE, YELLOW]),
            );
        }
        if (ballGraph.balls.some(ball => ball.pos.y > (25 + 6 * 50))) {
            debug.log("You lost");
        }
        nextRow++;
    },
    undefined,
    true,
);

// Create a ball to shoot with
let ball = createShootingBall();
let shooting = false;
onDraw(() => {
    if (shooting && ballPos.y < mousePos().y) {
        drawLine({
            p1: ballPos,
            p2: mousePos(),
            width: 4,
            color: CYAN,
        });
    }
});
onMouseRelease(b => {
    if (shooting && ballPos.y < mousePos().y) {
        shooting = false;
        ball.vel = ballPos.sub(mousePos()).unit().scale(500);
    }
});

// draw ending line
// onDraw(() => {
//     drawLine({
//         p1: vec2(0, 25 + 6 * 50),
//         p2: vec2(width(), 25 + 6 * 50),
//         width: 5,
//         color: WHITE,
//     });
// });
