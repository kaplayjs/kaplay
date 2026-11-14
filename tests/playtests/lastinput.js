kaplay();

const t = add([
    text(getLastInputDeviceType()),
    pos(center()),
    anchor("center"),
]);

onUpdate(() => {
    t.text = getLastInputDeviceType();
    debug.log(getLastInputDeviceType());
});
