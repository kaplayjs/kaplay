/**
 * @file Graveyard Shooter
 * @description Run and gun through top-down monster-filled rooms
 * @difficulty 2
 * @tags game, ai
 * @minver 4000.0
 * @category games
 */

// Made by riodigenero
// 2nd Place in Spooky & Tiny Jam

kaplay({
    width: 500,
    height: 500,
    background: "#3f3637",
    font: "happy-o",
    letterbox: true,
    scale: 2,
    pixelDensity: Math.max(2, devicePixelRatio),
});

loadBitmapFont("happy-o", "/crew/happy-o.png", 36, 45);
loadSprite("bean", "/crew/bean.png");
loadSprite("ghostiny", "/crew/ghostiny.png");
loadSprite("bag", "/crew/bag.png");
loadSprite("skuller", "/crew/skuller.png");
loadSprite("zombean", "/crew/zombean.png");
loadSprite("spider_web", "/crew/spider_web.png");
loadSprite("firing", "/crew/firing.png", {
    sliceX: 2,
    anims: {
        "anim": {
            from: 0,
            to: 1,
            loop: true,
            speed: 6.67,
        },
    },
});
loadSprite("sparkling", "/crew/sparkling.png", {
    sliceX: 5,
    anims: {
        "anim": {
            from: 0,
            to: 4,
            loop: true,
            speed: 10,
        },
    },
});

