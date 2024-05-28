// You can still use kaboom() instead of kaplay()!
kaboom();

addKaboom(center());

onKeyPress(() => addKaboom(mousePos()));
onMouseMove(() => addKaboom(mousePos()));
