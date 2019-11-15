/** @module CartesianGeometry */
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range1d, Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Point4d } from "../geometry4d/Point4d";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { PlaneAltitudeEvaluator } from "../Geometry";
import { Angle } from "../geometry3d/Angle";
import { GrowableFloat64Array } from "../geometry3d/GrowableFloat64Array";
import { Arc3d } from "../curve/Arc3d";
import { Clipper } from "./ClipUtils";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
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
 * * Given a point and inward normal, the signedDistance is (point DOT normal)
 * @public
 */
export declare class ClipPlane implements Clipper, PlaneAltitudeEvaluator {
    private _inwardNormal;
    /** Construct a parallel plane through the origin.
     * * Move it to the actual position.
     * * _distanceFromOrigin is the distance it moved, with the (inward) normal direction as positive
     */
    private _distanceFromOrigin;
    private _invisible;
    private _interior;
    private constructor();
    private safeSetXYZDistance;
    /**
     * Return true if all members are almostEqual to corresponding members of other.
     * @param other clip plane to compare
     */
    isAlmostEqual(other: ClipPlane): boolean;
    /** return a cloned plane */
    clone(): ClipPlane;
    /** return Return a cloned plane with coordinate data negated. */
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
     * * "normal" (normalX, normalY, nz) is the inward normal of the plane.
     * * The given (normalX,normalY,normalZ)
     * * "point" is any point of the plane.
     * * The stored distance for the plane is the dot product of the point with the normal (i.e. treat the point's xyz as a vector from the origin.)
     */
    static createNormalAndPointXYZXYZ(normalX: number, normalY: number, normalZ: number, originX: number, originY: number, originZ: number, invisible?: boolean, interior?: boolean, result?: ClipPlane): ClipPlane | undefined;
    /**
     * return a json object of the form
     * `{"normal":[u,v,w],"dist":signedDistanceValue,"interior":true,"invisible":true}`
     */
    toJSON(): any;
    /** parse json object to ClipPlane instance */
    static fromJSON(json: any, result?: ClipPlane): ClipPlane | undefined;
    /** Set both the invisible and interior flags. */
    setFlags(invisible: boolean, interior: boolean): void;
    /**
     * Return the stored distanceFromOrigin property.
     */
    readonly distance: number;
    /**
     * Return the stored inward normal property.
     */
    readonly inwardNormalRef: Vector3d;
    /**
     * Return the "interior" property bit
     */
    readonly interior: boolean;
    /**
     * Return the "invisible" property bit.
     */
    readonly invisible: boolean;
    /**
     * Create a plane defined by two points, an up vector, and a tilt angle relative to the up vector.
     * @param point0 start point of the edge
     * @param point1 end point of the edge
     * @param upVector vector perpendicular to the plane
     * @param tiltAngle angle to tilt the plane around the edge in the direction of the up vector.
     * @param result optional preallocated plane
     */
    static createEdgeAndUpVector(point0: Point3d, point1: Point3d, upVector: Vector3d, tiltAngle: Angle, result?: ClipPlane): ClipPlane | undefined;
    /**
     * Create a plane perpendicular to the edge between the xy parts of point0 and point1
     */
    static createEdgeXY(point0: Point3d, point1: Point3d, result?: ClipPlane): ClipPlane | undefined;
    /**
     * Return the Plane3d form of the plane.
     * * The plane origin is the point `distance * inwardNormal`
     * * The plane normal is the inward normal of the ClipPlane.
     */
    getPlane3d(): Plane3dByOriginAndUnitNormal;
    /**
     * Return the Point4d d form of the plane.
     * * The homogeneous xyz are the inward normal xyz.
     * * The homogeneous weight is the negated ClipPlane distance.
     */
    getPlane4d(): Point4d;
    /**
     * Set the plane from DPoint4d style plane.
     * * The saved plane has its direction normalized.
     * * This preserves the plane itself as a zero set but make plane evaluations act as true distances (even if the plane coefficients are scaled otherwise)
     * @param plane
     */
    setPlane4d(plane: Point4d): void;
    /**
     * Evaluate the distance from the plane to a point in space, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     * @deprecated Instead of `clipPlane.evaluatePoint(spacePoint)` use `clipPlane.altitude(spacePoint)` (for compatibility with interface `PlaneAltitudeEvaluator`)
     */
    evaluatePoint(point: Point3d): number;
    /**
     * Evaluate the altitude in weighted space, i.e. (dot product with inward normal) minus distance, with point.w scale applied to distance)
     * @param point space point to test
     */
    weightedAltitude(point: Point4d): number;
    /**
     * Evaluate the distance from the plane to a point in space, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     */
    altitude(point: Point3d): number;
    /**
     * Evaluate the distance from the plane to a point in space with point given as x,y,z, i.e. (dot product with inward normal) minus distance
     * @param point space point to test
     */
    altitudeXYZ(x: number, y: number, z: number): number;
    /** Return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     * @deprecated Instead of `clipPlane.dotProduct (vector)` use `clipPlane.velocity(vector)` for compatibility with interface `PlaneAltitudeEvaluator`
     */
    dotProductVector(vector: Vector3d): number;
    /** Return the dot product of the plane normal with the vector (NOT using the plane's distanceFromOrigin).
     */
    velocity(vector: Vector3d): number;
    /** Return the dot product of the plane normal with the x,yz, vector components (NOT using the plane's distanceFromOrigin).
     */
    velocityXYZ(x: number, y: number, z: number): number;
    /** Return the dot product of the plane normal with the point (treating the point xyz as a vector, and NOT using the plane's distanceFromOrigin).
     */
    dotProductPlaneNormalPoint(point: Point3d): number;
    /**
     * Return true if spacePoint is inside or on the plane, with tolerance applied to "on".
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointOnOrInside(spacePoint: Point3d, tolerance?: number): boolean;
    /**
     * Return true if spacePoint is strictly inside the halfspace, with tolerance applied to "on".
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointInside(point: Point3d, tolerance?: number): boolean;
    /**
     * Return true if spacePoint is strictly on the plane, within tolerance
     * @param spacePoint point to test.
     * @param tolerance tolerance for considering "near plane" to be "on plane"
     */
    isPointOn(point: Point3d, tolerance?: number): boolean;
    /**
     * Compute intersections of an (UNBOUNDED) arc with the plane.  Append them (as radians) to a growing array.
     * @param arc arc to test.  The angle limits of the arc are NOT considered.
     * @param intersectionRadians array to receive results
     */
    appendIntersectionRadians(arc: Arc3d, intersectionRadians: GrowableFloat64Array): void;
    private static _clipArcFractionArray;
    /** Announce fractional intervals of arc clip.
     * * Each call to `announce(fraction0, fraction1, arc)` announces one interval that is inside the clip plane.
     */
    announceClippedArcIntervals(arc: Arc3d, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /**
     * * Compute intersection of (unbounded) segment with the plane.
     * * If the ends are on the same side of the plane, return undefined.
     * * If the intersection is an endpoint or interior to the segment return the fraction.
     * * If both ends are on, return undefined.
     */
    getBoundedSegmentSimpleIntersection(pointA: Point3d, pointB: Point3d): number | undefined;
    /** Apply transform to the origin.  Apply inverse transpose of the matrix part to th normal vector. */
    transformInPlace(transform: Transform): boolean;
    /** Set the invisible flag.   Interpretation of this is up to the use code algorithms. */
    setInvisible(invisible: boolean): void;
    /**  reverse the sign of all coefficients, so outside and inside reverse */
    negateInPlace(): void;
    /**
     * Move the plane INWARD by given distance
     * @param offset distance of shift inwards
     */
    offsetDistance(offset: number): void;
    /**
     * Clip a polygon, returning the clip result in the same object.
     * @param xyz input/output polygon
     * @param work scratch object
     * @param tolerance tolerance for on-plane decision.
     * @deprecated Instead of `clipPlane.convexPolygonClipInPlace (xyz, work, tolerance)` use `PolygonOps.clipConvexPoint3dPolygonInPlace (clipPlane, xyz, work, tolerance)`
     */
    convexPolygonClipInPlace(xyz: Point3d[], work: Point3d[], tolerance?: number): void;
    /**
     * Clip a polygon to the inside or outside of the plane.
     * * Results with 2 or fewer points are ignored.
     * * Other than ensuring capacity in the arrays, there are no object allocations during execution of this function.
     * @param xyz input points.
     * @param work work buffer
     * @param tolerance tolerance for "on plane" decision.
     */
    clipConvexPolygonInPlace(xyz: GrowableXYZArray, work: GrowableXYZArray, inside?: boolean, tolerance?: number): void;
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     * @deprecated instead of `plane.convexPolygonSplitInsideOutside (xyz, xyzIn, xyzOut, altitudeRange)` use `PolygonOops.splitConvexPolygonInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange)`
     */
    convexPolygonSplitInsideOutside(xyz: Point3d[], xyzIn: Point3d[], xyzOut: Point3d[], altitudeRange: Range1d): void;
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     * @deprecated instead of `plane.convexPolygonSplitInsideOutsideGrowableArrays (xyz, xyzIn, xyzOut, altitudeRange)` use `PolygonOops.splitConvexPoint3dArrayolygonInsideOutsidePlane(this, xyz, xyzIn, xyzOut, altitudeRange)`
     */
    convexPolygonSplitInsideOutsideGrowableArrays(xyz: GrowableXYZArray, xyzIn: GrowableXYZArray, xyzOut: GrowableXYZArray, altitudeRange: Range1d): void;
    /**
     * Multiply the ClipPlane's DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     * @return false if unable to invert
     */
    multiplyPlaneByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /** Return an array containing
     * * All points that are exactly on the plane.
     * * Crossing points between adjacent points that are (strictly) on opposite sides.
     * @deprecated ClipPlane method `clipPlane.polygonCrossings(polygonPoints, crossings)` is deprecated.  Use Point3dArrayPolygonOps.polygonPlaneCrossings (clipPlane, polygonPoints, crossings)`
     */
    polygonCrossings(xyz: Point3d[], crossings: Point3d[]): void;
    /** announce the interval (if any) where a line is within the clip plane half space. */
    announceClippedSegmentIntervals(f0: number, f1: number, pointA: Point3d, pointB: Point3d, announce?: (fraction0: number, fraction1: number) => void): boolean;
    /**
     * Return a coordinate frame with
     * * origin at closest point to global origin
     * * z axis points in
     * x and y are "in plane"
     */
    getFrame(): Transform;
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     */
    intersectRange(range: Range3d, addClosurePoint?: boolean): GrowableXYZArray | undefined;
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     */
    static intersectRangeConvexPolygonInPlace(range: Range3d, xyz: GrowableXYZArray): GrowableXYZArray | undefined;
}
//# sourceMappingURL=ClipPlane.d.ts.map