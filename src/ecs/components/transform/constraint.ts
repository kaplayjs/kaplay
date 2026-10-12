import { drawCircle } from "../../../gfx/draw/drawCircle";
import { drawLine } from "../../../gfx/draw/drawLine";
import { drawPolygon } from "../../../gfx/draw/drawPolygon";
import {
    loadMatrix,
    multRotate,
    popTransform,
    pushMatrix,
    pushTransform,
} from "../../../gfx/stack";
import { clamp } from "../../../math/clamp";
import { Color } from "../../../math/color";
import { lerp } from "../../../math/lerp";
import { deg2rad, Mat23, rad2deg, vec2 } from "../../../math/math";
import {
    calcTransform,
    clampAngle,
    updateChildrenTransformRecursive,
    updateTransformRecursive,
} from "../../../math/various";
import { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { Comp, GameObj } from "../../../types";
import { system, SystemPhase } from "../../systems/systems";
import type { PosComp } from "./pos";
import type { RotateComp } from "./rotate";
import type { ScaleComp } from "./scale";

export type BoneOpt = {
    /* Minimum angle should be between -180 and 180, and smaller than maximum angle */
    minAngle?: number;
    /* Maximum angle should be between -180 and 180, and greater than minimum angle */
    maxAngle?: number;
};

export interface BoneComp extends Comp {
    /* Minimum angle should be between -180 and 180, and smaller than maximum angle */
    minAngle: number;
    /* Maximum angle should be between -180 and 180, and greater than minimum angle */
    maxAngle: number;
    setAngles(minAngle: number, maxAngle: number): void;
}

export interface Constraint extends Comp {
    constraint: {
        target: GameObj;
    };
    apply: () => void;
}

export type DistanceMode = "maximum" | "minimum" | "equal";

export type DistanceConstraintOpt = {
    /**
     * The desired distance between this and target
     */
    distance: number;
    /**
     * If maximum, the distance is maximum distance
     * If equal, the distance is the desired distance
     * If minimum, the distance is minimum distance
     */
    mode: DistanceMode;
    /**
     * Between 0 and 1. The percentage of the property being overwritten
     */
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
    /**
     * The offset added after applying the constraint
     */
    offset?: Vec2;
    /**
     * Between 0 and 1. The percentage of the property being overwritten
     */
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
    /**
     * The offset added after applying the constraint
     */
    offset?: number;
    /**
     * The factor applied before applying the constraint. For example 0.5 will only apply half of the rotation of the target
     */
    ratio?: number;
    /**
     * Between 0 and 1. The percentage of the property being overwritten
     */
    strength?: number;
    /**
     * Whether the constraint will track when the source object's rotation passes the 0-360 boundary and update an internal counter to prevent a sharp jump in the target's angle. Default false.
     */
    trackMultiturn?: boolean;
};

export interface RotationConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        offset: number;
        ratio: number;
        strength: number;
        trackMultiturn: boolean;
    };
}

export type ScaleConstraintOpt = {
    /**
     * Between 0 and 1. The percentage of the property being overwritten
     */
    strength?: number;
};

export interface ScaleConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        strength: number;
    };
}

export type TransformConstraintOpt = {
    /**
     * Between 0 and 1. The percentage of the property being overwritten
     */
    strength?: number;
};

export interface TransformConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        strength: number;
    };
}

/**
 * "FABRIK": Use Forward And Backward Reaching Inverse Kinematics
 * "CCD" : Use Cyclic Coordinate Descent
 */
type InverseKinematicsAlgorithm = "FABRIK" | "CCD";

export type IKConstraintOpt = {
    /**
     * The algorithm to use. Default is FABRIK.
     */
    algorithm?: InverseKinematicsAlgorithm;
    /**
     * Amount of bones. Default is 1.
     */
    depth: number;
    /**
     * Amount of ik iterations. Default is 10.
     */
    iterations?: number;
    /**
     * Between 0 and 1. The percentage of the property being overwritten. Default is 1.
     */
    strength?: number;
};

export interface IKConstraintComp extends Constraint {
    constraint: {
        target: GameObj;
        iterations: number;
        strength: number;
    };
}

let systemInstalled = false;

