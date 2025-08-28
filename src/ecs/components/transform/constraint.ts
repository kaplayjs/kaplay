import { onAdd, onDestroy, onUnuse, onUse } from "../../../events/globalEvents";
import { lerp } from "../../../math/lerp";
import { vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import { system, SystemPhase } from "../../systems/systems";

export interface Constraint extends Comp {
    constraint: {
        target: GameObj;
    };
    apply: () => void;
}

export type DistanceMode = "closer" | "further" | "exact";

export type DistanceConstraintOpt = {
    distance: number;
    mode: DistanceMode;
    strength?: number;
};

export interface DistanceConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        distance: number;
        mode: DistanceMode;
        strength: number;
    };
}

export type TranslationConstraintOpt = {
    offset?: Vec2;
    strength?: number;
};

export interface TranslationConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        offset: Vec2;
        strength: number;
    };
}

export type RotationConstraintOpt = {
    offset?: number;
    scale?: number;
    strength?: number;
};

export interface RotationConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        offset: number;
        scale: number;
        strength: number;
    };
}

export type ScaleConstraintOpt = {
    strength?: number;
};

export interface ScaleConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        strength: number;
    };
}

export type TransformConstraintOpt = {
    strength?: number;
};

export interface TransformConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        strength: number;
    };
}

let systemInstalled = false;

function installSystem() {
    if (systemInstalled) return;
    systemInstalled = true;
    // TODO: use a live query for this
    const constraints: Set<GameObj<Constraint>> = new Set();
    onAdd(obj => {
        if (obj.has("constraint")) {
            constraints.add(obj as GameObj<Constraint>);
        }
    });
    onDestroy(obj => {
        constraints.delete(obj as GameObj<Constraint>);
    });
    onUse((obj, id) => {
        if ("constraint" === id) {
            constraints.add(obj as GameObj<Constraint>);
        }
    });
    onUnuse((obj, id) => {
        if ("constraint" === id) {
            constraints.delete(obj as GameObj<Constraint>);
        }
    });
    system("constraint", () => {
        constraints.forEach(constraint => {
            constraint.apply();
        });
    }, [
        SystemPhase.BeforeDraw, // Because we need the transform to be up to date
    ]);
}

