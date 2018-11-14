/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Transform } from "./Transform";
import { BeJSONFunctions } from "../Geometry";
import { Plane3dByOriginAndUnitNormal } from "./Plane3dByOriginAndUnitNormal";
/** A Ray3d contains
 * * an origin point.
 * * a direction vector.  The vector is NOT required to be normalized.
 *  * an optional weight (number).
 *
 */
export declare class Ray3d implements BeJSONFunctions {
    origin: Point3d;
    direction: Vector3d;
    a?: number;
    private constructor();
    private static _create;
    static createXAxis(): Ray3d;
    static createYAxis(): Ray3d;
    static createZAxis(): Ray3d;
    static createZero(result?: Ray3d): Ray3d;
    isAlmostEqual(other: Ray3d): boolean;
    static create(origin: Point3d, direction: Vector3d, result?: Ray3d): Ray3d;
    /**
     * Given a homogeneous point and its derivative components, construct a Ray3d with cartesian coordinates and derivatives.
     * @param weightedPoint `[x,y,z,w]` parts of weighted point.
     * @param weightedDerivative `[x,y,z,w]` derivatives
     * @param result
     */
    static createWeightedDerivative(weightedPoint: Float64Array, weightedDerivative: Float64Array, result?: Ray3d): Ray3d | undefined;
    /** Create from coordinates of the origin and direction. */
    static createXYZUVW(originX: number, originY: number, originZ: number, directionX: number, directionY: number, directionZ: number, result?: Ray3d): Ray3d;
    /** Capture origin and direction in a new Ray3d. */
    static createCapture(origin: Point3d, direction: Vector3d): Ray3d;
    /** Create from (clones of) origin, direction, and numeric weight. */
    static createPointVectorNumber(origin: Point3d, direction: Vector3d, a: number, result?: Ray3d): Ray3d;
    /** Create from origin and target.  The direction vector is the full length (non-unit) vector from origin to target. */
    static createStartEnd(origin: Point3d, target: Point3d, result?: Ray3d): Ray3d;
    /** @returns Return a reference to the ray's origin. */
    getOriginRef(): Point3d;
    /** @returns Return a reference to the ray's direction vector. */
    getDirectionRef(): Vector3d;
    /** copy coordinates from origin and direction. */
    set(origin: Point3d, direction: Vector3d): void;
    /** Clone the ray. */
    clone(result?: Ray3d): Ray3d;
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform: Transform): Ray3d;
    /** Apply a transform in place. */
    transformInPlace(transform: Transform): void;
    /** Copy data from another ray. */
    setFrom(source: Ray3d): void;
    /** * fraction 0 is the ray origin.
     * * fraction 1 is at the end of the direction vector when placed at the origin.
     * @returns Return a point at fractional position along the ray.
     */
    fractionToPoint(fraction: number): Point3d;
    /** @returns Return the dot product of the ray's direction vector with a vector from the ray origin to the space point. */
    dotProductToPoint(spacePoint: Point3d): number;
    /**
     * @returns Return the fractional coordinate (along the direction vector) of the spacePoint projected to the ray.
     */
    pointToFraction(spacePoint: Point3d): number;
    /**
     *
     * @returns Return the spacePoint projected onto the ray.
     */
    projectPointToRay(spacePoint: Point3d): Point3d;
    /** Return a transform for rigid axes
     * at ray origin with z in ray direction.  If the direction vector is zero, axes default to identity (from createHeadsUpTriad)
     */
    toRigidZFrame(): Transform | undefined;
    /**
     * Convert {origin:[x,y,z], direction:[u,v,w]} to a Ray3d.
     */
    setFromJSON(json?: any): void;
    /**
     * try to scale the direction vector to a given magnitude.
     * @returns Returns false if ray direction is a zero vector.
     */
    trySetDirectionMagnitudeInPlace(magnitude?: number): boolean;
    tryNormalizeInPlaceWithAreaWeight(a: number): boolean;
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    static fromJSON(json?: any): Ray3d;
    /** return distance to point in space */
    distance(spacePoint: Point3d): number;
    /**
     * Return the intersection of the unbounded ray with a plane.
     * Stores the point of intersection in the result point given as a parameter,
     * and returns the parameter along the ray where the intersection occurs.
     * Returns undefined if the ray and plane are parallel.
     */
    intersectionWithPlane(plane: Plane3dByOriginAndUnitNormal, result?: Point3d): number | undefined;
}
//# sourceMappingURL=Ray3d.d.ts.map