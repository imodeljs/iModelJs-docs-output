"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
// import { Geometry } from "./Geometry";
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const GeometryQuery_1 = require("../curve/GeometryQuery");
const PolyfaceData_1 = require("./PolyfaceData");
const FacetFaceData_1 = require("./FacetFaceData");
const Geometry_1 = require("../Geometry");
const GrowableXYArray_1 = require("../geometry3d/GrowableXYArray");
function allDefined(valueA, valueB, valueC) {
    return valueA !== undefined && valueB !== undefined && valueC !== undefined;
}
/**
 * A Polyface is n abstract mesh structure (of unspecified implementation) that provides a PolyfaceVisitor
 * to iterate over its facets.
 * @public
 */
class Polyface extends GeometryQuery_1.GeometryQuery {
    constructor(data) {
        super();
        /** String name for schema properties */
        this.geometryCategory = "polyface";
        this.data = data;
    }
    /** Return the flag indicating if the mesh display must assume both sides are visible. */
    get twoSided() { return this.data.twoSided; }
    /** set the flag indicating if the mesh display must assume both sides are visible. */
    set twoSided(value) { this.data.twoSided = value; }
    /**
       * Check validity of indices into a data array.
       * * It is valid to have  both indices and data undefined.
       * * It is NOT valid for just one to be defined.
       * * Index values at indices[indexPositionA <= i < indexPositionB] must be valid indices to the data array.
       * @param indices array of indices.
       * @param indexPositionA first index to test
       * @param indexPositionB one past final index to test
       * @param data data array.  Only its length is referenced.
       */
    static areIndicesValid(indices, indexPositionA, indexPositionB, data, dataLength) {
        if (indices === undefined && data === undefined)
            return true;
        if (!indices || !data)
            return false;
        if (indexPositionA < 0 || indexPositionA >= indices.length)
            return false;
        if (indexPositionB < indexPositionA || indexPositionB > indices.length)
            return false;
        for (let i = indexPositionA; i < indexPositionB; i++)
            if (indices[i] < 0 || indices[i] >= dataLength)
                return false;
        return true;
    }
}
exports.Polyface = Polyface;
/**
 * An `IndexedPolyface` is a set of facets which can have normal, param, and color arrays with independent point, normal, param, and color indices.
 * @public
 */
