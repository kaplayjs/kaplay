import { _k } from "../../shared";
import type { GameObj } from "../../types";

/**
 * @group Plugins
 */
export type System = {
    name: string;
    run: () => void;
    when: SystemPhase[]
};

export enum SystemPhase {
    BeforeUpdate,
    BeforeFixedUpdate,
    BeforeDraw,
    AfterUpdate,
    AfterFixedUpdate,
    AfterDraw,
}

export function system<T>(
    name: string,
    action: ((iter: Iterable<GameObj<T>>) => void) | (() => void),
    when: SystemPhase[],
    tagOrIter?: string | Iterable<GameObj<T>>
) {
    const systems = _k.game.systems;
    const replacingSystemIdx = systems.findIndex((s) => s.name === name);

    // if existent system, remove it
    if (replacingSystemIdx != -1) {
        const replacingSystem = systems[replacingSystemIdx];
        const when = replacingSystem.when;

        for (const loc of when) {
            const idx = _k.game.systemsByEvent[loc].findIndex(
                (s) => s.name === name,
            );
            _k.game.systemsByEvent[loc].splice(idx, 1);
        }
    }

    const iter = tagOrIter ? (typeof tagOrIter == "string" ? _k.k.get(tagOrIter) as GameObj<T>[] : tagOrIter) : undefined;
    const run = iter ? () => { action(iter); } : () => { (action as () => void)(); }

    const system: System = {
        name,
        run,
        when
    };

    for (const loc of when) {
        _k.game.systemsByEvent[loc].push(system);
    }

    systems.push({ name, run, when });
};
