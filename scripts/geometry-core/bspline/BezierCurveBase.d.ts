/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Point4d } from "../geometry4d/Point4d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { IStrokeHandler } from "../geometry3d/GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { KnotVector } from "./KnotVector";
import { Bezier1dNd } from "./Bezier1dNd";
import { UnivariateBezier } from "../numerics/BezierPolynomials";
/**
 * Base class for CurvePrimitive (necessarily 3D) with _polygon.
 * * This has a Bezier1dNd polygon as a member, and implements dimension-independent methods
 * * This exists to support
 *    * BezierCurve3d -- 3 coordinates x,y,z per block in the Bezier1dNd poles
 *    * BezierCurve3dH -- 4 coordinates x,y,z,w per block in the Bezier1dNd poles
 * * The implementations of "pure 3d" queries is based on calling `getPolePoint3d`.
 * * This has the subtle failure difference that `getPolePoint3d` call with a valid index on on a 3d curve always succeeds, but on 3dH curve fails when weight is zero.
 * @public
 */
export declare abstract class BezierCurveBase extends CurvePrimitive {
    /** String name for schema properties */
    readonly curvePrimitiveType = "bezierCurve";
    /** Control points */
    protected _polygon: Bezier1dNd;
    /** scratch data blocks accessible by concrete class.   Initialized to correct blockSize in constructor. */
    protected _workData0: Float64Array;
    /** scratch data blocks accessible by concrete class.   Initialized to correct blockSize in constructor. */
    protected _workData1: Float64Array;
    /** Scratch xyz point accessible by derived classes. */
    protected _workPoint0: Point3d;
    /** Scratch xyz point accessible by derived classes. */
    protected _workPoint1: Point3d;
    protected constructor(blockSize: number, data: Float64Array);
    /** reverse the poles in place */
    reverseInPlace(): void;
    /** saturate the pole in place, using knot intervals from `spanIndex` of the `knotVector` */
    saturateInPlace(knotVector: KnotVector, spanIndex: number): boolean;
    /** (property accessor) Return the polynomial degree (one less than order) */
    readonly degree: number;
    /** (property accessor) Return the polynomial order */
    readonly order: number;
    /** (property accessor) Return the number of poles (aka control points) */
    readonly numPoles: number;
    /** Get pole `i` as a Point3d.
     * * For 3d curve, this is simple a pole access, and only fails (return `undefined`) for invalid index
     * * For 4d curve, this deweights the homogeneous pole and can fail due to 0 weight.
     */
    abstract getPolePoint3d(i: number, point?: Point3d): Point3d | undefined;
    /** Get pole `i` as a Point4d.
     * * For 3d curve, this accesses the simple pole and returns with weight 1.
     * * For 4d curve, this accesses the (weighted) pole.
     */
    abstract getPolePoint4d(i: number, point?: Point4d): Point4d | undefined;
    /** Set mapping to parent curve (e.g. if this bezier is a span extracted from a bspline, this is the knot interval of the span) */
    setInterval(a: number, b: number): void;
    /** map `fraction` from this Bezier curves inherent 0..1 range to the (a,b) range of parent
     * * ( The parent range should have been previously defined with `setInterval`)
     */
    fractionToParentFraction(fraction: number): number;
    /** append stroke points to a linestring, based on `strokeCount` and `fractionToPoint` from derived class*/
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** announce intervals with stroke counts */
    emitStrokableParts(handler: IStrokeHandler, _options?: StrokeOptions): void;
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray(): any[];
    /** return true if all poles are on a plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Return the length of the control polygon. */
    polygonLength(): number;
    /** Return the start point.  (first control point) */
    startPoint(): Point3d;
    /** Return the end point.  (last control point) */
    endPoint(): Point3d;
    /** Return the control polygon length as a quick length estimate. */
    quickLength(): number;
    /** Concrete classes must implement extendRange . . .  */
    abstract extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /**
     * 1D bezier coefficients for use in range computations.
     * @internal
     */
    protected _workBezier?: UnivariateBezier;
    /** scratch array for use by derived classes, using allocateAndZeroBezierWorkData for sizing. */
    protected _workCoffsA?: Float64Array;
    /** scratch array for use by derived classes, using allocateAndZeroBezierWorkData for sizing. */
    protected _workCoffsB?: Float64Array;
    /**
     * set up the _workBezier members with specific order.
     * * Try to reuse existing members if their sizes match.
     * * Ignore members corresponding to args that are 0 or negative.
     * @param primaryBezierOrder order of expected bezier
     * @param orderA length of _workCoffsA (simple array)
     * @param orderB length of _workCoffsB (simple array)
     */
    protected allocateAndZeroBezierWorkData(primaryBezierOrder: number, orderA: number, orderB: number): void;
    /**
     * Assess length and turn to determine a stroke count.
     * * this method is used by both BSplineCurve3d and BSplineCurve3dH.
     * * points are accessed via getPolePoint3d.
     *   * Hence a zero-weight pole will be a problem
     * @param options stroke options structure.
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
}
//# sourceMappingURL=BezierCurveBase.d.ts.map