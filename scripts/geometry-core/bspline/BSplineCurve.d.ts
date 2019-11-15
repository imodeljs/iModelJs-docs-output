/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { StrokeCountMap } from "../curve/Query/StrokeCountMap";
import { CurveLocationDetail } from "../curve/CurveLocationDetail";
import { StrokeOptions } from "../curve/StrokeOptions";
import { PlaneAltitudeEvaluator } from "../Geometry";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { GeometryHandler, IStrokeHandler } from "../geometry3d/GeometryHandler";
import { KnotVector, BSplineWrapMode } from "./KnotVector";
import { LineString3d } from "../curve/LineString3d";
import { BezierCurveBase } from "./BezierCurveBase";
import { BezierCurve3dH } from "./BezierCurve3dH";
import { BSpline1dNd } from "./BSpline1dNd";
import { Point4d } from "../geometry4d/Point4d";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
/**
 * Base class for BSplineCurve3d and BSplineCurve3dH.
 * * A bspline curve consists of a set of knots and a set of poles.
 * * The bspline curve is a function of the independent "knot axis" variable
 * * The curve "follows" the poles loosely.
 * * The is a set of polynomial spans.
 * * The polynomial spans all have same `degree`.
 * * Within each span, the polynomial of that `degree` is controlled by `order = degree + 1` contiguous points called poles.
 * * The is a strict relationship between knot and poles counts:  `numPoles + order = numKnots + 2'
 * * The number of spans is `numSpan = numPoles - degree`
 * * For a given `spanIndex`:
 *   * The `order` poles begin at index `spanIndex`.
 *   * The `2*order` knots begin as span index
 *   * The knot interval for this span is from `knot[degree+span-1] to knot[degree+span]`
 * * The active part of the knot axis is `knot[degree-1] < knot < knot[degree-1 + numSpan]` i.e. `knot[degree-1] < knot < knot[numPoles]
 *
 * Nearly all bsplines are "clamped ".
 * * Clamping make the curve pass through its first and last poles, with tangents directed along the first and last edges of the control polygon.
 * * The knots for a clamped bspline have `degree` copies of the lowest knot value and `degree` copies of the highest knot value.
 * * For instance, the knot vector `[0,0,0,1,2,3,3,3]
 *   * can be evaluated from `0<=knot<=3`
 *   * has 3 spans: 0 to 1, 1 to 2, 2 to 3
 *   * has 6 poles
 *   * passes through its first and last poles.
 * * `create` methods may allow classic convention that has an extra knot at the beginning and end of the knot vector.
 *   * The extra knots (first and last) were never referenced by the bspline recurrence relations.
 *   * When the `create` methods recognize the classic setup (`numPoles + order = numKnots`), the extra knot is not saved with the BSplineCurve3dBase knots.
 *
 * * The weighted variant has the problem that CurvePrimitive 3d typing does not allow undefined result where Point4d has zero weight.
 * * The convention for these is to return 000 in such places.
 *
 * * Note the class relationships:
 *   * BSpline1dNd knows the bspline recurrence relations for control points (poles) with no physical meaning.
 *   * BsplineCurve3dBase owns a protected BSpline1dNd
 *   * BsplineCurve3dBase is derived from CurvePrimitive, which creates obligation to act as a 3D curve, such as
 *     * evaluate fraction to point and derivatives wrt fraction
 *     * compute intersection with plane
 *   * BSplineCurve3d and BSplineCurve3dH have variant logic driven by whether or not there are "weights" on the poles.
 *     * For `BSplineCurve3d`, the xyz value of pole calculations are "final" values for 3d evaluation
 *     * For `BSplineCurve3dH`, various `BSpline1dNd` results with xyzw have to be normalized back to xyz.
 *
 * * These classes do not support "periodic" variants.
 *   * Periodic curves need to have certain leading knots and poles replicated at the end
 * @public
 */
