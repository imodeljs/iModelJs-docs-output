/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { KnotVector, BSplineWrapMode } from "./KnotVector";
/** Bspline knots and poles for 1d-to-Nd.
 * * The "pole" (aka control point) of this class is a block of `poleLength` numbers.
 * * Derived classes (not this class) assign meaning such as x,y,z,w.
 * * for instance, an instance of this class with `poleLength===3` does not know if its poles are x,y,z or weighed 2D x,y,w
 * @public
 */
export declare class BSpline1dNd {
    /** knots of the bspline */
    knots: KnotVector;
    /** poles, packed in blocks of `poleLength` doubles. */
    packedData: Float64Array;
    /** (property accessor) Return the number of numeric values per pole. */
    poleLength: number;
    /** (property accessor) Return the degree of the polynomials. */
    readonly degree: number;
    /** (property accessor) Return the number of order (one more than degree) of the polynomials */
    readonly order: number;
    /** (property accessor) Return the number of bezier spans (including null spans at multiple knots)*/
    readonly numSpan: number;
    /** (property accessor)  Return the number of poles*/
    readonly numPoles: number;
    /** copy 3 values of pole `i` into a point.
     * * The calling clas sis responsible for knowing if this is an appropriate access to the blocked data.
     */
    getPoint3dPole(i: number, result?: Point3d): Point3d | undefined;
    /** preallocated array (length === `order`) used as temporary in evaluations */
    basisBuffer: Float64Array;
    /** preallocated array (length === `poleLength`) used as temporary in evaluations */
    poleBuffer: Float64Array;
    /** preallocated array (length === `order`) used as temporary in evaluations */
    basisBuffer1: Float64Array;
    /** preallocated array (length === `order`) used as temporary in evaluations */
    basisBuffer2: Float64Array;
    /** preallocated array (length === `poleLength`) used as temporary in evaluations */
    poleBuffer1: Float64Array;
    /** preallocated array (length === `poleLength`) used as temporary in evaluations */
    poleBuffer2: Float64Array;
    /**
     * initialize arrays for given spline dimensions.
     * @param numPoles number of poles
     * @param poleLength number of coordinates per pole (e.g.. 3 for 3D unweighted, 4 for 3d weighted, 2 for 2d unweighted, 3 for 2d weighted)
     * @param order number of poles in support for a section of the bspline
     * @param knots KnotVector.  This is captured, not cloned.
     */
    protected constructor(numPoles: number, poleLength: number, order: number, knots: KnotVector);
    /**
     * create a 1Bspline1dNd`
     * @param numPoles number of poles
     * @param poleLength number of coordinates per pole (e.g.. 3 for 3D unweighted, 4 for 3d weighted, 2 for 2d unweighted, 3 for 2d weighted)
     * @param order number of poles in support for a section of the bspline
     * @param knots KnotVector.  This is captured, not cloned.
     */
    static create(numPoles: number, poleLength: number, order: number, knots: KnotVector): BSpline1dNd | undefined;
    /** Map a span index and local fraction to knot value. */
    spanFractionToKnot(span: number, localFraction: number): number;
    /** Evaluate the `order` basis functions (and optionally one or two derivatives) at a given fractional position within indexed span. */
    evaluateBasisFunctionsInSpan(spanIndex: number, spanFraction: number, f: Float64Array, df?: Float64Array, ddf?: Float64Array): void;
    /**
     * * Evaluate the basis functions at spanIndex and fraction.
     *   * Evaluations are stored in the preallocated `this.basisBuffer`
     * * Immediately do the summations of the basis values times the respective control points
     *   * Summations are stored in the preallocated `this.poleBuffer`
     * */
    evaluateBuffersInSpan(spanIndex: number, spanFraction: number): void;
    /**
     * * Evaluate the basis functions and one derivative at spanIndex and fraction.
     *   * Evaluations are stored in the preallocated `this.basisBuffer`
     * * Immediately do the summations of the basis values times the respective control points
     *   * Summations are stored in the preallocated `this.poleBuffer` and `this.poleBuffer`
     * */
    evaluateBuffersInSpan1(spanIndex: number, spanFraction: number): void;
    /** sum poles at span `spanIndex` by the weights in the `poleBuffer` */
    sumPoleBufferForSpan(spanIndex: number): void;
    /** sum poles at span `spanIndex` by the weights in the `poleBuffer1`, i.e. form first derivatives */
    sumPoleBuffer1ForSpan(spanIndex: number): void;
    /** sum poles at span `spanIndex` by the weights in the `poleBuffer2`, i.e. form second derivatives */
    sumPoleBuffer2ForSpan(spanIndex: number): void;
    /** Evaluate the function values and 1 or 2 derivatives into `this.poleBuffer`, `this.poleBuffer1` and `this.poleBuffer2` */
    evaluateBuffersAtKnot(u: number, numDerivative?: number): void;
    /**
     * Reverse the (blocked) poles (in `this.packedData` in place.
     */
    reverseInPlace(): void;
    /**
     * Test if the leading and trailing polygon coordinates are replicated in the manner of a "closed" bspline polygon which has been expanded
     * to act as a normal bspline.
     * @returns true if `degree` leading and trailing polygon blocks match
     */
    testCloseablePolygon(mode?: BSplineWrapMode): boolean;
}
//# sourceMappingURL=BSpline1dNd.d.ts.map