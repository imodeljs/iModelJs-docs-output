"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Range_1 = require("../geometry3d/Range");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const ClusterableArray_1 = require("../numerics/ClusterableArray");
/**
 * PolyfaceData carries data arrays for point, normal, param, color and their indices.
 *
 * * IndexedPolyface carries a PolyfaceData as a member. (NOT as a base class -- it already has GeometryQuery as base)
 * * IndexedPolyfaceVisitor uses PolyfaceData as a base class.
 */
class PolyfaceData {
    constructor(needNormals = false, needParams = false, needColors = false) {
        this.point = new GrowableXYZArray_1.GrowableXYZArray();
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
        if (this.auxData)
            result.auxData = this.auxData.clone();
        return result;
    }
    isAlmostEqual(other) {
        if (!GrowableXYZArray_1.GrowableXYZArray.isAlmostEqual(this.point, other.point))
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
    /** return indexed point. This is a copy of the coordinates, not a reference. */
    getPoint(i) { return this.point.getPoint3dAt(i); }
    /** return indexed normal. This is the REFERENCE to the normal, not a copy. */
    getNormal(i) { return this.normal ? this.normal[i] : Point3dVector3d_1.Vector3d.create(); }
    /** return indexed param. This is the REFERENCE to the param, not a copy. */
    getParam(i) { return this.param ? this.param[i] : Point2dVector2d_1.Point2d.create(); }
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
        if (this.auxData && other.auxData && this.auxData.channels.length === other.auxData.channels.length) {
            for (let iChannel = 0; iChannel < this.auxData.channels.length; iChannel++) {
                const thisChannel = this.auxData.channels[iChannel];
                const otherChannel = other.auxData.channels[iChannel];
                const blockSize = thisChannel.entriesPerValue;
                if (thisChannel.data.length === otherChannel.data.length) {
                    for (let iData = 0; iData < thisChannel.data.length; iData++) {
                        const thisData = thisChannel.data[iData];
                        const otherData = otherChannel.data[iData];
                        for (let i = 0; i < numEdge; i++)
                            thisData.copyValues(otherData, i, index0 + i, blockSize);
                        for (let i = 0; i < numWrap; i++)
                            thisData.copyValues(thisData, numEdge + i, i, blockSize);
                    }
                }
            }
            for (let i = 0; i < numEdge; i++)
                this.auxData.indices[i] = other.auxData.indices[index0 + i];
            for (let i = 0; i < numWrap; i++)
                this.auxData.indices[numEdge + i] = this.auxData.indices[i];
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
        if (this.auxData) {
            PolyfaceData.trimArray(this.auxData.indices, length);
            for (const channel of this.auxData.channels) {
                for (const data of channel.data)
                    PolyfaceData.trimArray(data.values, channel.entriesPerValue * length);
            }
        }
    }
    resizeAllDataArrays(length) {
        if (length > this.point.length) {
            while (this.point.length < length)
                this.point.push(Point3dVector3d_1.Point3d.create());
            while (this.pointIndex.length < length)
                this.pointIndex.push(-1);
            while (this.edgeVisible.length < length)
                this.edgeVisible.push(false);
            if (this.normal)
                while (this.normal.length < length)
                    this.normal.push(Point3dVector3d_1.Vector3d.create());
            if (this.param)
                while (this.param.length < length)
                    this.param.push(Point2dVector2d_1.Point2d.create());
            if (this.color)
                while (this.color.length < length)
                    this.color.push(0);
            if (this.auxData) {
                for (const channel of this.auxData.channels) {
                    for (const channelData of channel.data) {
                        while (channelData.values.length < length * channel.entriesPerValue)
                            channelData.values.push(0);
                    }
                }
            }
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
            if (this.auxData) {
                for (const channel of this.auxData.channels) {
                    for (const channelData of channel.data) {
                        channelData.values.length = length * channel.entriesPerValue;
                    }
                }
            }
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
        if (facetStartIndex && PolyfaceData.isValidFacetStartIndexArray(facetStartIndex)) {
            PolyfaceData.reverseIndices(facetStartIndex, this.pointIndex, true);
            PolyfaceData.reverseIndices(facetStartIndex, this.normalIndex, true);
            PolyfaceData.reverseIndices(facetStartIndex, this.paramIndex, true);
            PolyfaceData.reverseIndices(facetStartIndex, this.colorIndex, true);
            PolyfaceData.reverseIndices(facetStartIndex, this.edgeVisible, false);
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
            // apply simple Matrix3d to normals ...
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
    /**
     * Test if facetStartIndex is (minimally!) valid:
     * * length must be nonzero (recall that for "no facets" the facetStartIndexArray still must contain a 0)
     * * Each entry must be strictly smaller than the one that follows.
     * @param facetStartIndex array of facetStart data.  facet `i` has indices at `facetsStartIndex[i]` to (one before) `facetStartIndex[i+1]`
     */
    static isValidFacetStartIndexArray(facetStartIndex) {
        // facetStartIndex for empty facets has a single entry "0" -- empty array is not allowed
        if (facetStartIndex.length === 0)
            return false;
        for (let i = 0; i + 1 < facetStartIndex.length; i++)
            if (facetStartIndex[i] >= facetStartIndex[i + 1])
                return false;
        return true;
    }
    static reverseIndices(facetStartIndex, indices, preserveStart) {
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
//# sourceMappingURL=PolyfaceData.js.map