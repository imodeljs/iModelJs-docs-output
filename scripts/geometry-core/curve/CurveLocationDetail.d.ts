/** @module Curve */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Ray3d } from "../geometry3d/Ray3d";
import { CurvePrimitive } from "./CurvePrimitive";
/**
 * An enumeration of special conditions being described by a CurveLocationDetail.
 * @public
 */
export declare enum CurveIntervalRole {
    /** This point is an isolated point NOT at a primary vertex. */
    isolated = 0,
    /**  This point is an isolated vertex hit */
    isolatedAtVertex = 1,
    /** This is the beginning of an interval */
    intervalStart = 10,
    /** This is an interior point of an interval. */
    intervalInterior = 11,
    /** This is the end of an interval */
    intervalEnd = 12
}
/**
 * Return code for CurvePrimitive method `moveSignedDistanceFromFraction`
 * @public
 */
export declare enum CurveSearchStatus {
    /** unimplemented or zero length curve  */
    error = 0,
    /** complete success of search */
    success = 1,
    /** search ended prematurely (e.g. at incomplete distance moved) at start or end of curve */
    stoppedAtBoundary = 2
}
/**
 * CurveLocationDetail carries point and paramter data about a point evaluated on a curve.
 * * These are returned by a variety of queries.
 * * Particular contents can vary among the queries.
 * @public
 */
export declare class CurveLocationDetail {
    /** The curve being evaluated */
    curve?: CurvePrimitive;
    /** optional ray */
    ray?: Ray3d;
    /** The fractional position along the curve */
    fraction: number;
    /** Detail condition of the role this point has in some context */
    intervalRole?: CurveIntervalRole;
    /** The point on the curve */
    point: Point3d;
    /** A vector (e.g. tangent vector) in context */
    vectorInCurveLocationDetail?: Vector3d;
    /** A context-specific numeric value.  (E.g. a distance) */
    a: number;
    /** optional CurveLocationDetail with more detail of location.  For instance, a detail for fractional position within
     * a CurveChainWithDistanceIndex returns fraction and distance along the chain as its primary data and
     * further detail of the particular curve within the chain in the childDetail.
     */
    childDetail?: CurveLocationDetail;
    /** A status indicator for certain searches.
     * * e.g. CurvePrimitive.moveSignedDistanceFromFraction
     */
    curveSearchStatus?: CurveSearchStatus;
    /** A context-specific additional point */
    pointQ: Point3d;
    constructor();
    /** Set the (optional) intervalRole field */
    setIntervalRole(value: CurveIntervalRole): void;
    /** test if this is an isolated point. This is true if intervalRole is any of (undefined, isolated, isolatedAtVertex) */
    readonly isIsolated: boolean;
    /** Return a complete copy, WITH CAVEATS . . .
     * * curve member is copied as a reference.
     * * point and vector members are cloned.
     */
    clone(result?: CurveLocationDetail): CurveLocationDetail;
    /**
     * Updated in this instance.
     * * Note that if caller omits `vector` and `a`, those fields are updated to the call-list defaults (NOT left as-is)
     * * point and vector updates are by data copy (not capture of pointers)
     * @param fraction (required) fraction to install
     * @param point  (required) point to install
     * @param vector (optional) vector to install.
     * @param a (optional) numeric value to install.
     */
    setFP(fraction: number, point: Point3d, vector?: Vector3d, a?: number): void;
    /**
     * Updated in this instance.
     * * Note that if caller omits a`, that field is updated to the call-list default (NOT left as-is)
     * * point and vector updates are by data copy (not capture of the ray members)
     * @param fraction (required) fraction to install
     * @param ray  (required) point and vector to install
     * @param a (optional) numeric value to install.
     */
    setFR(fraction: number, ray: Ray3d, a?: number): void;
    /** Set the CurvePrimitive pointer, leaving all other properties untouched.
     */
    setCurve(curve: CurvePrimitive): void;
    /** record the distance from the CurveLocationDetail's point to the parameter point. */
    setDistanceTo(point: Point3d): void;
    /** create with a CurvePrimitive pointer but no coordinate data.
     */
    static create(curve: CurvePrimitive, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPoint(curve: CurvePrimitive, fraction: number, point: Point3d, result?: CurveLocationDetail): CurveLocationDetail;
    /**
     * Create a new detail with only ray, fraction, and point.
     */
    static createRayFractionPoint(ray: Ray3d, fraction: number, point: Point3d, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with CurvePrimitive pointer, fraction, and point coordinates
     */
    static createCurveFractionPointDistanceCurveSearchStatus(curve: CurvePrimitive, fraction: number, point: Point3d, distance: number, status: CurveSearchStatus, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with curveSearchStatus affected by allowExtension.
     * *
     */
    static createConditionalMoveSignedDistance(allowExtension: boolean, curve: CurvePrimitive, startFraction: number, endFraction: number, requestedSignedDistance: number, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveEvaluatedFraction(curve: CurvePrimitive, fraction: number, result?: CurveLocationDetail): CurveLocationDetail;
    /** create with CurvePrimitive pointer, fraction, and point coordinates.
     */
    static createCurveFractionPointDistance(curve: CurvePrimitive, fraction: number, point: Point3d, a: number, result?: CurveLocationDetail): CurveLocationDetail;
    /** update or create if closer than current contents.
     * @param curve candidate curve
     * @param fraction candidate fraction
     * @param point candidate point
     * @param a candidate distance
     * @returns true if the given distance is smaller (and hence this detail was updated.)
     */
    updateIfCloserCurveFractionPointDistance(curve: CurvePrimitive, fraction: number, point: Point3d, a: number): boolean;
}
/** Enumeration of configurations for intersections and min/max distance-between-curve
 * @public
 */
export declare enum CurveCurveApproachType {
    /** Intersection at a single point */
    Intersection = 0,
    /** Distinct points on the two curves, with each curve's tangent perpendicular to the chord between the points */
    PerpendicularChord = 1,
    /** Completely coincident geometry */
    CoincidentGeometry = 2,
    /** Completely parallel geometry. */
    ParallelGeometry = 3
}
/** A pair of CurveLocationDetail.
 * @public
 */
export declare class CurveLocationDetailPair {
    /** The first of the two details ... */
    detailA: CurveLocationDetail;
    /** The second of the two details ... */
    detailB: CurveLocationDetail;
    /** enumeration of how the detail pairs relate.
     * * This is set only by certain closeApproach calculations.
     */
    approachType?: CurveCurveApproachType;
    constructor(detailA?: CurveLocationDetail, detailB?: CurveLocationDetail);
    /** Create a curve detail pair using references to two CurveLocationDetails */
    static createCapture(detailA: CurveLocationDetail, detailB: CurveLocationDetail, result?: CurveLocationDetailPair): CurveLocationDetailPair;
    /** Make a deep copy of this CurveLocationDetailPair */
    clone(result?: CurveLocationDetailPair): CurveLocationDetailPair;
}
//# sourceMappingURL=CurveLocationDetail.d.ts.map