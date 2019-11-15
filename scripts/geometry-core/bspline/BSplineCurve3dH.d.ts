/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Point4d } from "../geometry4d/Point4d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { GeometryHandler, IStrokeHandler } from "../geometry3d/GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { BezierCurveBase } from "./BezierCurveBase";
import { BSplineCurve3dBase } from "./BSplineCurve";
import { StrokeCountMap } from "../curve/Query/StrokeCountMap";
/**
 * Weighted (Homogeneous) BSplineCurve in 3d
 * @public
 */
export declare class BSplineCurve3dH extends BSplineCurve3dBase {
    private _workBezier?;
    private initializeWorkBezier;
    /** Test if `other` is an instance of `BSplineCurve3dH` */
    isSameGeometryClass(other: any): boolean;
    /** Apply `transform` to the curve */
    tryTransformInPlace(transform: Transform): boolean;
    /** Get a pole, normalized to Point3d. */
    getPolePoint3d(poleIndex: number, result?: Point3d): Point3d | undefined;
    /** Get a pole as Point4d */
    getPolePoint4d(poleIndex: number, result?: Point4d): Point4d | undefined;
    /** map a spanIndex and fraction to a knot value. */
    spanFractionToKnot(span: number, localFraction: number): number;
    private constructor();
    /** Return a simple array of arrays with the control points as `[[x,y,z,w],[x,y,z,w],..]` */
    copyPoints(): any[];
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array(): Float64Array;
    /** Create a bspline with uniform knots.
     * * Control points may be supplied as:
     *   * array of Point4d, with weight already multiplied into the `[wx,wy,wz,w]`
     *   * array of Point3d, with implied weight 1.
     *   * Float64Array, blocked as xyzw, i.e. 4 doubles per control point.
     * @param controlPoints pole data in array form as noted above.
     * @param order  curve order (1 more than degree)
     */
    static createUniformKnots(controlPoints: Point3d[] | Point4d[] | Float64Array, order: number): BSplineCurve3dH | undefined;
    /** Create a bspline with given knots.
     *
     * *  Two count conditions are recognized:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static create(controlPoints: Float64Array | Point4d[] | Point3d[], knotArray: Float64Array | number[], order: number): BSplineCurve3dH | undefined;
    /** Return a deep clone of this curve. */
    clone(): BSplineCurve3dH;
    /** Clone the curve and apply a transform to the clone. */
    cloneTransformed(transform: Transform): BSplineCurve3dH;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex: number, spanFraction: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointAndDerivativeInSpan(spanIndex: number, spanFraction: number, result?: Ray3d): Ray3d;
    /** Evaluate at a position given by a knot value. */
    knotToPoint(u: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u: number, result?: Ray3d): Ray3d;
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /** test if the curve is almost equal to `other` */
    isAlmostEqual(other: any): boolean;
    /** Test if the curve is entirely within a plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** Return the control polygon length as quick approximation to the curve length. */
    quickLength(): number;
    /** call a handler with interval data for stroking. */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    /**  Append stroked approximation of this curve to the linestring. */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /**
     * Assess length and turn to determine a stroke count.
     * @param options stroke options structure.
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /**
     * Compute individual segment stroke counts.  Attach in a StrokeCountMap.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap evolving parent map.
     */
    computeAndAttachRecursiveStrokeCounts(options?: StrokeOptions, parentStrokeMap?: StrokeCountMap): void;
    /**
     * return true if the spline is (a) unclamped with (degree-1) matching knot intervals,
     * (b) (degree-1) wrapped points,
     * (c) marked wrappable from construction time.
     */
    readonly isClosable: boolean;
    /**
     * Return a CurvePrimitive (which is a BezierCurve3dH) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dH(spanIndex: number, result?: BezierCurveBase): BezierCurveBase | undefined;
    /**
     * Return a BezierCurveBase for this curve.  Because BSplineCurve3dH is homogeneous, the returned BezierCurveBase is always homogeneous.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3dH with matching order.
     */
    getSaturatedBezierSpan3dOr3dH(spanIndex: number, _prefer3dH: boolean, result?: BezierCurveBase): BezierCurveBase | undefined;
    /** Second step of double dispatch:  call `handler.handleBSplineCurve3dH(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Extend a range so in includes the range of this curve
     * * REMARK: this is based on the poles, not the exact curve.  This is generally larger than the true curve range.
     * @param rangeToExtend
     * @param transform transform to apply to points as they are entered into the range.
     */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BSplineCurve3dH.d.ts.map