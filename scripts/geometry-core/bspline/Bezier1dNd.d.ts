import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Point4d } from "../geometry4d/Point4d";
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
    static create(data: Point2d[] | Point3d[] | Point4d[]): Bezier1dNd | undefined;
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
     * * Data is left "in place" in poleIndexA
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
    /**
     * Saturate a univaraite bspline coefficient array in place
     * * On input, the array is the coefficients one span of a bspline, packed in an array of `(knots.order)` values.
     * * These are modified in place, and on return are a bezier for the same knot interval.
     * @param coffs input as bspline coefficients, returned as bezier coefficients
     * @param knots knot vector
     * @param spanIndex index of span whose (unsaturated) poles are in the coefficients.
     * @param optional function for `setInterval (knotA, knotB)` call to announce knot limits.
     */
    static saturate1dInPlace(coffs: Float64Array, knots: KnotVector, spanIndex: number): boolean;
    /**
     * Apply deCasteljou interpolations to isolate a smaller bezier polygon, representing interval 0..fraction of the original
     * @param fracton "end" fraction for split.
     * @returns false if fraction is 0 -- no changes applied.
     */
    subdivideInPlaceKeepLeft(fraction: number): boolean;
    /**
     * Apply deCasteljou interpolations to isolate a smaller bezier polygon, representing interval 0..fraction of the original
     * @param fracton "end" fraction for split.
     * @returns false if fraction is 0 -- no changes applied.
     */
    subdivideInPlaceKeepRight(fraction: number): boolean;
    /**
     * Saturate a univaraite bspline coefficient array in place
     * @param fracton0 fracton for first split.   This is the start of the output polygon
     * @param fracton1 fracton for first split.   This is the start of the output polygon
     * @return false if fractions are (almost) identical.
     */
    subdivideToIntervalInPlace(fraction0: number, fraction1: number): boolean;
    /** optional interval for mapping to a parent object */
    interval?: Segment1d;
    /** create or update the mapping to parent curve. */
    setInterval(a: number, b: number): void;
    /** map a fraction to the parent space. */
    fractionToParentFraction(fraction: number): number;
}
//# sourceMappingURL=Bezier1dNd.d.ts.map