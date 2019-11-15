/** @module Polyface */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Polyface, PolyfaceVisitor } from "./Polyface";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { BagOfCurves, CurveCollection } from "../curve/CurveCollection";
import { Loop } from "../curve/Loop";
import { LineString3d } from "../curve/LineString3d";
import { MomentData } from "../geometry4d/MomentData";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { LineSegment3d } from "../curve/LineSegment3d";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { RangeLengthData } from "./RangeLengthData";
/**
 * Structure to return multiple results from volume between facets and plane
 * @public
 */
export interface FacetProjectedVolumeSums {
    /** Summed (signed) volume */
    volume: number;
    /** summed area moments for positive contributions */
    positiveProjectedFacetAreaMoments?: MomentData;
    /** summed area moments for negative contributions */
    negativeProjectedFacetAreaMoments?: MomentData;
}
/** PolyfaceQuery is a static class whose methods implement queries on a polyface or polyface visitor provided as a parameter to each method.
 * @public
 */
export declare class PolyfaceQuery {
    /** copy the points from a visitor into a Linestring3d in a Loop object */
    static visitorToLoop(visitor: PolyfaceVisitor): Loop;
    /** Create a linestring loop for each facet of the polyface. */
    static indexedPolyfaceToLoops(polyface: Polyface): BagOfCurves;
    /** Return the sum of all facets areas. */
    static sumFacetAreas(source: Polyface | PolyfaceVisitor): number;
    /** sum volumes of tetrahedra from origin to all facets.
     * * if origin is omitted, the first point encountered (by the visitor) is used as origin.
     * * If the mesh is closed, this sum is the volume.
     * * If the mesh is not closed, this sum is the volume of a mesh with various additional facets
     * from the origin to facets.
    */
    static sumTetrahedralVolumes(source: Polyface | PolyfaceVisitor, origin?: Point3d): number;
    /** sum (signed) volumes between facets and a plane.
     * Return a structure with multiple sums:
     * * volume = the sum of (signed) volumes between facets and the plane.
     * * positiveAreaMomentData, negativeProjectedFacetAreaMoments = moment data with centroid, area, and second moments with respect to the centroid.
     *
    */
    static sumVolumeBetweenFacetsAndPlane(source: Polyface | PolyfaceVisitor, plane: Plane3dByOriginAndUnitNormal): FacetProjectedVolumeSums;
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all all facets, as viewed from origin. */
    static sumFacetSecondAreaMomentProducts(source: Polyface | PolyfaceVisitor, origin: Point3d): Matrix4d;
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all tetrahedral volumes from origin */
    static sumFacetSecondVolumeMomentProducts(source: Polyface | PolyfaceVisitor, origin: Point3d): Matrix4d;
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation around the x,y,z axes.
     */
    static computePrincipalAreaMoments(source: Polyface): MomentData | undefined;
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation around the x,y,z axes.
     * * The result is only valid if the mesh is closed.
     * * There is no test for closure.  Use `PolyfaceQuery.isPolyfaceClosedByEdgePairing(polyface)` to test for closure.
     */
    static computePrincipalVolumeMoments(source: Polyface): MomentData | undefined;
    /**
     * Test if the facets in `source` occur in perfectly mated pairs, as is required for a closed manifold volume.
     * @param source
     */
    static isPolyfaceClosedByEdgePairing(source: Polyface): boolean;
    /**
    * Test if the facets in `source` occur in perfectly mated pairs, as is required for a closed manifold volume.
    * If not, extract the boundary edges as lines.
    * @param source
    */
    static boundaryEdges(source: Polyface, includeDanglers?: boolean, includeMismatch?: boolean, includeNull?: boolean): CurveCollection | undefined;
    /** Find segments (within the linestring) which project to facets.
     * * Announce each pair of linestring segment and on-facet segment through a callback.
     * * Facets are ASSUMED to be convex and planar.
     */
    static announceSweepLinestringToConvexPolyfaceXY(linestringPoints: GrowableXYZArray, polyface: Polyface, announce: AnnounceDrapePanel): any;
    /** Search the facets for facet subsets that are connected with at least vertex contact.
     * * Return array of arrays of facet indices.
     */
    static partitionFacetIndicesByVertexConnectedComponent(polyface: Polyface | PolyfaceVisitor): number[][];
    /** Clone the facets in each partition to a separate polyface.
     *
     */
    static clonePartitions(polyface: Polyface | PolyfaceVisitor, partitions: number[][]): Polyface[];
    /** Search the facets for facet subsets that are connected with at least edge contact.
     * * Return array of arrays of facet indices.
     */
    static partitionFacetIndicesByEdgeConnectedComponent(polyface: Polyface | PolyfaceVisitor): number[][];
    /** Find segments (within the linestring) which project to facets.
     * * Assemble each segment pair as a facet in a new polyface
     * * Facets are ASSUMED to be convex and planar.
     */
    static sweepLinestringToFacetsXYreturnSweptFacets(linestringPoints: GrowableXYZArray, polyface: Polyface): Polyface;
    /** Find segments (within the linestring) which project to facets.
     * * Return collected line segments
     */
    static sweepLinestringToFacetsXYReturnLines(linestringPoints: GrowableXYZArray, polyface: Polyface): LineSegment3d[];
    /** Find segments (within the linestring) which project to facets.
     * * Return chains.
     */
    static sweepLinestringToFacetsXYReturnChains(linestringPoints: GrowableXYZArray, polyface: Polyface): LineString3d[];
    /** Find segments (within the linestring) which project to facets.
     * * Return chains.
     */
    static collectRangeLengthData(polyface: Polyface | PolyfaceVisitor): RangeLengthData;
    /** Clone the facets, inserting vertices (within edges) where points not part of each facet's vertex indices impinge within edges.
     *
     */
    static cloneWithTVertexFixup(polyface: Polyface): Polyface;
    /** Clone the facets, inserting removing points that are simply within colinear edges.
     *
     */
    static cloneWithColinearEdgeFixup(polyface: Polyface): Polyface;
}
/** Announce the points on a drape panel.
 * * The first two points in the array are always along the draped line segment.
 * * The last two are always on the facet.
 * * If there are 4 points, those two pairs are distinct, i.e. both segment points are to the same side of the facet.
 * * If there are 3 points, those two pairs share an on-facet point.
 * * The panel is ordered so the outward normal is to the right of the draped segment.
 * @param indexAOnFacet index (in points) of the point that is the first facet point for moving forward along the linestring
 * @param indexBOnFacet index (in points) of the point that is the second facet point for moving forward along the linestring
 * @public
 */
export declare type AnnounceDrapePanel = (linestring: GrowableXYZArray, segmentIndex: number, polyface: Polyface, facetIndex: number, points: Point3d[], indexAOnFacet: number, indexBOnFacet: number) => any;
//# sourceMappingURL=PolyfaceQuery.d.ts.map