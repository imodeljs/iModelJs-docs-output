/** @module CartesianGeometry */
import { PlaneAltitudeEvaluator } from "../Geometry";
import { Point2d } from "./Point2dVector2d";
import { XAndY } from "./XYZProps";
import { Point3d, Vector3d } from "./Point3dVector3d";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Ray3d } from "./Ray3d";
import { IndexedXYZCollection, IndexedReadWriteXYZCollection } from "./IndexedXYZCollection";
import { GrowableXYZArray } from "./GrowableXYZArray";
import { Range3d, Range1d } from "./Range";
/** Static class for operations that treat an array of points as a polygon (with area!) */
/**
 * Various (static method) computations for arrays of points interpreted as a polygon.
 * @public
 */
export declare class PolygonOps {
    /** Sum areas of triangles from points[0] to each far edge.
     * * Consider triangles from points[0] to each edge.
     * * Sum the areas(absolute, without regard to orientation) all these triangles.
     * @returns sum of absolute triangle areas.
     */
    static sumTriangleAreas(points: Point3d[] | GrowableXYZArray): number;
    /** Sum areas of triangles from points[0] to each far edge.
     * * Consider triangles from points[0] to each edge.
     * * Sum the areas(absolute, without regard to orientation) all these triangles.
     * @returns sum of absolute triangle areas.
     */
    static sumTriangleAreasXY(points: Point3d[]): number;
    /** These values are the integrated area moment products [xx,xy,xz, x]
     * for a right triangle in the first quadrant at the origin -- (0,0),(1,0),(0,1)
     */
    private static readonly _triangleMomentWeights;
    /** These values are the integrated volume moment products [xx,xy,xz, x, yx,yy,yz,y, zx,zy,zz,z,x,y,z,1]
     * for a tetrahedron in the first quadrant at the origin -- (0,00),(1,0,0),(0,1,0),(0,0,1)
     */
    private static readonly _tetrahedralMomentWeights;
    private static _vector0;
    private static _vector1;
    private static _vector2;
    private static _vectorOrigin;
    private static _normal;
    private static _matrixA;
    private static _matrixB;
    private static _matrixC;
    /** return a vector which is perpendicular to the polygon and has magnitude equal to the polygon area. */
    static areaNormalGo(points: IndexedXYZCollection, result?: Vector3d): Vector3d | undefined;
    /** return a vector which is perpendicular to the polygon and has magnitude equal to the polygon area. */
    static areaNormal(points: Point3d[], result?: Vector3d): Vector3d;
    /** return the area of the polygon.
     * * This assumes the polygon is planar
     * * This does NOT assume the polygon is on the xy plane.
     */
    static area(points: Point3d[]): number;
    /** return the projected XY area of the polygon. */
    static areaXY(points: Point3d[] | IndexedXYZCollection): number;
    /**
     * Return a Ray3d with (assuming the polygon is planar and not self-intersecting)
     * * origin at the centroid of the (3D) polygon
     * * normal is a unit vector perpendicular to the plane
     * * 'a' member is the area.
     * @param points
     */
    static centroidAreaNormal(points: IndexedXYZCollection | Point3d[]): Ray3d | undefined;
    /**
     * Return a Ray3d with (assuming the polygon is planar and not self-intersecting)
     * * origin at the centroid of the (3D) polygon
     * * normal is a unit vector perpendicular to the plane
     * * 'a' member is the area.
     * @param points
     */
    private static centroidAreaNormalGo;
    /**
     * * Return (in caller-allocated centroid) the centroid of the xy polygon.
     * * Return (as function value)  the area
     */
    static centroidAndAreaXY(points: Point2d[], centroid: Point2d): number | undefined;
    /**
     * Return a unit normal to the plane of the polygon.
     * @param points array of points around the polygon.  This is assumed to NOT have closure edge.
     * @param result caller-allocated result vector.
     */
    static unitNormal(points: IndexedXYZCollection, result: Vector3d): boolean;
    /** Accumulate to the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     */
    /** Accumulate to the matrix of area products of a polygon with respect to an origin.
     * * The polygon is assumed to be planar and non-self-intersecting.
     * * Accumulated values are integrals over triangles from point 0 of the polygon to other edges of the polygon.
     * * Integral over each triangle is transformed to integrals from the given origin.
     * @param points array of points around the polygon.   Final closure point is not needed.
     * @param origin origin for global accumulation.
     * @param moments 4x4 matrix where products are accumulated.
     */
    static addSecondMomentAreaProducts(points: IndexedXYZCollection, origin: Point3d, moments: Matrix4d): void;
    /** Accumulate to the matrix of volume products of a polygon with respect to an origin.
     * * The polygon is assumed to be planar and non-self-intersecting.
     * * Accumulated values are integrals over tetrahedra from the origin to triangles on the polygon.
     * @param points array of points around the polygon.   Final closure point is not needed.
     * @param origin origin for tetrahedra
     * @param moments 4x4 matrix where products are accumulated.
     */
    static addSecondMomentVolumeProducts(points: IndexedXYZCollection, origin: Point3d, moments: Matrix4d): void;
    /** Return the matrix of area products of a polygon with respect to an origin.
     * The polygon is assumed to be planar and non-self-intersecting.
     * * `frameType===2` has xy vectors in the plane of the polygon, plus a unit normal z. (Used for area integrals)
     * * `frameType===3` has vectors from origin to 3 points in the triangle. (Used for volume integrals)
     */
    private static addSecondMomentTransformedProducts;
    /** Test the direction of turn at the vertices of the polygon, ignoring z-coordinates.
     *
     * *  For a polygon without self intersections, this is a convexity and orientation test: all positive is convex and counterclockwise,
     * all negative is convex and clockwise
     * *  Beware that a polygon which turns through more than a full turn can cross itself and close, but is not convex
     * *  Returns 1 if all turns are to the left, -1 if all to the right, and 0 if there are any zero or reverse turns
     */
    static testXYPolygonTurningDirections(pPointArray: Point2d[] | Point3d[]): number;
    /**
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static classifyPointInPolygon(x: number, y: number, points: XAndY[]): number | undefined;
    /**
     * Test if point (x,y) is IN, OUT or ON a polygon.
     * @return (1) for in, (-1) for OUT, (0) for ON
     * @param x x coordinate
     * @param y y coordinate
     * @param points array of xy coordinates.
     */
    static classifyPointInPolygonXY(x: number, y: number, points: IndexedXYZCollection): number | undefined;
    /**
     * Reverse loops as necessary to make them all have CCW orientation for given outward normal.
     * @param loops
     * @param outwardNormal
     * @return the number of loops reversed.
     */
    static orientLoopsCCWForOutwardNormalInPlace(loops: GrowableXYZArray | GrowableXYZArray[], outwardNormal: Vector3d): number;
    /**
     * If reverse loops as necessary to make them all have CCW orientation for given outward normal.
     * * Return an array of arrays which capture the input pointers.
     * * In each first level array:
     *    * The first loop is an outer loop.
     *    * all subsequent loops are holes
     *    * The outer loop is CCW
     *    * The holes are CW.
     * @param loops multiple loops to sort and reverse.
     */
    static sortOuterAndHoleLoopsXY(loops: IndexedReadWriteXYZCollection[]): IndexedReadWriteXYZCollection[][];
}
/**
 *  `IndexedXYZCollectionPolygonOps` class contains _static_ methods for typical operations on polygons carried as `IndexedXyZCollection`
 * @public
 */
