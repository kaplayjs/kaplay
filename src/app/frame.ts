import { app, debug } from "../kaplay";

export function dt() {
    return app.dt() * debug.timeScale;
}

export function fixedDt() {
    return app.fixedDt() * debug.timeScale;
}

export function restDt() {
    return app.restDt() * debug.timeScale;
}
