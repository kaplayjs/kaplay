/**
 * @file Health
 * @description How to use health to manage the health points of entities
 * @difficulty 0
 * @tags basics
 * @minver 4000.0
 * @category concepts
 */

kaplay({
    font: "happy",
    background: "4a3052",
});

// Let's load some assets
loadBean();
loadHappy();
loadSprite("gun", "sprites/gun.png");
loadSprite("zombean", "sprites/zombean.png");
loadSound("hit", "sounds/hit.mp3");

const controlText = add([
    text("Press SPACE to shoot!", { font: "happy", size: 25 }),
    pos(25),
    anchor("left"),
    color(WHITE),
]);

const bean = add([
    sprite("bean"),
    pos(250, 315),
    scale(2),
    // This will make it so bean has an initial HP of 100, since maxHP is not specified
    // It will be the same as the initial HP
    health(100),
    area(),
    anchor("center"),
    color(),
    "bean",
]);

const gun = bean.add([
    sprite("gun"),
    pos(15, -10),
]);

// We'll make a basic text that displays bean's HP
const hpText = bean.add([
    text(`${bean.hp}/${bean.maxHP}`, { size: 15 }),
    pos(-40, -50),
]);

// And we'll update it every frame
bean.onUpdate(() => {
    hpText.text = `${bean.hp}/${bean.maxHP}`;
});

bean.onKeyPress("space", () => {
    // Adds bullets when pressing space to hurt the evil zombeans
    const bullet = add([
        rect(20, 20, { radius: 5 }),
        color(YELLOW),
        outline(5, BLACK),
        move(1, 600),
        pos(bean.pos.add(100, -5)),
        area(),
        offscreen({ destroy: true }), // Destroy them on offscreen to avoid lag
        "bullet",
    ]);

    bullet.onCollide(() => {
        wait(0, () => bullet.destroy());
    });
});

// When bean collides with a zombie, the zombie will bump off bean and bean will take damage
bean.onCollide("zombie", (zombie) => {
    zombie.pos.x += 50;
    bean.hp -= 10;
});

// When bean loses HP, onHurt() will run, this will play a "hit" sound and make bean RED for a bit
bean.onHurt(() => {
    play("hit");
    tween(RED, WHITE, 0.15, (p) => bean.color = p);
});

// When bean's dead he will be turned into a zombie D:
// You can check if an object is dead by checking "obj.dead"
bean.onDeath(() => {
    bean.destroy();
    const newZombie = add([
        sprite("zombean"),
        pos(bean.pos),
        anchor("center"),
        scale(0),
        offscreen({ destroy: true }),
    ]);

    tween(vec2(0), vec2(2), 0.15, (p) => newZombie.scale = p);

    newZombie.onUpdate(() => {
        newZombie.move(-80, 0);
    });
});

// We'll create the evil zombean here
const zombean = add([
    sprite("zombean"),
    pos(900, 315),
    scale(2),
    health(100, 100),
    anchor("center"),
    area(),
    color(),
    rotate(),
    offscreen({ destroy: true }),
    "zombie",
]);

// We'll make a basic text that displays zombeans's HP
const zombeanHPText = zombean.add([
    text(`${zombean.hp}/${zombean.maxHP}`, { size: 15 }),
    pos(-35, -50),
]);

// We'll update the text and move zombean -80 X pixels every frame
zombean.onUpdate(() => {
    zombeanHPText.text = `${zombean.hp}/${zombean.maxHP}`;
    zombean.move(-80, 0);
});

// When zombean collides with a bullet, zombean will lose 10 HP
zombean.onCollide("bullet", () => {
    zombean.hp -= 10;
    zombean.pos.x += 40;
});

// When zombean loses HP, onHurt() gets triggered
zombean.onHurt(() => {
    play("hit");
    tween(RED, WHITE, 0.15, (p) => zombean.color = p);
    tween(rand(-10, 10), 0, 0.15, (p) => zombean.angle = p);
});

// When zombean dies, he will be tweened to death
zombean.onDeath(() => {
    zombeanHPText.destroy();
    zombean.area.scale = vec2(0); // Disables its collisions
    tween(0, 90, 1, (p) => zombean.angle = p, easings.easeOutCirc);
    tween(
        zombean.pos.y,
        height() + 50,
        1,
        (p) => zombean.pos.y = p,
        easings.easeOutCirc,
    ).onEnd(() => {
        zombean.destroy();
    });
});