function installSystem() {
    if (systemInstalled) return;
    systemInstalled = true;
    // TODO: use a live query for this
    const constraints: Set<GameObj<Constraint>> = new Set();
    _k.appScope.onAdd(obj => {
        if (obj.has("constraint")) {
            constraints.add(obj as GameObj<Constraint>);
        }
    });
    _k.appScope.onDestroy(obj => {
        constraints.delete(obj as GameObj<Constraint>);
    });
    _k.appScope.onUse((obj, id) => {
        if ("constraint" === id) {
            constraints.add(obj as GameObj<Constraint>);
        }
    });
    _k.appScope.onUnuse((obj, id) => {
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
    /**
     * A distance constraint
     * @param target - The object to keep within distance off
     * @param opt - Options
     *
     * @returns DistanceConstraintComp
     */
    distance(
        target: GameObj,
        opt: DistanceConstraintOpt,
    ): DistanceConstraintComp {
        installSystem();
        return {
            id: "constraint",
            constraint: {
                target: target,
                distance: opt.distance,
                mode: opt.mode || "equal",
                strength: opt.strength ?? 1,
            },
            apply(this: GameObj<PosComp | DistanceConstraintComp>) {
                const d = vec2(
                    // We use world distance
                    this.transform.e - this.constraint.target.transform.e,
                    this.transform.f - this.constraint.target.transform.f,
                );
                const dd = this.constraint.distance * this.constraint.distance;
                if (
                    (this.constraint.mode === "maximum" && d.slen() > dd)
                    || (this.constraint.mode === "minimum" && d.slen() < dd)
                    || (this.constraint.mode === "equal" && d.slen() != dd)
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
                        const p = this.pos;
                        p.x = transform.e;
                        p.y = transform.f;
                        this.pos = p;
                    }
                    else {
                        const p = this.pos;
                        p.x = this.transform.e;
                        p.y = this.transform.f;
                        this.pos = p;
                    }
                }
            },
        };
    },
    /**
     * A translation constraint
     * @param target - The object to copy the translation from
     * @param opt - Options
     *
     * @returns TranslationConstraintComp
     */
    translation(
        target: GameObj,
        opt: TranslationConstraintOpt,
    ): TranslationConstraintComp {
        installSystem();
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength ?? 1,
                offset: opt.offset || new Vec2(),
            },
            apply(this: GameObj<PosComp | TranslationConstraintComp>) {
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
                    const p = this.pos;
                    p.x = transform.e;
                    p.y = transform.f;
                    this.pos = p;
                }
                else {
                    const p = this.pos;
                    p.x = this.transform.e;
                    p.y = this.transform.f;
                    this.pos = p;
                }
            },
        };
    },
    /**
     * A rotation constraint
     * @param target - The object to copy the rotation from
     * @param opt - Options
     *
     * @returns RotationConstraintComp
     */
    rotation(
        target: GameObj,
        opt: RotationConstraintOpt,
    ): RotationConstraintComp {
        installSystem();
        let fullTurnsCount = 0, prevDstAngle = 0, tmpMat = new Mat23();
        return {
            id: "constraint",
            constraint: {
                target: target,
                ratio: opt.ratio ?? 1,
                strength: opt.strength ?? 1,
                offset: opt.offset || 0,
                trackMultiturn: opt.trackMultiturn ?? false,
            },
            apply(this: GameObj<RotateComp | RotationConstraintComp>) {
                // We use world rotation
                const srcAngle = this.transform.getRotation();
                const dstAngle = this.constraint.target.transform.getRotation();
                if (
                    this.constraint.trackMultiturn
                    && Math.abs(dstAngle - prevDstAngle) > 180
                ) {
                    if (dstAngle < prevDstAngle) fullTurnsCount++;
                    else fullTurnsCount--;
                }
                prevDstAngle = dstAngle;
                const newAngle = lerp(
                    srcAngle,
                    (dstAngle + fullTurnsCount * 360) * this.constraint.ratio
                        + this.constraint.offset,
                    this.constraint.strength,
                );
                const scale = this.transform.getScale();
                // Update world angle
                tmpMat.setTRS(
                    this.transform.e,
                    this.transform.f,
                    newAngle,
                    scale.x,
                    scale.y,
                );
                // Modify local angle
                if (this.parent) {
                    const transform = this.parent?.transform.inverse.mul(
                        tmpMat,
                    );
                    this.angle = transform.getRotation();
                }
                else {
                    this.angle = newAngle;
                }
                updateTransformRecursive(this);
            },
        };
    },
    /**
     * A scale constraint
     * @param target - The object to copy the scale from
     * @param opt - Options
     *
     * @returns ScaleConstraintComp
     */
    scale(
        target: GameObj,
        opt: ScaleConstraintOpt,
    ): ScaleConstraintComp {
        installSystem();
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength ?? 1,
            },
            apply(this: GameObj<ScaleConstraintComp | ScaleComp>) {
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
    /**
     * A transform constraint
     * @param target - The object to copy the transform from
     * @param opt - Options
     *
     * @returns TransformConstraintComp
     */
    transform(
        target: GameObj,
        opt: TransformConstraintOpt,
    ): TransformConstraintComp {
        installSystem();
        return {
            id: "constraint",
            constraint: {
                target: target,
                strength: opt.strength ?? 1,
            },
            apply(
                this: GameObj<
                    PosComp | RotateComp | ScaleComp | TransformConstraintComp
                >,
            ) {
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
                    this.pos = vec2(transform.e, transform.f);
                    this.angle = transform.getRotation();
                    this.scale = transform.getScale();
                }
                else {
                    this.pos = vec2(newX, newY);
                    this.angle = newAngle;
                    this.scale = newScale;
                }
            },
        };
    },
    bone(
        minAngle?: number,
        maxAngle?: number,
        minLength?: number,
        maxLength?: number,
    ) {
        let _minAngle = Math.max(
            -180,
            Math.min(minAngle ?? -180, maxAngle ?? 180),
        );
        let _maxAngle = Math.min(
            180,
            Math.max(minAngle ?? -180, maxAngle ?? 180),
        );
        let _minLength = minLength;
        let _maxLength = maxLength;
        return {
            id: "bone",
            get minAngle() {
                return _minAngle;
            },
            get maxAngle() {
                return _maxAngle;
            },
            setAngles(minAngle?: number, maxAngle?: number) {
                _minAngle = Math.max(
                    -180,
                    Math.min(minAngle ?? -180, maxAngle ?? 180),
                );
                _maxAngle = Math.min(
                    180,
                    Math.max(minAngle ?? -180, maxAngle ?? 180),
                );
            },
            get minLength() {
                return _minLength;
            },
            get maxLength() {
                return _maxLength;
            },
            drawInspect(this: GameObj<IKConstraintComp | RotateComp>) {
                pushTransform();
                multRotate(-this.angle + _minAngle);
                drawCircle({
                    radius: 20,
                    start: _maxAngle - _minAngle,
                    color: Color.RED,
                });
                popTransform();
            },
        };
    },
    ik(target: GameObj, opt: IKConstraintOpt): IKConstraintComp {
        installSystem();
        const algorithm = opt.algorithm || "FABRIK";
        const depth = opt.depth ?? 1;
        const iterations = opt.iterations ?? 10;
        const chain: GameObj[] = [];
        const length: number[] = [];
        if (algorithm === "CCD") {
            return {
                id: "constraint",
                constraint: {
                    target: target,
                    iterations: iterations,
                    strength: opt.strength || 1,
                },
                apply(this: GameObj<PosComp | IKConstraintComp>) {
                    // Get IK chain from end effector to root
                    const endEffector = chain[0] = this;
                    for (let i = 1; i <= depth; i++) {
                        chain[i] = chain[i - 1].parent!;
                    }
                    let dx, dy;
                    for (let it = 0; it < iterations; it++) {
                        // Rotate every effector in the chain to point towards the target
                        for (let i = depth; i > 0; i--) {
                            const effector = chain[i];
                            const effectorTransform = effector.transform;
                            if (i !== depth) {
                                // We updated the transform of the parent, so update this transform
                                calcTransform(effector, effectorTransform);
                            }

                            // Angle of effector to target
                            dx = target.transform.e
                                - effectorTransform.e;
                            dy = target.transform.f
                                - effectorTransform.f;
                            const angleToTarget = rad2deg(Math.atan2(dy, dx));

                            // Angle of effector to end effector
                            dx = endEffector.transform.e
                                - effectorTransform.e;
                            dy = endEffector.transform.f
                                - effectorTransform.f;
                            const angleToEndEffector = rad2deg(
                                Math.atan2(dy, dx),
                            );

                            // Rotation to move end effector towards target
                            const angleCorrection = angleToTarget
                                - angleToEndEffector;

                            // Update global transform
                            const rotation = effectorTransform.getRotation();
                            const scale = effectorTransform.getScale();
                            effectorTransform.setTRS(
                                effectorTransform.e,
                                effectorTransform.f,
                                rotation + angleCorrection,
                                scale.x,
                                scale.y,
                            );
                            if (effector.parent) {
                                // Calculate local rotation
                                const transform = effector.parent.transform
                                    .inverse.mul(
                                        effectorTransform,
                                    );
                                let newAngle = clampAngle(
                                    transform.getRotation(),
                                );
                                // If constraint on angle, apply
                                if (
                                    effector.minAngle != undefined
                                    && effector.maxAngle != undefined
                                ) {
                                    newAngle = Math.min(
                                        Math.max(newAngle, effector.minAngle),
                                        effector.maxAngle,
                                    );
                                }
                                effector.angle = newAngle;
                            }
                            else {
                                // Local rotation is global rotation
                                let newAngle = clampAngle(
                                    rotation + angleCorrection,
                                );
                                // If constraint on angle, apply
                                if (
                                    effector.minAngle != undefined
                                    && effector.maxAngle != undefined
                                ) {
                                    newAngle = Math.min(
                                        Math.max(newAngle, effector.minAngle),
                                        effector.maxAngle,
                                    );
                                }
                                effector.angle = newAngle;
                            }

                            if (
                                effector.parent
                                && effector.parent.minLength != undefined
                                && effector.parent.maxLength != undefined
                            ) {
                                // Vector from parent to target
                                const ax = target.transform.e
                                    - effector.parent.transform.e;
                                const ay = target.transform.f
                                    - effector.parent.transform.f;
                                // Vector from parent to bone
                                const bx = effectorTransform.e
                                    - effector.parent.transform.e;
                                const by = effectorTransform.f
                                    - effector.parent.transform.f;
                                // Projection of target onto bone
                                const s = (ax * bx + ay * by)
                                    / (bx * bx + by * by);
                                const px = s * bx;
                                const py = s * by;
                                // Desired length
                                let len = Math.sqrt(px * px + py * py);
                                // New length = desired length clamped
                                const nlen = clamp(
                                    len,
                                    effector.parent.minLength,
                                    effector.parent.maxLength,
                                );
                                // Old length
                                const olen = Math.sqrt(
                                    effector.pos.x * effector.pos.x
                                        + effector.pos.y * effector.pos.y,
                                );
                                // Scale to desired length clamped
                                effector.pos.x *= nlen / olen;
                                effector.pos.y *= nlen / olen;
                            }

                            if (
                                (effector.minAngle != undefined
                                    && effector.maxAngle != undefined)
                                || (effector.minLength != undefined
                                    && effector.maxLength != undefined)
                            ) {
                                // We changed the local angle, so the current effector's transform needs to be updated
                                updateTransformRecursive(effector);
                            }
                            else {
                                updateChildrenTransformRecursive(effector);
                            }
                        }
                    }
                },
                drawInspect(this: GameObj<IKConstraintComp>) {
                    const endEffector = chain[0] = this;
                    for (let i = 1; i <= depth; i++) {
                        chain[i] = chain[i - 1].parent!;
                    }
                    let p1 = chain[depth].pos;
                    pushTransform();
                    for (let i = depth; i > 0; i--) {
                        const bone = chain[i];
                        const childBone = chain[i - 1];
                        const len = childBone.pos.len();
                        loadMatrix(bone.transform);
                        drawPolygon({
                            pts: [
                                vec2(0, 0),
                                vec2(len / 10, -len / 10),
                                childBone.pos,
                                vec2(len / 10, len / 10),
                            ],
                        });
                    }
                    popTransform();
                },
            };
        }
        else {
            return {
                id: "constraint",
                constraint: {
                    target: target,
                    iterations: iterations,
                    strength: opt.strength || 1,
                },
                apply(this: GameObj<PosComp | IKConstraintComp>) {
                    // Get IK chain from end effector to root
                    const endEffector = chain[0] = this;
                    // The end effector does not have a length
                    length[0] = 0;
                    let dx, dy;
                    for (let i = 1; i <= depth; i++) {
                        chain[i] = chain[i - 1].parent!;
                        dx = chain[i].transform.e
                            - chain[i - 1].transform.e;
                        dy = chain[i].transform.f
                            - chain[i - 1].transform.f;
                        // Calculate the length of the other effectors
                        length[i] = Math.sqrt(dx * dx + dy * dy);
                    }
                    const root = chain[depth];
                    const rootPosX = root.transform.e;
                    const rootPosY = root.transform.f;
                    // Perform FABRIK
                    for (let it = 0; it < iterations; it++) {
                        let l;
                        // Forward step, pull end effector towards target
                        endEffector.transform.e = target.transform.e;
                        endEffector.transform.f = target.transform.f;
                        // Pull effectors in sequence to restore length
                        for (let i = 1; i <= depth; i++) {
                            // Vector towards previous effector
                            dx = chain[i].transform.e
                                - chain[i - 1].transform.e;
                            dy = chain[i].transform.f
                                - chain[i - 1].transform.f;
                            l = Math.sqrt(dx * dx + dy * dy);
                            chain[i].transform.e = chain[i - 1].transform.e
                                + dx * length[i] / l;
                            chain[i].transform.f = chain[i - 1].transform.f
                                + dy * length[i] / l;
                        }
                        // Backward step, pull root back to its original position
                        root.transform.e = rootPosX;
                        root.transform.f = rootPosY;
                        // Pull effectors in reverse sequence to restore length
                        for (let i = depth - 1; i >= 0; i--) {
                            // Vector towards previous effector
                            dx = chain[i].transform.e
                                - chain[i + 1].transform.e;
                            dy = chain[i].transform.f
                                - chain[i + 1].transform.f;
                            l = Math.sqrt(dx * dx + dy * dy);
                            chain[i].transform.e = chain[i + 1].transform.e
                                + dx * length[i + 1] / l;
                            chain[i].transform.f = chain[i + 1].transform.f
                                + dy * length[i + 1] / l;
                        }
                    }
                    // Modify local position or angle depending on the presence of a rotate
                    for (let i = depth; i >= 0; i--) {
                        const obj = chain[i];
                        // If i < depth, obviously the object has a rent
                        if (i < depth || obj.parent) {
                            const parent = obj.parent!;
                            if (parent.has("rotate")) {
                                // If the parent has an angle, use the parent's angle and local length
                                const parentTransform = parent.transform;
                                // Calculate the difference in angle
                                const angle = rad2deg(
                                    Math.atan2(
                                        obj.transform.f - parentTransform.f,
                                        obj.transform.e - parentTransform.e,
                                    ),
                                );
                                // Keep the translation and scale
                                const scale = parentTransform.getScale();
                                parentTransform.setTRS(
                                    parentTransform.e,
                                    parentTransform.f,
                                    angle, // orient the parent towards the object
                                    scale.x,
                                    scale.y,
                                );
                                if (parent.parent) {
                                    const transform = parent.parent.transform
                                        .inverse.mul(
                                            parent.transform,
                                        );
                                    parent.angle = transform.getRotation();
                                }
                                else {
                                    parent.angle = angle;
                                }

                                // Update the local properties
                                const transform = parentTransform.inverse.mul(
                                    obj.transform,
                                );
                                obj.pos = vec2(transform.e, transform.f);
                            }
                            else {
                                // If there is no angle, just use position
                                const transform = obj.parent!.transform.inverse
                                    .mul(
                                        obj.transform,
                                    );
                                obj.pos = vec2(transform.e, transform.f);
                            }
                        }
                        else {
                            obj.pos = vec2(obj.transform.e, obj.transform.f);
                        }
                    }
                },
                drawInspect(this: GameObj<IKConstraintComp>) {
                    const endEffector = chain[0] = this;
                    for (let i = 1; i <= depth; i++) {
                        chain[i] = chain[i - 1].parent!;
                    }
                    let p1 = chain[depth].pos;
                    pushTransform();
                    for (let i = depth; i > 0; i--) {
                        const bone = chain[i];
                        const childBone = chain[i - 1];
                        loadMatrix(bone.transform);
                        drawPolygon({
                            pts: [
                                vec2(0, 0),
                                vec2(10, -10),
                                childBone.pos,
                                vec2(10, 10),
                            ],
                        });
                    }
                    popTransform();
                },
            };
        }
    },
};
