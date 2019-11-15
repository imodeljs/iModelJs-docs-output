/** @module Curve */
import { BeJSONFunctions, PlaneAltitudeEvaluator } from "../Geometry";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { GeometryHandler, IStrokeHandler } from "../geometry3d/GeometryHandler";
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive, AnnounceNumberNumberCurvePrimitive } from "./CurvePrimitive";
import { VariantCurveExtendParameter } from "./CurveExtendMode";
import { GeometryQuery } from "./GeometryQuery";
import { CurveLocationDetail } from "./CurveLocationDetail";
import { LineString3d } from "./LineString3d";
import { Clipper } from "../clipping/ClipUtils";
/**
 * A LineSegment3d is:
 *
 * * A 3d line segment represented by its start and end coordinates
 *   * startPoint
 *   * endPoint
 * * The segment is parameterized with fraction 0 at the start and fraction 1 at the end, i.e. either of these equivalent forms to map fraction `f` to a point `X(f)`
 *   *  `X(f) = startPoint + f * (endPoint - startPoint)`
 *   * `X(f) = (1-f)*startPoint  + f * endPoint`
 * @public
 */
export declare class LineSegment3d extends CurvePrimitive implements BeJSONFunctions {
    /** String name for schema properties */
    readonly curvePrimitiveType = "lineSegment";
    /** test if `other` is of class `LineSegment3d` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _point0;
    private _point1;
    /** Return REFERENCE to the start point of this segment.
     * * (This is distinct from the `CurvePrimitive` abstract method `endPoint()` which creates a returned point
     */
    readonly point0Ref: Point3d;
    /** Return REFERENCE to the end point of this segment.
     * * (This is distinct from the `CurvePrimitive` abstract method `endPoint()` which creates a returned point
     */
    readonly point1Ref: Point3d;
    /**
     * A LineSegment3d extends along its infinite line.
     */
    readonly isExtensibleFractionSpace: boolean;
    /**
     * CAPTURE point references as a `LineSegment3d`
     * @param point0
     * @param point1
     */
    private constructor();
    /** Set the start and endpoints by capturing input references. */
    setRefs(point0: Point3d, point1: Point3d): void;
    /** Set the start and endpoints by cloning the input parameters. */
    set(point0: Point3d, point1: Point3d): void;
    /** copy (clone) data from other */
    setFrom(other: LineSegment3d): void;
    /** Return a (clone of) the start point. (This is NOT a reference to the stored start point) */
    startPoint(result?: Point3d): Point3d;
    /** Return a (clone of) the end point. (This is NOT a reference to the stored end point) */
    endPoint(result?: Point3d): Point3d;
    /** Return the point and derivative vector at fractional position along the line segment. */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the line segment
     * * x axis is the first derivative, i.e. along the line segment
     * * y axis is the second derivative, i.e. 000
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Clone the LineSegment3d */
    clone(): LineSegment3d;
    /** Clone and apply transform to the clone. */
    cloneTransformed(transform: Transform): CurvePrimitive;
    /** Create with start and end points.  The point contents are cloned into the LineSegment3d. */
    static create(point0: Point3d, point1: Point3d, result?: LineSegment3d): LineSegment3d;
    /** Create with start and end points.  The point contents are CAPTURED into the result */
    static createCapture(point0: Point3d, point1: Point3d): LineSegment3d;
    /** create a LineSegment3d from xy coordinates of start and end, with common z.
     * @param x0 start point x coordinate.
     * @param y0 start point y coordinate.
     * @param x1 end point x coordinate.
     * @param y1 end point y coordinate.
     * @param z z coordinate to use for both points.
     * @param result optional existing LineSegment to be reinitialized.
     */
    static createXYXY(x0: number, y0: number, x1: number, y1: number, z?: number, result?: LineSegment3d): LineSegment3d;
    /** create a LineSegment3d from xy coordinates of start and end, with common z.
     * @param x0 start point x coordinate.
     * @param y0 start point y coordinate.
     * @param x1 end point x coordinate.
     * @param y1 end point y coordinate.
     * @param z z coordinate to use for both points.
     * @param result optional existing LineSegment to be reinitialized.
     */
    static createXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, result?: LineSegment3d): LineSegment3d;
    /** Return the point at fractional position along the line segment. */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Return the length of the segment. */
    curveLength(): number;
    /** Return the length of the partial segment between fractions. */
    curveLengthBetweenFractions(fraction0: number, fraction1: number): number;
    /** Return the length of the segment. */
    quickLength(): number;
    /**
     * Returns a curve location detail with both xyz and fractional coordinates of the closest point.
     * @param spacePoint point in space
     * @param extend if false, only return points within the bounded line segment. If true, allow the point to be on the unbounded line that contains the bounded segment.
     */
    closestPoint(spacePoint: Point3d, extend: VariantCurveExtendParameter, result?: CurveLocationDetail): CurveLocationDetail;
    /** swap the endpoint references. */
    reverseInPlace(): void;
    /** Transform the two endpoints of this LinSegment. */
    tryTransformInPlace(transform: Transform): boolean;
    /** Test if both endpoints are in a plane (within tolerance) */
    isInPlane(plane: PlaneAltitudeEvaluator): boolean;
    /** Compute points of simple (transverse) with a plane.
     * * Use isInPlane to test if the line segment is completely in the plane.
     */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
    /**
     * Extend a range to include the (optionally transformed) line segment
     * @param range range to extend
     * @param transform optional transform to apply to the end points
     */
    extendRange(range: Range3d, transform?: Transform): void;
    /**
     * Construct a line from either of these json forms:
     *
     * * object with named start and end:
     * `{startPoint: pointValue, endPoint: pointValue}`
     * * array of two point values:
     * `[pointValue, pointValue]`
     * The point values are any values accepted by the Point3d method setFromJSON.
     * @param json data to parse.
     */
    setFromJSON(json?: any): void;
    /** A simple line segment's fraction and distance are proportional. */
    getFractionToDistanceScale(): number | undefined;
    /**
     * Place the lineSegment3d start and points in a json object
     * @return {*} [[x,y,z],[x,y,z]]
     */
    toJSON(): any;
    /** Create a new `LineSegment3d` with coordinates from json object.   See `setFromJSON` for object layout description. */
    static fromJSON(json?: any): LineSegment3d;
    /** Near equality test with `other`. */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /** Second step of double dispatch:  call `handler.handleLineSegment3d(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Find intervals of this curve primitive that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     */
    announceClipIntervals(clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Return (if possible) a curve primitive which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA: number, fractionB: number): CurvePrimitive | undefined;
}
//# sourceMappingURL=LineSegment3d.d.ts.map