import { _k } from "../../shared";

/**
 * @group Plugins
 * @subgroup Systems
 */
export type System = {
    name: string;
    run: () => void;
    when: SystemPhase[];
};

/**
 * @group Plugins
 * @subgroup Systems
 */
export enum SystemPhase {
    BeforeUpdate,
    BeforeFixedUpdate,
    BeforeDraw,
    AfterUpdate,
    AfterFixedUpdate,
    AfterDraw,
}

export const system = (
    name: string,
    action: () => void,
    when: SystemPhase[],
) => {
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

    const system: System = {
        name,
        run: action,
        when,
    };

    for (const loc of when) {
        _k.game.systemsByEvent[loc].push(system);
    }

    systems.push({ name, run: action, when });
};
