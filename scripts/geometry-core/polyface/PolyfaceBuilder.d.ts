/** @module Polyface */
import { IndexedPolyface } from "./Polyface";
import { GrowableFloat64Array } from "../GrowableArray";
import { Point3d, Vector3d, Point2d } from "../PointVector";
import { Transform } from "../Transform";
import { StrokeOptions } from "../curve/StrokeOptions";
import { GeometryQuery } from "../curve/CurvePrimitive";
import { Cone } from "../solid/Cone";
import { Sphere } from "../solid/Sphere";
import { TorusPipe } from "../solid/TorusPipe";
import { LinearSweep } from "../solid/LinearSweep";
import { RotationalSweep } from "../solid/RotationalSweep";
import { Box } from "../solid/Box";
import { RuledSweep } from "../solid/RuledSweep";
import { AnyCurve } from "../curve/CurveChain";
import { LineString3d } from "../curve/LineString3d";
import { HalfEdgeGraph, HalfEdgeToBooleanFunction } from "../topology/Graph";
import { NullGeometryHandler, UVSurface } from "../GeometryHandler";
/**
 *
 * * Simple construction for strongly typed GeometryQuery objects:
 *
 * ** Create a builder with `builder = PolyfaceBuilder.create()`
 * ** Add GeemotryQuery objects:
 *
 * *** `builder.addGeometryQuery(g: GeometryQuery)`
 * *** `builder.addCone(cone: Cone)`
 * *** `builder.addTorusPipe(surface: TorusPipe)`
 * *** `builder.addLinearSweepLineStrings(surface: LinearSweep)`
 * *** `builder.addRotationalSweep(surface: RotatationalSweep)`
 * *** `builder.addLinearSweep(surface: LinearSweep)`
 * *** `builder.addRuledSweep(surface: RuledSweep)`
 * *** `builder.addSphere(sphere: Sphere)`
 * *** `builder.addBox(box: Box)`
 * *** `buidler.addIndexedPolyface(polyface)`
 * **  Extract with `builder.claimPolyface (true)`
 *
 * * Simple construction for ephemeral constructive data:
 *
 * ** Create a builder with `builder = PolyfaceBuilder.create()`
 * ** Add from fragmentary data:
 *
 * *** `builder.addBetweenLineStrings (linestringA, linestringB, addClosure)`
 * *** `builder.addBetweenTransformedLineStrings (curves, transformA, transformB, addClosure)`
 * *** `builder.addBetweenStroked (curveA, curveB)`
 * *** `builder.addLinearSweepLineStrigns (contour, vector)`
 * *** `builder.addPolygon (points, numPointsToUse)`
 * *** `builder.addTransformedUnitBox (transform)`
 * *** `builder.addTriangleFan (conePoint, linestring, toggleOrientation)`
 * *** `builder.addTrianglesInUnchedkedPolygon (linestring, toggle)`
 * *** `builder.addUVGrid(surface,numU, numV, createFanInCaps)`
 * *** `builder.addGraph(Graph, acceptFaceFunction)`
 * **  Extract with `builder.claimPolyface(true)`
 *
 * * Low-level detail construction -- direct use of indices
 *
 * ** Create a builder with `builder = PolyfaceBuilder.create()`
 * ** Add GeometryQuery objects
 *
 * *** `builder.findOrAddPoint(point)`
 * *** `builder.findOrAddPointInLineString (linestring, index)`
 * *** `builder.findorAddTransformedPointInLineString(linestring, index, transform)`
 * *** `builder.findOrAddPointXYZ(x,y,z)`
 * *** `builder.addTriangleFanFromIndex0(indexArray, toggle)`
 * *** `builder.addTriangle (point0, point1, point2)`
 * *** `builder.addQuad (point0, point1, point2, point3)`
 * *** `builder.addOneBasedPointIndex (index)`
 */
