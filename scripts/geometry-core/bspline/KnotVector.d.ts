/**
 * Enumeration of the possible ways of converting a "periodic" knot vector to an open knot vector.
 * None (0) ==> no wrap possible
 * OpenByAddintControlPoints (1)  ==> wrapped by adding poles
 * OpenByRemovingKnots (2)  ==> wrapped by deleting extreme knots.
 * @public
 */
export declare enum BSplineWrapMode {
    /** No conversion to periodic */
    None = 0,
    /** Convert to periodic by removing control points.  This is typical for closed bcurve constructed by control points with maximum continuity.
     * * Knots stay the same in open and periodic form.
     * * Periodic form omits {degree} control points.
     */
    OpenByAddingControlPoints = 1,
    /** Convert to periodic by adding special knots.  This is typical of closed bcurve constructed as exact circular or elliptic arc
     * * 2 knots on each end are omitted in open form
     * * poles stay the same.
     */
    OpenByRemovingKnots = 2
}
/**
 * Array of non-decreasing numbers acting as a knot array for bsplines.
 *
 * * Essential identity: numKnots = numPoles + order = numPoles + degree - 1
 * * Various bspline libraries have confusion over how many "end knots" are needed. "Many" libraries (including MicroStation)
 *     incorrectly demand "order" knots at each end for clamping.   But only "order - 1" are really needed.
 * * This class uses the "order-1" convention.
 * * This class provides queries to convert among spanIndex and knotIndex
 * * A span is a single interval of the knots.
 * * The left knot of span {k} is knot {k+degree-1}
 * * This class provides queries to convert among spanFraction, fraction of knot range, and knot
 * * core computations (evaluateBasisFunctions) have leftKnotIndex and global knot value as inputs.  Caller's need to
 * know their primary values (global knot, spanFraction).
 * @public
 */
export declare class KnotVector {
    /** The simple array of knot values. */
    knots: Float64Array;
    /** Return the degree of basis functions defined in these knots. */
    degree: number;
    private _knot0;
    private _knot1;
    private _wrapMode?;
    /** tolerance for considering two knots to be the same. */
    static readonly knotTolerance = 1e-9;
    /** Return the leftmost knot value (of the active interval, ignoring unclamped leading knots)*/
    readonly leftKnot: number;
    /** Return the rightmost knot value (of the active interval, ignoring unclamped leading knots)*/
    readonly rightKnot: number;
    /** Return the index of the leftmost knot of the active interval */
    readonly leftKnotIndex: number;
    /** Return the index of the rightmost knot of the active interval */
    readonly rightKnotIndex: number;
    /**
     * Return true if the bspline was created by adding poles in to "closed" structure
     */
    /** Set the wrappable flag.  This is used by serialize/deserialize to mark knotVector's that were converted from periodic style. */
    wrappable: BSplineWrapMode;
    /** Return the number of bezier spans.  Not that this includes zero-length spans if there are repeated knots. */
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
    /** Return the total knot distance from beginning to end. */
    readonly knotLength01: number;
    /**
     * Returns true if all numeric values have wraparound conditions for "closed" knotVector with specified wrap mode
     * @param mode optional test mode.  If undefined, use the this.wrappable.
     */
    testClosable(mode?: BSplineWrapMode): boolean;
    /** Test matching degree and knot values */
    isAlmostEqual(other: KnotVector): boolean;
    /** install knot values from an array, optionally ignoring first and last.
     */
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
     * Create knot vector with {degree-1} replicated knots at start and end, and uniform knots between.
     * @param  numInterval number of intervals in knot space.  (NOT POLE COUNT)
     * @param degree degree of polynomial
     * @param a0 left knot value for active interval
     * @param a1 right knot value for active interval
     */
    static createUniformWrapped(numInterval: number, degree: number, a0: number, a1: number): KnotVector;
    /**
     * Create knot vector with given knot values and degree.
     * @param knotArray knot values
     * @param degree degree of polynomial
     * @param skipFirstAndLast true to skip class overclamped end knots.
     */
    static create(knotArray: number[] | Float64Array, degree: number, skipFirstAndLast?: boolean): KnotVector;
    /**
     * Return the average of degree consecutive knots beginning at spanIndex.
     */
    grevilleKnot(spanIndex: number): number;
    /** Return an array sized for a set of the basis function values. */
    createBasisArray(): Float64Array;
    /** Convert localFraction within the interval following an indexed knot to a knot value. */
    baseKnotFractionToKnot(knotIndex0: number, localFraction: number): number;
    /** Convert localFraction within an indexed bezier span to a knot value. */
    spanFractionToKnot(spanIndex: number, localFraction: number): number;
    /** Convert localFraction within an indexed bezier span to fraction of active knot range. */
    spanFractionToFraction(spanIndex: number, localFraction: number): number;
    /** Return fraction of active knot range to knot value. */
    fractionToKnot(fraction: number): number;
    /**
     * Evaluate basis functions f[] at knot value u.
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
    /** Return the (highest) index of the knot less than or equal to u */
    knotToLeftKnotIndex(u: number): number;
    /**
     * Given a span index, return the index of the knot at its left.
     * @param spanIndex index of span
     */
    spanIndexToLeftKnotIndex(spanIndex: number): number;
    /** Return the knot interval length of indexed bezier span. */
    spanIndexToSpanLength(spanIndex: number): number;
    /**
     * Given a span index, test if it is within range and has nonzero length.
     * * note that a false return does not imply there are no more spans.  This may be a double knot (zero length span) followed by more real spans
     * @param spanIndex index of span to test.
     */
    isIndexOfRealSpan(spanIndex: number): boolean;
    /** Reflect all knots so `leftKnot` and `rightKnot` are maintained but interval lengths reverse. */
    reflectKnots(): void;
    /**
     * return a simple array form of the knots.  optionally replicate the first and last
     * in classic over-clamped manner
     */
    copyKnots(includeExtraEndKnot: boolean): number[];
}
//# sourceMappingURL=KnotVector.d.ts.map