loadSound("enter", "/sounds/mystic.mp3");
loadSound("fire", "/sounds/explode.mp3");
loadSound("ice", "/sounds/bug.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("wooosh", "/sounds/wooosh.mp3");
loadSound("bell", "/sounds/bell.mp3");
loadSound("powerup", "/sounds/powerup.mp3");
loadSound("gates", "/sounds/danger.mp3");

let roomsReached = 0;

scene("game", ({ gatesState, startPos, mana = 700 } = {}) => {
    const isStart = roomsReached === 0;

    if (isStart) {
        const title = add([
            text("Run and Gun\nThe Graveyard", {
                font: "happy-o",
                width: width() - 60,
                size: 35,
                align: "center",
                letterSpacing: -4,
            }),
            pos(30, 90),
            z(height() * 2),
        ]);

        const startY = 90;
        let time = 0;

        title.onUpdate(() => {
            time += dt();
            title.pos = vec2(title.pos.x, startY + Math.sin(time * 3) * 10);
        });
    }
    else {
        play("enter", { volume: 0.2 });
    }

    let PLAYER_SPEED = 150;

    const player = add([
        sprite("bean"),
        scale(0.5),
        pos(startPos ?? vec2(250, 350)),
        anchor("center"),
        area({ isSensor: true }),
        body(),
        z(),
        "player",
    ]);
    player.onUpdate(() => player.z = player.pos.y);

    const hand = add([
        circle(4),
        pos(player.pos),
        anchor("center"),
        z(height()),
        outline(2, rgb("#1f102a")),
        color("#5ba675"),
    ]);
    hand.onUpdate(() => {
        const mouse = mousePos();
        const angle = mouse.sub(player.pos).angle();
        const radius = 25;

        hand.pos = player.pos.add(
            vec2(
                Math.cos(deg2rad(angle)) * radius,
                Math.sin(deg2rad(angle)) * radius,
            ),
        );
        hand.angle = angle;
    });

    onMousePress("left", () => {
        if (mana <= 0) return;

        const direction = mousePos().sub(player.pos).unit();
        const bullet = add([
            sprite("firing", { anim: "anim" }),
            pos(hand.pos),
            area({ isSensor: true }),
            scale(0.45),
            anchor("center"),
            offscreen({ destroy: true }),
            move(direction, 200),
            z(),
            "bullet",
        ]);
        bullet.onUpdate(() => bullet.z = bullet.pos.y);

        mana -= 5;
        mana_display.text = "Mana: " + mana;
        play("fire", { speed: 0.5, volume: 0.2 });
    });

    onMousePress("right", () => {
        if (mana < 10) return;

        const bullet_freeze = add([
            rect(64, 64, { radius: 18 }),
            pos(hand.pos),
            area({ isSensor: true, scale: 0.5 }),
            anchor("center"),
            color(0, 238, 255),
            outline(2),
            scale(1),
            z(-1),
            timer(),
            "ice",
        ]);
        bullet_freeze.tween(
            vec2(0.5),
            bullet_freeze.scale,
            0.2,
            v => bullet_freeze.scale = v,
            easings.easeOutQuad,
        );
        wait(5, () => destroy(bullet_freeze));

        mana -= 10;
        mana_display.text = "Mana: " + mana, { letterSpacing: -6 };
        play("ice", { volume: 0.2 });
    });

    const mana_display = add([
        text("Mana: " + mana, { letterSpacing: -6 }),
        pos(player.pos.x, player.pos.y - 20),
        anchor("bot"),
        scale(0.4),
        z(height()),
    ]);
    mana_display.onUpdate(() => {
        mana_display.pos = vec2(
            clamp(player.pos.x, 65, 435),
            player.pos.y - 20,
        );
    });

    player.onUpdate(() => {
        const dir = vec2(0);
        dir.x = isKeyDown(["right", "d"]) - isKeyDown(["left", "a"]);
        dir.y = isKeyDown(["down", "s"]) - isKeyDown(["up", "w"]);
        player.move(dir.scale(
            PLAYER_SPEED * (dir.x && dir.y && 1 / Math.sqrt(2) || 1),
        ));
    });
    player.onUpdate(() => {
        if (player.pos.x >= 493) {
            player.pos.x = 36;
            changeLevel();
        }
        else if (player.pos.x <= 7) {
            player.pos.x = 464;
            changeLevel();
        }
        else if (player.pos.y <= 3) {
            player.pos.y = 466;
            changeLevel();
        }
        else if (player.pos.y >= 493) {
            player.pos.y = 36;
            changeLevel();
        }
    });

    const patrols = [];
    function spawnEnemy(opt) {
        const p = vec2(randi(30, 450), randi(30, 450));
        const s = opt.sprite ?? "ghostiny";
        const enemy = add([
            sprite(s),
            pos(p),
            anchor("center"),
            scale(opt.scale ?? 1),
            area({ isSensor: true }),
            health(opt.hp ?? 2),
            z(p.y + getSprite(s).data.height / 2),
            "enemy",
            opt.tag ?? opt.sprite,
        ]);

        enemy.onCollide("bullet", (b) => {
            destroy(b);
            play("hit");
            enemy.hp -= 1;
            if (enemy.hp <= 0) {
                if (chance(0.2)) {
                    const spark = add([
                        sprite("sparkling", { anim: "anim" }),
                        pos(enemy.pos),
                        area({ isSensor: true }),
                        scale(0.75),
                        anchor("center"),
                        z(enemy.z),
                        timer(),
                        "spark",
                    ]);
                    spark.tween(
                        vec2(0),
                        spark.scale,
                        0.4,
                        v => spark.scale = v,
                        easings.easeOutBack,
                    );
                    play("bell", { volume: 0.2 });
                }
                addKaboom(enemy.pos, {
                    scale: 0.5,
                    comps: [z(height())],
                });
                destroy(enemy);
                play("fire", { volume: 0.2 });
                shake(2);
            }
        });

        let speed = opt.speed;
        if (speed) {
            enemy.onUpdate(() => {
                const direction = player.pos.sub(enemy.pos).unit();
                enemy.pos = enemy.pos.add(direction.scale(speed * dt()));
                enemy.z = enemy.pos.y;
            });

            enemy.onCollide("ice", (i) => {
                enemy.hp -= 1;
                speed = 0;
            });

            enemy.onCollideEnd("ice", () => {
                speed = opt.speed;
            });
        }

        return enemy;
    }
    function spawnEnemies(gc, zc, sc, pc) {
        for (let i = 0; i < gc; i++) {
            spawnEnemy({
                tag: "ghost",
                sprite: "ghostiny",
                scale: 0.8,
                hp: 2,
                speed: 50,
            });
        }
        for (let i = 0; i < zc; i++) {
            spawnEnemy({
                tag: "zombie",
                sprite: "zombean",
                scale: 0.6,
                hp: 3,
                speed: 30,
            });
        }

        const graves = [...get("zombie"), ...get("ghost")]
            .sort((a, b) => a.pos.y - b.pos.y);
        for (const grave of graves) {
            const patch = add([
                rect(44, 50, { radius: 4 }),
                pos(
                    clamp(grave.pos.x, 80, width() - 80),
                    clamp(grave.pos.y, 84, height() - 74),
                ),
                color("#5a321d"),
                anchor("top"),
                z(-1),
                "decor",
                "patch",
            ]);
            const tomb = add([
                rect(30, 40, { radius: [14, 14, 0, 0] }),
                pos(patch.pos.x, patch.pos.y - 15),
                anchor("center"),
                body({ isStatic: true }),
                color("#5c5455"),
                outline(2.5, rgb("#1f102a")),
                area({ scale: vec2(1, 0.5), collisionIgnore: ["tomb"] }),
                z(patch.pos.y - 10),
                "tomb",
                "decor",
            ]);
        }

        for (let i = 0; i < sc; i++) {
            spawnEnemy({
                sprite: "skuller",
                scale: 1,
                hp: 5,
                speed: 0,
            });
        }
        for (let i = 0; i < pc; i++) {
            const patrol = add([
                sprite("bag"),
                pos(randi(30, 450), randi(30, 450)),
                anchor("center"),
                area({ isSensor: true }),
                scale(0.6),
                "patrol",
            ]);
            patrol.onUpdate(() => patrol.z = patrol.pos.y);
            const patrolData = {
                enemy: patrol,
                speed: 50,
                direction: vec2(1, 0),
                timer: rand(1, 2),
            };
            patrols.push(patrolData);
            patrol.onCollide("ice", () => patrolData.speed = 0);
            patrol.onCollideEnd("ice", () => patrolData.speed = 50);
        }
    }
    onUpdate(() => {
        for (const patrolData of patrols) {
            const patrol = patrolData.enemy;
            if (!patrol.exists()) continue;
            if (
                !patrolData.direction
                || typeof patrolData.direction.scale !== "function"
            ) {
                patrolData.direction = choose([
                    vec2(1, 0),
                    vec2(-1, 0),
                    vec2(0, 1),
                    vec2(0, -1),
                ]);
            }
            patrol.flipX = patrolData.direction.x < 0;
            patrolData.timer -= dt();
            if (patrolData.timer <= 0) {
                patrolData.direction = vec2(rand(-1, 1), rand(-1, 1)).unit();
                patrolData.timer = rand(1, 2);
            }
            patrol.pos = patrol.pos.add(
                patrolData.direction.scale(patrolData.speed * dt()),
            );
            patrol.pos.x = clamp(patrol.pos.x, 40, width() - 40);
            patrol.pos.y = clamp(patrol.pos.y, 36, height() - 36);
        }
    });

    loop(3, () => {
        for (const skull of get("skuller")) {
            const direction = player.pos.sub(skull.pos).unit();

            const web = add([
                sprite("spider_web"),
                pos(skull.pos),
                anchor("center"),
                scale(1),
                area({
                    isSensor: true,
                    scale: 0.5,
                    collisionIgnore: ["enemy", "patrol", "web", "tomb"],
                }),
                z(height() - 1),
                timer(),
                "web",
            ]);
            web.tween(
                vec2(0.5),
                web.scale,
                0.4,
                v => web.scale = v,
                easings.easeOutQuad,
            );
            let webTimer = 0;
            web.onUpdate(() => {
                webTimer += dt();

                if (webTimer >= 2) {
                    web.z = 0;
                    web.tween(
                        web.scale,
                        vec2(0.9),
                        0.2,
                        v => web.scale = v,
                        easings.easeOutCirc,
                    );
                    return cancel();
                }

                web.pos = web.pos.add(direction.scale(100 * dt()));
            });

            play("wooosh");
        }
    });

    player.onCollide("web", (web) => {
        debug.log("PLAYER HIT BY WEB!");
        destroy(web);
        PLAYER_SPEED = 50;
        wait(1.5, () => {
            PLAYER_SPEED = 150;
        });
        mana -= 10;
        mana_display.text = "Mana: " + mana;
        play("hit");
    });
    player.onCollide("patrol", (p) => {
        destroy(p);
        mana -= 10;
        mana_display.text = "Mana: " + mana;
        play("hit");
        shake(2);
    });
    player.onCollide("enemy", (e) => {
        destroy(e);
        mana -= 20;
        mana_display.text = "Mana: " + mana;
        play("hit");
        shake(2);
    });
    player.onCollide("spark", (spark) => {
        destroy(spark);
        mana += 10;
        mana_display.text = "Mana: " + mana, { letterSpacing: -6 };
        play("powerup", { volume: 0.5 });
    });
    onCollide("web", "bullet", (w) => {
        destroy(w);
        play("hit");
    });

    addLevel([
        "===========    ==========",
        "=x                      =",
        ...Array(8).fill(
            "=                       =",
        ),
        ...Array(4).fill(""),
        ...Array(10).fill(
            "=                       =",
        ),
        "===========    ==========",
    ], {
        tileWidth: 20,
        tileHeight: 20,
        pos: vec2(20, 0),
        tiles: {
            "=": () => [
                rect(20, 20),
                area({ collisionIgnore: ["wall"] }),
                body({ isStatic: true }),
                color(getBackground()),
                anchor("topright"),
                "wall",
            ],
            "x": () => [
                rect(width(), height()),
                pos(-40, -20),
                color("#7d481d"),
                z(-1),
            ],
        },
    });

    const addGate = (p, rect, tag) =>
        add([
            { closedPos: p.clone() },
            pos(p),
            rect,
            anchor("topleft"),
            color(getBackground()),
            area({ isSensor: true }),
            body({ isStatic: true }),
            tag,
        ]);
    const l_gate = addGate(vec2(0, 200), rect(20, 80), "L");
    const r_gate = addGate(vec2(480, 200), rect(20, 80), "R");
    const u_gate = addGate(vec2(220, 0), rect(80, 20), "U");
    const d_gate = addGate(vec2(220, 480), rect(80, 20), "D");

    function updateGates() {
        l_gate.pos = l_gate.closedPos;
        r_gate.pos = r_gate.closedPos;
        u_gate.pos = u_gate.closedPos;
        d_gate.pos = d_gate.closedPos;

        gatesState ??= randi(1, 6);

        switch (gatesState) {
            case 1:
                l_gate.pos.y = 0;
                break;
            case 2:
                r_gate.pos.y = 0;
                break;
            case 3:
                u_gate.pos.x = 0;
                break;
            case 4:
                d_gate.pos.x = 0;
                break;
            case 5:
                l_gate.pos.y = 0;
                r_gate.pos.y = 0;
                u_gate.pos.x = 0;
                d_gate.pos.x = 0;
                break;
        }

        if (!isStart) play("gates", { volume: 0.2 });
    }
    updateGates();

    if (!isStart) {
        spawnEnemies(randi(1, 5), randi(1, 4), randi(1, 3), randi(1, 7));
    }

    let roomCleared = false;
    const checkRoomGates = () => {
        const enemiesLeft = get("enemy").length;
        if (enemiesLeft > 0) {
            if (gatesState !== 6) {
                gatesState = 6;
                updateGates();
            }
        }
        else if (!roomCleared) {
            roomCleared = true;
            gatesState = randi(1, 6);
            updateGates();
        }
    };
    if (!isStart) onUpdate(checkRoomGates);

    function changeLevel() {
        roomsReached += 1;
        go("game", {
            startPos: player.pos,
            mana,
        });
    }

    onUpdate(() => {
        if (mana <= 0) {
            play("gates", { volume: 0.2 });
            go("retry");
        }
    });
});

scene("retry", () => {
    add([
        text("YOU DIED    Score: " + roomsReached, {
            size: 30,
            width: 300,
            font: "happy-o",
        }),
        pos(140, 100),
    ]);
    add([
        text("Press R to retry", {
            size: 16,
            width: 300,
            font: "happy-o",
        }),
        pos(140, 250),
    ]);

    onKeyRelease("r", () => {
        roomsReached = 0;
        play("gates", { volume: 0.2 });
        go("game");
    });
});

onLoad(() => go("game"));
