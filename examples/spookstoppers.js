/**
 * @file Spook Stoppers
 * @description Mix ingredients to shoot and survive
 * @difficulty 1
 * @tags game, input
 * @minver 4000.0
 * @category games
 */

// Made by Maxuo
// 2nd Place in Spooky & Tiny Jam

kaplay({
    width: 500,
    height: 800,
    letterbox: true,
    scale: Math.max(1, Math.min(innerWidth / 500, innerHeight / 800)),
    pixelDensity: Math.min(2, devicePixelRatio),
    font: "happy",
    background: "#144909",
});

loadSprite("skull", "/crew/skuller.png");
loadSprite("pumpkin", "/crew/pumpka.png");
loadSprite("cobweb", "/crew/spider_web.png");
loadSprite("marroc", "/crew/marroc.png");
loadSprite("jam", "/crew/jam.png");

loadSprite("ghost", "/crew/ghostiny.png");
loadSprite("zombie", "/crew/zombean.png");

loadSprite("fire", "/crew/fire.png");
loadSprite("egg", "/crew/egg.png");

loadSound("shoot", "/sounds/bug.mp3");
loadSound("explode", "/sounds/explode.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("move", "/sounds/score.mp3");
loadSound("input", "/sounds/movebox.wav");
loadSound("rip", "/sounds/off.mp3");

loadHappy();

scene("game", () => {
    gameState.score = 0;
    health = maxHealth;

    addEnemySpawner();

    // boundary
    add([
        rect(500, 20),
        pos(center().x, 510),
        color(rgb(18, 49, 1)),
        area({ isSensor: true }),
        anchor("center"),
        "boundary",
        {
            draw: () => {
                const healthPercent = (health / maxHealth) * 100;
                let color;
                if (healthPercent > 50) color = GREEN;
                else if (healthPercent <= 25) color = RED;
                else color = YELLOW;

                drawRect({
                    width: 500 * (health / maxHealth),
                    height: 10,
                    color: color,
                    anchor: "center",
                });
            },
        },
    ]);

    onCollide("enemy", "boundary", (enemy) => {
        play("hit");
        destroy(enemy);
        health -= enemy.dmg;
        shake(2);
        if (health <= 0) go("gameover");
    });

    onCollide("bullet", "enemy", (bullet, enemy) => {
        play("explode", { volume: 0.2 });
        destroy(bullet);
        addKaboom(enemy.pos, { scale: 0.5 });
        destroy(enemy);
        gameState.score++;
    });

    if (isTouchscreen()) {
        const backBtn = add([
            rect(45, 45, { radius: 10 }),
            pos(center().x - 214, 720),
            color("#ffaf63"),
            outline(5, rgb(219, 69, 0)),
            area({ scale: 1.5 }),
            anchor("center"),
            {
                draw: () => {
                    drawText({
                        text: "<",
                        pos: vec2(-2, -2),
                        size: 30,
                        color: BLACK,
                        anchor: "center",
                    });
                },
            },
        ]);

        backBtn.onClick(() => subtractIndex());

        const forwardBtn = add([
            rect(45, 45, { radius: 10 }),
            pos(center().x + 214, 720),
            color("#ffaf63"),
            outline(5, rgb(219, 69, 0)),
            area({ scale: 1.5 }),
            anchor("center"),
            {
                draw: () => {
                    drawText({
                        text: ">",
                        pos: vec2(-2, -2),
                        size: 30,
                        color: BLACK,
                        anchor: "center",
                    });
                },
            },
        ]);

        forwardBtn.onClick(() => addIndex());

        const interactBtn = add([
            rect(45, 45, { radius: 10 }),
            pos(center().x + 200, 640),
            color("#63fff2"),
            outline(5, rgb(0, 157, 219)),
            area({ scale: 1.5 }),
            anchor("center"),
            {
                draw: () => {
                    drawText({
                        text: "o",
                        pos: vec2(0, -3),
                        size: 30,
                        color: BLACK,
                        anchor: "center",
                    });
                },
            },
        ]);

        interactBtn.onClick(() => sendRecipe());

        const backspaceBtn = add([
            rect(45, 45, { radius: 10 }),
            pos(center().x - 200, 640),
            color("#f54d4d"),
            outline(5, rgb(182, 17, 17)),
            area({ scale: 1.5 }),
            anchor("center"),
            {
                draw: () => {
                    drawText({
                        text: "-",
                        pos: vec2(0, 0),
                        size: 30,
                        color: BLACK,
                        anchor: "center",
                    });
                },
            },
        ]);

        backspaceBtn.onClick(() => removeIngredient());
    }

    onKeyPress(["left", "a"], () => {
        subtractIndex();
    });

    onKeyPress(["right", "d"], () => {
        addIndex();
    });

    onKeyPress(["enter", "space"], () => {
        sendRecipe();
    });

    onKeyPress("backspace", () => {
        removeIngredient();
    });

    function subtractIndex() {
        play("move", { volume: 0.5, detune: -150 });
        cursorIndex = (--cursorIndex + blocks.length) % blocks.length;
    }

    function addIndex() {
        play("move", { volume: 0.5 });
        cursorIndex = (++cursorIndex + blocks.length) % blocks.length;
    }

    function sendRecipe() {
        if (writtenRecipe.length < 3) {
            writtenRecipe.push(cursorIndex);
            play("input", { detune: 100 });
        }
        else {
            let isValid = false;

            for (let i = 0; i < recipes.length; i++) {
                const recipe = recipes[i];
                if (
                    recipe.length === writtenRecipe.length
                    && recipe.every((val, i) => val === writtenRecipe[i])
                ) {
                    isValid = true;
                    addBullet(i);
                    play("shoot", { volume: 0.2 });
                    generateRecipe(i);
                }
            }

            if (!isValid) {
                burp();
                shake(vec2(8, 0), 0.5);
            }

            writtenRecipe = [];
        }
    }

    function removeIngredient() {
        if (writtenRecipe.length > 0) {
            writtenRecipe.pop();
            play("input", { detune: -300 });
        }
    }

    onDraw(() => {
        drawText({
            text: gameState.score.toString(),
            size: 20,
            pos: vec2(20, 20),
        });

        for (let i = 0; i < lanes.length; i++) {
            const recipe = recipes[i];

            for (let j = 0; j < lanes.length; j++) {
                drawSprite({
                    sprite: blocks[recipe[j]],
                    pos: vec2(lanes[i] + recipePos[j], 555),
                    scale: vec2(0.5),
                    anchor: "center",
                });
            }

            if (
                recipe.length === writtenRecipe.length
                && recipe.every((val, i) => val === writtenRecipe[i])
            ) {
                drawRect({
                    width: 75,
                    height: 4,
                    pos: vec2(lanes[i], 580),
                    color: GREEN,
                    anchor: "center",
                });
            }
        }

        drawRect({
            width: 300,
            height: 60,
            pos: vec2(center().x, 640),
            color: rgb(18, 49, 1),
            outline: { width: 4, color: rgb(33, 87, 3) },
            anchor: "center",
        });

        for (let i = 0; i < writtenRecipe.length; i++) {
            const ingredient = blocks[writtenRecipe[i]];

            drawSprite({
                sprite: ingredient,
                pos: vec2(
                    center().x + (i - (writtenRecipe.length - 1) / 2) * 65,
                    640,
                ),
                scale: vec2(0.7),
                anchor: "center",
            });
        }

        const xMult = 70;
        const xOffset = 110;
        const y = 720;

        for (let i = 0; i < blocks.length; i++) {
            const x = (i * xMult) + xOffset;

            drawRect({
                width: 60,
                height: 60,
                pos: vec2(x, y),
                color: rgb(18, 49, 1),
                outline: { width: 4, color: rgb(33, 87, 3) },
                anchor: "center",
            });

            drawSprite({
                sprite: blocks[i],
                pos: vec2(x, y),
                scale: vec2(0.5),
                anchor: "center",
            });
        }

        drawRect({
            width: 60,
            height: 60,
            pos: vec2((cursorIndex * xMult) + xOffset, y),
            fill: false,
            outline: { width: 5, color: rgb(255, 115, 0) },
            anchor: "center",
        });
    });
});

scene("gameover", () => {
    play("rip", { volume: 0.5 });

    wait(0.5, () => {
        onKeyPress("enter", () => go("game"));
        onMousePress(() => go("game"));
    });

    onDraw(() => {
        drawText({
            text: "Score: " + gameState.score.toString(),
            size: 30,
            pos: vec2(center().x, center().y - 100),
            anchor: "center",
        });

        drawText({
            text: "\\[Enter]\\ to Play Again",
            size: 20,
            pos: vec2(center().x, center().y + 50),
            anchor: "center",
        });
    });
});

go("game");

const laneGap = 170;
const lanes = [center().x - laneGap, center().x, center().x + laneGap];
const gameState = {
    score: 0,
};

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let cursorIndex = 0;

const recipePos = [-25, 0, 25];

let recipes = [
    [0, 1, 2],
    [1, 0, 2],
    [2, 1, 0],
];

let writtenRecipe = [0, 1, 2];

const maxHealth = 16;
let health = maxHealth;

const blocks = [
    "skull",
    "pumpkin",
    "cobweb",
    "marroc",
    "jam",
];

function generateRecipe(index) {
    recipes[index] = [];
    for (let i = 0; i < 3; i++) {
        recipes[index].push(randInt(0, 4));
    }
}

function addEnemy(x, y) {
    const rand = randInt(0, 4);
    const spr = rand === 4 ? "zombie" : "ghost";

    return add([
        sprite(spr),
        pos(x, y),
        anchor("center"),
        move(vec2(0, 1), randInt(30, 80)),
        area({ isSensor: true, scale: vec2(0.5, 0.5) }),
        "enemy",
        {
            dmg: spr === "ghost" ? 1 : 2,
        },
    ]);
}

const speed = 300;

function addBullet(lane) {
    add([
        sprite("egg"),
        scale(0.4),
        pos(lanes[lane], 500),
        move(vec2(0, -1), speed),
        anchor("center"),
        area({ isSensor: true }),
        offscreen({ destroy: true }),
        "bullet",
        {
            draw: () => {
                drawSprite({
                    sprite: "fire",
                    flipY: true,
                    pos: vec2(0, 50),
                    anchor: "center",
                });
            },
        },
    ]);
}

const enemyStartPos = -30;

function addEnemySpawner() {
    function spawnLoop() {
        wait(randInt(2, 4), () => {
            addEnemy(lanes[randInt(0, lanes.length - 1)], enemyStartPos);
            spawnLoop();
        });
    }

    wait(1, () => {
        addEnemy(lanes[0], enemyStartPos);
        spawnLoop();
    });
}
