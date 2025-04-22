/**
 * @file Kaboom!
 * @description How to KABOOM!
 * @difficulty 0
 * @tags basics, effects
 * @minver 3001.0
 * @category basics
 */

// KAPLAY born as the direct successor of Kaboom.js!

// TIP: You can use kaboom() instead of kaplay()!
kaboom();

// The addKaboom() effect is a fun way to add explosions to your game.
addKaboom(center());

onKeyPress(() => addKaboom(mousePos()));
onMouseMove(() => addKaboom(mousePos()));
