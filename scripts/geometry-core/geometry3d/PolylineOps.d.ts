import { Point3d } from "./Point3dVector3d";
import { Range1d } from "./Range";
/** @module CartesianGeometry */
/**
 * PolylineOps is a collection of static methods operating on polylines.
 * @public
 */
export declare class PolylineOps {
    /**
     * Return a Range1d with the shortest and longest edge lengths of the polyline.
     * @param points points to examine.
     */
    static edgeLengthRange(points: Point3d[]): Range1d;
    /**
     * Return a simplified subset of given points.
     * * Points are removed by the Douglas-Puecker algorithm, viz https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm
     * * This is a global search, with multiple passes over the data.
     * @param source
     * @param chordTolerance
     */
    static compressByChordError(source: Point3d[], chordTolerance: number): Point3d[];
    /**
     * Return a simplified subset of given points, omitting points if very close to their neighbors.
     * * This is a local search, with a single pass over the data.
     * @param source input points
     * @param maxEdgeLength
     */
    static compressShortEdges(source: Point3d[], maxEdgeLength: number): Point3d[];
    /**
     * Return a simplified subset of given points, omitting points of the triangle with adjacent points is small.
     * * This is a local search, with a single pass over the data.
     * @param source input points
     * @param maxEdgeLength
     */
    static compressSmallTriangles(source: Point3d[], maxTriangleArea: number): Point3d[];
    /**
     * Return a simplified subset of given points, omitting points if close to the edge between neighboring points before and after
     * * This is a local search, with a single pass over the data for each pass.
     * @param source input points
     * @param maxDistance omit points if this close to edge between points before and after
     * @param numPass max number of times to run the filter.  numPass=2 is observed to behave well.
     *
     */
    static compressByPerpendicularDistance(source: Point3d[], maxDistance: number, numPass?: number): Point3d[];
}
//# sourceMappingURL=PolylineOps.d.ts.map