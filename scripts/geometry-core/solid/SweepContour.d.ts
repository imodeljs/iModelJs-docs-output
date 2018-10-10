/** @module Solid */
import { Vector3d } from "../PointVector";
import { Transform } from "../Transform";
import { CurveCollection } from "../curve/CurveChain";
import { Ray3d } from "../AnalyticGeometry";
import { PolyfaceBuilder } from "../polyface/PolyfaceBuilder";
import { StrokeOptions } from "../curve/StrokeOptions";
/**
 * Sweepable contour with Transform for local to world interaction.
 */
export declare class SweepContour {
    curves: CurveCollection;
    localToWorld: Transform;
    private constructor();
    static createForLinearSweep(contour: CurveCollection, defaultNormal?: Vector3d): SweepContour | undefined;
    static createForRotation(contour: CurveCollection, axis: Ray3d): SweepContour | undefined;
    getCurves(): CurveCollection;
    tryTransformInPlace(transform: Transform): boolean;
    clone(): SweepContour;
    cloneTransformed(transform: Transform): SweepContour | undefined;
    isAlmostEqual(other: any): boolean;
    private _xyStrokes?;
    private _facets?;
    /**
     * build the (cached) internal facets.
     * @param _builder (NOT USED -- an internal builder is constructed for the triangulation)
     * @param options options for stroking the curves.
     */
    buildFacets(_builder: PolyfaceBuilder, options: StrokeOptions | undefined): void;
    /** Emit facets to a builder.
     * This method may cache and reuse facets over multiple calls.
     */
    emitFacets(builder: PolyfaceBuilder, reverse: boolean, transform?: Transform): void;
}
//# sourceMappingURL=SweepContour.d.ts.map