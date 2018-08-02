/** @module Curve */
import { CurvePrimitive } from "./CurvePrimitive";
import { Path, Loop, ParityRegion, UnionRegion, AnyCurve, BagOfCurves, CurveCollection } from "./CurveChain";
/** base class for detailed traversal of curve artifacts.  This recurses to children in the quickest way (no records of path)
 * Use the RecursiveCurveProcessorWithStack to record the path along the visit.
 */
export declare abstract class RecursiveCurveProcessor {
    protected constructor();
    /** process error content */
    announceUnexpected(_data: AnyCurve, _indexInParent: number): void;
    /** process a leaf primitive. */
    announceCurvePrimitive(_data: CurvePrimitive, _indexInParent?: number): void;
    /** announce a path (recurse to children) */
    announcePath(data: Path, _indexInParent?: number): void;
    /** announce a loop (recurse to children) */
    announceLoop(data: Loop, _indexInParent?: number): void;
    /** annouce beginning or end of loops in a parity region */
    announceParityRegion(data: ParityRegion, _indexInParent?: number): void;
    /** annouce beginning or end of a parity region */
    announceUnionRegion(data: UnionRegion, _indexInParent?: number): void;
    announceBagOfCurves(data: BagOfCurves, _indexInParent?: number): void;
}
/** base class for detailed traversal of curve artifacts, maintaining a stack that shows complete path to each artifact.
 * Use the QuickRecursiveCurveProcessor to visit without recording the path.
 */
export declare abstract class RecursiveCurveProcessorWithStack extends RecursiveCurveProcessor {
    protected stack: CurveCollection[];
    protected constructor();
    enter(data: CurveCollection): void;
    leave(): CurveCollection | undefined;
    /** process error content */
    announceUnexpected(_data: AnyCurve, _indexInParent: number): void;
    /** process a leaf primitive. */
    announceCurvePrimitive(_data: CurvePrimitive, _indexInParent?: number): void;
    /** announce a path (recurse to children) */
    announcePath(data: Path, indexInParent?: number): void;
    /** announce a loop (recurse to children) */
    announceLoop(data: Loop, indexInParent?: number): void;
    /** annouce beginning or end of loops in a parity region */
    announceParityRegion(data: ParityRegion, _indexInParent?: number): void;
    /** annouce beginning or end of a parity region */
    announceUnionRegion(data: UnionRegion, indexInParent?: number): void;
    announceBagOfCurves(data: BagOfCurves, _indexInParent?: number): void;
}
