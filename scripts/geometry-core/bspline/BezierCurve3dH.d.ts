import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Point4d } from "../geometry4d/Point4d";
import { Transform } from "../geometry3d/Transform";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { CurveLocationDetail } from "../curve/CurveLocationDetail";
import { StrokeOptions } from "../curve/StrokeOptions";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { BezierCurveBase } from "./BezierCurveBase";
import { Range3d } from "../geometry3d/Range";
/** 3d curve with homogeneous weights. */
export declare class BezierCurve3dH extends BezierCurveBase {
    isSameGeometryClass(other: any): boolean;
    /**
     * Apply (multiply by) an affine transform
     * @param transform
     */
    tryTransformInPlace(transform: Transform): boolean;
    /**
     * Apply (multiply by) a perspective transform
     * @param matrix
     */
    tryMultiplyMatrix4dInPlace(matrix: Matrix4d): void;
    private _workRay0;
    private _workRay1;
    /** Return a specific pole as a full `[x,y,z,x] Point4d` */
    getPolePoint4d(i: number, result?: Point4d): Point4d | undefined;
    /** Return a specific pole normalized to weight 1
     */
    getPolePoint3d(i: number, result?: Point3d): Point3d | undefined;
    /**
     * @returns true if all weights are within tolerance of 1.0
     */
    isUnitWeight(tolerance?: number): boolean;
    /**
     * Capture a polygon as the data for a new `BezierCurve3dH`
     * @param polygon complete packed data and order.
     */
    private constructor();
    /** Create a curve with given points.
     * * If input is `Point2d[]`, the points are promoted with `z=0` and `w=1`
     * * If input is `Point3d[]`, the points are promoted with w=1`
     *
     */
    static create(data: Point3d[] | Point4d[] | Point2d[]): BezierCurve3dH | undefined;
    /** create a bezier curve of specified order, filled with zeros */
    static createOrder(order: number): BezierCurve3dH;
    /** Load order * 4 doubles from data[3 * spanIndex] as poles (with added weight) */
    loadSpan3dPolesWithWeight(data: Float64Array, spanIndex: number, weight: number): void;
    /** Load order * 4 doubles from data[3 * spanIndex] as poles (with added weight) */
    loadSpan4dPoles(data: Float64Array, spanIndex: number): void;
    clone(): BezierCurve3dH;
    /**
     * Return a curve after transform.
     */
    cloneTransformed(transform: Transform): BezierCurve3dH;
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint4d(fraction: number, result?: Point4d): Point4d;
    /** Return the cartesian point and derivative vector. */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    isAlmostEqual(other: any): boolean;
    /**
     * Assess legnth and turn to determine a stroke count.
     * @param options stroke options structure.
     */
    strokeCount(options?: StrokeOptions): number;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Form dot products of each pole with given coefficients. Return as entries in products array.
     * @param products array of (scalar) dot products
     * @param ax x coefficient
     * @param ay y coefficient
     * @param az z coefficient
     * @param aw w coefficient
     */
    poleProductsXYZW(products: Float64Array, ax: number, ay: number, az: number, aw: number): void;
    /** Find the closest point within the bezier span, using true perpendicular test (but no endpoint test)
     * * If closer than previously recorded, update the CurveLocationDetail
     * * This assumes this bezier is saturated.
     * @param spacePoint point being projected
     * @param detail pre-allocated detail to record (evolving) closest point.
     * @returns true if an updated occured, false if either (a) no perpendicular projections or (b) perpendiculars were not closer.
     */
    updateClosestPointByTruePerpendicular(spacePoint: Point3d, detail: CurveLocationDetail): boolean;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
//# sourceMappingURL=BezierCurve3dH.d.ts.map