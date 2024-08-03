import { getGravity, getGravityDirection } from "../../game";
import { width } from "../../gfx";
import { debug } from "../../kaplay";
import { Polygon, Vec2, vec2 } from "../../math";
import type { Comp, GameObj } from "../../types";
import type { PosComp } from "../transform";
import type { AreaComp } from "./area";
import type { BodyComp } from "./body";

export type SurfaceEffectorCompOpt = {
    speed: number;
    speedVariation?: number;
    forceScale?: number;
};

export interface SurfaceEffectorComp extends Comp {
    speed: number;
    speedVariation: number;
    forceScale: number;
}

export function surfaceEffector(
    opts: SurfaceEffectorCompOpt,
): SurfaceEffectorComp {
    return {
        id: "surfaceEffector",
        require: ["area"],
        speed: opts.speed,
        speedVariation: opts.speedVariation ?? 0,
        forceScale: opts.speedVariation ?? 0.9,
        add(this: GameObj<AreaComp | SurfaceEffectorComp>) {
            this.onCollideUpdate((obj, col) => {
                const dir = col?.normal.normal();
                const currentVel = obj.vel.project(dir);
                const wantedVel = dir?.scale(this.speed);
                const force = wantedVel?.sub(currentVel);
                obj.addForce(force?.scale(obj.mass * this.forceScale));
            });
        },
    };
}

export type AreaEffectorCompOpt = {
    useGlobalAngle?: boolean;
    forceAngle: number;
    forceMagnitude: number;
    forceVariation?: number;
    linearDrag?: number;
    // angularDrag?: number;
};

export interface AreaEffectorComp extends Comp {
    useGlobalAngle: boolean;
    forceAngle: number;
    forceMagnitude: number;
    forceVariation: number;
    linearDrag?: number;
    // angularDrag?: number;
}

export function areaEffector(opts: AreaEffectorCompOpt): AreaEffectorComp {
    return {
        id: "areaEffector",
        require: ["area"],
        useGlobalAngle: opts.useGlobalAngle || false,
        forceAngle: opts.forceAngle,
        forceMagnitude: opts.forceMagnitude,
        forceVariation: opts.forceVariation ?? 0,
        linearDrag: opts.linearDrag ?? 0,
        // angularDrag: opts.angularDrag ?? 0,
        add(this: GameObj<AreaComp | AreaEffectorComp>) {
            this.onCollideUpdate((obj, col) => {
                const dir = Vec2.fromAngle(this.forceAngle);
                const force = dir.scale(this.forceMagnitude);
                obj.addForce(force);
                if (this.linearDrag) {
                    obj.addForce(obj.vel.scale(-this.linearDrag));
                }
            });
        },
    };
}

export type ForceMode = "constant" | "inverseLinear" | "inverseSquared";

export type PointEffectorCompOpt = {
    forceMagnitude: number;
    forceVariation: number;
    distanceScale?: number;
    forceMode?: ForceMode;
    linearDrag?: number;
    // angularDrag?: number;
};

export interface PointEffectorComp extends Comp {
    forceMagnitude: number;
    forceVariation: number;
    distanceScale: number;
    forceMode: ForceMode;
    linearDrag: number;
    // angularDrag: number;
}

export function pointEffector(opts: PointEffectorCompOpt): PointEffectorComp {
    return {
        id: "pointEffector",
        require: ["area", "pos"],
        forceMagnitude: opts.forceMagnitude,
        forceVariation: opts.forceVariation ?? 0,
        distanceScale: opts.distanceScale ?? 1,
        forceMode: opts.forceMode || "inverseLinear",
        linearDrag: opts.linearDrag ?? 0,
        // angularDrag: opts.angularDrag ?? 0,
        add(this: GameObj<PointEffectorComp | AreaComp | PosComp>) {
            this.onCollideUpdate((obj, col) => {
                const dir = this.pos.sub(obj.pos);
                const length = dir.len();
                const distance = length * this.distanceScale / 10;
                const forceScale = this.forceMode === "constant"
                    ? 1
                    : this.forceMode === "inverseLinear"
                    ? 1 / distance
                    : 1 / distance ** 2;
                const force = dir.scale(
                    this.forceMagnitude * forceScale / length,
                );
                obj.addForce(force);
                if (this.linearDrag) {
                    obj.addForce(obj.vel.scale(-this.linearDrag));
                }
            });
        },
    };
}

