/** @module CartesianGeometry */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range1d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Point4d } from "../geometry4d/Point4d";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { Angle } from "../geometry3d/Angle";
import { GrowableFloat64Array } from "../geometry3d/GrowableFloat64Array";
import { Arc3d } from "../curve/Arc3d";
import { Clipper } from "./ClipUtils";
import { AnnounceNumberNumberCurvePrimitive } from "../curve/CurvePrimitive";
/** A ClipPlane is a single plane represented as
 * * An inward unit normal (u,v,w)
 * * A signedDistance
 *
 * Hence
 * * The halfspace function evaluation for "point" [x,y,z,] is: ([x,y,z] DOT (u,v,w)l - signedDistance)
 * * POSITIVE values of the halfspace function are "inside"
 * * ZERO value of the halfspace function is "on"
 * * NEGATIVE value of the halfspace function is "outside"
 * * A representative point on the plane is (signedDistance*u, signedDistance * v, signedDistance *w)
 */
export declare class ClipPlane implements Clipper {
    static fractionTol: number;
    private _inwardNormal;
    /** Construct a parallel plane through the origin.
     * * Move it to the actual position.
     * * _distanceFromOrigin is the distance it moved, with the (inward) normal direction as positive
     */
    private _distanceFromOrigin;
    private _invisible;
    private _interior;
    private constructor();
    /**
     * @returns Return true if all members are almostEqual to corresponding members of other.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: ClipPlane): boolean;
    /** @return a cloned plane */
    clone(): ClipPlane;
    /** @return Return a cloned plane with coordinate data negated. */
    cloneNegated(): ClipPlane;
    /** Create a ClipPlane from Plane3dByOriginAndUnitNormal. */
    static createPlane(plane: Plane3dByOriginAndUnitNormal, invisible?: boolean, interior?: boolean, result?: ClipPlane): ClipPlane;
    /**
     * * Create a ClipPlane with direct normal and signedDistance.
     * * The vector is normalized for storage.
     */
    static createNormalAndDistance(normal: Vector3d, distance: number, invisible?: boolean, interior?: boolean, result?: ClipPlane): ClipPlane | undefined;
    /** Create a ClipPlane
     * * "normal" is the inward normal of the plane. (It is internally normalized)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPoint(normal: Vector3d, point: Point3d, invisible?: boolean, interior?: boolean, result?: ClipPlane): ClipPlane | undefined;
    /** Create a ClipPlane
     * * "normal" is the inward normal of the plane. (It is internally normalized)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPointXYZXYZ(normalX: number, normalY: number, normalZ: number, originX: number, originY: number, originZ: number, invisible?: boolean, interior?: boolean): ClipPlane | undefined;
    /**
     * return a json object of the form
     * `{"normal":[u,v,w],"dist":signedDistanceValue,"interior":true,"invisible":true}`
     */
    toJSON(): any;
    static fromJSON(json: any, result?: ClipPlane): ClipPlane | undefined;
    setFlags(invisible: boolean, interior: boolean): void;
    readonly distance: number;
    readonly inwardNormalRef: Vector3d;
    readonly interior: boolean;
    readonly invisible: boolean;
    static createEdgeAndUpVector(point0: Point3d, point1: Point3d, upVector: Vector3d, tiltAngle: Angle, result?: ClipPlane): ClipPlane | undefined;
    static createEdgeXY(point0: Point3d, point1: Point3d, result?: ClipPlane): ClipPlane | undefined;
    getPlane3d(): Plane3dByOriginAndUnitNormal;
    getPlane4d(): Point4d;
    setPlane4d(plane: Point4d): void;
    evaluatePoint(point: Point3d): number;
    /** @returns return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     */
    dotProductVector(vector: Vector3d): number;
    /** @returns return the dot product of the plane normal with the point (treating the point xyz as a vector, and NOT using the plane's distanceFromOrigin).
     */
    dotProductPlaneNormalPoint(point: Point3d): number;
    isPointOnOrInside(point: Point3d, tolerance?: number): boolean;
    isPointInside(point: Point3d, tolerance?: number): boolean;
    isPointOn(point: Point3d, tolerance?: number): boolean;
    appendIntersectionRadians(arc: Arc3d, intersectionRadians: GrowableFloat64Array): void;
    private static _clipArcFractionArray;
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * * Compute intersection of (unbounded) segment with the plane.
     * * If the ends are on the same side of the plane, return undefined.
     * * If the intersection is an endpoint or interior to the segment return the fraction.
     * * If both ends are on, return undefined.
     */
    getBoundedSegmentSimpleIntersection(pointA: Point3d, pointB: Point3d): number | undefined;
    transformInPlace(transform: Transform): boolean;
    setInvisible(invisible: boolean): void;
    /**  reverse the sign of all coefficients, so outside and inside reverse */
    negateInPlace(): void;
    /**
     * Move the plane INWARD by given distance
     * @param offset distance of shift inwards
     */
    offsetDistance(offset: number): void;
    convexPolygonClipInPlace(xyz: Point3d[], work: Point3d[]): void;
    polygonCrossings(xyz: Point3d[], crossings: Point3d[]): void;
    convexPolygonSplitInsideOutside(xyz: Point3d[], xyzIn: Point3d[], xyzOut: Point3d[], altitudeRange: Range1d): void;
    multiplyPlaneByMatrix(matrix: Matrix4d): void;
    /** announce the interval (if any) where a line is within the clip plane half space. */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
}
//# sourceMappingURL=ClipPlane.d.ts.map