export declare abstract class BSplineCurve3dBase extends CurvePrimitive {
    /** String name for schema properties */
    readonly curvePrimitiveType = "bsplineCurve";
    /** The underlying blocked-pole spline, with simple x,y,z poles */
    protected _bcurve: BSpline1dNd;
    protected constructor(poleDimension: number, numPoles: number, order: number, knots: KnotVector);
    /** Return the degree (one less than the order) of the curve */
    readonly degree: number;
    /** Return the order (one more than degree) of the curve */
    readonly order: number;
    /** Return the number of bezier spans in the curve.  Note that this number includes the number of null spans at repeated knows */
    readonly numSpan: number;
    /** Return the number of poles */
    readonly numPoles: number;
    /**
   * return a simple array form of the knots.  optionally replicate the first and last
   * in classic over-clamped manner
   */
    copyKnots(includeExtraEndKnot: boolean): number[];
    /**
   * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
   */
    setWrappable(value: BSplineWrapMode): void;
    /** Evaluate at a position given by fractional position within a span. */
    abstract evaluatePointInSpan(spanIndex: number, spanFraction: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by fractional position within a span. */
    abstract evaluatePointAndDerivativeInSpan(spanIndex: number, spanFraction: number, result?: Ray3d): Ray3d;
    /** Evaluate xyz at a position given by knot. */
    abstract knotToPoint(knot: number, result?: Point3d): Point3d;
    /** Evaluate xyz and derivative at position given by a knot value.  */
    abstract knotToPointAndDerivative(knot: number, result?: Ray3d): Ray3d;
    /** Evaluate xyz and 2 derivatives at position given by a knot value.  */
    abstract knotToPointAnd2Derivatives(knot: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Evaluate the curve point at `fraction` */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Construct a ray with
     * * origin at the fractional position along the arc
     * * direction is the first derivative, i.e. tangent along the curve
     */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the curve
     * * y axis is the second derivative
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Return the start point of the curve.
     */
    startPoint(): Point3d;
    /**
     * Return the end point of the curve
     */
    endPoint(): Point3d;
    /** Reverse the curve in place.
     * * Poles are reversed
     * * knot values are mirrored around the middle of the
     */
    reverseInPlace(): void;
    /**
     * Return an array with this curve's bezier fragments.
     */
    collectBezierSpans(prefer3dH: boolean): BezierCurveBase[];
    /**
      * Return a BezierCurveBase for this curve.  The concrete return type may be BezierCurve3d or BezierCurve3dH according to the instance type and the prefer3dH parameter.
      * @param spanIndex
      * @param prefer3dH true to force promotion to homogeneous.
      * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
      */
    abstract getSaturatedBezierSpan3dOr3dH(spanIndex: number, prefer3dH: boolean, result?: BezierCurveBase): BezierCurveBase | undefined;
    /** Return a specified pole as a Point4d.
     * * BSplineCurve3d appends weight 1 to its xyz
     * * BSplineCurve3dH with pole whose "normalized" point is (x,y,z) but has weight w returns its weighted (wx,wy,wz,w)
     */
    abstract getPolePoint4d(poleIndex: number, result?: Point4d): Point4d | undefined;
    /** Return a specified pole as a Point3d
     * * BSplineCurve3d returns its simple xyz
     * * BSplineCurve3dH attempts to normalize its (wx,wy,wz,w) back to (x,y,z), and returns undefined if weight is zero.
     * @param poleIndex
     * @param result optional result
     */
    abstract getPolePoint3d(poleIndex: number, result?: Point3d): Point3d | undefined;
    /** Given a pole index, return the starting index for the contiguous array. */
    poleIndexToDataIndex(poleIndex: number): number | undefined;
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible)
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint: Point3d, _extend: boolean): CurveLocationDetail | undefined;
    /** Implement `CurvePrimitive.appendPlaneIntersections`
     * @param plane A plane (e.g. specific type Plane3dByOriginAndUnitNormal or Point4d)
     * @param result growing array of plane intersections
     * @return number of intersections appended to the array.
    */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
}
/**
 * A BSplineCurve3d is a bspline curve whose poles are Point3d.
 * See BSplineCurve3dBase for description of knots, order, degree.
 * @public
 */
