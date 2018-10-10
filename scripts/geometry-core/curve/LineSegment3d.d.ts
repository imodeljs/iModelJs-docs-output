/** @module Curve */
import { BeJSONFunctions, PlaneAltitudeEvaluator } from "../Geometry";
import { Point3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Plane3dByOriginAndUnitNormal, Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { StrokeOptions } from "../curve/StrokeOptions";
import { CurvePrimitive, GeometryQuery, CurveLocationDetail, AnnounceNumberNumberCurvePrimitive } from "./CurvePrimitive";
import { LineString3d } from "./LineString3d";
import { Clipper } from "../clipping/ClipUtils";
/**
 * A LineSegment3d is:
 *
 * * A 3d line segment represented by
 *
 * ** startPoint
 * ** endPoint
 * parameterized with fraction 0 at the start and fraction 1 at the end, i.e. either of these equivalent forms:
 *
 * **  `X(f) = startPoint + f * (endPoint - startPoint)`
 * ** `X(f) = (1-f)*startPoint  + f * endPoint`
 */
export declare class LineSegment3d extends CurvePrimitive implements BeJSONFunctions {
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _point0;
    private _point1;
    readonly point0Ref: Point3d;
    readonly point1Ref: Point3d;
    private constructor();
    /** Set the start and endpoints by capturing input references. */
    setRefs(point0: Point3d, point1: Point3d): void;
    /** Set the start and endponits by cloning the input parameters. */
    set(point0: Point3d, point1: Point3d): void;
    /** copy (clone) data from other */
    setFrom(other: LineSegment3d): void;
    /** @returns Return a (clone of) the start point. */
    startPoint(result?: Point3d): Point3d;
    /** @returns Return a (clone of) the end point. */
    endPoint(result?: Point3d): Point3d;
    /** @returns Return the point at fractional position along the line segment. */
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
    /** Create with start and end points.  The ponit contents are cloned into the LineSegment3d. */
    static create(point0: Point3d, point1: Point3d, result?: LineSegment3d): LineSegment3d;
    /** create a LineSegment3d from xy coordinates of start and end, with common z.
     * @param x0 start point x coordinate.
     * @param y0 start point y coordinate.
     * @param x1 end point x coordinate.
     * @param y1 end point y coordinate.
     * @param z z coordinate to use for both points.
     * @param result optional existing LineSegment to be reinitiazlized.
     */
    static createXYXY(x0: number, y0: number, x1: number, y1: number, z?: number, result?: LineSegment3d): LineSegment3d;
    /** create a LineSegment3d from xy coordinates of start and end, with common z.
     * @param x0 start point x coordinate.
     * @param y0 start point y coordinate.
     * @param x1 end point x coordinate.
     * @param y1 end point y coordinate.
     * @param z z coordinate to use for both points.
     * @param result optional existing LineSegment to be reinitiazlized.
     */
    static createXYZXYZ(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, result?: LineSegment3d): LineSegment3d;
    /** @returns Return the point at fractional position along the line segment. */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    curveLength(): number;
    quickLength(): number;
    /**
     * @param spacePoint point in space
     * @param extend if false, only return points within the bounded line segment. If true, allow the point to be on the unbounded line that contains the bounded segment.
     * @returns Returns a curve location detail with both xyz and fractional coordinates of the closest point.
     */
    closestPoint(spacePoint: Point3d, extend: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    reverseInPlace(): void;
    tryTransformInPlace(transform: Transform): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
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
    /**
     * Place the lineSegment3d start and points in a json object
     * @return {*} [[x,y,z],[x,y,z]]
     */
    toJSON(): any;
    static fromJSON(json?: any): LineSegment3d;
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Find intervals of this curveprimitve that are interior to a clipper
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