/** @module Polyface */
import { IndexedPolyface, PolyfaceVisitor } from "./Polyface";
import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { StrokeOptions } from "../curve/StrokeOptions";
import { GeometryQuery } from "../curve/GeometryQuery";
import { Cone } from "../solid/Cone";
import { Sphere } from "../solid/Sphere";
import { TorusPipe } from "../solid/TorusPipe";
import { LinearSweep } from "../solid/LinearSweep";
import { RotationalSweep } from "../solid/RotationalSweep";
import { Box } from "../solid/Box";
import { RuledSweep } from "../solid/RuledSweep";
import { AnyCurve, AnyRegion } from "../curve/CurveChain";
import { LineString3d } from "../curve/LineString3d";
import { HalfEdgeGraph, HalfEdge, HalfEdgeToBooleanFunction } from "../topology/Graph";
import { NullGeometryHandler, UVSurface } from "../geometry3d/GeometryHandler";
import { GrowableXYArray } from "../geometry3d/GrowableXYArray";
import { GrowableXYZArray } from "../geometry3d/GrowableXYZArray";
import { Segment1d } from "../geometry3d/Segment1d";
import { IndexedXYZCollection } from "../geometry3d/IndexedXYZCollection";
/**
 * UVSurfaceOps is a class containing static methods operating on UVSurface objects.
 * @public
 */
export declare class UVSurfaceOps {
    private constructor();
    /**
     * * evaluate `numEdge+1` points at surface uv parameters interpolated between (u0,v0) and (u1,v1)
     * * accumulate the xyz in a linestring.
     * * If xyzToUV is given, also accumulate transformed values as surfaceUV
     * * use xyzToUserUV transform to convert xyz to uv stored in the linestring (this uv is typically different from surface uv -- e.g. torus cap plane coordinates)
     * @param surface
     * @param u0 u coordinate at start of parameter space line
     * @param v0 v coordinate at end of parameter space line
     * @param u1 u coordinate at start of parameter space line
     * @param v1 v coordinate at end of parameter space line
     * @param numEdge number of edges.   (`numEdge+1` points are evaluated)
     * @param saveUV if true, save each surface uv fractions with `linestring.addUVParamsAsUV (u,v)`
     * @param saveFraction if true, save each fractional coordinate (along the u,v line) with `linestring.addFraction (fraction)`
     *
     * @param xyzToUV
     */
    static createLinestringOnUVLine(surface: UVSurface, u0: number, v0: number, u1: number, v1: number, numEdge: number, saveUV?: boolean, saveFraction?: boolean): LineString3d;
}
/**
 *
 * * Simple construction for strongly typed GeometryQuery objects:
 *
 *  * Create a builder with `builder = PolyfaceBuilder.create()`
 *  * Add GeometryQuery objects:
 *
 *    * `builder.addGeometryQuery(g: GeometryQuery)`
 *    * `builder.addCone(cone: Cone)`
 *    * `builder.addTorusPipe(surface: TorusPipe)`
 *    * `builder.addLinearSweepLineStrings(surface: LinearSweep)`
 *    * `builder.addRotationalSweep(surface: RotationalSweep)`
 *    * `builder.addLinearSweep(surface: LinearSweep)`
 *    * `builder.addRuledSweep(surface: RuledSweep)`
 *    * `builder.addSphere(sphere: Sphere)`
 *    * `builder.addBox(box: Box)`
 *    * `builder.addIndexedPolyface(polyface)`
 *  *  Extract with `builder.claimPolyface (true)`
 *
 * * Simple construction for ephemeral constructive data:
 *
 *  * Create a builder with `builder = PolyfaceBuilder.create()`
 *  * Add from fragmentary data:
 *    * `builder.addBetweenLineStrings (linestringA, linestringB, addClosure)`
 *    * `builder.addBetweenTransformedLineStrings (curves, transformA, transformB, addClosure)`
 *    * `builder.addBetweenStroked (curveA, curveB)`
 *    * `builder.addLinearSweepLineStrings (contour, vector)`
 *    * `builder.addPolygon (points, numPointsToUse)`
 *    * `builder.addTransformedUnitBox (transform)`
 *    * `builder.addTriangleFan (conePoint, linestring, toggleOrientation)`
 *    * `builder.addTrianglesInUncheckedPolygon (linestring, toggle)`
 *    * `builder.addUVGridBody(surface,numU, numV, createFanInCaps)`
 *    * `builder.addGraph(Graph, acceptFaceFunction)`
 *  *  Extract with `builder.claimPolyface(true)`
 *
 * * Low-level detail construction -- direct use of indices
 *  * Create a builder with `builder = PolyfaceBuilder.create()`
 *  * Add GeometryQuery objects
 *    * `builder.findOrAddPoint(point)`
 *    * `builder.findOrAddPointInLineString (linestring, index)`
 *    * `builder.findOrAddTransformedPointInLineString(linestring, index, transform)`
 *    * `builder.findOrAddPointXYZ(x,y,z)`
 *    * `builder.addTriangle (point0, point1, point2)`
 *    * `builder.addQuad (point0, point1, point2, point3)`
 *    * `builder.addOneBasedPointIndex (index)`
 * @public
 */
