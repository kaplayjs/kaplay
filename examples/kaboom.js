/**
 * @file Kaboom!
 * @description How to KABOOM in kaplay
 * @difficulty 0
 * @tags basics, effects
 * @minver 3001.0
 */

// You can still use kaboom() to initialize the game instead of kaplay()!
kaboom();

addKaboom(center());

onKeyPress(() => addKaboom(mousePos()));
onMouseMove(() => addKaboom(mousePos()));
