/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { KnotVector } from "./KnotVector";
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
    /**
     * Test if the leading and trailing polygon coordinates are replicated in the manner of a "closed" bspline polygon which has been expanded
     * to act as a normal bspline.
     * @returns true if `degree` leading and trailing polygon blocks match
     */
    testCloseablePolygon(): boolean;
}
//# sourceMappingURL=BSpline1dNd.d.ts.map