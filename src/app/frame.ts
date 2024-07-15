import { app, debug } from "../kaplay";

export function dt() {
    return app.dt() * debug.timeScale;
}
