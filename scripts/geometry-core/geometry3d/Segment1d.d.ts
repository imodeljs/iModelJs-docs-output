/**
 * * A Segment1d is an interval of an axis named x.
 * * The interval is defined by two values x0 and x1.
 * * The x0 and x1 values can be in either order.
 * * * if `x0 < x1` fractional coordinates within the segment move from left to right.
 * * * if `x0 > x1` fractional coordinatesw within the segment move from right to left.
 * * This differs from a Range1d in that:
 * * For a Range1d the reversed ordering of its limit values means "empty interval".
 * * For a Segment1d the reversed ordering is a real interval but fractional positions mvoe backwards.
 * * The segment is parameterized with a fraction
 * * * Fraction 0 is the start (`x0`)
 * * * Fraction 1 is the end (`x1`)
 * * * The fraction equation is `x = x0 + fraction * (x1-x0)` or (equivalently) `x = (1-fraction) * x0 + fraction * x1`
 */
export declare class Segment1d {
    x0: number;
    x1: number;
    private constructor();
    set(x0: number, x1: number): void;
    /**
     * create segment1d with given end values
     * @param x0 start value
     * @param x1 end value
     * @param result optional pre-existing result to be reinitialized.
     */
    static create(x0?: number, x1?: number, result?: Segment1d): Segment1d;
    /**
     * Copy both end values from other Segment1d
     * @param other source Segment1d
     */
    setFrom(other: Segment1d): void;
    /**
     * clone this Segment1d, return as a separate object.
     */
    clone(): Segment1d;
    /**
     * @returns true if both coordinates (`x0` and `x1`) are in the 0..1 range.
     */
    readonly isIn01: boolean;
    /**
     * Evalauate the segment at fractional position
     * @returns position within the segment
     * @param fraction fractional position within this segment
     */
    fractionToPoint(fraction: number): number;
    /**
     * * swap the x0 and x1 member values.
     * * This makes the fractionToPoint evaluates reverse direction.
     */
    reverseInPlace(): void;
    /**
     * Near equality test, using Geometry.isSameCoordinate for tolerances.
     */
    isAlmostEqual(other: Segment1d): boolean;
    /**
     * Return true if the segment limits are (exactly) 0 and 1
     */
    readonly isExact01: boolean;
}
//# sourceMappingURL=Segment1d.d.ts.map