export declare class IndexedXYZCollectionPolygonOps {
    private static _xyz0Work;
    private static _xyz1Work;
    private static _xyz2Work;
    /**
     * Split a (convex) polygon into 2 parts based on altitude evaluations.
     * * POSITIVE ALTITUDE IS IN
     * @param plane any `PlaneAltitudeEvaluator` object that can evaluate `plane.altitude(xyz)` for distance from the plane.
     * @param xyz original polygon
     * @param xyzPositive array to receive inside part (altitude > 0)
     * @param xyzNegative array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     */
    static splitConvexPolygonInsideOutsidePlane(plane: PlaneAltitudeEvaluator, xyz: IndexedReadWriteXYZCollection, xyzPositive: IndexedReadWriteXYZCollection, xyzNegative: IndexedReadWriteXYZCollection, altitudeRange: Range1d): void;
    /**
     * Clip a polygon to one side of a plane.
     * * Results with 2 or fewer points are ignored.
     * * Other than ensuring capacity in the arrays, there are no object allocations during execution of this function.
     * * plane is passed as unrolled Point4d (ax,ay,az,aw) point (x,y,z) acts as homogeneous (x,y,z,1)
     *   * `keepPositive === true` selects positive altitudes.
     * @param plane any type that has `plane.altitude`
     * @param xyz input points.
     * @param work work buffer
     * @param tolerance tolerance for "on plane" decision.
     */
    static clipConvexPolygonInPlace(plane: PlaneAltitudeEvaluator, xyz: GrowableXYZArray, work: GrowableXYZArray, keepPositive?: boolean, tolerance?: number): void;
    /**
     * Return the intersection of the plane with a range cube.
     * @param range
     * @param xyzOut intersection polygon.  This is convex.
     * @return reference to xyz if the polygon still has points; undefined if all points are clipped away.
     */
    static intersectRangeConvexPolygonInPlace(range: Range3d, xyz: GrowableXYZArray): GrowableXYZArray | undefined;
}
/**
 * `Point3dArrayPolygonOps` class contains _static_ methods for typical operations on polygons carried as `Point3d[]`
 * @public
 */
export declare class Point3dArrayPolygonOps {
    private static _xyz0Work;
    /**
     * Split a (convex) polygon into 2 parts.
     * @param xyz original polygon
     * @param xyzIn array to receive inside part
     * @param xyzOut array to receive outside part
     * @param altitudeRange min and max altitudes encountered.
     */
    static convexPolygonSplitInsideOutsidePlane(plane: PlaneAltitudeEvaluator, xyz: Point3d[], xyzIn: Point3d[], xyzOut: Point3d[], altitudeRange: Range1d): void;
    /** Return an array containing
     * * All points that are exactly on the plane.
     * * Crossing points between adjacent points that are (strictly) on opposite sides.
     */
    static polygonPlaneCrossings(plane: PlaneAltitudeEvaluator, xyz: Point3d[], crossings: Point3d[]): void;
    /**
     * Clip a polygon, returning the clip result in the same object.
     * @param xyz input/output polygon
     * @param work scratch object
     * @param tolerance tolerance for on-plane decision.
     */
    static convexPolygonClipInPlace(plane: PlaneAltitudeEvaluator, xyz: Point3d[], work: Point3d[] | undefined, tolerance?: number): void;
}
//# sourceMappingURL=PolygonOps.d.ts.map