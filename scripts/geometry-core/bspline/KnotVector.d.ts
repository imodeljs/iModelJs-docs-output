/**
 * Array of non-decreasing numbers acting as a knot array for bsplines.
 *
 * * Essential identity: numKnots = numPoles + order = numPoles + degree - 1
 * * Various bspline libraries have confusion over how many "end knots" are needed. "Many" libraries (including Microstation)
 *     incorrectly demand "order" knots at each end for clamping.   But only "order - 1" are really needed.
 * * This class uses the "order-1" convention.
 * * This class provides queries to convert among spanIndex and knotIndex
 * * A span is a single interval of the knots.
 * * The left knot of span {k} is knot {k+degree-1}
 * * This class provides queries to convert among spanFraction, fraction of knot range, and knot
 * * core computations (evaluateBasisFucntions) have leftKnotIndex and global knot value as inputs.  Caller's need to
 * know their primary values (global knot, spanFraction).
 */
export declare class KnotVector {
    knots: Float64Array;
    degree: number;
    private _knot0;
    private _knot1;
    private _possibleWrap;
    static readonly knotTolerance = 1e-9;
    readonly leftKnot: number;
    readonly rightKnot: number;
    readonly leftKnotIndex: number;
    readonly rightKnotIndex: number;
    wrappable: boolean;
    readonly numSpans: number;
    /**
     *
     * * If knots is a number array or Float64Array, the those values become the local knot array.
     * * If knots is a simple number, the local knot array is allocated to that size but left as zeros.
     * @param knots
     * @param degree
     */
    private constructor();
    /** copy degree and knots to a new KnotVector. */
    clone(): KnotVector;
    private setupFixedValues;
    /** @returns Return the total knot distance from beginning to end. */
    readonly knotLength01: number;
    isAlmostEqual(other: KnotVector): boolean;
    setKnots(knots: number[] | Float64Array, skipFirstAndLast?: boolean): void;
    /**
     * Create knot vector with {degree-1} replicated knots at start and end, and uniform knots between.
     * @param numPoles Number of poles
     * @param degree degree of polynomial
     * @param a0 left knot value for active interval
     * @param a1 right knot value for active interval
     */
    static createUniformClamped(numPoles: number, degree: number, a0: number, a1: number): KnotVector;
    /**
     * Create knot vector with given knot values and degree.
     * @param knotArray knot values
     * @param degree degree of polynomial
     * @param skipFirstAndLast true to skip class overclamped end knots.
     */
    static create(knotArray: number[] | Float64Array, degree: number, skipFirstAndLast?: boolean): KnotVector;
    /**
     * Return the average of degree consecutive knots begining at spanIndex.
     */
    grevilleKnot(spanIndex: number): number;
    /** Return an array sized for a set of the basis function values. */
    createBasisArray(): Float64Array;
    baseKnotFractionToKnot(knotIndex0: number, localFraction: number): number;
    spanFractionToKnot(spanIndex: number, localFraction: number): number;
    spanFractionToFraction(spanIndex: number, localFraction: number): number;
    fractionToKnot(fraction: number): number;
    /**
     * Evaluate basis fucntions f[] at knot value u.
     *
     * @param u knot value for evaluation
     * @param f array of basis values.  ASSUMED PROPER LENGTH
     */
    evaluateBasisFunctions(knotIndex0: number, u: number, f: Float64Array): void;
    /**
     * Evaluate basis fucntions f[] at knot value u.
     *
     * @param u knot value for evaluation
     * @param f array of basis values.  ASSUMED PROPER LENGTH
     */
    evaluateBasisFunctions1(knotIndex0: number, u: number, f: Float64Array, df: Float64Array, ddf?: Float64Array): void;
    knotToLeftKnotIndex(u: number): number;
    /**
     * Given a span index, return the index of the knot at its left.
     * @param spanIndex index of span
     */
    spanIndexToLeftKnotIndex(spanIndex: number): number;
    spanIndexToSpanLength(spanIndex: number): number;
    /**
     * Given a span index, test if it is withn range and has nonzero length.
     * * note that a false return does not imply there are no more spans.  This may be a double knot (zero length span) followed by more real spans
     * @param spanIndex index of span to test.
     */
    isIndexOfRealSpan(spanIndex: number): boolean;
    reflectKnots(): void;
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(includeExtraEndKnot: boolean): number[];
}
//# sourceMappingURL=KnotVector.d.ts.map