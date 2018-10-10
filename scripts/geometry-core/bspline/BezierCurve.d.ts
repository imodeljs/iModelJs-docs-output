/** @module Bspline */
import { Point3d, Point2d, Segment1d } from "../PointVector";
import { Point4d, Matrix4d } from "../numerics/Geometry4d";
import { Range3d } from "../Range";
import { Transform } from "../Transform";
import { Ray3d, Plane3dByOriginAndVectors } from "../AnalyticGeometry";
import { CurvePrimitive, CurveLocationDetail } from "../curve/CurvePrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../AnalyticGeometry";
import { GeometryHandler, IStrokeHandler } from "../GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { KnotVector } from "./KnotVector";
/**
 * Implements a multidimensional bezier curve of fixed order.
 * BezierCurve3d implements with blockSize 3.
 * BezierCurve3dH implements with blockSize 4.
 */
export declare class Bezier1dNd {
    private _packedData;
    private _order;
    private _blockSize;
    private _basis;
    constructor(blockSize: number, polygon: Float64Array);
    /** return a clone of the data array */
    clonePolygon(result?: Float64Array): Float64Array;
    /** Return the bezier order */
    readonly order: number;
    /** return the packed data array.  This is a REFERENCE to the array. */
    readonly packedData: Float64Array;
    /** Create a Bezier1dNd, using the structure of `data[0]` to determine the beizer order. */
    create(data: Point2d[] | Point3d[] | Point4d[]): Bezier1dNd | undefined;
    /** Return the curve value at bezier fraction `s`
     * @return buffer of length `blockSize`.
    */
    evaluate(s: number, buffer?: Float64Array): Float64Array;
    /** Return the curve derivative value at bezier fraction `s`
    * @return buffer of length `blockSize`.
    */
    evaluateDerivative(s: number, buffer?: Float64Array): Float64Array;
    /** get a single point of the polygon as a simple array.  */
    getPolygonPoint(i: number, buffer?: Float64Array): Float64Array | undefined;
    /** set a single point of the polygon as a simple array.  */
    setPolygonPoint(i: number, buffer: Float64Array): void;
    /** Load order * dimension doubles from data[dimension * spanIndex] as poles
     * @param data packed source array.  block size in `data` assumed to match dimension for this.
     * @param spanIndex block index in data.
     */
    loadSpanPoles(data: Float64Array, spanIndex: number): void;
    /** Load order * (dataDimension + 1)  doubles from data[dataDimension * spanIndex] as poles with weight inserted
     * @param data packed array of data.
     * @param dataDimension dimension of data. Must have `dataDimension+1=this.order`
     * @param spanIndex index of first data block to access.
     * @param weight weight to append to each block
     */
    loadSpanPolesWithWeight(data: Float64Array, dataDimension: number, spanIndex: number, weight: number): void;
    /**  return a json array of arrays with each control point as a lower level array of numbers */
    unpackToJsonArrays(): any[];
    /** equality test with usual metric tolerances */
    isAlmostEqual(other: any): boolean;
    /** block-by-block reversal */
    reverseInPlace(): void;
    /**
     * interpolate at `fraction` between poleA and poleB.
     * @param poleIndexA first pole index
     * @param fraction fractional position
     * @param poleIndexB second pole index
     */
    interpolatePoleInPlace(poleIndexA: number, fraction: number, poleIndexB: number): void;
    /**
     *
     * @param knots
     * @param spanIndex index of span whose (unsaturated) poles are in the bezie.
     * @param optional function for `setInterval (knotA, knotB)` call to announce knot limits.
     */
    saturateInPlace(knots: KnotVector, spanIndex: number): boolean;
    /** optional interval for mapping to a parent object */
    interval?: Segment1d;
    /** create or update the mapping to parent curve. */
    setInterval(a: number, b: number): void;
    /** map a fraction to the parent space. */
    fractionToParentFraction(fraction: number): number;
}
/**
 * Base class for CurvePrimitve (necessarily 3D) with _polygon.
 * * This has a Bezier1dNd polygon as a member, and implements dimension-indendent methods
 * * This exists to support BezeierCurve3d and BezierCurve3dH.
 * * The implementations of "pure 3d" queries is based on calling `getPolePoint3d`.
 * * This has the subtle failure difference that `getPolePoint3d` call with a valid index on on a 3d curve always succeeds, but on 3dH curve fails when weight is zero.
 */