export declare class PolyfaceBuilder extends NullGeometryHandler {
    private polyface;
    private _options;
    readonly options: StrokeOptions;
    private reversed;
    /** extract the polyface. */
    claimPolyface(compress?: boolean): IndexedPolyface;
    toggleReversedFacetFlag(): void;
    private constructor();
    static create(options?: StrokeOptions): PolyfaceBuilder;
    /** add facets for a transformed unit box. */
    addTransformedUnitBox(transform: Transform): void;
    /** Add triangles from points[0] to each far edge.
     * @param ls linestring with point coordinates
     * @param reverse if true, wrap the triangle creation in toggleReversedFacetFlag.
     */
    addTriangleFan(conePoint: Point3d, ls: LineString3d, toggle: boolean): void;
    /** Add triangles from points[0] to each far edge.
     * @param ls linestring with point coordinates
     * @param reverse if true, wrap the triangle creation in toggleReversedFacetFlag.
     */
    addTrianglesInUncheckedPolygon(ls: LineString3d, toggle: boolean): void;
    /** Add triangles from points[0] to each far edge.
     * @param ls linestring with point coordinates
     * @param reverse if true, wrap the triangle creation in toggleReversedFacetFlag.
     */
    addTriangleFanFromIndex0(index: GrowableFloat64Array, toggle: boolean, needNormals?: boolean, needParams?: boolean): void;
    /**
     * Announce point coordinates.  The implemetation is free to either create a new point or (if known) return indxex of a prior point with the same coordinates.
     */
    findOrAddPoint(xyz: Point3d): number;
    /**
     * Announce point coordinates.  The implemetation is free to either create a new param or (if known) return indxex of a prior param with the same coordinates.
     */
    findOrAddParamXY(x: number, y: number): number;
    private static workPointFindOrAdd;
    /**
     * Announce point coordinates.  The implemetation is free to either create a new point or (if knonw) return indxex of a prior point with the same coordinates.
     * @returns Returns the point index in the Polyface.
     * @param index Index of the point in the linestring.
     */
    findOrAddPointInLineString(ls: LineString3d, index: number, transform?: Transform): number | undefined;
    /**
     * Announce point coordinates.  The implemetation is free to either create a new point or (if known) return index of a prior point with the same coordinates.
     */
    findOrAddPointXYZ(x: number, y: number, z: number): number;
    /**
     * Add a quad to the polyface given its points in order around the edges.
     * Optionally provide params and normals, otherwise they will be calculated without reference data.
     * Optionally mark this quad as the last piece of a face in this polyface.
     */
    addQuadFacet(points: Point3d[], params?: Point2d[], normals?: Vector3d[]): void;
    /** Announce a single quad facet's point indexes.
     *
     * * The actual quad may be reversed or trianglulated based on builder setup.
     * *  indexA0 and indexA1 are in the forward order at the "A" end of the quad
     * *  indexB0 and indexB1 are in the forward order at the "B" end of the quad.
     */
    private addIndexedQuadPointIndexes(indexA0, indexA1, indexB0, indexB1);
    /** For a single quad facet, add the indexes of the corresponding param points. */
    private addIndexedQuadParamIndexes(indexA0, indexA1, indexB0, indexB1);
    /** For a single quad facet, add the indexes of the corresponding normal vectors. */
    private addIndexedQuadNormalIndexes(indexA0, indexA1, indexB0, indexB1);
    /**
     * Add a triangle to the polyface given its points in order around the edges.
     * Optionally provide params and normals, otherwise they will be calculated without reference data.
     * Optionally mark this triangle as the last piece of a face in this polyface.
     */
    addTriangleFacet(points: Point3d[], params?: Point2d[], normals?: Vector3d[]): void;
    /** Announce a single triangle facet's point indexes.
     *
     * * The actual quad may be reversed or trianglulated based on builder setup.
     * *  indexA0 and indexA1 are in the forward order at the "A" end of the quad
     * *  indexB0 and indexB1 are in the forward order at the "B" end of hte quad.
     */
    private addIndexedTrianglePointIndexes(indexA, indexB, indexC);
    /** For a single triangle facet, add the indexes of the corresponding params. */
    private addIndexedTriangleParamIndexes(indexA, indexB, indexC);
    /** For a single triangle facet, add the indexes of the corresponding params. */
    private addIndexedTriangleNormalIndexes(indexA, indexB, indexC);
    /** Add facets betwee lineStrings with matched point counts.
     *
     * * Facets are announced to addIndexedQuad.
     * * addIndexedQuad is free to apply reversal or triangulation options.
     */
    addBetweenLineStrings(lineStringA: LineString3d, lineStringB: LineString3d, addClosure?: boolean): void;
    /** Add facets betwee lineStrings with matched point counts.
     *
     * * Facets are announced to addIndexedQuad.
     * * addIndexedQuad is free to apply reversal or triangulation options.
     */
    addBetweenTransformedLineStrings(curves: AnyCurve, transformA: Transform, transformB: Transform, addClosure?: boolean): void;
    addBetweenStroked(dataA: AnyCurve, dataB: AnyCurve): void;
    /**
     *
     * @param cone cone to facet
     * @param strokeCount number of strokes around the cone.  If omitted, use the strokeOptions previously supplied to the builder.
     */
    addCone(cone: Cone, strokeCount?: number): void;
    /**
     *
     * @param surface TorusPipe to facet
     * @param strokeCount number of strokes around the cone.  If omitted, use the strokeOptions previously supplied to the builder.
     */
    addTorusPipe(surface: TorusPipe, phiStrokeCount?: number, thetaStrokeCount?: number): void;
    /**
     *
     * @param vector sweep vector
     * @param contour contour which contains only linestrings
     */
    addLinearSweepLineStrings(contour: AnyCurve, vector: Vector3d): void;
    addRotationalSweep(surface: RotationalSweep): void;
    /**
     *
     * @param cone cone to facet
     */
    addLinearSweep(surface: LinearSweep): void;
    /**
     *
     * @param cone cone to facet
     */
    addRuledSweep(surface: RuledSweep): void;
    addSphere(sphere: Sphere, strokeCount?: number): void;
    addBox(box: Box): void;
    /** Add a polygon to the evolving facets.
     *
     * * Add points to the polyface
     * * indices are added (in reverse order if indicated by the builder state)
     * @param points array of points.  This may contain extra points not to be used in the polygon
     * @param numPointsToUse number of points to use.
     */
    addPolygon(points: Point3d[], numPointsToUse: number): void;
    /** Add a polyface, with optional reverse and transform. */
    addIndexedPolyface(source: IndexedPolyface, reversed: boolean, transform?: Transform): void;
    /**
     * Produce a new FacetFaceData for all terminated facets since construction of the previous face.
     * Each facet number/index is mapped to the FacetFaceData through the faceToFaceData array.
     * Returns true if successful, and false otherwise.
     */
    endFace(): boolean;
    handleCone(g: Cone): any;
    handleTorusPipe(g: TorusPipe): any;
    handleSphere(g: Sphere): any;
    handleBox(g: Box): any;
    handleLinearSweep(g: LinearSweep): any;
    handleRotationalSweep(g: RotationalSweep): any;
    handleRuledSweep(g: RuledSweep): any;
    addGeometryQuery(g: GeometryQuery): void;
    /**
     *
     * * Visit all faces
     * * Test each face with f(node) for any node on the face.
     * * For each face that passes, pass its coordinates to the builder.
     * * Rely on the builder's compress step to find common vertex coordinates
     */
    addGraph(graph: HalfEdgeGraph, needParams: boolean, acceptFaceFunction?: HalfEdgeToBooleanFunction): void;
    static graphToPolyface(graph: HalfEdgeGraph, options?: StrokeOptions, acceptFaceFunction?: HalfEdgeToBooleanFunction): IndexedPolyface;
    private static index0;
    private static index1;
    /**
     * Given a 2-dimensional grid of points and optional corresponding params and normals, add the grid to the polyface as a series of quads.
     * Each facet in the grid should either be made up of 3 or 4 edges. Optionally specify that this quad is the last piece of a face.
     */
    addGrid(pointArray: Point3d[][], paramArray?: Point2d[][], normalArray?: Vector3d[][], endFace?: boolean): void;
    addUVGrid(surface: UVSurface, numU: number, numV: number, createFanInCaps: boolean): void;
}
