/** @module CartesianGeometry */
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Transform } from "./Transform";
import { BeJSONFunctions } from "../Geometry";
import { Plane3dByOriginAndUnitNormal } from "./Plane3dByOriginAndUnitNormal";
import { XYAndZ } from "./XYZProps";
import { CurveLocationDetailPair } from "../curve/CurveLocationDetail";
import { Range1d, Range3d } from "./Range";
/** A Ray3d contains
 * * an origin point.
 * * a direction vector.  The vector is NOT required to be normalized.
 *  * an optional weight (number).
 * @public
 */
export declare class Ray3d implements BeJSONFunctions {
    /** The ray origin */
    origin: Point3d;
    /** The ray direction.  This is commonly (but not always) a unit vector. */
    direction: Vector3d;
    /** Numeric annotation. */
    a?: number;
    private constructor();
    private static _create;
    /** Create a ray on the x axis. */
    static createXAxis(): Ray3d;
    /** Create a ray on the y axis. */
    static createYAxis(): Ray3d;
    /** Create a ray on the z axis. */
    static createZAxis(): Ray3d;
    /** Create a ray with all zeros. */
    static createZero(result?: Ray3d): Ray3d;
    /** Test for nearly equal rays. */
    isAlmostEqual(other: Ray3d): boolean;
    /** Create a ray from origin and direction. */
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
    /** Return a reference to the ray's origin. */
    getOriginRef(): Point3d;
    /** Return a reference to the ray's direction vector. */
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
    /** Return the dot product of the ray's direction vector with a vector from the ray origin to the space point. */
    dotProductToPoint(spacePoint: Point3d): number;
    /**
     * Return the fractional coordinate (along the direction vector) of the spacePoint projected to the ray.
     */
    pointToFraction(spacePoint: Point3d): number;
    /**
     *
     * Return the spacePoint projected onto the ray.
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
    /**
     * If parameter `a` is clearly nonzero and the direction vector can be normalized,
     * * save the parameter `a` as the optional `a` member of the ray.
     * * normalize the ray's direction vector
     * If parameter `a` is nearly zero,
     * * Set the `a` member to zero
     * * Set the ray's direction vector to zero.
     * @param a area to be saved.
     */
    tryNormalizeInPlaceWithAreaWeight(a: number): boolean;
    /**
     * Convert an Angle to a JSON object.
     * @return {*} [origin,normal]
     */
    toJSON(): any;
    /** Create a new ray from json object.  See `setFromJSON` for json structure; */
    static fromJSON(json?: any): Ray3d;
    /** return distance from the ray to point in space */
    distance(spacePoint: Point3d): number;
    /**
     * Return the intersection of the unbounded ray with a plane.
     * Stores the point of intersection in the result point given as a parameter,
     * and returns the parameter along the ray where the intersection occurs.
     * Returns undefined if the ray and plane are parallel.
     */
    intersectionWithPlane(plane: Plane3dByOriginAndUnitNormal, result?: Point3d): number | undefined;
    /**
     * * Find intersection of the ray with a Range3d.
     * * return the range of fractions (on the ray) which are "inside" the range.
     * * Note that a range is always returned;  if there is no intersection it is indicated by the test `result.sNull`
     */
    intersectionWithRange3d(range: Range3d, result?: Range1d): Range1d;
    /** Construct a vector from `ray.origin` to target point.
     * * return the part of the vector that is perpendicular to `ray.direction`.
     *  * i.e. return the shortest vector from the ray to the point.
     */
    perpendicularPartOfVectorToTarget(targetPoint: XYAndZ, result?: Vector3d): Vector3d;
    /** Determine if two rays intersect, are fully overlapped, parallel but no coincident, or skew
     * * Return a CurveLocationDetailPair which
     * * contains fraction and point on each ray.
     * * has (in the CurveLocationDetailPair structure, as member approachType) annotation indicating one of these relationships
     *   * CurveCurveApproachType.Intersection -- the rays have a simple intersection, at fractions indicated in detailA and detailB
     *   * CurveCurveApproachType.PerpendicularChord -- there is pair of where the rays have closest approach.  The rays are skew in space.
     *   * CurveCurveApproachType.CoincidentGeometry -- the rays are the same unbounded line in space. The fractions and points are a representative single common point.
     *   * CurveCurveApproachType.Parallel -- the rays are parallel (and not coincident).   The two points are at the minimum distance
     */
    static closestApproachRay3dRay3d(rayA: Ray3d, rayB: Ray3d): CurveLocationDetailPair;
}
//# sourceMappingURL=Ray3d.d.ts.map