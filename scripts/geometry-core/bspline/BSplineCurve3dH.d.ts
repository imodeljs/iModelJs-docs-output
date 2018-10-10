/** @module Bspline */
import { Point3d } from "../PointVector";
import { Point4d } from "../numerics/Geometry4d";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { BezierCurveBase } from "./BezierCurve";
import { BSplineCurve3dBase } from "./BSplineCurve";
/**
 * Weighted (Homogeneous) BSplineCurve in 3d
 */
export declare class BSplineCurve3dH extends BSplineCurve3dBase {
    isSameGeometryClass(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    getPole(i: number, result?: Point3d): Point3d | undefined;
    spanFractionToKnot(span: number, localFraction: number): number;
    private constructor();
    /** Return a simple array of arrays with the control points as `[[x,y,z,w],[x,y,z,w],..]` */
    copyPoints(): any[];
    /** Return a simple array of the control points coordinates */
    copyPointsFloat64Array(): Float64Array;
    /** Create a bspline with uniform knots. */
    static createUniformKnots(poles: Point3d[] | Point4d[], order: number): BSplineCurve3dH | undefined;
    /** Create a bspline with given knots.
     *
     * *  Two count conditions are recognized:
     *
     * ** If poleArray.length + order == knotArray.length, the first and last are assumed to be the
     *      extraneous knots of classic clamping.
     * ** If poleArray.length + order == knotArray.length + 2, the knots are in modern form.
     *
     */
    static create(poleArray: Float64Array | Point4d[], knotArray: Float64Array | number[], order: number): BSplineCurve3dH | undefined;
    clone(): BSplineCurve3dH;
    cloneTransformed(transform: Transform): BSplineCurve3dH;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointInSpan(spanIndex: number, spanFraction: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by fractional position within a span. */
    evaluatePointAndTangentInSpan(spanIndex: number, spanFraction: number, result?: Ray3d): Ray3d;
    /** Evaluate at a positioni given by a knot value. */
    knotToPoint(u: number, result?: Point3d): Point3d;
    /** Evaluate at a position given by a knot value.  */
    knotToPointAndDerivative(u: number, result?: Ray3d): Ray3d;
    /** Evaluate at a position given by a knot value.  Return point with 2 derivatives. */
    knotToPointAnd2Derivatives(u: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
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
     * Return a CurvePrimitive (which is a BezierCurve3dH) for a specified span of this curve.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dH(spanIndex: number, result?: BezierCurveBase): BezierCurveBase | undefined;
    /**
     * Return a BezierCurveBase for this curve.  Because BSplineCurve3dH is homogeneous, the returned BezierCurveBase is always homogeneous.
     * @param spanIndex
     * @param result optional reusable curve.  This will only be reused if it is a BezierCurve3d with matching order.
     */
    getSaturatedBezierSpan3dOr3dH(spanIndex: number, _prefer3dH: boolean, result?: BezierCurveBase): BezierCurveBase | undefined;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BSplineCurve3dH.d.ts.map