export const constraint = {
    distance(target: GameObj, opt: DistanceConstraintOpt) {
        installSystem();
        return {
            id: "constraint",
            constraint: {
                target: target,
                distance: opt.distance,
                mode: opt.mode,
                strength: opt.strength || 1,
            },
            apply(this: GameObj<any>) {
                const d = vec2(
                    // We use world distance
                    this.transform.e - this.constraint.target.transform.e,
                    this.transform.f - this.constraint.target.transform.f,
                );
                const dd = this.constraint.distance * this.constraint.distance;
                if (
                    (this.constraint.mode === "closer" && d.slen() > dd)
                    || (this.constraint.mode === "further" && d.slen() < dd)
                    || (this.constraint.mode === "exact" && d.slen() != dd)
                ) {
                    const l = d.len();
                    // Modify world position
                    this.transform.e = lerp(
                        this.transform.e,
                        this.constraint.target.transform.e
                            + d.x / l * this.constraint.distance,
                        this.constraint.strength,
                    );
                    this.transform.f = lerp(
                        this.transform.f,
                        this.constraint.target.transform.f
                            + d.y / l * this.constraint.distance,
                        this.constraint.strength,
                    );
                    // Modify local position
                    if (this.parent) {
                        const transform = this.parent?.transform.inverse.mul(
                            this.transform,
                        );
                        this.pos.x = transform.e;
                        this.pos.y = transform.f;
                    }
                    else {
                        this.pos.x = this.transform.e;
                        this.pos.y = this.transform.f;
                    }
                }
            },
        };
    },
    translation(
        target: GameObj,
        opt: TranslationConstraintOpt,
    ): TranslationConstraintComp {
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength || 1,
                offset: opt.offset || new Vec2(),
            },
            apply(this: GameObj<any>) {
                // We use world translation
                this.transform.e = lerp(
                    this.transform.e,
                    this.constraint.target.transform.e
                        + this.constraint.offset.x,
                    this.constraint.strength,
                );
                this.transform.f = lerp(
                    this.transform.f,
                    this.constraint.target.transform.f
                        + this.constraint.offset.x,
                    this.constraint.strength,
                );
                // Modify local position
                if (this.parent) {
                    const transform = this.parent?.transform.inverse.mul(
                        this.transform,
                    );
                    this.pos.x = transform.e;
                    this.pos.y = transform.f;
                }
                else {
                    this.pos.x = this.transform.e;
                    this.pos.y = this.transform.f;
                }
            },
        };
    },
    rotation(
        target: GameObj,
        opt: RotationConstraintOpt,
    ): RotationConstraintComp {
        return {
            id: "constraint",
            constraint: {
                target: target,
                scale: opt.scale || 1,
                strength: opt.strength || 1,
                offset: opt.offset || 0,
            },
            apply(this: GameObj<any>) {
                // We use world rotation
                const srcAngle = this.transform.getRotation();
                const dstAngle = this.constraint.target.transform.getRotation();
                const newAngle = lerp(
                    srcAngle,
                    dstAngle * this.constraint.scale + this.constraint.offset,
                    this.constraint.strength,
                );
                const scale = this.transform.getScale();
                // Update world angle
                this.transform.setTRS(
                    this.transform.e,
                    this.transform.f,
                    newAngle,
                    scale.x,
                    scale.y,
                );
                // Modify local angle
                if (this.parent) {
                    const transform = this.parent?.transform.inverse.mul(
                        this.transform,
                    );
                    this.angle = transform.getRotation();
                }
                else {
                    this.angle = newAngle;
                }
            },
        };
    },
    scale(
        target: GameObj,
        opt: ScaleConstraintOpt,
    ): ScaleConstraintComp {
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength || 1,
            },
            apply(this: GameObj<any>) {
                // We use world scale
                const srcScale = this.transform.getScale();
                const dstScale = this.constraint.target.transform.getScale();
                const newScale = lerp(
                    srcScale,
                    dstScale,
                    this.constraint.strength,
                );
                const angle = this.transform.getRotation();
                // Update world scale
                this.transform.setTRS(
                    this.transform.e,
                    this.transform.f,
                    angle,
                    newScale.x,
                    newScale.y,
                );
                // Modify local scale
                if (this.parent) {
                    const transform = this.parent?.transform.inverse.mul(
                        this.transform,
                    );
                    this.scale = transform.getScale();
                }
                else {
                    this.scale = newScale;
                }
            },
        };
    },
    transform(
        target: GameObj,
        opt: TransformConstraintOpt,
    ): TransformConstraintComp {
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength || 1,
            },
            apply(this: GameObj<any>) {
                // We use world properties
                const newX = lerp(
                    this.transform.e,
                    this.constraint.target.transform.e,
                    this.constraint.strength,
                );
                const newY = lerp(
                    this.transform.f,
                    this.constraint.target.transform.f,
                    this.constraint.strength,
                );
                const srcAngle = this.transform.getRotation();
                const dstAngle = this.constraint.target.transform.getRotation();
                const newAngle = lerp(
                    srcAngle,
                    dstAngle,
                    this.constraint.strength,
                );
                const srcScale = this.transform.getScale();
                const dstScale = this.constraint.target.transform.getScale();
                const newScale = lerp(
                    srcScale,
                    dstScale,
                    this.constraint.strength,
                );
                // Update world properties
                this.transform.setTRS(
                    newX,
                    newY,
                    newAngle,
                    newScale.x,
                    newScale.y,
                );
                // Modify local properties
                if (this.parent) {
                    const transform = this.parent?.transform.inverse.mul(
                        this.transform,
                    );
                    this.pos.x = transform.e;
                    this.pos.y = transform.f;
                    this.angle = transform.getRotation();
                    this.scale = transform.getScale();
                }
                else {
                    this.pos.x = newX;
                    this.pos.y = newY;
                    this.angle = newAngle;
                    this.scale = newScale;
                }
            },
        };
    },
};
