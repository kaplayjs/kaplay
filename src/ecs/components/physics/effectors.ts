import { Polygon, vec2 } from "../../../math/math";
import { Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "../transform/pos";
import type { AreaComp } from "./area";
import type { BodyComp } from "./body";

/**
 * Options for the {@link surfaceEffector `surfaceEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface SurfaceEffectorCompOpt {
    speed: number;
    speedVariation?: number;
    forceScale?: number;
}

/**
 * The {@link surfaceEffector `surfaceEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
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
                if (!obj.has("body")) return;
                const dir = col?.normal.normal();
                const currentVel = obj.vel.project(dir);
                const wantedVel = dir?.scale(this.speed);
                const force = wantedVel?.sub(currentVel);
                obj.addForce(force?.scale(obj.mass * this.forceScale));
            });
        },
    };
}

/**
 * Options for the {@link areaEffector `areaEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaEffectorCompOpt {
    useGlobalAngle?: boolean;
    force: Vec2;
    linearDrag?: number;
}

/**
 * The {@link areaEffector `areaEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface AreaEffectorComp extends Comp {
    useGlobalAngle: boolean;
    force: Vec2;
    linearDrag: number;
}

export function areaEffector(opts: AreaEffectorCompOpt): AreaEffectorComp {
    return {
        id: "areaEffector",
        require: ["area"],
        force: opts.force,
        linearDrag: opts.linearDrag ?? 0,
        useGlobalAngle: opts.useGlobalAngle ?? true,
        add(this: GameObj<AreaComp | AreaEffectorComp>) {
            this.onCollideUpdate(obj => {
                if (!obj.has("body")) return;
                obj.addForce(
                    this.useGlobalAngle
                        ? this.force
                        : this.force.rotate(this.transform.getRotation()),
                );
                if (this.linearDrag) {
                    obj.addForce(obj.vel.scale(-this.linearDrag));
                }
            });
        },
    };
}

/**
 * @group Components
 * @subgroup Component Types
 */
export type ForceMode = "constant" | "inverseLinear" | "inverseSquared";

/**
 * Options for the {@link pointEffector `pointEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface PointEffectorCompOpt {
    forceMagnitude: number;
    distanceScale?: number;
    forceMode?: ForceMode;
    linearDrag?: number;
}

/**
 * The {@link pointEffector `pointEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface PointEffectorComp extends Comp {
    forceMagnitude: number;
    distanceScale: number;
    forceMode: ForceMode;
    linearDrag: number;
}

export function pointEffector(opts: PointEffectorCompOpt): PointEffectorComp {
    return {
        id: "pointEffector",
        require: ["area", "pos"],
        forceMagnitude: opts.forceMagnitude,
        distanceScale: opts.distanceScale ?? 1,
        forceMode: opts.forceMode || "inverseLinear",
        linearDrag: opts.linearDrag ?? 0,
        // angularDrag: opts.angularDrag ?? 0,
        add(this: GameObj<PointEffectorComp | AreaComp | PosComp>) {
            this.onCollideUpdate((obj, col) => {
                if (!obj.has("body")) return;
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

/**
 * Options for the {@link constantForce `constantForce()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface ConstantForceCompOpt {
    force?: Vec2;
    useGlobalAngle?: boolean;
}

/**
 * The {@link constantForce `constantForce()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface ConstantForceComp extends Comp {
    force: Vec2 | undefined;
    useGlobalAngle: boolean;
}

export function constantForce(opts: ConstantForceCompOpt): ConstantForceComp {
    return {
        id: "constantForce",
        require: ["body"],
        force: opts.force,
        useGlobalAngle: opts.useGlobalAngle ?? true,
        update(this: GameObj<BodyComp | ConstantForceComp>) {
            if (this.force) {
                this.addForce(
                    this.useGlobalAngle
                        ? this.force
                        : this.force.rotate(this.transform.getRotation()),
                );
            }
        },
    };
}

/**
 * Options for the {@link platformEffector `platformEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export type PlatformEffectorCompOpt = {
    /**
     * If the object is about to collide and the collision normal direction is
     * in here (i.e. the object is moving roughly in this direction), the object won't collide.
     *
     * Should be a list of unit vectors `LEFT`, `RIGHT`, `UP`, or `DOWN`.
     *
     * Defaults to `[UP]`, i.e. the object will only be able to pass through when it
     * is jumping upwards, but will collide when it is moving downwards or sideways.
     */
    ignoreSides?: Vec2[];
    /**
     * A function that determines whether the object should collide.
     *
     * If present, it overrides the `ignoreSides`; if absent, it is
     * automatically created from `ignoreSides`.
     */
    shouldCollide?: (
        this: GameObj<PlatformEffectorComp>,
        obj: GameObj,
        normal: Vec2,
    ) => boolean;
};

/**
 * The {@link platformEffector `platformEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface PlatformEffectorComp extends Comp {
    /**
     * A set of the objects that should not collide with this, because `shouldCollide` returned true.
     *
     * Objects in here are automatically removed when they stop colliding, so the casual user shouldn't
     * need to touch this much. However, if an object is added to this set before the object collides
     * with the platform effector, it won't collide even if `shouldCollide` returns true.
     */
    platformIgnore: Set<GameObj>;
}

export function platformEffector(
    opt: PlatformEffectorCompOpt = {},
): PlatformEffectorComp {
    opt.ignoreSides ??= [Vec2.UP];
    opt.shouldCollide ??= (_, normal) => {
        return opt.ignoreSides?.findIndex(s => s.sdist(normal) < Number.EPSILON)
            == -1;
    };
    return {
        id: "platformEffector",
        require: ["area", "body"],
        platformIgnore: new Set<GameObj>(),
        add(this: GameObj<BodyComp | AreaComp | PlatformEffectorComp>) {
            this.onBeforePhysicsResolve(collision => {
                if (this.platformIgnore.has(collision.target)) {
                    collision.preventResolution();
                }
                else if (
                    !opt.shouldCollide!.call(
                        this,
                        collision.target,
                        collision.normal,
                    )
                ) {
                    collision.preventResolution();
                    this.platformIgnore.add(collision.target);
                }
            });
            this.onCollideEnd(obj => {
                this.platformIgnore.delete(obj);
            });
        },
    };
}

/**
 * Options for the {@link buoyancyEffector `buoyancyEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface BuoyancyEffectorCompOpt {
    surfaceLevel: number;
    density?: number;
    linearDrag?: number;
    angularDrag?: number;
    flowAngle?: number;
    flowMagnitude?: number;
    flowVariation?: number;
}

/**
 * The {@link buoyancyEffector `buoyancyEffector()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
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
                if (!obj.has("body")) return;
                const o = obj as GameObj<BodyComp | AreaComp>;
                const shape = o.worldArea();
                const polygon: Polygon = shape instanceof Polygon
                    ? shape
                    : new Polygon(shape.bbox().points());
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
