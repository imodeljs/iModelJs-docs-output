import { BagOfCurves } from "./CurveCollection";
import { CurvePrimitive } from "./CurvePrimitive";
import { Path } from "./Path";
/**
 * Manage a growing array of arrays of curve primitives that are to be joined "head to tail" in paths.
 * * The caller makes a sequence of calls to announce individual primitives.
 * * Ordering so "head to tail" is obvious is the caller's responsibility.
 * * This class manages the tedium of distinguishing isolated primitives, paths, and multiple paths.
 * * Construction logic makes each chain internally continuous, i.e. suitable for being a Path.
 * * Chaining only occurs between primitives that are consecutive in the announcement stream.
 * * Usage pattern is
 *   * initialization: `context = new ChainCollectorContext (makeClones: boolean)`
 *   * many times: `   context.announceCurvePrimitive (primitive)`
 *   * end:        ` result = context.grabResults ()`
 * @internal
 */
export declare class ChainCollectorContext {
    private _chains;
    private _makeClones;
    /**
     * Push a new chain with an optional first primitive.
     */
    private pushNewChain;
    private findOrCreateTailChain;
    /** Initialize with an empty array of chains.
     * @param makeClones if true, all CurvePrimitives sent to `announceCurvePrimitive` is immediately cloned.  If false, the reference to the original curve is maintained.
     */
    constructor(makeClones: boolean);
    /** Announce a curve primitive
     * * If possible, append it to the current chain.
     * * Otherwise start a new chain.
     */
    announceCurvePrimitive(candidate: CurvePrimitive): void;
    /** Transfer markup (e.g. isCutAtStart, isCutAtEnd) from source to destination */
    private transferMarkup;
    /** turn an array of curve primitives into the simplest possible strongly typed curve structure.
     * * The input array is assumed to be connected appropriately to act as the curves of a Path.
     * * When a path is created the curves array is CAPTURED.
     */
    private promoteArrayToCurves;
    /** Return the collected results, structured as the simplest possible type. */
    grabResult(): CurvePrimitive | Path | BagOfCurves | undefined;
    private static _workPointA?;
    private static _workPointB?;
    /** test if there is a break between primitiveA and primitiveB, due to any condition such as
     * * primitiveA.isCutAtEnd
     * * primitiveB.isCutAtStart
     * * physical gap between primitives.
     */
    private static needBreakBetweenPrimitives;
}
//# sourceMappingURL=ChainCollectorContext.d.ts.map