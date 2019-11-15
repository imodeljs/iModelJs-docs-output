/** @module Solid */
import { Vector3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { CurveCollection } from "../curve/CurveCollection";
import { Ray3d } from "../geometry3d/Ray3d";
import { PolyfaceBuilder } from "../polyface/PolyfaceBuilder";
import { MultiLineStringDataVariant } from "../topology/Triangulation";
import { StrokeOptions } from "../curve/StrokeOptions";
/**
 * Sweepable contour with Transform for local to world interaction.
 * * The surface/solid classes `LinearSweep`, `RotationalSweep`, `RuledSweep` use this for their swept contours.
 * @public
 */
export declare class SweepContour {
    /** The underlying curve collection, in its world coordinates position. */
    curves: CurveCollection;
    /** coordinate frame that in which the curves are all in the xy plane. */
    localToWorld: Transform;
    /** Axis used only in rotational case. */
    axis: Ray3d | undefined;
    private constructor();
    /** Create for linear sweep.
     * * The optional default normal may be useful for guiding coordinate frame setup.
     * * the contour is CAPTURED.
     */
    static createForLinearSweep(contour: CurveCollection, defaultNormal?: Vector3d): SweepContour | undefined;
    /** Create for linear sweep.
     * * The optional default normal may be useful for guiding coordinate frame setup.
     * * the points are captured into linestrings and Loops as needed.
     */
    static createForPolygon(points: MultiLineStringDataVariant, defaultNormal?: Vector3d): SweepContour | undefined;
    /** Create for rotational sweep.
     * * The axis ray is retained.
     * * the contour is CAPTURED.
     */
    static createForRotation(contour: CurveCollection, axis: Ray3d): SweepContour | undefined;
    /** Return (Reference to) the curves */
    getCurves(): CurveCollection;
    /** Apply `transform` to the curves, axis.
     * * The local to world frame is reconstructed for the transformed curves.
     */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a deep clone. */
    clone(): SweepContour;
    /** Return a transformed clone. */
    cloneTransformed(transform: Transform): SweepContour | undefined;
    /** Test for near equality of cures and local frame. */
    isAlmostEqual(other: any): boolean;
    private _xyStrokes?;
    private _facets?;
    /**
     * build the (cached) internal facets.
     * @param _builder (NOT USED -- an internal builder is constructed for the triangulation)
     * @param options options for stroking the curves.
     */
    buildFacets(_builder: PolyfaceBuilder, options: StrokeOptions | undefined): void;
    /** delete existing facets.
     * * This protects against PolyfaceBuilder reusing facets constructed with different options settings.
     */
    purgeFacets(): void;
    /** Emit facets to a builder.
     * This method may cache and reuse facets over multiple calls.
     */
    emitFacets(builder: PolyfaceBuilder, reverse: boolean, transform?: Transform): void;
}
//# sourceMappingURL=SweepContour.d.ts.map