class IndexedPolyface extends Polyface {
    /**
     * Constructor for a new polyface.
     * @param data PolyfaceData arrays to capture.
     * @param facetStart optional array of facet start indices (e.g. known during clone)
     * @param facetToFacetData optional array of face identifiers (e.g. known during clone)
     */
    constructor(data, facetStart, facetToFaceData) {
        super(data);
        if (facetStart)
            this._facetStart = facetStart.slice();
        else {
            this._facetStart = [];
            this._facetStart.push(0);
        }
        if (facetToFaceData)
            this._facetToFaceData = facetToFaceData.slice();
        else
            this._facetToFaceData = [];
    }
    /** Test if other is an instance of `IndexedPolyface` */
    isSameGeometryClass(other) { return other instanceof IndexedPolyface; }
    /** Tests for equivalence between two IndexedPolyfaces. */
    isAlmostEqual(other) {
        if (other instanceof IndexedPolyface) {
            return this.data.isAlmostEqual(other.data) && PointHelpers_1.NumberArray.isExactEqual(this._facetStart, other._facetStart) &&
                PointHelpers_1.NumberArray.isExactEqual(this._facetToFaceData, other._facetToFaceData);
        }
        return false;
    }
    /**
     * Returns true if either the point array or the point index array is empty.
     */
    get isEmpty() { return this.data.pointCount === 0 || this.data.pointIndex.length === 0; }
    /**
     * * apply the transform to points
     * * apply the (inverse transpose of) the matrix part to normals
     * * If determinant is negative, also
     *   * negate normals
     *   * reverse index order around each facet.
     * @param transform
     */
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
    /** Return a deep clone. */
    clone() {
        const result = new IndexedPolyface(this.data.clone(), this._facetStart.slice(), this._facetToFaceData.slice());
        return result;
    }
    /** Return a deep clone with transformed points and normals */
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    /** Reverse the order of indices around all facets. */
    reverseIndices() { this.data.reverseIndices(this._facetStart); }
    /** Reverse the direction of all normal vectors. */
    reverseNormals() { this.data.reverseNormals(); }
    /** return face data using a facet index. This is the REFERENCE to the FacetFaceData, not a copy. Returns undefined if none found. */
    tryGetFaceData(i) {
        const faceIndex = this._facetToFaceData[i];
        if (faceIndex >= this.data.face.length)
            return undefined;
        return this.data.face[faceIndex];
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
        const sourceToDestPointIndex = new GrowableFloat64Array_1.GrowableFloat64Array();
        sourceToDestPointIndex.ensureCapacity(source.data.pointCount);
        const sourcePoints = source.data.point;
        const xyz = Point3dVector3d_1.Point3d.create();
        for (let i = 0, n = source.data.point.length; i < n; i++) {
            sourcePoints.getPoint3dAtUncheckedPointIndex(i, xyz);
            if (transform) {
                transform.multiplyPoint3d(xyz, xyz);
                sourceToDestPointIndex.push(this.addPoint(xyz));
            }
            else
                sourceToDestPointIndex.push(this.addPoint(xyz));
        }
        // Add point index and facet data
        const numSourceFacets = source._facetStart.length - 1;
        for (let i = 0; i < numSourceFacets; i++) {
            const i0 = source._facetStart[i];
            const i1 = source._facetStart[i + 1];
            if (reversed) {
                for (let j = i1; j-- > i0;) {
                    this.addPointIndex(sourceToDestPointIndex.atUncheckedIndex(source.data.pointIndex[j]), source.data.edgeVisible[j]);
                }
            }
            else {
                for (let j = i0; j < i1; j++) {
                    this.addPointIndex(sourceToDestPointIndex.atUncheckedIndex(source.data.pointIndex[j]), source.data.edgeVisible[j]);
                }
            }
            this.terminateFacet(false);
        }
        // Add param and param index data
        if (copyParams) {
            const myParams = this.data.param;
            const startOfNewParams = myParams.length;
            myParams.pushFromGrowableXYArray(source.data.param);
            for (let i = 0; i < source._facetStart.length; i++) { // Expect facet start and ends for points to match normals
                const i0 = source._facetStart[i];
                const i1 = source._facetStart[i + 1];
                if (reversed) {
                    for (let j = i1; j-- > i0;)
                        this.addParamIndex(startOfNewParams + source.data.paramIndex[j]);
                }
                else {
                    for (let j = i0; j < i1; j++)
                        this.addParamIndex(startOfNewParams + source.data.paramIndex[j]);
                }
            }
        }
        // Add normal and normal index data
        if (copyNormals && source.data.normal) {
            const startOfNewNormals = this.data.normal.length;
            const numNewNormals = source.data.normal.length;
            for (let i = 0; i < numNewNormals; i++) {
                const sourceNormal = source.data.normal.getVector3dAtCheckedVectorIndex(i);
                if (transform) {
                    transform.multiplyVector(sourceNormal, sourceNormal);
                    this.addNormal(sourceNormal);
                }
                else {
                    this.addNormal(sourceNormal);
                }
            }
            for (let i = 0; i < source._facetStart.length; i++) { // Expect facet start and ends for points to match normals
                const i0 = source._facetStart[i];
                const i1 = source._facetStart[i + 1];
                if (reversed) {
                    for (let j = i1; j-- > i0;)
                        this.addNormalIndex(startOfNewNormals + source.data.normalIndex[j]);
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
            for (let i = 0; i < source._facetStart.length; i++) { // Expect facet start and ends for points to match colors
                const i0 = source._facetStart[i];
                const i1 = source._facetStart[i + 1];
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
            for (const facetToFaceIdx of source._facetToFaceData) {
                this._facetToFaceData.push(startOfNewFaceData + facetToFaceIdx);
            }
        }
    }
    /** Return the total number of param indices in zero-terminated style, which includes
     * * all the indices in the packed zero-based table
     * * one additional index for the zero-terminator of each facet.
     * @note Note that all index arrays (point, normal, param, color) have the same counts, so there
     * is not a separate query for each of them.
     */
    get zeroTerminatedIndexCount() { return this.data.pointIndex.length + this._facetStart.length - 1; }
    /** Create an empty facet set, with coordinate and index data to be supplied later.
     * @param needNormals true if normals will be constructed
     * @param needParams true if uv parameters will be constructed
     * @param needColors true if colors will e constructed.
     */
    static create(needNormals = false, needParams = false, needColors = false, twoSided = false) {
        return new IndexedPolyface(new PolyfaceData_1.PolyfaceData(needNormals, needParams, needColors, twoSided));
    }
    /** add (a clone of ) a point. return its 0 based index.
     * @param point point coordinates
     * @param priorIndex optional index of prior point to check for repeated coordinates
     * @returns Returns the zero-based index of the added or reused point.
     */
    addPoint(point, priorIndex) {
        if (priorIndex !== undefined) {
            const distance = this.data.point.distanceIndexToPoint(priorIndex, point);
            if (distance !== undefined && Geometry_1.Geometry.isSmallMetricDistance(distance))
                return priorIndex;
        }
        this.data.point.pushXYZ(point.x, point.y, point.z);
        return this.data.point.length - 1;
    }
    /** add a point.
     * @returns Returns the zero-based index of the added point.
     */
    addPointXYZ(x, y, z) { this.data.point.push(Point3dVector3d_1.Point3d.create(x, y, z)); return this.data.point.length - 1; }
    /** Add a uv param.
     * @returns 0-based index of the added param.
     */
    addParam(param) {
        if (!this.data.param)
            this.data.param = new GrowableXYArray_1.GrowableXYArray();
        this.data.param.push(param);
        return this.data.param.length - 1;
    }
    /** Add a uv parameter to the parameter array.
     * @param priorIndexA first index to check for possible duplicate value.
     * @param priorIndexB second index to check for possible duplicate value.
     * @returns 0-based index of the added or reused param.
     */
    addParamUV(u, v, priorIndexA, priorIndexB) {
        if (!this.data.param)
            this.data.param = new GrowableXYArray_1.GrowableXYArray();
        if (priorIndexA !== undefined && this.data.isAlmostEqualParamIndexUV(priorIndexA, u, v))
            return priorIndexA;
        if (priorIndexB !== undefined && this.data.isAlmostEqualParamIndexUV(priorIndexB, u, v))
            return priorIndexB;
        this.data.param.push(Point2dVector2d_1.Point2d.create(u, v));
        return this.data.param.length - 1;
    }
    /** Add a normal vector
     * @param priorIndexA first index to check for possible duplicate value.
     * @param priorIndexB second index to check for possible duplicate value.
     * @returns 0-based index of the added or reused normal.
     */
    addNormal(normal, priorIndexA, priorIndexB) {
        if (this.data.normal !== undefined) {
            let distance;
            if (priorIndexA !== undefined) {
                distance = this.data.normal.distanceIndexToPoint(priorIndexA, normal);
                if (distance !== undefined && Geometry_1.Geometry.isSmallMetricDistance(distance))
                    return priorIndexA;
            }
            if (priorIndexB !== undefined) {
                distance = this.data.normal.distanceIndexToPoint(priorIndexB, normal);
                if (distance !== undefined && Geometry_1.Geometry.isSmallMetricDistance(distance))
                    return priorIndexB;
            }
            const tailIndex = this.data.normal.length - 1;
            distance = this.data.normal.distanceIndexToPoint(tailIndex, normal);
            if (distance !== undefined && Geometry_1.Geometry.isSmallMetricDistance(distance))
                return tailIndex;
        }
        return this.addNormalXYZ(normal.x, normal.y, normal.z);
    }
    /** Add a normal vector given by direct coordinates
     * @returns 0-based index of the added or reused param.
     */
    addNormalXYZ(x, y, z) {
        if (!this.data.normal)
            this.data.normal = new GrowableXYZArray_1.GrowableXYZArray();
        this.data.normal.pushXYZ(x, y, z);
        return this.data.normal.length - 1;
    }
    /** Add a color
     * @returns 0-based index of the added or reused color.
     */
    addColor(color) {
        if (!this.data.color)
            this.data.color = [];
        this.data.color.push(color);
        return this.data.color.length - 1;
    }
    /** Add a point index with edge visibility flag. */
    addPointIndex(index, visible = true) { this.data.pointIndex.push(index); this.data.edgeVisible.push(visible); }
    /** Add a normal index */
    addNormalIndex(index) {
        if (!this.data.normalIndex)
            this.data.normalIndex = [];
        this.data.normalIndex.push(index);
    }
    /** Add a param index */
    addParamIndex(index) {
        if (!this.data.paramIndex)
            this.data.paramIndex = [];
        this.data.paramIndex.push(index);
    }
    /** Add a color index */
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
        const numFacets = this._facetStart.length - 1;
        const lengthA = this._facetStart[numFacets]; // number of indices in accepted facets
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
            if (!Polyface.areIndicesValid(this.data.normalIndex, lengthA, lengthB, this.data.normal, this.data.normal ? this.data.normal.length : 0))
                messages.push("invalid normal indices in open facet");
            if (messages.length > 0) {
                this.cleanupOpenFacet();
                return messages;
            }
        }
        // appending to facetStart accepts the facet !!!
        this._facetStart.push(lengthB);
        return undefined;
    }
    /**
     * All terminated facets added since the declaration of the previous face
     * will be grouped into a new face with their own 2D range.
     */
    /** (read-only property) number of facets */
    get facetCount() { return this._facetStart.length - 1; }
    /** (read-only property) number of faces */
    get faceCount() { return this.data.faceCount; }
    /** (read-only property) number of points */
    get pointCount() { return this.data.pointCount; }
    /** (read-only property) number of colors */
    get colorCount() { return this.data.colorCount; }
    /** (read-only property) number of parameters */
    get paramCount() { return this.data.paramCount; }
    /** (read-only property) number of normals */
    get normalCount() { return this.data.normalCount; }
    /** Return the number of edges in a particular facet. */
    numEdgeInFacet(facetIndex) {
        if (this.isValidFacetIndex(facetIndex))
            return this._facetStart[facetIndex + 1] - this._facetStart[facetIndex];
        return 0;
    }
    /** test if `index` is a valid facet index. */
    isValidFacetIndex(index) { return index >= 0 && index + 1 < this._facetStart.length; }
    /** ASSUME valid facet index . .. return its start index in index arrays. */
    facetIndex0(index) { return this._facetStart[index]; }
    /** ASSUME valid facet index . .. return its end index in index arrays. */
    facetIndex1(index) { return this._facetStart[index + 1]; }
    /** create a visitor for this polyface */
    createVisitor(numWrap = 0) { return IndexedPolyfaceVisitor.create(this, numWrap); }
    /** Return the range of (optionally transformed) points in this mesh. */
    range(transform, result) { return this.data.range(result, transform); }
    /** Extend `range` with coordinates from this mesh */
    extendRange(range, transform) { this.data.range(range, transform); }
    /** Given the index of a facet, return the data pertaining to the face it is a part of. */
    getFaceDataByFacetIndex(facetIndex) {
        return this.data.face[this._facetToFaceData[facetIndex]];
    }
    /**
     * All terminated facets since the last face declaration will be mapped to a single new FacetFaceData object
     * using facetToFaceData[]. FacetFaceData holds the 2D range of the face. Returns true if successful, false otherwise.
     */
    setNewFaceData(endFacetIndex = 0) {
        const facetStart = this._facetToFaceData.length;
        if (facetStart >= this._facetStart.length)
            return false;
        if (0 === endFacetIndex) // The default for endFacetIndex is really the last facet
            endFacetIndex = this._facetStart.length; // Last facetStart index corresponds to the next facet if we were to create one
        const faceData = FacetFaceData_1.FacetFaceData.createNull();
        const visitor = IndexedPolyfaceVisitor.create(this, 0);
        if (!visitor.moveToReadIndex(facetStart)) { // Move visitor to first facet of new face
            return false;
        }
        // If parameter range is provided (by the polyface planeSet clipper) then use it
        const paramDefined = this.data.param !== undefined;
        const setParamRange = faceData.paramRange.isNull && paramDefined;
        do {
            if (setParamRange && visitor.param !== undefined)
                visitor.param.extendRange(faceData.paramRange);
        } while (visitor.moveToNextFacet() && visitor.currentReadIndex() < endFacetIndex);
        if (paramDefined && !(this.data.param.length === 0) && faceData.paramDistanceRange.isNull)
            faceData.setParamDistanceRangeFromNewFaceData(this, facetStart, endFacetIndex);
        this.data.face.push(faceData);
        const faceDataIndex = this.data.face.length - 1;
        for (let i = this._facetToFaceData.length; i < endFacetIndex; i++)
            this._facetToFaceData.push(0 === this._facetStart[i] ? 0 : faceDataIndex);
        return true;
    }
    /** Second step of double dispatch:  call `handler.handleIndexedPolyface(this)` */
    dispatchToGeometryHandler(handler) {
        return handler.handleIndexedPolyface(this);
    }
}
exports.IndexedPolyface = IndexedPolyface;
/**
 * An `IndexedPolyfaceVisitor` is an iterator-like object that "visits" facets of a mesh.
 * * The visitor extends a `PolyfaceData ` class, so it can at any time hold all the data of a single facet.
 * @public
 */
class IndexedPolyfaceVisitor extends PolyfaceData_1.PolyfaceData {
    // to be called from static factory method that validates the polyface ...
    constructor(facets, numWrap) {
        super(facets.data.normalCount > 0, facets.data.paramCount > 0, facets.data.colorCount > 0, facets.twoSided);
        this._polyface = facets;
        this._numWrap = numWrap;
        if (facets.data.auxData)
            this.auxData = facets.data.auxData.createForVisitor();
        this.reset();
        this._numEdges = 0;
        this._nextFacetIndex = 0;
        this._currentFacetIndex = -1;
    }
    /** Return the client polyface object. */
    clientPolyface() { return this._polyface; }
    /** Set the number of vertices duplicated (e.g. 1 for start and end) in arrays in the visitor. */
    setNumWrap(numWrap) { this._numWrap = numWrap; }
    /** Return the number of edges in the current facet.
     * * Not that if this visitor has `numWrap` greater than zero, the number of edges is smaller than the number of points.
     */
    get numEdgesThisFacet() { return this._numEdges; }
    /** Create a visitor for iterating the facets of `polyface`, with indicated number of points to be added to each facet to produce closed point arrays
     * Typical wrap counts are:
     * * 0 -- leave the point arrays with "missing final edge"
     * * 1 -- add point 0 as closure point
     * * 2 -- add points 0 and 1 as closure and wrap point.  This is useful when vertex visit requires two adjacent vectors, e.g. for cross products.
     */
    static create(polyface, numWrap) {
        return new IndexedPolyfaceVisitor(polyface, numWrap);
    }
    /** Advance the iterator to a particular facet in the client polyface */
    moveToReadIndex(facetIndex) {
        if (!this._polyface.isValidFacetIndex(facetIndex))
            return false;
        this._currentFacetIndex = facetIndex;
        this._nextFacetIndex = facetIndex + 1;
        this._numEdges = this._polyface.numEdgeInFacet(facetIndex);
        this.resizeAllDataArrays(this._numEdges + this._numWrap);
        this.gatherIndexedData(this._polyface.data, this._polyface.facetIndex0(this._currentFacetIndex), this._polyface.facetIndex1(this._currentFacetIndex), this._numWrap);
        return true;
    }
    /** Advance the iterator to a the 'next' facet in the client polyface */
    moveToNextFacet() {
        if (this._nextFacetIndex !== this._currentFacetIndex)
            return this.moveToReadIndex(this._nextFacetIndex);
        this._nextFacetIndex++;
        return true;
    }
    /** Reset the iterator to start at the first facet of the polyface. */
    reset() {
        this.moveToReadIndex(0);
        this._nextFacetIndex = 0; // so immediate moveToNextFacet stays here.
    }
    /**
     * Attempts to extract the distance parameter for the given vertex index on the current facet
     * Returns the distance parameter as a point. Returns undefined on failure.
     */
    tryGetDistanceParameter(index, result) {
        if (index >= this.numEdgesThisFacet)
            return undefined;
        if (this.param === undefined || this._polyface.data.face.length === 0)
            return undefined;
        const faceData = this._polyface.tryGetFaceData(this._currentFacetIndex);
        if (!faceData)
            return undefined;
        return faceData.convertParamXYToDistance(this.param.getXAtUncheckedPointIndex(index), this.param.getYAtUncheckedPointIndex(index), result);
    }
    /**
     * Attempts to extract the normalized parameter (0,1) for the given vertex index on the current facet.
     * Returns the normalized parameter as a point. Returns undefined on failure.
     */
    tryGetNormalizedParameter(index, result) {
        if (index >= this.numEdgesThisFacet)
            return undefined;
        if (this.param === undefined || this._polyface.data.face.length === 0)
            return undefined;
        const faceData = this._polyface.tryGetFaceData(this._currentFacetIndex);
        if (!faceData)
            return undefined;
        return faceData.convertParamXYToNormalized(this.param.getXAtUncheckedPointIndex(index), this.param.getYAtUncheckedPointIndex(index), result);
    }
    /** Return the index (in the client polyface) of the current facet */
    currentReadIndex() { return this._currentFacetIndex; }
    /** Return the point index of vertex i within the currently loaded facet */
    clientPointIndex(i) { return this.pointIndex[i]; }
    /** Return the param index of vertex i within the currently loaded facet */
    clientParamIndex(i) { return this.paramIndex ? this.paramIndex[i] : -1; }
    /** Return the normal index of vertex i within the currently loaded facet */
    clientNormalIndex(i) { return this.normalIndex ? this.normalIndex[i] : -1; }
    /** Return the color index of vertex i within the currently loaded facet */
    clientColorIndex(i) { return this.colorIndex ? this.colorIndex[i] : -1; }
    /** Return the aux data index of vertex i within the currently loaded facet */
    clientAuxIndex(i) { return this.auxData ? this.auxData.indices[i] : -1; }
    /** clear the contents of all arrays.  Use this along with transferDataFrom methods to build up new facets */
    clearArrays() {
        if (this.point !== undefined)
            this.point.length = 0;
        if (this.param !== undefined)
            this.param.length = 0;
        if (this.normal !== undefined)
            this.normal.length = 0;
        if (this.color !== undefined)
            this.color.length = 0;
    }
    /** transfer data from a specified index of the other visitor as new data in this visitor. */
    pushDataFrom(other, index) {
        this.point.pushFromGrowableXYZArray(other.point, index);
        if (this.color && other.color && index < other.color.length)
            this.color.push(other.color[index]);
        if (this.param && other.param && index < other.param.length)
            this.param.pushFromGrowableXYArray(other.param, index);
        if (this.normal && other.normal && index < other.normal.length)
            this.normal.pushFromGrowableXYZArray(other.normal, index);
    }
    /** transfer interpolated data from the other visitor.
     * * all data values are interpolated at `fraction` between `other` values at index0 and index1.
     */
    pushInterpolatedDataFrom(other, index0, fraction, index1) {
        this.point.pushInterpolatedFromGrowableXYZArray(other.point, index0, fraction, index1);
        if (this.color && other.color && index0 < other.color.length && index1 < other.color.length)
            this.color.push(interpolateColor(other.color[index0], fraction, other.color[index1]));
        if (this.param && other.param && index0 < other.param.length && index1 < other.param.length)
            this.param.pushInterpolatedFromGrowableXYArray(other.param, index0, fraction, index1);
        if (this.normal && other.normal && index0 < other.normal.length && index1 < other.normal.length)
            this.normal.pushInterpolatedFromGrowableXYZArray(other.normal, index0, fraction, index1);
    }
}
exports.IndexedPolyfaceVisitor = IndexedPolyfaceVisitor;
/**
 * * shift to right by shiftBits.
 * * mask off the low 8 bits
 * * interpolate the number
 * * truncate to floor
 * * shift left
 * * Hence all numbers in and out of the floating point are 0..255.
 * @param color0
 * @param fraction
 * @param color1
 * @param shiftBits
 */
function interpolateByte(color0, fraction, color1, shiftBits) {
    color0 = (color0 >>> shiftBits) & 0xFF;
    color1 = (color1 >>> shiftBits) & 0xFF;
    const color = Math.floor(color0 + fraction * (color1 - color0)) & 0xFF;
    return color << shiftBits;
}
function interpolateColor(color0, fraction, color1) {
    // don't allow fractions outside the individual byte ranges.
    fraction = Geometry_1.Geometry.clamp(fraction, 0, 1);
    // interpolate each byte in place ....
    /*
    const byte0 = interpolateLowByte(color0 & 0xFF, fraction, color1 & 0xFF);
    const byte1 = interpolateLowByte((color0 & 0xFF00) >>> 8, fraction, (color1 & 0xFF00) >>> 8) << 8;
    const byte2 = interpolateLowByte((color0 & 0xFF0000) >>> 16, fraction, (color1 & 0xFF0000) >>> 16) << 16;
    const byte3 = interpolateLowByte((color0 & 0xFF000000) >>> 24, fraction, (color1 & 0xFF000000) >>> 24) << 24;
    */
    const byte0 = interpolateByte(color0, fraction, color1, 0);
    const byte1 = interpolateByte(color0, fraction, color1, 8);
    const byte2 = interpolateByte(color0, fraction, color1, 16);
    const byte3 = interpolateByte(color0, fraction, color1, 24);
    return (byte0 | byte1 | byte2 | byte3);
}
//# sourceMappingURL=Polyface.js.map