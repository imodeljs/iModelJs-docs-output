"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
// import { Geometry } from "./Geometry";
const PointVector_1 = require("../PointVector");
const Range_1 = require("../Range");
const PointHelpers_1 = require("../PointHelpers");
const GrowableArray_1 = require("../GrowableArray");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const ClusterableArray_1 = require("../numerics/ClusterableArray");
/**
 * Check validity of indices into a data array.
 * * It is valid to have  both indices and data undeinfed.
 * * It is NOT valid for just one to be defined.
 * * Index values at indices[indexPositionA <= i < indexPositionB] must be valid indices to the data array.
 * @param indices array of indices.
 * @param indexPositionA first index to test
 * @param indexPositionB one past final index to test
 * @param data data array.  Only its length is referenced.
 */
function areIndicesValid(indices, indexPositionA, indexPositionB, data) {
    if (indices === undefined && data === undefined)
        return true;
    if (!indices || !data)
        return false;
    const dataLength = data.length;
    if (indexPositionA < 0 || indexPositionA >= indices.length)
        return false;
    if (indexPositionB < indexPositionA || indexPositionB > indices.length)
        return false;
    for (let i = indexPositionA; i < indexPositionB; i++)
        if (indices[i] < 0 || indices[i] >= dataLength)
            return false;
    return true;
}
function allDefined(valueA, valueB, valueC) {
    return valueA !== undefined && valueB !== undefined && valueC !== undefined;
}
/**
 * Test if facetStartIndex is (minimally!) valid:
 * * length must be nonzero (recall that for "no facets" the facetStartIndexArray still must contain a 0)
 * * Each entry must be strictly smaller than the one that follows.
 * @param facetStartIndex array of facetStart data.  facet `i` has indices at `facetsStartIndex[i]` to (one before) `facetStartIndex[i+1]`
 */
function isValidFacetStartIndexArray(facetStartIndex) {
    // facetStartIndex for empty facets has a single entry "0" -- empty array is not allowed
    if (facetStartIndex.length === 0)
        return false;
    for (let i = 0; i + 1 < facetStartIndex.length; i++)
        if (facetStartIndex[i] >= facetStartIndex[i + 1])
            return false;
    return true;
}
function reverseIndices(facetStartIndex, indices, preserveStart) {
    if (!indices || indices.length === 0)
        return true; // empty case
    if (indices.length > 0) {
        if (facetStartIndex[facetStartIndex.length - 1] === indices.length) {
            for (let i = 0; i + 1 < facetStartIndex.length; i++) {
                let index0 = facetStartIndex[i];
                let index1 = facetStartIndex[i + 1];
                if (preserveStart) {
                    // leave [index0] as is so reversed facet starts at same vertex
                    while (index1 > index0 + 2) {
                        index1--;
                        index0++;
                        const a = indices[index0];
                        indices[index0] = indices[index1];
                        indices[index1] = a;
                    }
                }
                else {
                    // reverse all
                    while (index1 > index0 + 1) {
                        index1--;
                        const a = indices[index0];
                        indices[index0] = indices[index1];
                        indices[index1] = a;
                        index0++;
                    }
                }
            }
            return true;
        }
    }
    return false;
}
/**
 * Data for a face in a polyface containing facets.
 * This is built up cooperatively by the PolyfaceBuilder and its
 * callers, and stored as a FaceData array in PolyfaceData.
 */
