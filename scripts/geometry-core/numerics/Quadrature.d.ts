/** @module Numerics */
/** Support class for quadrature -- approximate integrals by summing weighted function values.
 * These are filled with x and weight for quadrature between xA and xB
 *
 * Since quadrature is done in side tight loops, these methods are structured for minimum object
 * allocation.
 * For methods names setupGauss<N> (where N is a smallish integer), the CALLER creates arrays xMapped and wMapped
 * The method installs particular x and weight values.
 */
export declare class Quadrature {
    static readonly gaussX2Interval01: Float64Array;
    static readonly gaussW2Interval01: Float64Array;
    static readonly gaussX3Interval01: Float64Array;
    static readonly gaussW3Interval01: Float64Array;
    static readonly gaussX4Interval01: Float64Array;
    static readonly gaussW4Interval01: Float64Array;
    static readonly gaussX5Interval01: Float64Array;
    static readonly gaussW5Interval01: Float64Array;
    /**
     * Given points and weights in a reference interval (usually 0 to 1):
     *
     * * map each xRef[i] to xA + h * xRef[i];
     * * scale each weight wRef[i] to h * wRef[i]
     * * all arrays are assumed to have xRef.length entries.
     * * the return value is xRef.length
     * @param xA beginning of target interval
     * @param h length of target interval
     * @param xRef x coordinates in reference interval
     * @param wRef weights for integration in the reference interval
     * @param xMapped x coordinates to evaluate integrands
     * @param wMapped weights for evaluated integrands
     */
    static mapWeights(xA: number, h: number, xRef: Float64Array, wRef: Float64Array, xMapped: Float64Array, wMapped: Float64Array): number;
    static setupGauss2(xA: number, xB: number, xMapped: Float64Array, wMapped: Float64Array): number;
    static setupGauss3(xA: number, xB: number, xMapped: Float64Array, wMapped: Float64Array): number;
    /** Caller allocates and passes Float6dArray of length
     * These are filled with x and weight for quadrature between xA and xB
     */
    static setupGauss5(xA: number, xB: number, xMapped: Float64Array, wMapped: Float64Array): number;
    static setupGauss4(xA: number, xB: number, xMapped: Float64Array, wMapped: Float64Array): number;
    /** Sum function values with given weghts and x values. */
    static sum1(xx: Float64Array, ww: Float64Array, n: number, f: (x: number) => number): number;
}