export declare class BSplineCurve3d extends BSplineCurve3dBase {
    private _workBezier?;
    private initializeWorkBezier;
    /** test of `other` is an instance of BSplineCurve3d */
    isSameGeometryClass(other: any): boolean;
    /** Apply `transform` to the poles. */
    tryTransformInPlace(transform: Transform): boolean;
    /** Get a pole as simple Point3d. */
    getPolePoint3d(poleIndex: number, result?: Point3d): Point3d | undefined;
    /** Get a pole as Point4d with weight 1 */
    getPolePoint4d(poleIndex: number, result?: Point4d): Point4d | undefined;
    /** Convert  `spanIndex` and `localFraction` to a knot. */
    spanFractionToKnot(span: number, localFraction: number): number;
    private constructor();
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPoints(): any[];
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array(): Float64Array;
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(includeExtraEndKnot: boolean): number[];
    /** Create a bspline with uniform knots. */
    static createUniformKnots(poles: Point3d[] | Float64Array | GrowableXYZArray, order: number): BSplineCurve3d | undefined;
    /** Create a bspline with given knots.
     *
     * *  Two count conditions are recognized:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static create(poleArray: Float64Array | Point3d[], knotArray: Float64Array | number[], order: number): BSplineCurve3d | undefined;
    /** Return a deep clone */
    clone(): BSplineCurve3d;
    /** Return a transformed deep clone. */
    cloneTransformed(transform: Transform): BSplineCurve3d;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex: number, spanFraction: number): Point3d;
    /** Evaluate point and derivative vector at a position given by fractional position within a span.
     * * The derivative is with respect to the span fraction (NOT scaled to either global fraction or knot)
     */
    evaluatePointAndDerivativeInSpan(spanIndex: number, spanFraction: number): Ray3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPoint(u: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u: number, result?: Ray3d): Ray3d;
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** Evaluate the curve point at a fractional of the entire knot range. */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Evaluate the curve point at a fractional of the entire knot range. */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** test if almost the same curve as `other` */
    isAlmostEqual(other: any): boolean;
    /** test if this curve is entirely within plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Return the control polygon length as approximation (always overestimate) of the curve length. */
    quickLength(): number;
    /** Emit beziers or strokes (selected by the stroke options) to the handler. */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * Assess length and turn to determine a stroke count.
     * @param options stroke options structure.
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /**
     * Compute individual segment stroke counts.  Attach in a StrokeCountMap.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap evolving parent map.
     * @alpha
     */
    computeAndAttachRecursiveStrokeCounts(options?: StrokeOptions, parentStrokeMap?: StrokeCountMap): void;
    /** Append strokes to a linestring. */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /**
     * Test knots, control points, and wrappable flag to see if all agree for a possible wrapping.
     * @returns the manner of closing.   Se BSplineWrapMode for particulars of each mode.
     *
     */
    readonly isClosable: BSplineWrapMode;
    /**
     * Return a BezierCurveBase for this curve.  The concrete return type may be BezierCurve3d or BezierCurve3dH according to this type.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dOr3dH(spanIndex: number, prefer3dH: boolean, result?: BezierCurveBase): BezierCurveBase | undefined;
    /**
     * Return a CurvePrimitive (which is a BezierCurve3d) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3d(spanIndex: number, result?: BezierCurveBase): BezierCurveBase | undefined;
    /**
     * Return a CurvePrimitive (which is a BezierCurve3dH) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dH(spanIndex: number, result?: BezierCurveBase): BezierCurve3dH | undefined;
    /**
     * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
     */
    setWrappable(value: BSplineWrapMode): void;
    /** Second step of double dispatch:  call `handler.handleBSplineCurve3d(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Extend a range so in includes the range of this curve
     * * REMARK: this is based on the poles, not the exact curve.  This is generally larger than the true curve range.
     * @param rangeToExtend
     * @param transform transform to apply to points as they are entered into the range.
     */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BSplineCurve.d.ts.map