class FacetFaceData {
    get paramDistanceRange() { return this._paramDistanceRange; }
    get paramRange() { return this._paramRange; }
    constructor(distanceRange, paramRange) {
        this._paramDistanceRange = distanceRange;
        this._paramRange = paramRange;
    }
    /** Create a FacetFaceData with null ranges. */
    static createNull() {
        return new FacetFaceData(Range_1.Range2d.createNull(), Range_1.Range2d.createNull());
    }
    /** Create a deep copy of this FacetFaceData object. */
    clone(result) {
        if (result) {
            this._paramDistanceRange.clone(result._paramDistanceRange);
            this._paramRange.clone(result._paramRange);
            return result;
        }
        return new FacetFaceData(this._paramDistanceRange.clone(), this._paramRange.clone());
    }
    /** Restore this FacetFaceData to its null constructor state. */
    null() {
        this._paramDistanceRange.setNull();
        this._paramRange.setNull();
    }
    /** Return distance-based parameter from stored parameter value. */
    convertParamToDistance(param, result) {
        result = result ? result : PointVector_1.Point2d.create();
        const paramDelta = this._paramRange.high.minus(this._paramRange.low);
        result.x = (0 === paramDelta.x) ? param.x : (this._paramDistanceRange.low.x + (param.x - this._paramRange.low.x)
            * (this._paramDistanceRange.high.x - this._paramDistanceRange.low.x) / paramDelta.x);
        result.y = (0.0 === paramDelta.y) ? param.y : (this.paramDistanceRange.low.y + (param.y - this._paramRange.low.y)
            * (this._paramDistanceRange.high.y - this._paramDistanceRange.low.y) / paramDelta.y);
        return result;
    }
    /** Return normalized (0-1) parameter from stored parameter value. */
    convertParamToNormalized(param, result) {
        result = result ? result : PointVector_1.Point2d.create();
        const paramDelta = this._paramRange.high.minus(this._paramRange.low);
        result.x = (0.0 === paramDelta.x) ? param.x : ((param.x - this._paramRange.low.x) / paramDelta.x);
        result.y = (0.0 === paramDelta.y) ? param.y : ((param.y - this._paramRange.low.y) / paramDelta.y);
        return result;
    }
    /** Scale distance paramaters. */
    scaleDistances(distanceScale) {
        this._paramDistanceRange.low.x *= distanceScale;
        this._paramDistanceRange.low.y *= distanceScale;
        this._paramDistanceRange.high.x *= distanceScale;
        this._paramDistanceRange.high.y *= distanceScale;
    }
    /**
     * Sets the paramDistance range of this FacetFaceData based on the newly terminated facets that make it up.
     * Takes the polyface itself, the first and last indexes of the facets to be included in the face.
     * Returns true on success, false otherwise.
     */
    setParamDistanceRangeFromNewFaceData(polyface, facetStart, facetEnd) {
        const dSTotal = PointVector_1.Point2d.create();
        const dSSquaredTotal = PointVector_1.Point2d.create();
        let aveTotal = 0;
        const visitor = IndexedPolyfaceVisitor.create(polyface, 0);
        if (!visitor.moveToReadIndex(facetStart))
            return false;
        do {
            const numPointsInFacet = visitor.numEdgesThisFacet;
            const visitorPoints = visitor.point;
            const trianglePointIndexes = [];
            const visitorParams = visitor.param;
            const triangleParamIndexes = [];
            if (!visitorParams)
                return false;
            for (let k = 0; k < numPointsInFacet; k++) {
                trianglePointIndexes[2] = k;
                triangleParamIndexes[2] = k;
                if (k > 1) {
                    const dUV0 = visitorParams[triangleParamIndexes[0]].minus(visitorParams[triangleParamIndexes[1]]);
                    const dUV1 = visitorParams[triangleParamIndexes[1]].minus(visitorParams[triangleParamIndexes[2]]);
                    const delta0 = visitorPoints.getPoint3dAt(trianglePointIndexes[0]).minus(visitorPoints.getPoint3dAt(trianglePointIndexes[1]));
                    const delta1 = visitorPoints.getPoint3dAt(trianglePointIndexes[1]).minus(visitorPoints.getPoint3dAt(trianglePointIndexes[2]));
                    const uvCross = Math.abs(dUV0.x * dUV1.y - dUV1.x * dUV0.y);
                    if (uvCross) {
                        const dwDu = PointVector_1.Point3d.createFrom(delta0);
                        dwDu.scaleInPlace(dUV1.y);
                        dwDu.addScaledInPlace(delta1, -dUV0.y);
                        const dwDv = PointVector_1.Point3d.createFrom(delta1);
                        dwDv.scaleInPlace(dUV0.x);
                        dwDv.addScaledInPlace(delta0, -dUV1.x);
                        const dS = PointVector_1.Point2d.create(dwDu.magnitude() / uvCross, dwDv.magnitude() / uvCross);
                        dSTotal.x += dS.x;
                        dSTotal.y += dS.y;
                        dSSquaredTotal.x += dS.x * dS.x;
                        dSSquaredTotal.y += dS.y * dS.y;
                        aveTotal++;
                    }
                }
                triangleParamIndexes[0] = triangleParamIndexes[1];
                triangleParamIndexes[1] = triangleParamIndexes[2];
                trianglePointIndexes[0] = trianglePointIndexes[1];
                trianglePointIndexes[1] = trianglePointIndexes[2];
            }
        } while (visitor.moveToNextFacet() && visitor.currentReadIndex() < facetEnd);
        if (aveTotal !== 0) {
            const dS = PointVector_1.Point2d.create(dSTotal.x / aveTotal, dSTotal.y / aveTotal);
            const standardDeviation = PointVector_1.Point2d.create(Math.sqrt(Math.abs((dSSquaredTotal.x / aveTotal) - dS.x * dS.x)), Math.sqrt(Math.abs((dSSquaredTotal.y / aveTotal) - dS.y * dS.y)));
            // TR# 268980 - Add standard deviation to match QV....
            this._paramDistanceRange.low.set(0, 0);
            this._paramDistanceRange.high.set((dS.x + standardDeviation.x) * (this._paramRange.high.x - this._paramRange.low.x), (dS.y + standardDeviation.y) * (this._paramRange.high.y - this._paramRange.low.y));
        }
        return true;
    }
}
exports.FacetFaceData = FacetFaceData;
/**
 * PolyfaceData carries data arrays for point, normal, param, color and their indices.
 *
 * * IndexedPolyface carries a PolyfaceData as a member. (NOT as a base class -- it already has GeometryQuery as base)
 * * IndexedPolyfaceVisitor uses PolyfaceData as a base class.
 */
