import { CurvePrimitive } from "../CurvePrimitive";
import { CurveCollection } from "../CurveCollection";
/**
 * Context for splitting curves.
 * @internal
 */
export declare class CurveSplitContext {
    private static hasInteriorDetailAIntersections;
    private collectFragmentAndAdvanceCut;
    /** Collect fragments from an intersections array, with the array detailA entries all referencing to curveToCut.
     * * The `intersections` array is sorted on its detailA field.
     */
    private collectSinglePrimitiveFragments;
    static cloneCurvesWithXYSplitFlags(curvesToCut: CurvePrimitive | CurveCollection | undefined, cutterCurves: CurveCollection): CurveCollection | CurvePrimitive | undefined;
}
//# sourceMappingURL=CurveSplitContext.d.ts.map