export type ConstantForceCompOpt = {
    force?: Vec2;
};

export interface ConstantForceComp extends Comp {
    force?: Vec2;
}

export function constantForce(opts: ConstantForceCompOpt): ConstantForceComp {
    return {
        id: "constantForce",
        require: ["body"],
        force: opts.force,
        update(this: GameObj<BodyComp | ConstantForceComp>) {
            if (this.force) {
                this.addForce(this.force);
            }
        },
    };
}

export type PlatformEffectorCompOpt = {
    surfaceArc?: number;
    useOneWay?: boolean;
};

export interface PlatformEffectorComp extends Comp {
    surfaceArc: number;
    useOneWay: boolean;
}

export function platformEffector(
    opt: PlatformEffectorCompOpt,
): PlatformEffectorComp {
    return {
        id: "platformEffector",
        require: ["area", "body"],
        surfaceArc: opt.surfaceArc ?? 180,
        useOneWay: opt.useOneWay ?? false,
        add(this: GameObj<BodyComp | AreaComp | PlatformEffectorComp>) {
            this.onBeforePhysicsResolve(collision => {
                const v = collision.target.vel;
                const up = getGravityDirection().scale(-1);
                const angle = up.angleBetween(v);
                if (Math.abs(angle) > this.surfaceArc / 2) {
                    collision.preventResolution();
                }
            });
        },
    };
}

export type BuoyancyEffectorCompOpt = {
    surfaceLevel: number;
    density?: number;
    linearDrag?: number;
    angularDrag?: number;
    flowAngle?: number;
    flowMagnitude?: number;
    flowVariation?: number;
};

export interface BuoyancyEffectorComp extends Comp {
    surfaceLevel: number;
    density: number;
    linearDrag: number;
    angularDrag: number;
    flowAngle: number;
    flowMagnitude: number;
    flowVariation: number;
    applyBuoyancy(body: GameObj<BodyComp>, submergedArea: Polygon): void;
    applyDrag(body: GameObj<BodyComp>, submergedArea: Polygon): void;
}

export function buoyancyEffector(
    opts: BuoyancyEffectorCompOpt,
): BuoyancyEffectorComp {
    return {
        id: "buoyancyEffector",
        require: ["area"],
        surfaceLevel: opts.surfaceLevel,
        density: opts.density ?? 1,
        linearDrag: opts.linearDrag ?? 1,
        angularDrag: opts.angularDrag ?? 0.2,
        flowAngle: opts.flowAngle ?? 0,
        flowMagnitude: opts.flowMagnitude ?? 0,
        flowVariation: opts.flowVariation ?? 0,
        add(this: GameObj<AreaComp | BuoyancyEffectorComp>) {
            this.onCollideUpdate((obj, col) => {
                const o = obj as GameObj<BodyComp | AreaComp>;
                const polygon = o.worldArea();
                const [submergedArea, _] = polygon.cut(
                    vec2(-100, this.surfaceLevel),
                    vec2(100, this.surfaceLevel),
                );

                if (submergedArea) {
                    this.applyBuoyancy(o, submergedArea);
                    this.applyDrag(o, submergedArea);
                }

                if (this.flowMagnitude) {
                    o.addForce(
                        Vec2.fromAngle(this.flowAngle).scale(
                            this.flowMagnitude,
                        ),
                    );
                }
            });
        },
        applyBuoyancy(body: GameObj<BodyComp>, submergedArea: Polygon) {
            const displacedMass = this.density * submergedArea.area();
            const buoyancyForce = vec2(0, 1).scale(-displacedMass);
            // console.log("buoyancyForce", buoyancyForce)
            // TODO: Should be applied to the center of submergedArea, but since there is no torque yet, this is OK
            body.addForce(buoyancyForce);
        },
        applyDrag(body: GameObj<BodyComp>, submergedArea: Polygon) {
            const velocity = body.vel;
            const dragMagnitude = this.density * this.linearDrag;
            const dragForce = velocity.scale(-dragMagnitude);
            // console.log("dragForce", dragForce)
            // TODO: Should be applied to the center of submergedArea, but since there is no torque yet, this is OK
            body.addForce(dragForce);
            // const angularDrag = submergedArea.area() * -body.angularVelocity * this.angularDrag;
            // object.addTorque(angularDrag);
        },
    };
}
