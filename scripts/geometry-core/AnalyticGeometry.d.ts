/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./PointVector";
import { Transform } from "./Transform";
import { BeJSONFunctions } from "./Geometry";
/**
 * A plane defined by
 *
 * * Any point on the plane.
 * * a unit normal.
 */
export declare class Plane3dByOriginAndUnitNormal implements BeJSONFunctions {
    private _origin;
    private _normal;
    private constructor();
    private static _create;
    /**
     * Create a plane parallel to the XY plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createXYPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    /**
     * Create a plane parallel to the YZ plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createYZPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    /**
     * Create a plane parallel to the ZX plane
     * @param origin optional plane origin.  If omitted, the origin is placed at 000
     */
    static createZXPlane(origin?: Point3d): Plane3dByOriginAndUnitNormal;
    static create(origin: Point3d, normal: Vector3d, result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal | undefined;
    /** Create a plane defined by two points and an in-plane vector.
     * @param pointA any point in the plane
     * @param pointB any other point in the plane
     * @param vector any vector in the plane but not parallel to the vector from pointA to pointB
     */
    static createPointPointVectorInPlane(pointA: Point3d, pointB: Point3d, vector: Vector3d): Plane3dByOriginAndUnitNormal | undefined;
    isAlmostEqual(other: Plane3dByOriginAndUnitNormal): boolean;
    setFromJSON(json?: any): void;
    /**
     * Convert to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    static fromJSON(json?: any): Plane3dByOriginAndUnitNormal;
    /** @returns a reference to the origin. */
    getOriginRef(): Point3d;
    /** @returns a reference to the unit normal. */
    getNormalRef(): Vector3d;
    /** Copy coordinates from the given origin and normal. */
    set(origin: Point3d, normal: Vector3d): void;
    clone(result?: Plane3dByOriginAndUnitNormal): Plane3dByOriginAndUnitNormal;
    /** Create a clone and return the transform of the clone. */
    cloneTransformed(transform: Transform): Plane3dByOriginAndUnitNormal | undefined;
    /** Copy data from the given plane. */
    setFrom(source: Plane3dByOriginAndUnitNormal): void;
    /** @returns Return the altitude of spacePoint above or below the plane.  (Below is negative) */
    altitude(spacePoint: Point3d): number;
    /** @returns return a point at specified (signed) altitude */
    altitudeToPoint(altitude: number, result?: Point3d): Point3d;
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocityXYZ(x: number, y: number, z: number): number;
    /** @returns The dot product of spaceVector with the plane's unit normal.  This tells the rate of change of altitude
     * for a point moving at speed one along the spaceVector.
     */
    velocity(spaceVector: Vector3d): number;
    /** @returns the altitude of a point given as separate x,y,z components. */
    altitudeXYZ(x: number, y: number, z: number): number;
    /** @returns the altitude of a point given as separate x,y,z,w components. */
    altitudeXYZW(x: number, y: number, z: number, w: number): number;
    /** @returns Return the projection of spacePoint onto the plane. */
    projectPointToPlane(spacePoint: Point3d, result?: Point3d): Point3d;
    /** @return Returns true of spacePoint is within distance tolerance of the plane. */
    isPointInPlane(spacePoint: Point3d): boolean;
}
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
/**
 * A Point3dVector3dVector3d is an origin and a pair of vectors.
 * This defines a plane with (possibly skewed) uv coordinates
 */
export declare class Plane3dByOriginAndVectors implements BeJSONFunctions {
    origin: Point3d;
    vectorU: Vector3d;
    vectorV: Vector3d;
    private constructor();
    static createOriginAndVectors(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Capture origin and directions in a new planed. */
    static createCapture(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    setOriginAndVectorsXYZ(x0: number, y0: number, z0: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number): Plane3dByOriginAndVectors;
    setOriginAndVectors(origin: Point3d, vectorU: Vector3d, vectorV: Vector3d): Plane3dByOriginAndVectors;
    static createOriginAndVectorsXYZ(x0: number, y0: number, z0: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Define a plane by three points in the plane.
     * @param origin origin for the parameterization.
     * @param targetU target point for the vectorU starting at the origin.
     * @param targetV target point for the vectorV originating at the origin.
     * @param result optional result.
     */
    static createOriginAndTargets(origin: Point3d, targetU: Point3d, targetV: Point3d, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Create a plane with origin at 000, unit vectorU in x direction, and unit vectorV in the y direction.
     */
    static createXYPlane(result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** create a plane from data presented as Float64Arrays.
     * @param origin x,y,z of origin.
     * @param vectorU x,y,z of vectorU
     * @param vectorV x,y,z of vectorV
     */
    static createOriginAndVectorsArrays(origin: Float64Array, vectorU: Float64Array, vectorV: Float64Array, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** create a plane from data presented as Float64Array with weights
     * @param origin x,y,z,w of origin.
     * @param vectorU x,y,z,w of vectorU
     * @param vectorV x,y,z,w of vectorV
     */
    static createOriginAndVectorsWeightedArrays(originw: Float64Array, vectorUw: Float64Array, vectorVw: Float64Array, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Evaluate a point a grid coordinates on the plane.
     * * The computed point is `origin + vectorU * u + vectorV * v`
     * @param u coordinate along vectorU
     * @param v coordinate along vectorV
     * @param result optional result destination.
     * @returns Return the computed coordinate.
     */
    fractionToPoint(u: number, v: number, result?: Point3d): Point3d;
    fractionToVector(u: number, v: number, result?: Vector3d): Vector3d;
    setFromJSON(json?: any): void;
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    static fromJSON(json?: any): Plane3dByOriginAndVectors;
    isAlmostEqual(other: Plane3dByOriginAndVectors): boolean;
}
//# sourceMappingURL=AnalyticGeometry.d.ts.map