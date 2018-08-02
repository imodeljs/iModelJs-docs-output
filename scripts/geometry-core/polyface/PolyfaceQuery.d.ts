/** @module Polyface */
import { Point3d } from "../PointVector";
import { Polyface, PolyfaceVisitor } from "./Polyface";
import { Matrix4d } from "../numerics/Geometry4d";
import { Loop, BagOfCurves } from "../curve/CurveChain";
import { MomentData } from "../numerics/Moments";
/** PolyfaceQuery is a static class whose methods implement queries on a polyface or polyface visitor provided as a parameter to each mtehod. */
export declare class PolyfaceQuery {
    /** copy the points from a visitor into a Linestring3d in a Loop object */
    static VisitorToLoop(visitor: PolyfaceVisitor): Loop;
    /** Create a linestring loop for each facet of the polyface. */
    static IndexedPolyfaceToLoops(polyface: Polyface): BagOfCurves;
    /** @returns Return the sum of all facets areas. */
    static sumFacetAreas(source: Polyface | PolyfaceVisitor): number;
    /** sum volumes of tetrahedra from origin to all facets.
     * * if origin is omitted, the first point encountered (by the visitor) is used as origin.
     * * If the mesh is closed, this sum is the volume.
     * * If the mesh is not closed, this sum is the volume of a mesh with various additional facets
     * from the origin to facets.
    */
    static sumTetrahedralVolumes(source: Polyface | PolyfaceVisitor, origin?: Point3d): number;
    /** Return the inertia products [xx,xy,xz,xw, yw, etc] integrated over all facets. */
    static SumFacetSecondAreaMomentProducts(source: Polyface | PolyfaceVisitor, origin: Point3d): Matrix4d;
    /** Compute area moments for the mesh. In the returned MomentData:
     * * origin is the centroid.
     * * localToWorldMap has the origin and principal directions
     * * radiiOfGyration radii for rotation aroud the x,y,z axes.
     */
    static computePrincipalAreaMoments(source: Polyface): MomentData | undefined;
}
