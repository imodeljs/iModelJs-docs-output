/** @module Polyface */
import { Polyface, PolyfaceVisitor, IndexedPolyface } from "./Polyface";
import { ClipPlane } from "../clipping/ClipPlane";
import { ConvexClipPlaneSet } from "../clipping/ConvexClipPlaneSet";
import { PolyfaceBuilder } from "./PolyfaceBuilder";
import { LineString3d } from "../curve/LineString3d";
/** PolyfaceClip is a static class gathering operations using Polyfaces and clippers.
 * @public
 */
export declare class PolyfaceClip {
    /** Clip each facet of polyface to the ClipPlane.
     * * Return all surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceClipPlaneWithClosureFace(polyface: Polyface, clipper: ClipPlane, insideClip?: boolean, buildClosureFace?: boolean): Polyface;
    /** Clip each facet of polyface to the ClipPlane.
     * * Return all surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceClipPlane(polyface: Polyface, clipper: ClipPlane, insideClip?: boolean): Polyface;
    /** Clip each facet of polyface to the ClipPlane.
     * * Return surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceConvexClipPlaneSet(polyface: Polyface, clipper: ConvexClipPlaneSet): Polyface;
    /** Clip each facet of polyface to the ClipPlane or ConvexClipPlaneSet
     * * This method parses  the variant input types and calls a more specific method.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyface(polyface: Polyface, clipper: ClipPlane | ConvexClipPlaneSet): Polyface | undefined;
    /** Find consecutive points around a polygon (with implied closure edge) that are ON a plane
     * @param points array of points around polygon.  Closure edge is implied.
     * @param chainContext context receiving edges
     * @param point0 work point
     * @param point1 work point
    */
    private static collectEdgesOnPlane;
    /** Intersect each facet with the clip plane. (Producing intersection edges.)
     * * Return all edges  chained as array of LineString3d.
     */
    static sectionPolyfaceClipPlane(polyface: Polyface, clipper: ClipPlane): LineString3d[];
    /**
     * * Split facets of mesh "A" into parts that are
     *     * under mesh "B"
     *     * over mesh "B"
     * * both meshes are represented by visitors rather than the meshes themselves
     *     * If the data in-hand is a mesh, call with `mesh.createVisitor`
     * * The respective clip parts are fed to caller-supplied builders.
     *    * Caller may set either or both builders to toggle facet order (e.g. toggle the lower facets to make them "point down" in cut-fill application)
     *    * This step is commonly one-half of "cut fill".
     *       * A "cut fill" wrapper will call this twice with the visitor and builder roles reversed.
     * * Both polyfaces are assumed convex with CCW orientation viewed from above.
     * @param visitorA iterator over polyface to be split.
     * @param visitorB iterator over polyface that acts as a splitter
     * @param orientUnderMeshDownward if true, the "meshAUnderB" output is oriented with its normals reversed so it can act as the bottom side of a cut-fill pair.
     */
    static clipPolyfaceUnderOverConvexPolyfaceIntoBuilders(visitorA: PolyfaceVisitor, visitorB: PolyfaceVisitor, builderAUnderB: PolyfaceBuilder | undefined, builderAOverB: PolyfaceBuilder | undefined): void;
    /**
     * * Split facets into vertically overlapping sections
     * * both meshes are represented by visitors rather than the meshes themselves
     *     * If the data in-hand is a mesh, call with `mesh.createVisitor`
     * * The respective clip parts are returned as separate meshes.
     *    * Caller may set either or both builders to toggle facet order (e.g. toggle the lower facets to make them "point down" in cut-fill application)
     * * Both polyfaces are assumed convex with CCW orientation viewed from above.
     * * Each output contains some facets from meshA and some from meshB:
     *    * meshAUnderB -- areas where meshA is underneath mesh B.
     *        * If A is "design surface" and B is existing DTM, this is "cut" volume
     *    * meshAOverB  -- areas where meshB is over meshB.
     *        * If A is "design surface" and B is existing DTM, this is "fill" volume
     *
     * @param visitorA iterator over polyface to be split.
     * @param visitorB iterator over polyface that acts as a splitter
     * @param orientUnderMeshDownward if true, the "meshAUnderB" output is oriented with its normals reversed so it can act as the bottom side of a cut-fill pair.
     */
    static computeCutFill(meshA: IndexedPolyface, meshB: IndexedPolyface): {
        meshAUnderB: IndexedPolyface;
        meshAOverB: IndexedPolyface;
    };
}
//# sourceMappingURL=PolyfaceClip.d.ts.map