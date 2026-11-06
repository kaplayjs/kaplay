import { Polygon, vec2 } from "../../../math/math";
import { type SerializedVec2, Vec2 } from "../../../math/Vec2";
import type { Comp, GameObj } from "../../../types";
import type { PosComp } from "../transform/pos";
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
    serialize(): SurfaceEffectorCompOpt;
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
        serialize() {
            return {
                speed: this.speed,
                speedVariation: this.speedVariation,
                forceScale: this.forceScale,
            };
        },
    };
}

export function surfaceEffectorFactory(data: SurfaceEffectorCompOpt) {
    return surfaceEffector(data);
}

/**
 * The serialized {@link areaEffector `areaEffector()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export type SerializedAreaEffectorComp = Omit<AreaEffectorCompOpt, "force"> & {
    force: SerializedVec2;
};

export type AreaEffectorCompOpt = {
    useGlobalAngle?: boolean;
    force: Vec2;
    linearDrag?: number;
};

export interface AreaEffectorComp extends Comp {
    useGlobalAngle: boolean;
    force: Vec2;
    linearDrag: number;
    serialize(): SerializedAreaEffectorComp;
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
        serialize() {
            return {
                useGlobalAngle: this.useGlobalAngle,
                force: this.force.serialize(),
                linearDrag: this.linearDrag,
            };
        },
    };
}

export function areaEffectorFactory(data: SerializedAreaEffectorComp) {
    data.force = Vec2.deserialize(data.force);
    return areaEffector(data as AreaEffectorCompOpt);
}

export type ForceMode = "constant" | "inverseLinear" | "inverseSquared";

export type PointEffectorCompOpt = {
    forceMagnitude: number;
    distanceScale?: number;
    forceMode?: ForceMode;
    linearDrag?: number;
};

export interface PointEffectorComp extends Comp {
    forceMagnitude: number;
    distanceScale: number;
    forceMode: ForceMode;
    linearDrag: number;
    serialize(): PointEffectorCompOpt;
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
        serialize() {
            return {
                forceMagnitude: this.forceMagnitude,
                distanceScale: this.distanceScale,
                forceMode: this.forceMode,
                linearDrag: this.linearDrag,
            };
        },
    };
}

export function pointEffectorFactory(data: PointEffectorCompOpt) {
    return pointEffector(data);
}

/**
 * The serialized {@link constantForce `constantForce()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export type SerializedConstantForceComp =
    & Omit<ConstantForceCompOpt, "force">
    & {
        force?: SerializedVec2;
    };

export type ConstantForceCompOpt = {
    force?: Vec2;
    useGlobalAngle?: boolean;
};

export interface ConstantForceComp extends Comp {
    force: Vec2 | undefined;
    useGlobalAngle: boolean;
    serialize(): SerializedConstantForceComp;
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
        serialize() {
            const data: SerializedConstantForceComp = {
                useGlobalAngle: this.useGlobalAngle,
            };
            if (this.force) data.force = this.force.serialize();
            return data;
        },
    };
}

export function constantForceFactory(data: SerializedConstantForceComp) {
    data.force &&= Vec2.deserialize(data.force);
    return constantForce(data as ConstantForceCompOpt);
}

/**
 * The serialized {@link platformEffector `platformEffector()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedPlatformEffectorComp {
    ignoreSides?: SerializedVec2[];
}

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

export interface PlatformEffectorComp extends Comp {
    /**
     * A set of the objects that should not collide with this, because `shouldCollide` returned true.
     *
     * Objects in here are automatically removed when they stop colliding, so the casual user shouldn't
     * need to touch this much. However, if an object is added to this set before the object collides
     * with the platform effector, it won't collide even if `shouldCollide` returns true.
     */
    platformIgnore: Set<GameObj>;
    /**
     * Note: Only `ignoreSides` is supported (`shouldCollide()` opt will be omitted).
     */
    serialize(): SerializedPlatformEffectorComp;
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
        serialize() {
            const data: SerializedPlatformEffectorComp = {};
            if (opt.ignoreSides?.length) {
                data.ignoreSides = opt.ignoreSides.map(s => s.serialize());
            }
            return data;
        },
    };
}

export function platformEffectorFactory(data: SerializedPlatformEffectorComp) {
    data.ignoreSides &&= data.ignoreSides.map(s => Vec2.deserialize(s));
    return platformEffector(data as PlatformEffectorCompOpt);
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
    serialize(): BuoyancyEffectorCompOpt;
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
        serialize() {
            return {
                surfaceLevel: this.surfaceLevel,
                density: this.density,
                linearDrag: this.linearDrag,
                angularDrag: this.angularDrag,
                flowAngle: this.flowAngle,
                flowMagnitude: this.flowMagnitude,
                flowVariation: this.flowVariation,
            };
        },
    };
}

export function buoyancyEffectorFactory(data: BuoyancyEffectorCompOpt) {
    return buoyancyEffector(data);
}