class PolyfaceData {
    constructor(needNormals = false, needParams = false, needColors = false) {
        this.point = new GrowableArray_1.GrowableXYZArray();
        this.pointIndex = [];
        this.edgeVisible = [];
        this.face = [];
        if (needNormals) {
            this.normal = [];
            this.normalIndex = [];
        }
        if (needParams) {
            this.param = [];
            this.paramIndex = [];
        }
        if (needColors) {
            this.color = [];
            this.colorIndex = [];
        }
    }
    clone() {
        const result = new PolyfaceData();
        result.point = this.point.clone();
        result.pointIndex = this.pointIndex.slice();
        result.edgeVisible = this.edgeVisible.slice();
        result.face = this.face.slice();
        if (this.normal)
            result.normal = PointHelpers_1.Vector3dArray.cloneVector3dArray(this.normal);
        if (this.param)
            result.param = PointHelpers_1.Point2dArray.clonePoint2dArray(this.param);
        if (this.color)
            result.color = this.color.slice();
        if (this.normalIndex)
            result.normalIndex = this.normalIndex.slice();
        if (this.paramIndex)
            result.paramIndex = this.paramIndex.slice();
        if (this.colorIndex)
            result.colorIndex = this.colorIndex.slice();
        return result;
    }
    isAlmostEqual(other) {
        if (!GrowableArray_1.GrowableXYZArray.isAlmostEqual(this.point, other.point))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.pointIndex, other.pointIndex))
            return false;
        if (!PointHelpers_1.Vector3dArray.isAlmostEqual(this.normal, other.normal))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.normalIndex, other.normalIndex))
            return false;
        if (!PointHelpers_1.Point2dArray.isAlmostEqual(this.param, other.param))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.paramIndex, other.paramIndex))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.color, other.color))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.colorIndex, other.colorIndex))
            return false;
        if (!PointHelpers_1.NumberArray.isExactEqual(this.edgeVisible, other.edgeVisible))
            return false;
        return true;
    }
    get requireNormals() { return undefined !== this.normal; }
    get pointCount() { return this.point.length; }
    get normalCount() { return this.normal ? this.normal.length : 0; }
    get paramCount() { return this.param ? this.param.length : 0; }
    get colorCount() { return this.color ? this.color.length : 0; }
    get indexCount() { return this.pointIndex.length; } // ALWAYS INDEXED ... all index vectors must have same length.
    /** Will return 0 if no faces were specified during construction. */
    get faceCount() { return this.face.length; }
    /** return indexed point. This is a copy of the coordinates, not a referenc. */
    getPoint(i) { return this.point.getPoint3dAt(i); }
    /** return indexed normal. This is the REFERENCE to the normal, not a copy. */
    getNormal(i) { return this.normal ? this.normal[i] : PointVector_1.Vector3d.create(); }
    /** return indexed param. This is the REFERENCE to the param, not a copy. */
    getParam(i) { return this.param ? this.param[i] : PointVector_1.Point2d.create(); }
    /** return indexed color */
    getColor(i) { return this.color ? this.color[i] : 0; }
    /** return indexed visibility */
    getEdgeVisible(i) { return this.edgeVisible[i]; }
    /** Copy the contents (not pointer) of point[i] into dest. */
    copyPointTo(i, dest) { this.point.getPoint3dAt(i, dest); }
    /** Copy the contents (not pointer) of normal[i] into dest. */
    copyNormalTo(i, dest) { if (this.normal)
        dest.setFrom(this.normal[i]); }
    /** Copy the contents (not pointer) of param[i] into dest. */
    copyParamTo(i, dest) { if (this.param)
        dest.setFrom(this.param[i]); }
    /**
     * * Copy data from other to this.
     * * This is the essense of transfering coordinates spread throughout a large polyface into a visitor's single facet.
     * * "other" is the large polyface
     * * "this" is the visitor
     * * does NOT copy face data - visitors reference the FacetFaceData array for the whole polyface!!
     * @param other polyface data being mined.
     * @param index0 start index in other's index arrays
     * @param index1 end index (one beyond last data accessed0 in other's index arrays
     * @param numWrap number of points to replicate as wraparound.
     */
    gatherIndexedData(other, index0, index1, numWrap) {
        const numEdge = index1 - index0;
        const numTotal = numEdge + numWrap;
        this.resizeAllDataArrays(numTotal);
        // copy wrapped points
        for (let i = 0; i < numEdge; i++)
            this.point.transferFromGrowableXYZArray(i, other.point, other.pointIndex[index0 + i]);
        for (let i = 0; i < numWrap; i++)
            this.point.transferFromGrowableXYZArray(numEdge + i, this.point, i);
        // copy wrapped pointIndex
        for (let i = 0; i < numEdge; i++)
            this.pointIndex[i] = other.pointIndex[index0 + i];
        for (let i = 0; i < numWrap; i++)
            this.pointIndex[numEdge + i] = this.pointIndex[i];
        // copy wrapped edge visibility
        for (let i = 0; i < numEdge; i++)
            this.edgeVisible[i] = other.edgeVisible[index0 + i];
        for (let i = 0; i < numWrap; i++)
            this.edgeVisible[numEdge + i] = this.edgeVisible[i];
        if (this.normal && this.normalIndex && other.normal && other.normalIndex) {
            for (let i = 0; i < numEdge; i++)
                this.normal[i].setFrom(other.normal[other.normalIndex[index0 + i]]);
            for (let i = 0; i < numWrap; i++)
                this.normal[numEdge + i].setFrom(this.normal[i]);
            for (let i = 0; i < numEdge; i++)
                this.normalIndex[i] = other.normalIndex[index0 + i];
            for (let i = 0; i < numWrap; i++)
                this.normalIndex[numEdge + i] = this.normalIndex[i];
        }
        if (this.param && this.paramIndex && other.param && other.paramIndex) {
            for (let i = 0; i < numEdge; i++)
                this.param[i].setFrom(other.param[other.paramIndex[index0 + i]]);
            for (let i = 0; i < numWrap; i++)
                this.param[numEdge + i].setFrom(this.param[i]);
            for (let i = 0; i < numEdge; i++)
                this.paramIndex[i] = other.paramIndex[index0 + i];
            for (let i = 0; i < numWrap; i++)
                this.paramIndex[numEdge + i] = this.paramIndex[i];
        }
        if (this.color && this.colorIndex && other.color && other.colorIndex) {
            for (let i = 0; i < numEdge; i++)
                this.color[i] = other.color[this.colorIndex[index0 + i]];
            for (let i = 0; i < numWrap; i++)
                this.color[numEdge + i] = this.color[i];
            for (let i = 0; i < numEdge; i++)
                this.colorIndex[i] = other.colorIndex[index0 + i];
            for (let i = 0; i < numWrap; i++)
                this.colorIndex[numEdge + i] = this.colorIndex[i];
        }
    }
    static trimArray(data, length) { if (data && length < data.length)
        data.length = length; }
    trimAllIndexArrays(length) {
        PolyfaceData.trimArray(this.pointIndex, length);
        PolyfaceData.trimArray(this.paramIndex, length);
        PolyfaceData.trimArray(this.normalIndex, length);
        PolyfaceData.trimArray(this.colorIndex, length);
        PolyfaceData.trimArray(this.edgeVisible, length);
    }
    resizeAllDataArrays(length) {
        if (length > this.point.length) {
            while (this.point.length < length)
                this.point.push(PointVector_1.Point3d.create());
            while (this.pointIndex.length < length)
                this.pointIndex.push(-1);
            while (this.edgeVisible.length < length)
                this.edgeVisible.push(false);
            if (this.normal)
                while (this.normal.length < length)
                    this.normal.push(PointVector_1.Vector3d.create());
            if (this.param)
                while (this.param.length < length)
                    this.param.push(PointVector_1.Point2d.create());
            if (this.color)
                while (this.color.length < length)
                    this.color.push(0);
        }
        else if (length < this.point.length) {
            this.point.resize(length);
            this.edgeVisible.length = length;
            this.pointIndex.length = length;
            if (this.normal)
                this.normal.length = length;
            if (this.param)
                this.param.length = length;
            if (this.color)
                this.color.length = length;
        }
    }
    range(result, transform) {
        result = result ? result : Range_1.Range3d.createNull();
        result.extendArray(this.point, transform);
        return result;
    }
    /** reverse indices facet-by-facet, with the given facetStartIndex array delimiting faces.
     *
     * * facetStartIndex[0] == 0 always -- start of facet zero.
     * * facet k has indices from facetStartIndex[k] <= i < facetStartIndex[k+1]
     * * hence for "internal" k, facetStartIndex[k] is both the upper limit of facet k-1 and the start of facet k.
     * *
     */
    reverseIndices(facetStartIndex) {
        if (facetStartIndex && isValidFacetStartIndexArray(facetStartIndex)) {
            reverseIndices(facetStartIndex, this.pointIndex, true);
            reverseIndices(facetStartIndex, this.normalIndex, true);
            reverseIndices(facetStartIndex, this.paramIndex, true);
            reverseIndices(facetStartIndex, this.colorIndex, true);
            reverseIndices(facetStartIndex, this.edgeVisible, false);
        }
    }
    reverseNormals() {
        if (this.normal)
            for (const normal of this.normal)
                normal.scaleInPlace(-1.0);
    }
    // This base class is just a data carrier.  It does not know if the index order and normal directions have special meaning.
    // 1) Caller must reverse normals if semanitically needed.
    // 2) Caller must reverse indices if semantically needed.
    tryTransformInPlace(transform) {
        const inverseTranspose = transform.matrix.inverse();
        this.point.transformInPlace(transform);
        if (inverseTranspose) {
            // apply simple RotMatrix to normals ...
            if (this.normal) {
                inverseTranspose.multiplyVectorArrayInPlace(this.normal);
            }
        }
        return true;
    }
    compress() {
        const packedData = ClusterableArray_1.ClusterableArray.clusterGrowablePoint3dArray(this.point);
        this.point = packedData.growablePackedPoints;
        packedData.updateIndices(this.pointIndex);
        //    if (this.paramIndex)  // Tracking uv params
        //      packedData.updateIndices(this.paramIndex);
        //    if (this.normalIndex) // Tracking normals
        //      packedData.updateIndices(this.normalIndex);
    }
}
// <ul
// <li>optional arrays (normal, uv, color) must be indicated at constructor time.
// <li>all arrays are (independently) indexed.
// <li>with regret, the point, param, normal, and color arrays are exposed publicly.
// <li>getX methods are "trusting" -- no bounds check
// <li>getX methods return references to X.
// <li> EXCEPT -- for optional arrays, the return 000.
// <li>copyX methods move data to caller-supplied result..
// </ul>
PolyfaceData.planarityLocalRelTol = 1.0e-13;
exports.PolyfaceData = PolyfaceData;
/**
 * A Polyface is n abstract mesh structure (of unspecified implementation) that provides a PolyfaceVisitor
 * to iterate over its facets.
 */
