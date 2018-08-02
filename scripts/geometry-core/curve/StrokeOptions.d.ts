/** @module Curve */
import { Angle } from "../Geometry";
/** tolerance blob for various stroking methods.
 *
 * * Across many applications, the critical concepts are:   chordTol, angleTol, maxEdgeLength
 * * Chord error is an distance measured from a curve or facet to its approximating stroke or facet.
 * * angle is the angle between two contiguous strokes or across a facet edge.
 * * maxEdgeLength is the length of a stroke or a edge of a facet.
 *
 * It is rare for all three to be active at once:
 * * Nearly all stroke and facet use cases will apply an angle tolerance.
 * * * For curves, 15 degrees is typical
 * * * For facets, 22.5 degrees is typical.
 * * * Halving the angle tolerance will (roughly) make curves get twice as many strokes, and surfaces get 4 times as many facets.
 * * * The angle tolerance has the useful property that its effect is independent of scale of that data.  If data is suddenly scaled into millimeters rather than meters, the facet counts remain the same.
 * * When creating output for devicies such as 3D printing will want a chord tolerance.
 * * For graphics display, use an angle tolerance of around 15 degrees and an chord tolerance which is the size of several pixels.
 * * Analysis meshes (e.g. Finite Elements) commonly need to apply maxEdgeLength.
 * * * Using maxEdgeLength for graphics probably produces too many facets.   For example, it causes long cylinders to get many nearly-square facets instead of the samll number of long quads usually used for graphics.
 * * Facet tolerances are, as the Pirates' Code, guidelines, not absolute rules.   Facet and stroke code may ignore tolerances in awkward situations.
 * * If multiple tolerances are in effect, the actual count will usually be based on the one that demands the most strokes or facets, unless it is so high that it violates some upper limit on the number of facets on an arc or a section of a curve.
 *
 */
export declare class StrokeOptions {
    /** distance from stroke to actual geometry */
    chordTol?: number;
    /** turning angle betwee strokes. */
    angleTol?: Angle;
    /** maximum length of a single stroke. */
    maxEdgeLength?: number;
    /** caller expects convex facets.  */
    needConvexFacets?: boolean;
    /** minimum strokes on a primitive */
    minStrokesPerPrimitive?: number;
    /** whether or not to triangulate each added facet */
    shouldTriangulate: boolean;
    private _needNormals?;
    private _needParams?;
    needParams: boolean;
    needNormals: boolean;
    needColors?: boolean;
    defaultCircleStrokes: number;
    hasMaxEdgeLength(): boolean;
    applyMaxEdgeLength(minCount: number, totalLength: number): number;
    applyAngleTol(minCount: number, sweepRadians: number, defaultStepRadians: number): number;
    static applyAngleTol(options: StrokeOptions | undefined, minCount: number, sweepRadians: number, defaultStepRadians?: number): number;
    applyTolerancesToArc(radius: number, sweepRadians?: number): number;
    applyChordTol(minCount: number, radius: number, sweepRadians: number): number;
    applyMinStrokesPerPrimitive(minCount: number): number;
    static createForCurves(): StrokeOptions;
    static createForFacets(): StrokeOptions;
}
