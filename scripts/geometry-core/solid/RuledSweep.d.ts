/** @module Solid */
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurveCollection } from "../curve/CurveCollection";
import { GeometryQuery } from "../curve/GeometryQuery";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { SolidPrimitive } from "./SolidPrimitive";
import { SweepContour } from "./SweepContour";
/**
 * * type for a function argument taking 2 curves and returning another curve or failing with undefined.
 * * This is used (for instance) by `RuleSweep.mutatePartners`
 * @public
 */
export declare type CurvePrimitiveMutator = (primitiveA: CurvePrimitive, primitiveB: CurvePrimitive) => CurvePrimitive | undefined;
/**
 * A ruled sweep (surface) is a collection of 2 or more contours.
 * * All contours must have identical number and type of geometry. (paths, loops, parity regions, lines, arcs, other curves)
 * @public
 */
export declare class RuledSweep extends SolidPrimitive {
    /** String name for schema properties */
    readonly solidPrimitiveType = "ruledSweep";
    private _contours;
    private constructor();
    /**
     * Create a ruled sweep from an array of contours.
     *  * the contours are CAPTURED (not cloned)
     */
    static create(contours: CurveCollection[], capped: boolean): RuledSweep | undefined;
    /** Return a reference to the array of SweepContour. */
    sweepContoursRef(): SweepContour[];
    /** Return clones of all the sweep contours
     * * See also cloneContours, which returns the spatial contours without their local coordinate system definitions)
     */
    cloneSweepContours(): SweepContour[];
    /** Return clones of all the contours
     * * See also cloneContours, which returns the contours in their local coordinate systems
     */
    cloneContours(): CurveCollection[];
    /** Return a deep clone */
    clone(): RuledSweep;
    /** Transform all contours in place. */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a cloned transform. */
    cloneTransformed(transform: Transform): RuledSweep;
    /** Return a coordinate frame (right handed unit vectors)
     * * origin on base contour
     * * x, y directions from base contour.
     * * z direction perpendicular
     */
    getConstructiveFrame(): Transform | undefined;
    /** Test if `other` is an instance of a `RuledSweep` */
    isSameGeometryClass(other: any): boolean;
    /** test same contour geometry and capping. */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** dispatch to strongly typed `handler.handleRuledSweep(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /**
     * Return the section curves at a fraction of the sweep
     * @param vFraction fractional position along the sweep direction
     */
    constantVSection(vFraction: number): CurveCollection | undefined;
    /** Pass each contour to `extendRange` */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Construct a CurveCollection with the same structure as collectionA and collectionB, with primitives constructed by the caller-supplied primitiveMutator function.
     * @returns Returns undefined if there is any type mismatch between the two collections.
     */
    static mutatePartners(collectionA: CurveCollection, collectionB: CurveCollection, primitiveMutator: CurvePrimitiveMutator): CurveCollection | undefined;
    /**
     * Return true if this is a closed volume, as observed by
     * * cap flag
     * identical first and last contours.
     */
    readonly isClosedVolume: boolean;
}
//# sourceMappingURL=RuledSweep.d.ts.map