export declare abstract class BezierCurveBase extends CurvePrimitive {
    protected _polygon: Bezier1dNd;
    /** data blocks accessible by concrete class.   Initialized to correct blockSize in constructor. */
    protected _workData0: Float64Array;
    protected _workData1: Float64Array;
    /**
     * *_workPoint0 and _workPoint1 are conventional 3d points
     * * create by constructor
     * * accessbile by derived classes
     * */
    protected _workPoint0: Point3d;
    protected _workPoint1: Point3d;
    protected constructor(blockSize: number, data: Float64Array);
    /** reverse the poles in place */
    reverseInPlace(): void;
    /** saturate the pole in place, using knot intervals from `spanIndex` of the `knotVector` */
    saturateInPlace(knotVector: KnotVector, spanIndex: number): boolean;
    readonly degree: number;
    readonly order: number;
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
    setInterval(a: number, b: number): void;
    fractionToParentFraction(fraction: number): number;
    /** Return a stroke count appropriate for given stroke options. */
    abstract strokeCount(options?: StrokeOptions): number;
    /** append stroke points to a linestring, based on `strokeCount` and `fractionToPoint` from derived class*/
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** announce intervals with stroke counts */
    emitStrokableParts(handler: IStrokeHandler, _options?: StrokeOptions): void;
    /** return true if all poles are on a plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    polygonLength(): number;
    startPoint(): Point3d;
    endPoint(): Point3d;
    quickLength(): number;
    /** Extend range by all poles.  */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
}
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
     * */
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
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPointsAsJsonArrays(): any[];
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
    dispatchToGeometryHandler(_handler: GeometryHandler): any;
    /**
     * Form dot products of each pole with given coefficients. Return as entries in products array.
     * @param products array of (scalar) dot products
     * @param ax x coefficient
     * @param ay y coefficient
     * @param az z coefficient
     * @param aw w coefficient
     */
    poleProductsXYZW(products: Float64Array, ax: number, ay: number, az: number, aw: number): void;
    private _workBezier?;
    private _workCoffsA?;
    private _workCoffsB?;
    /**
     * set up the _workBezier members with specific order.
     * * Try to reuse existing members if their sizes match.
     * * Ignore members corresponding to args that are 0 or negative.
     * @param primaryBezierOrder order of expected bezier
     * @param orderA length of _workCoffsA (simple array)
     * @param orderB length of _workdCoffsB (simple array)
     */
    private allocateAndZeroBezierWorkData;
    /** Find the closest point within the bezier span, using true perpendicular test (but no endpoint test)
     * * If closer than previously recorded, update the CurveLocationDetail
     * * This assumes this bezier is saturated.
     * @param spacePoint point being projected
     * @param detail pre-allocated detail to record (evolving) closest point.
     * @returns true if an updated occured, false if either (a) no perpendicular projections or (b) perpendiculars were not closer.
     */
    updateClosestPointByTruePerpendicular(spacePoint: Point3d, detail: CurveLocationDetail): boolean;
}
/** 3d curve (unweighted) */
export declare class BezierCurve3d extends BezierCurveBase {
    isSameGeometryClass(other: any): boolean;
    tryTransformInPlace(transform: Transform): boolean;
    private _workRay0;
    private _workRay1;
    /** Return a specific pole as a full `[x,y,z] Point3d` */
    getPolePoint3d(i: number, result?: Point3d): Point3d | undefined;
    /** Return a specific pole as a full `[w*x,w*y,w*z, w] Point4d` */
    getPolePoint4d(i: number, result?: Point4d): Point4d | undefined;
    /**
     * Capture a polygon as the data for a new `BezierCurve3d`
     * @param polygon complete packed data and order.
     */
    private constructor();
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray(): any[];
    /** Return poles as a linestring */
    copyPointsAsLineString(): LineString3d;
    /** Create a curve with given points.
     * * If input is `Point2d[]`, the points are promoted with `z=0` and `w=1`
     * * If input is `Point3d[]`, the points are promoted with w=1`
     *
     */
    static create(data: Point3d[] | Point2d[]): BezierCurve3d | undefined;
    /** create a bezier curve of specified order, filled with zeros */
    static createOrder(order: number): BezierCurve3d;
    /** Load order * 3 doubles from data[3 * spanIndex] as poles */
    loadSpanPoles(data: Float64Array, spanIndex: number): void;
    clone(): BezierCurve3d;
    /**
     * Return a curve after transform.
     */
    cloneTransformed(transform: Transform): BezierCurve3d;
    /** Return a (deweighted) point on the curve. If deweight fails, returns 000 */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
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
    /**
     * convert to bspline curve and dispatch to handler
     * @param handler handelr to receive strongly typed geometry
     */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=BezierCurve.d.ts.map