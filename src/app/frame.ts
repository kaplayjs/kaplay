import { app, debug } from "../kaboom";

export function dt() {
    return app.dt() * debug.timeScale;
}
