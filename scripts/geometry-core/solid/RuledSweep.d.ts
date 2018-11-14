/** @module Solid */
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurveCollection } from "../curve/CurveCollection";
import { GeometryQuery } from "../curve/GeometryQuery";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { SweepContour } from "./SweepContour";
export declare class RuledSweep extends SolidPrimitive {
    private _contours;
    private constructor();
    static create(contours: CurveCollection[], capped: boolean): RuledSweep | undefined;
    /** @returns Return a reference to the array of sweep contours. */
    sweepContoursRef(): SweepContour[];
    cloneSweepContours(): SweepContour[];
    cloneContours(): CurveCollection[];
    clone(): RuledSweep;
    tryTransformInPlace(transform: Transform): boolean;
    cloneTransformed(transform: Transform): RuledSweep;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpenedicular
     */
    getConstructiveFrame(): Transform | undefined;
    isSameGeometryClass(other: any): boolean;
    isAlmostEqual(other: GeometryQuery): boolean;
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * @returns Return the section curves at a fraction of the sweep
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Construct a CurveCollection with the same structure as collectionA and collectionB, with primitives constructed by the caller-supplied primitiveMutator function.
     * @returns Returns undefined if there is any type mismatch between the two collections.
     */
    static mutatePartners(collectionA: CurveCollection, collectionB: CurveCollection, primitiveMutator: (primitiveA: CurvePrimitive, primitiveB: CurvePrimitive) => CurvePrimitive | undefined): CurveCollection | undefined;
}
//# sourceMappingURL=RuledSweep.d.ts.map