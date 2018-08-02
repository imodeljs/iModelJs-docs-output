/** @module Curve */
import { CurvePrimitive } from "./CurvePrimitive";
import { Transform } from "../Transform";
import { RecursiveCurveProcessor, RecursiveCurveProcessorWithStack } from "./CurveProcessor";
import { CurveCollection } from "./CurveChain";
/** Algorithmic class: Accumulate maximum gap between adjacent primitives of CurveChain.
 */
export declare class GapSearchContext extends RecursiveCurveProcessorWithStack {
    maxGap: number;
    constructor();
    static maxGap(target: CurveCollection): number;
    announceCurvePrimitive(curve: CurvePrimitive, _indexInParent: number): void;
}
/** Algorithmic class: Count LineSegment3d and LineString3d primitives.
 */
export declare class CountLinearPartsSearchContext extends RecursiveCurveProcessorWithStack {
    numLineSegment: number;
    numLineString: number;
    numOther: number;
    constructor();
    static hasNonLinearPrimitives(target: CurveCollection): boolean;
    announceCurvePrimitive(curve: CurvePrimitive, _indexInParent: number): void;
}
/** Algorithmic class: Transform curves in place.
 */
export declare class TransformInPlaceContext extends RecursiveCurveProcessor {
    numFail: number;
    numOK: number;
    transform: Transform;
    constructor(transform: Transform);
    static tryTransformInPlace(target: CurveCollection, transform: Transform): boolean;
    announceCurvePrimitive(curvePrimitive: CurvePrimitive, _indexInParent: number): void;
}
/** Algorithmic class: Sum lengths of curves */
export declare class SumLengthsContext extends RecursiveCurveProcessor {
    private sum;
    private constructor();
    static sumLengths(target: CurveCollection): number;
    announceCurvePrimitive(curvePrimitive: CurvePrimitive, _indexInParent: number): void;
}
/**
 * Algorithmic class for cloning curve collections.
 * * recurse through collection nodes, building image nodes as needed and inserting clones of children.
 * * for individual primitive, invoke doClone (protected) for direct clone; insert into parent
 */
export declare class CloneCurvesContext extends RecursiveCurveProcessorWithStack {
    private result;
    private transform;
    private constructor();
    static clone(target: CurveCollection, transform?: Transform): CurveCollection | undefined;
    enter(c: CurveCollection): void;
    leave(): CurveCollection | undefined;
    protected doClone(primitive: CurvePrimitive): CurvePrimitive;
    announceCurvePrimitive(primitive: CurvePrimitive, _indexInParent: number): void;
}
