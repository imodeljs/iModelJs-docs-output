"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("./Range");
const PolylineCompressionByEdgeOffset_1 = require("./PolylineCompressionByEdgeOffset");
const GrowableXYZArray_1 = require("./GrowableXYZArray");
// cspell:word Puecker
/** @module CartesianGeometry */
/**
 * PolylineOps is a collection of static methods operating on polylines.
 * @public
 */
class PolylineOps {
    /**
     * Return a Range1d with the shortest and longest edge lengths of the polyline.
     * @param points points to examine.
     */
    static edgeLengthRange(points) {
        const range = Range_1.Range1d.createNull();
        for (let i = 1; i < points.length; i++) {
            range.extendX(points[i - 1].distance(points[i]));
        }
        return range;
    }
    /**
     * Return a simplified subset of given points.
     * * Points are removed by the Douglas-Puecker algorithm, viz https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm
     * * This is a global search, with multiple passes over the data.
     * @param source
     * @param chordTolerance
     */
    static compressByChordError(source, chordTolerance) {
        return PolylineCompressionByEdgeOffset_1.PolylineCompressionContext.compressPoint3dArrayByChordError(source, chordTolerance);
    }
    /**
     * Return a simplified subset of given points, omitting points if very close to their neighbors.
     * * This is a local search, with a single pass over the data.
     * @param source input points
     * @param maxEdgeLength
     */
    static compressShortEdges(source, maxEdgeLength) {
        const dest = GrowableXYZArray_1.GrowableXYZArray.create(source);
        PolylineCompressionByEdgeOffset_1.PolylineCompressionContext.compressInPlaceByShortEdgeLength(dest, maxEdgeLength);
        return dest.getPoint3dArray();
    }
    /**
     * Return a simplified subset of given points, omitting points of the triangle with adjacent points is small.
     * * This is a local search, with a single pass over the data.
     * @param source input points
     * @param maxEdgeLength
     */
    static compressSmallTriangles(source, maxTriangleArea) {
        const dest = GrowableXYZArray_1.GrowableXYZArray.create(source);
        PolylineCompressionByEdgeOffset_1.PolylineCompressionContext.compressInPlaceBySmallTriangleArea(dest, maxTriangleArea);
        return dest.getPoint3dArray();
    }
    /**
     * Return a simplified subset of given points, omitting points if close to the edge between neighboring points before and after
     * * This is a local search, with a single pass over the data for each pass.
     * @param source input points
     * @param maxDistance omit points if this close to edge between points before and after
     * @param numPass max number of times to run the filter.  numPass=2 is observed to behave well.
     *
     */
    static compressByPerpendicularDistance(source, maxDistance, numPass = 2) {
        const dest = GrowableXYZArray_1.GrowableXYZArray.create(source);
        let num0 = dest.length;
        for (let pass = 0; pass < numPass; pass++) {
            PolylineCompressionByEdgeOffset_1.PolylineCompressionContext.compressInPlaceByPerpendicularDistance(dest, maxDistance);
            const num1 = dest.length;
            if (num1 === num0)
                break;
            num0 = num1;
        }
        return dest.getPoint3dArray();
    }
}
exports.PolylineOps = PolylineOps;
//# sourceMappingURL=PolylineOps.js.map