class Polyface extends CurvePrimitive_1.GeometryQuery {
    constructor(data) {
        super();
        this._twoSided = false;
        this.data = data;
    }
    get twoSided() { return this._twoSided; }
    set twoSided(value) { this._twoSided = value; }
}
exports.Polyface = Polyface;
class IndexedPolyface extends Polyface {
    isSameGeometryClass(other) { return other instanceof IndexedPolyface; }
    /** Tests for equivalence between two IndexedPolyfaces. */
    isAlmostEqual(other) {
        if (other instanceof IndexedPolyface) {
            return this.data.isAlmostEqual(other.data) && PointHelpers_1.NumberArray.isExactEqual(this.facetStart, other.facetStart) &&
                PointHelpers_1.NumberArray.isExactEqual(this.facetToFaceData, other.facetToFaceData);
        }
        return false;
    }
    tryTransformInPlace(transform) {
        if (this.data.tryTransformInPlace(transform)) {
            const determinant = transform.matrix.determinant();
            if (determinant < 0) {
                this.reverseIndices();
                this.reverseNormals();
            }
        }
        return false;
    }
    clone() {
        return new IndexedPolyface(this.data.clone(), this.facetStart.slice(), this.facetToFaceData.slice());
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    reverseIndices() { this.data.reverseIndices(this.facetStart); }
    reverseNormals() { this.data.reverseNormals(); }
    /** return face data using a facet index. This is the REFERENCE to the FacetFaceData, not a copy. Returns undefined if none found. */
    tryGetFaceData(i) {
        const faceIndex = this.facetToFaceData[i];
        if (faceIndex >= this.data.face.length)
            return undefined;
        return this.data.face[faceIndex];
    }
    constructor(data, facetStart, facetToFaceData) {
        super(data);
        if (facetStart)
            this.facetStart = facetStart.slice();
        else {
            this.facetStart = [];
            this.facetStart.push(0);
        }
        if (facetToFaceData)
            this.facetToFaceData = facetToFaceData.slice();
        else
            this.facetToFaceData = [];
    }
    /**
     * * Add facets from source to this polyface.
     * * optionally reverse the facets.
     * * optionally apply a transform to points.
     * * will only copy param, normal, color, and face data if we are already tracking them AND/OR the source contains them
     */
    addIndexedPolyface(source, reversed, transform) {
        const copyParams = allDefined(this.data.param, source.data.param, source.data.paramIndex);
        const copyNormals = allDefined(this.data.normal, source.data.normal, source.data.normalIndex);
        // Add point data
        const sourceToDestPointIndex = new GrowableArray_1.GrowableFloat64Array();
        sourceToDestPointIndex.ensureCapacity(source.data.pointCount);
        const sourcePoints = source.data.point;
        const xyz = PointVector_1.Point3d.create();
        for (let i = 0, n = source.data.point.length; i < n; i++) {
            sourcePoints.getPoint3dAt(i, xyz);
            if (transform) {
                transform.multiplyPoint3d(xyz, xyz);
                sourceToDestPointIndex.push(this.addPoint(xyz));
            }
            else
                sourceToDestPointIndex.push(this.addPoint(xyz));
        }
        // Add point index and facet data
        const numSourceFacets = source.facetStart.length - 1;
        for (let i = 0; i < numSourceFacets; i++) {
            const i0 = source.facetStart[i];
            const i1 = source.facetStart[i + 1];
            if (reversed) {
                for (let j = i1; j-- > i0;) {
                    this.addPointIndex(sourceToDestPointIndex.at(source.data.pointIndex[j]), source.data.edgeVisible[j]);
                }
            }
            else {
                for (let j = i0; j < i1; j++) {
                    this.addPointIndex(sourceToDestPointIndex.at(source.data.pointIndex[j]), source.data.edgeVisible[j]);
                }
            }
            this.terminateFacet(false);
        }
        // Add param and param index data
        if (copyParams) {
            const startOfNewParams = this.data.param.length;
            for (const param of source.data.param) {
                const sourceParam = param.clone();
                if (transform) {
                    // TODO: Perform transformation
                    this.addParam(sourceParam);
                }
                else {
                    this.addParam(sourceParam);
                }
            }
            for (let i = 0; i < source.facetStart.length; i++) {
                const i0 = source.facetStart[i];
                const i1 = source.facetStart[i + 1];
                if (reversed) {
                    for (let j = i1; j-- > i0;)
                        this.addParamIndex(startOfNewParams + source.data.paramIndex[j - 1]);
                }
                else {
                    for (let j = i0; j < i1; j++)
                        this.addParamIndex(startOfNewParams + source.data.paramIndex[j]);
                }
            }
        }
        // Add normal and normal index data
        if (copyNormals) {
            const startOfNewNormals = this.data.normal.length;
            for (const normal of source.data.normal) {
                const sourceNormal = normal.clone();
                if (transform) {
                    transform.multiplyVector(sourceNormal, sourceNormal);
                    this.addNormal(sourceNormal);
                }
                else {
                    this.addNormal(sourceNormal);
                }
            }
            for (let i = 0; i < source.facetStart.length; i++) {
                const i0 = source.facetStart[i];
                const i1 = source.facetStart[i + 1];
                if (reversed) {
                    for (let j = i1; j-- > i0;)
                        this.addNormalIndex(startOfNewNormals + source.data.normalIndex[j - 1]);
                }
                else {
                    for (let j = i0; j < i1; j++)
                        this.addNormalIndex(startOfNewNormals + source.data.normalIndex[j]);
                }
            }
        }
        // Add color and color index data
        if (this.data.color && source.data.color && source.data.colorIndex) {
            const startOfNewColors = this.data.color.length;
            for (const sourceColor of source.data.color) {
                this.addColor(sourceColor);
            }
            for (let i = 0; i < source.facetStart.length; i++) {
                const i0 = source.facetStart[i];
                const i1 = source.facetStart[i + 1];
                if (reversed) {
                    for (let j = i1; j-- > i0;)
                        this.addColorIndex(startOfNewColors + source.data.colorIndex[j - 1]);
                }
                else {
                    for (let j = i0; j < i1; j++)
                        this.addColorIndex(startOfNewColors + source.data.colorIndex[j]);
                }
            }
        }
        // Add face and facetToFace index data
        if (source.data.face.length !== 0) {
            const startOfNewFaceData = this.data.face.length;
            for (const face of source.data.face) {
                const sourceFaceData = face.clone();
                this.data.face.push(sourceFaceData);
            }
            for (const facetToFaceIdx of source.facetToFaceData) {
                this.facetToFaceData.push(startOfNewFaceData + facetToFaceIdx);
            }
        }
    }
    /** @returns Return the total number of param indices in zero-terminated style, which includes
     * * all the indices in the packed zero-based table
     * * one additional index for the zero-terminator of each facet.
     * @note Note that all index arrays (point, normal, param, color) have the same counts, so there
     * is not a separate query for each of them.
     */
    get zeroTerminatedIndexCount() { return this.data.pointIndex.length + this.facetStart.length - 1; }
    static create(needNormals = false, needParams = false, needColors = false) {
        return new IndexedPolyface(new PolyfaceData(needNormals, needParams, needColors));
    }
    /** add (a clone of ) a point. return its 0 based index.
     * @returns Returns the zero-based index of the added point.
     */
    addPoint(point) { this.data.point.pushXYZ(point.x, point.y, point.z); return this.data.point.length - 1; }
    /** add a point.
     * @returns Returns the zero-based index of the added point.
     */
    addPointXYZ(x, y, z) { this.data.point.push(PointVector_1.Point3d.create(x, y, z)); return this.data.point.length - 1; }
    addParam(param) {
        if (!this.data.param)
            this.data.param = [];
        this.data.param.push(param.clone());
        return this.data.param.length - 1;
    }
    addParamXY(x, y) {
        if (!this.data.param)
            this.data.param = [];
        this.data.param.push(PointVector_1.Point2d.create(x, y));
        return this.data.param.length - 1;
    }
    addNormal(normal) {
        if (!this.data.normal)
            this.data.normal = [];
        this.data.normal.push(normal.clone());
        return this.data.normal.length - 1;
    }
    addNormalXYZ(x, y, z) {
        if (!this.data.normal)
            this.data.normal = [];
        this.data.normal.push(PointVector_1.Vector3d.create(x, y, z));
        return this.data.normal.length - 1;
    }
    addColor(color) {
        if (!this.data.color)
            this.data.color = [];
        this.data.color.push(color);
        return this.data.color.length - 1;
    }
    addPointIndex(index, visible = true) { this.data.pointIndex.push(index); this.data.edgeVisible.push(visible); }
    addNormalIndex(index) {
        if (!this.data.normalIndex)
            this.data.normalIndex = [];
        this.data.normalIndex.push(index);
    }
    addParamIndex(index) {
        if (!this.data.paramIndex)
            this.data.paramIndex = [];
        this.data.paramIndex.push(index);
    }
    addColorIndex(index) {
        if (!this.data.colorIndex)
            this.data.colorIndex = [];
        this.data.colorIndex.push(index);
    }
    /** clean up the open facet.  return the returnValue (so caller can easily return cleanupOpenFacet("message")) */
    cleanupOpenFacet() {
        this.data.trimAllIndexArrays(this.data.pointIndex.length);
    }
    /** announce the end of construction of a facet.
     *
     * * The "open" facet is checked for:
     *
     * **  Same number of indices among all active index arrays --  point, normal, param, color
     * **  All indices are within bounds of the respective data arrays.
     * *  in error cases, all index arrays are trimmed back to the size when previous facet was terminated.
     * *  "undefined" return is normal.   Any other return is a description of an error.
     */
    terminateFacet(validateAllIndices = true) {
        const numFacets = this.facetStart.length - 1;
        const lengthA = this.facetStart[numFacets]; // number of indices in accepted facets
        const lengthB = this.data.pointIndex.length; // number of indices including the open facet
        if (validateAllIndices) {
            const messages = [];
            if (lengthB < lengthA + 2)
                messages.push("Less than 3 indices in open facet");
            if (this.data.normalIndex && this.data.normalIndex.length !== lengthB)
                messages.push("normalIndex count must match pointIndex count");
            if (this.data.paramIndex && this.data.paramIndex.length !== lengthB)
                messages.push("paramIndex count must equal pointIndex count");
            if (this.data.colorIndex && this.data.colorIndex.length !== lengthB)
                messages.push("colorIndex count must equal pointIndex count");
            if (this.data.edgeVisible.length !== lengthB)
                messages.push("visibleIndex count must equal pointIndex count");
            if (!areIndicesValid(this.data.normalIndex, lengthA, lengthB, this.data.normal))
                messages.push("invalid normal indices in open facet");
            if (messages.length > 0) {
                this.cleanupOpenFacet();
                return messages;
            }
        }
        // appending to facetStart accepts the facet !!!
        this.facetStart.push(lengthB);
        return undefined;
    }
    /**
     * All terminated facets added since the declaration of the previous face
     * will be grouped into a new face with their own 2D range.
     */
    /** (read-only property) number of facets */
    get facetCount() { return this.facetStart.length - 1; }
    /** (read-only property) number of faces */
    get faceCount() { return this.data.face.length; }
    /** (read-only property) number of points */
    get pointCount() { return this.data.pointCount; }
    /** (read-only property) number of colors */
    get colorCount() { return this.data.colorCount; }
    /** (read-only property) number of parameters */
    get paramCount() { return this.data.paramCount; }
    /** (read-only property) number of normals */
    get normalCount() { return this.data.normalCount; }
    numEdgeInFacet(facetIndex) {
        if (this.isValidFacetIndex(facetIndex))
            return this.facetStart[facetIndex + 1] - this.facetStart[facetIndex];
        return 0;
    }
    isValidFacetIndex(index) { return index >= 0 && index + 1 < this.facetStart.length; }
    /** ASSUME valid facet index . .. return its start index in index arrays. */
    facetIndex0(index) { return this.facetStart[index]; }
    /** ASSUME valid facet index . .. return its end index in index arrays. */
    facetIndex1(index) { return this.facetStart[index + 1]; }
    /** create a visitor for this polyface */
    createVisitor(numWrap = 0) { return IndexedPolyfaceVisitor.create(this, numWrap); }
    range(transform, result) { return this.data.range(result, transform); }
    extendRange(range, transform) { this.data.range(range, transform); }
    /** Given the index of a facet, return the data pertaining to the face it is a part of. */
    getFaceDataByFacetIndex(facetIndex) {
        return this.data.face[this.facetToFaceData[facetIndex]];
    }
    /** Given the index of a face, return the range of that face. */
    getFaceDataByFaceIndex(faceIndex) {
        return this.data.face[faceIndex];
    }
    /**
     * All terminated facets since the last face declaration will be mapped to a single new FacetFaceData object
     * using facetToFaceData[]. FacetFaceData holds the 2D range of the face. Returns true if successful, false otherwise.
     */
    setNewFaceData(endFacetIndex = 0) {
        const facetStart = this.facetToFaceData.length;
        if (facetStart >= this.facetStart.length)
            return false;
        if (0 === endFacetIndex)
            endFacetIndex = this.facetStart.length; // Last facetStart index corresponds to the next facet if we were to create one
        const faceData = FacetFaceData.createNull();
        const visitor = IndexedPolyfaceVisitor.create(this, 0);
        if (!visitor.moveToReadIndex(facetStart)) {
            return false;
        }
        // If parameter range is provided (by the polyface planeset clipper) then use it
        const paramDefined = this.data.param !== undefined;
        const setParamRange = faceData.paramRange.isNull() && paramDefined;
        do {
            for (let i = 0; i < visitor.numEdgesThisFacet; i++) {
                if (setParamRange && visitor.param !== undefined)
                    faceData.paramRange.extendPoint(visitor.param[i]);
            }
        } while (visitor.moveToNextFacet() && visitor.currentReadIndex() < endFacetIndex);
        if (paramDefined && !(this.data.param.length === 0) && faceData.paramDistanceRange.isNull())
            faceData.setParamDistanceRangeFromNewFaceData(this, facetStart, endFacetIndex);
        this.data.face.push(faceData);
        const faceDataIndex = this.data.face.length - 1;
        for (let i = this.facetToFaceData.length; i < endFacetIndex; i++)
            this.facetToFaceData.push(0 === this.facetStart[i] ? 0 : faceDataIndex);
        return true;
    }
    /** TODO: IMPLEMENT */
    isClosedByEdgePairing() {
        return false;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleIndexedPolyface(this);
    }
}
exports.IndexedPolyface = IndexedPolyface;
class IndexedPolyfaceVisitor extends PolyfaceData {
    // to be called from static factory method that validates the polyface ...
    constructor(facets, numWrap) {
        super(facets.data.normalCount > 0, facets.data.paramCount > 0, facets.data.colorCount > 0);
        this.polyface = facets;
        this.numWrap = numWrap;
        this.reset();
        this.numEdges = 0;
        this.nextFacetIndex = 0;
        this.currentFacetIndex = -1;
    }
    get numEdgesThisFacet() { return this.numEdges; }
    static create(polyface, numWrap) {
        return new IndexedPolyfaceVisitor(polyface, numWrap);
    }
    moveToReadIndex(facetIndex) {
        if (!this.polyface.isValidFacetIndex(facetIndex))
            return false;
        this.currentFacetIndex = facetIndex;
        this.nextFacetIndex = facetIndex + 1;
        this.numEdges = this.polyface.numEdgeInFacet(facetIndex);
        this.resizeAllDataArrays(this.numEdges + this.numWrap);
        this.gatherIndexedData(this.polyface.data, this.polyface.facetIndex0(this.currentFacetIndex), this.polyface.facetIndex1(this.currentFacetIndex), this.numWrap);
        return true;
    }
    moveToNextFacet() {
        if (this.nextFacetIndex !== this.currentFacetIndex)
            return this.moveToReadIndex(this.nextFacetIndex);
        this.nextFacetIndex++;
        return true;
    }
    reset() {
        this.moveToReadIndex(0);
        this.nextFacetIndex = 0; // so immediate moveToNextFacet stays here.
    }
    /**
     * Attempts to extract the distance parameter for the face of a given point index.
     * Returns the distance parameter as a point. Returns undefined on failure.
     */
    tryGetDistanceParameter(index, result) {
        if (index >= this.numEdgesThisFacet)
            return undefined;
        if (this.param === undefined || this.polyface.data.face.length === 0)
            return undefined;
        const faceData = this.polyface.tryGetFaceData(this.currentFacetIndex);
        if (!faceData)
            return undefined;
        return faceData.convertParamToDistance(this.param[index], result);
    }
    /**
     * Attempts to extract the normalized parameter (0,1) for the face of a given point index.
     * Returns the normalized parameter as a point. Returns undefined on failure.
     */
    tryGetNormalizedParameter(index, result) {
        if (index >= this.numEdgesThisFacet)
            return undefined;
        if (this.param === undefined || this.polyface.data.face.length === 0)
            return undefined;
        const faceData = this.polyface.tryGetFaceData(this.currentFacetIndex);
        if (!faceData)
            return undefined;
        return faceData.convertParamToNormalized(this.param[index], result);
    }
    currentReadIndex() { return this.currentFacetIndex; }
    clientPointIndex(i) { return this.pointIndex[i]; }
    clientParamIndex(i) { return this.paramIndex ? this.paramIndex[i] : -1; }
    clientNormalIndex(i) { return this.normalIndex ? this.normalIndex[i] : -1; }
    clientColorIndex(i) { return this.colorIndex ? this.colorIndex[i] : -1; }
}
exports.IndexedPolyfaceVisitor = IndexedPolyfaceVisitor;
//# sourceMappingURL=Polyface.js.map