export declare class PolyfaceBuilder extends NullGeometryHandler {
    private _polyface;
    private _options;
    /** return (pointer to) the `StrokeOptions` in use by the builder. */
    readonly options: StrokeOptions;
    private _reversed;
    /** Ask if this builder is reversing vertex order as loops are received. */
    readonly reversedFlag: boolean;
    /** extract the polyface. */
    claimPolyface(compress?: boolean): IndexedPolyface;
    /** Toggle (reverse) the flag controlling orientation flips for newly added facets. */
    toggleReversedFacetFlag(): void;
    private constructor();
    /**
     * Create a builder with given StrokeOptions
     * @param options StrokeOptions (captured)
     */
    static create(options?: StrokeOptions): PolyfaceBuilder;
    /** add facets for a transformed unit box. */
    addTransformedUnitBox(transform: Transform): void;
    /** Add triangles from points[0] to each far edge.
     * @param ls linestring with point coordinates
     * @param toggle if true, wrap the triangle creation in toggleReversedFacetFlag.
     */
    addTriangleFan(conePoint: Point3d, ls: LineString3d, toggle: boolean): void;
    /** Add triangles from points[0] to each far edge
     * * Assume the polygon is convex.
     * * i.e. simple triangulation from point0
     * * i.e. simple cross products give a good normal.
     * @param ls linestring with point coordinates
     * @param reverse if true, wrap the triangle creation in toggleReversedFacetFlag.
     */
    addTrianglesInUncheckedConvexPolygon(ls: LineString3d, toggle: boolean): void;
    /**
     * Announce point coordinates.  The implementation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     */
    findOrAddPoint(xyz: Point3d): number;
    /**
     * Announce point coordinates.  The implementation is free to either create a new param or (if known) return index of a prior param with the same coordinates.
     */
    findOrAddParamXY(x: number, y: number): number;
    private static _workPointFindOrAddA;
    private static _workVectorFindOrAdd;
    private static _workUVFindOrAdd;
    /**
     * Announce point coordinates.  The implementation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     */
    findOrAddPointInLineString(ls: LineString3d, index: number, transform?: Transform, priorIndex?: number): number | undefined;
    /**
     * Announce point coordinates.  The implementation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     */
    findOrAddPointInGrowableXYZArray(xyz: GrowableXYZArray, index: number, transform?: Transform, priorIndex?: number): number | undefined;
    /**
     * Announce point coordinates.  The implementation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     */
    findOrAddNormalInGrowableXYZArray(xyz: GrowableXYZArray, index: number, transform?: Transform, priorIndex?: number): number | undefined;
    /**
     * Announce param coordinates.  The implementation is free to either create a new param or (if known) return index of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the param in the linestring.
     */
    findOrAddParamInGrowableXYArray(data: GrowableXYArray, index: number): number | undefined;
    /**
     * Announce param coordinates, taking u from ls.fractions and v from parameter.  The implementation is free to either create a new param or (if known) return index of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     */
    findOrAddParamInLineString(ls: LineString3d, index: number, v: number, priorIndexA?: number, priorIndexB?: number): number | undefined;
    /**
     * Announce normal coordinates found at index in the surfaceNormal array stored on the linestring
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     * @param priorIndex possible prior normal index to reuse
     */
    findOrAddNormalInLineString(ls: LineString3d, index: number, transform?: Transform, priorIndexA?: number, priorIndexB?: number): number | undefined;
    /**
     * This is a misspelling of findOrAddNormalInLineString
     * @deprecated
     */
    findOrAddNormalnLineString(ls: LineString3d, index: number, transform?: Transform, priorIndexA?: number, priorIndexB?: number): number | undefined;
    /**
     * Announce point coordinates.  The implementation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     */
    findOrAddPointXYZ(x: number, y: number, z: number): number;
    /** Returns a transform who can be applied to points on a triangular facet in order to obtain UV parameters. */
    private getUVTransformForTriangleFacet;
    /** Returns the normal to a triangular facet. */
    private getNormalForTriangularFacet;
    /**
     * Add a quad to the polyface given its points in order around the edges.
     * Optionally provide params and the plane normal, otherwise they will be calculated without reference data.
     * Optionally mark this quad as the last piece of a face in this polyface.
     */
    addQuadFacet(points: Point3d[] | GrowableXYZArray, params?: Point2d[], normals?: Vector3d[]): void;
    /** Announce a single quad facet's point indexes.
     *
     * * The actual quad may be reversed or triangulated based on builder setup.
     * *  indexA0 and indexA1 are in the forward order at the "A" end of the quad
     * *  indexB0 and indexB1 are in the forward order at the "B" end of the quad.
     */
    private addIndexedQuadPointIndexes;
    /** For a single quad facet, add the indexes of the corresponding param points. */
    private addIndexedQuadParamIndexes;
    /** For a single quad facet, add the indexes of the corresponding normal vectors. */
    private addIndexedQuadNormalIndexes;
    /**
     * Add a triangle to the polyface given its points in order around the edges.
     * * Optionally provide params and triangle normals, otherwise they will be calculated without reference data.
     */
    addTriangleFacet(points: Point3d[] | GrowableXYZArray, params?: Point2d[], normals?: Vector3d[]): void;
    /** Announce a single triangle facet's point indexes.
     *
     * * The actual quad may be reversed or triangulated based on builder setup.
     * *  indexA0 and indexA1 are in the forward order at the "A" end of the quad
     * *  indexB0 and indexB1 are in the forward order at the "B" end of hte quad.
     */
    private addIndexedTrianglePointIndexes;
    /** For a single triangle facet, add the indexes of the corresponding params. */
    private addIndexedTriangleParamIndexes;
    /** For a single triangle facet, add the indexes of the corresponding params. */
    private addIndexedTriangleNormalIndexes;
    /** Find or add xyzIndex and normalIndex for coordinates in the sector. */
    private setSectorIndices;
    private addSectorQuadA01B01;
    /** Add facets between lineStrings with matched point counts.
     * * surface normals are computed from (a) curve tangents in the linestrings and (b)rule line between linestrings.
     * * Facets are announced to addIndexedQuad.
     * * addIndexedQuad is free to apply reversal or triangulation options.
     */
    addBetweenLineStringsWithRuleEdgeNormals(lineStringA: LineString3d, vA: number, lineStringB: LineString3d, vB: number, addClosure?: boolean): void;
    /** Add facets between lineStrings with matched point counts.
     * * point indices pre-stored
     * * normal indices pre-stored
     * * uv indices pre-stored
     */
    addBetweenLineStringsWithStoredIndices(lineStringA: LineString3d, lineStringB: LineString3d): void;
    /** Add facets between lineStrings with matched point counts.
     *
     * * Facets are announced to addIndexedQuad.
     * * addIndexedQuad is free to apply reversal or triangulation options.
     */
    addBetweenTransformedLineStrings(curves: AnyCurve, transformA: Transform, transformB: Transform, addClosure?: boolean): void;
    private addBetweenStrokeSetPair;
    /**
     * Add facets from a Cone
     */
    addCone(cone: Cone): void;
    /**
     * Add facets for a TorusPipe.
     */
    addTorusPipe(surface: TorusPipe, phiStrokeCount?: number, thetaStrokeCount?: number): void;
    /**
     * Add point data (no params, normals) for linestrings.
     * * This recurses through curve chains (loops and paths)
     * * linestrings are swept
     * * All other curve types are ignored.
     * @param vector sweep vector
     * @param contour contour which contains only linestrings
     */
    addLinearSweepLineStringsXYZOnly(contour: AnyCurve, vector: Vector3d): void;
    /**
     * Construct facets for a rotational sweep.
     */
    addRotationalSweep(surface: RotationalSweep): void;
    /**
     * Construct facets for any planar region
     */
    addTriangulatedRegion(region: AnyRegion): void;
    /**
     * * Recursively visit all children of data.
     * * At each primitive, invoke the computeStrokeCountForOptions method, with options from the builder.
     * @param data
     */
    applyStrokeCountsToCurvePrimitives(data: AnyCurve | GeometryQuery): void;
    private addBetweenStrokeSetsWithRuledNormals;
    private createIndicesInLineString;
    private addBetweenRotatedStrokeSets;
    /**
     *
     * Add facets from
     * * The swept contour
     * * each cap.
     */
    addLinearSweep(surface: LinearSweep): void;
    /**
     * Add facets from a ruled sweep.
     */
    addRuledSweep(surface: RuledSweep): boolean;
    /**
     * Add facets from a Sphere
     */
    addSphere(sphere: Sphere, strokeCount?: number): void;
    /**
     * Add facets from a Box
     */
    addBox(box: Box): void;
    /** Add a polygon to the evolving facets.
     *
     * * Add points to the polyface
     * * indices are added (in reverse order if indicated by the builder state)
     * @param points array of points.  This may contain extra points not to be used in the polygon
     * @param numPointsToUse number of points to use.
     */
    addPolygon(points: Point3d[], numPointsToUse?: number): void;
    /** Add a polygon to the evolving facets.
     *
     * * Add points to the polyface
     * * indices are added (in reverse order if indicated by the builder state)
     * @param points array of points.  This may contain extra points not to be used in the polygon
     * @param numPointsToUse number of points to use.
     */
    addPolygonGrowableXYZArray(points: GrowableXYZArray): void;
    /** Add a polygon to the evolving facets.
     *
     * * Add points to the polyface
     * * indices are added (in reverse order if indicated by the builder state)
     * @param normals array of points.  This may contain extra points not to be used in the polygon
     * @param numPointsToUse number of points to use.
     */
    addFacetFromGrowableArrays(points: GrowableXYZArray, normals: GrowableXYZArray | undefined, params: GrowableXYArray | undefined, colors: number[] | undefined): void;
    /** Add the current visitor facet to the evolving polyface.
     * * indices are added (in reverse order if indicated by the builder state)
     */
    addFacetFromVisitor(visitor: PolyfaceVisitor): void;
    /** Add a polyface, with optional reverse and transform. */
    addIndexedPolyface(source: IndexedPolyface, reversed: boolean, transform?: Transform): void;
    /**
     * Produce a new FacetFaceData for all terminated facets since construction of the previous face.
     * Each facet number/index is mapped to the FacetFaceData through the faceToFaceData array.
     * Returns true if successful, and false otherwise.
     */
    endFace(): boolean;
    /** Double dispatch handler for Cone */
    handleCone(g: Cone): any;
    /** Double dispatch handler for TorusPipe */
    handleTorusPipe(g: TorusPipe): any;
    /** Double dispatch handler for Sphere */
    handleSphere(g: Sphere): any;
    /** Double dispatch handler for Box */
    handleBox(g: Box): any;
    /** Double dispatch handler for LinearSweep */
    handleLinearSweep(g: LinearSweep): any;
    /** Double dispatch handler for RotationalSweep */
    handleRotationalSweep(g: RotationalSweep): any;
    /** Double dispatch handler for RuledSweep */
    handleRuledSweep(g: RuledSweep): any;
    /** add facets for a GeometryQuery object.   This is double dispatch through `dispatchToGeometryHandler(this)` */
    addGeometryQuery(g: GeometryQuery): void;
    /**
     *
     * * Visit all faces
     * * Test each face with f(node) for any node on the face.
     * * For each face that passes, pass its coordinates to the builder.
     * * Rely on the builder's compress step to find common vertex coordinates
     * @internal
     */
    addGraph(graph: HalfEdgeGraph, needParams: boolean, acceptFaceFunction?: HalfEdgeToBooleanFunction): void;
    /**
     *
     * * For each node in `faces`
     *  * add all of its vertices to the polyface
     *  * add point indices to form a new facet.
     *    * (Note: no normal or param indices are added)
     *  * terminate the facet
     * @internal
     */
    addGraphFaces(_graph: HalfEdgeGraph, faces: HalfEdge[]): void;
    /** Create a polyface containing the faces of a HalfEdgeGraph, with test function to filter faces.
     * @internal
     */
    static graphToPolyface(graph: HalfEdgeGraph, options?: StrokeOptions, acceptFaceFunction?: HalfEdgeToBooleanFunction): IndexedPolyface;
    /** Create a polyface containing an array of faces of a HalfEdgeGraph, with test function to filter faces.
     * @internal
     */
    static graphFacesToPolyface(graph: HalfEdgeGraph, faces: HalfEdge[]): IndexedPolyface;
    /** Create a polyface containing triangles in a (space) polygon.
     * * The polyface contains only coordinate data (no params or normals).
     */
    static polygonToTriangulatedPolyface(points: Point3d[], localToWorld?: Transform): IndexedPolyface | undefined;
    /**
     * Given arrays of coordinates for multiple facets.
     * * pointArray[i] is an array of 3 or 4 points
     * * paramArray[i] is an array of matching number of params
     * * normalArray[i] is an array of matching number of normals.
     * @param pointArray array of arrays of point coordinates
     * @param paramArray array of arrays of uv parameters
     * @param normalArray array of arrays of normals
     * @param endFace if true, call this.endFace after adding all the facets.
     */
    addCoordinateFacets(pointArray: Point3d[][], paramArray?: Point2d[][], normalArray?: Vector3d[][], endFace?: boolean): void;
    /**
     * * Evaluate `(numU + 1) * (numV + 1)` grid points (in 0..1 in both u and v) on a surface.
     * * Add the facets for `numU * numV` quads.
     * * uv params are the 0..1 fractions.
     * * normals are cross products of u and v direction partial derivatives.
     * @param surface
     * @param numU
     * @param numV
     */
    addUVGridBody(surface: UVSurface, numU: number, numV: number, uMap?: Segment1d, vMap?: Segment1d): void;
    /**
     * Triangulate the points as viewed in xy.
     * @param points
     */
    static pointsToTriangulatedPolyface(points: Point3d[]): IndexedPolyface | undefined;
    /** Create (and add to the builder) triangles that bridge the gap between two linestrings.
     * * Each triangle will have 1 vertex on one of the linestrings and 2 on the other
     * * Choice of triangles is heuristic, hence does not have a unique solution.
     * * Logic to choice among the various possible triangle orders prefers
     *    * Make near-coplanar facets
     *    * make facets with good aspect ratio.
     *    * This is exercised with a limited number of lookahead points, i.e. greedy to make first-available decision.
     * @param pointsA points of first linestring.
     * @param pointsB points of second linestring.
     */
    addGreedyTriangulationBetweenLineStrings(pointsA: Point3d[] | LineString3d | IndexedXYZCollection, pointsB: Point3d[] | LineString3d | IndexedXYZCollection): void;
}
//# sourceMappingURL=PolyfaceBuilder.d.ts.map