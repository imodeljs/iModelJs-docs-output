/** @module Bspline */
import { Point3d } from "../PointVector";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { KnotVector } from "./KnotVector";
import { LineString3d } from "../curve/LineString3d";
import { BezierCurve3dH, BezierCurveBase } from "./BezierCurve";
/** Bspline knots and poles for 1d-to-Nd. */
export declare class BSpline1dNd {
    knots: KnotVector;
    packedData: Float64Array;
    poleLength: number;
    readonly degree: number;
    readonly order: number;
    readonly numSpan: number;
    readonly numPoles: number;
    getPoint3dPole(i: number, result?: Point3d): Point3d | undefined;
    basisBuffer: Float64Array;
    poleBuffer: Float64Array;
    basisBuffer1: Float64Array;
    basisBuffer2: Float64Array;
    poleBuffer1: Float64Array;
    poleBuffer2: Float64Array;
    /**
     * initialize arrays for given spline dimensions.
     * @param numPoles number of poles
     * @param poleLength number of coordinates per pole (e.g.. 3 for 3D unweighted, 4 for 3d weighted, 2 for 2d unweighted, 3 for 2d weigthed)
     * @param order number of poles in support for a section of the bspline
     */
    protected constructor(numPoles: number, poleLength: number, order: number, knots: KnotVector);
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    static create(numPoles: number, poleLength: number, order: number, knots: KnotVector): BSpline1dNd | undefined;
    spanFractionToKnot(span: number, localFraction: number): number;
    evaluateBasisFunctionsInSpan(spanIndex: number, spanFraction: number, f: Float64Array, df?: Float64Array, ddf?: Float64Array): void;
    evaluateBuffersInSpan(spanIndex: number, spanFraction: number): void;
    evaluateBuffersInSpan1(spanIndex: number, spanFraction: number): void;
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBufferForSpan(spanIndex: number): void;
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBuffer1ForSpan(spanIndex: number): void;
    /** sum poles by the weights in the basisBuffer, using poles for given span */
    sumPoleBuffer2ForSpan(spanIndex: number): void;
    evaluateBuffersAtKnot(u: number, numDerivative?: number): void;
    reverseInPlace(): void;
}
/**
 * Base class for BSplineCurve3d and BSplineCurve3dH.
 * * The weighted variant has the problem that CurvePrimitive 3d typing does not allow undefined result where Point4d has zero weight.
 * * The convention for these is to return 000 in such places.
 */
export declare abstract class BSplineCurve3dBase extends CurvePrimitive {
    protected _bcurve: BSpline1dNd;
    protected constructor(poleDimension: number, numPoles: number, order: number, knots: KnotVector);
    readonly degree: number;
    readonly order: number;
    readonly numSpan: number;
    readonly numPoles: number;
    /**
   * return a simple array form of the knots.  optionally replicate the first and last
   * in classic over-clamped manner
   */
    copyKnots(includeExtraEndKnot: boolean): number[];
    /**
   * Set the flag indicating the bspline might be suitable for having wrapped "closed" interpretation.
   */
    setWrappable(value: boolean): void;
    /** Evaluate at a position given by fractional position within a span. */
    abstract evaluatePointInSpan(spanIndex: number, spanFraction: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by fractional position within a span. */
    abstract evaluatePointAndTangentInSpan(spanIndex: number, spanFraction: number, result?: Ray3d): Ray3d;
    /** Evaluate xyz at a position given by knot. */
    abstract knotToPoint(knot: number, result?: Point3d): Point3d;
    /** Evaluate xyz and derivative at position given by a knot value.  */
    abstract knotToPointAndDerivative(knot: number, result?: Ray3d): Ray3d;
    /** Evaluate xyz and 2 derivatives at position given by a knot value.  */
    abstract knotToPointAnd2Derivatives(knot: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
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
    startPoint(): Point3d;
    endPoint(): Point3d;
    reverseInPlace(): void;
    /**
     * Return an array with this curve's bezier fragments.
     */
    collectBezierSpans(prefer3dH: boolean): BezierCurveBase[];
    /**
      * Return a BezierCurveBase for this curve.  The concrete return type may be BezierCuve3d or BezierCurve3dH according to the instance type and the prefer3dH parameter.
      * @param spanIndex
      * @param prefer3dH true to force promotion to homogeneous.
      * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
      */
    abstract getSaturatedBezierSpan3dOr3dH(spanIndex: number, prefer3dH: boolean, result?: BezierCurveBase): BezierCurveBase | undefined;
}
export declare class BSplineCurve3d extends BSplineCurve3dBase {
    isSameGeometryClass(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    getPole(i: number, result?: Point3d): Point3d | undefined;
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
    static createUniformKnots(poles: Point3d[], order: number): BSplineCurve3d | undefined;
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
    clone(): BSplineCurve3d;
    cloneTransformed(transform: Transform): BSplineCurve3d;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex: number, spanFraction: number): Point3d;
    evaluatePointAndTangentInSpan(spanIndex: number, spanFraction: number): Ray3d;
    /** Evaluate at a positioni given by a knot value.  */
    knotToPoint(u: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u: number, result?: Ray3d): Ray3d;
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    isAlmostEqual(other: any): boolean;
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    quickLength(): number;
    emitStrokableParts(handler: IStrokeHandler, _options?: StrokeOptions): void;
    emitStrokes(dest: LineString3d, _options?: StrokeOptions): void;
    /**
     * return true if the spline is (a) unclamped with (degree-1) matching knot intervals,
     * (b) (degree-1) wrapped points,
     * (c) marked wrappable from construction time.
     */
    readonly isClosable: boolean;
    /**
     * Return a BezierCurveBase for this curve.  The concrete return type may be BezierCuve3d or BezierCurve3dH according to this type.
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
    setWrappable(value: boolean): void;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BSplineCurve.d.ts.map