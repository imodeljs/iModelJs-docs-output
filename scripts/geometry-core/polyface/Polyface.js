"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Polyface */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty*/
// import { Geometry } from "./Geometry";
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Range_1 = require("../geometry3d/Range");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
const GeometryQuery_1 = require("../curve/GeometryQuery");
const PolyfaceData_1 = require("./PolyfaceData");
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
        result = result ? result : Point2dVector2d_1.Point2d.create();
        const paramDelta = this._paramRange.high.minus(this._paramRange.low);
        result.x = (0 === paramDelta.x) ? param.x : (this._paramDistanceRange.low.x + (param.x - this._paramRange.low.x)
            * (this._paramDistanceRange.high.x - this._paramDistanceRange.low.x) / paramDelta.x);
        result.y = (0.0 === paramDelta.y) ? param.y : (this.paramDistanceRange.low.y + (param.y - this._paramRange.low.y)
            * (this._paramDistanceRange.high.y - this._paramDistanceRange.low.y) / paramDelta.y);
        return result;
    }
    /** Return normalized (0-1) parameter from stored parameter value. */
    convertParamToNormalized(param, result) {
        result = result ? result : Point2dVector2d_1.Point2d.create();
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
        const dSTotal = Point2dVector2d_1.Point2d.create();
        const dSSquaredTotal = Point2dVector2d_1.Point2d.create();
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
                        const dwDu = Point3dVector3d_1.Point3d.createFrom(delta0);
                        dwDu.scaleInPlace(dUV1.y);
                        dwDu.addScaledInPlace(delta1, -dUV0.y);
                        const dwDv = Point3dVector3d_1.Point3d.createFrom(delta1);
                        dwDv.scaleInPlace(dUV0.x);
                        dwDv.addScaledInPlace(delta0, -dUV1.x);
                        const dS = Point2dVector2d_1.Point2d.create(dwDu.magnitude() / uvCross, dwDv.magnitude() / uvCross);
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
            const dS = Point2dVector2d_1.Point2d.create(dSTotal.x / aveTotal, dSTotal.y / aveTotal);
            const standardDeviation = Point2dVector2d_1.Point2d.create(Math.sqrt(Math.abs((dSSquaredTotal.x / aveTotal) - dS.x * dS.x)), Math.sqrt(Math.abs((dSSquaredTotal.y / aveTotal) - dS.y * dS.y)));
            // TR# 268980 - Add standard deviation to match QV....
            this._paramDistanceRange.low.set(0, 0);
            this._paramDistanceRange.high.set((dS.x + standardDeviation.x) * (this._paramRange.high.x - this._paramRange.low.x), (dS.y + standardDeviation.y) * (this._paramRange.high.y - this._paramRange.low.y));
        }
        return true;
    }
}
exports.FacetFaceData = FacetFaceData;
/** The data types of [[AuxChannel]].  The scalar types are used to produce thematic  vertex colors. */
var AuxChannelDataType;
(function (AuxChannelDataType) {
    /** General scalar type - no scaling is applied if associated [[Polyface]] is transformed. */
    AuxChannelDataType[AuxChannelDataType["Scalar"] = 0] = "Scalar";
    /** Distance (scalar) scaling is applied if associated [[Polyface]] is scaled. 3 Data values (x,y.z) per entry. */
    AuxChannelDataType[AuxChannelDataType["Distance"] = 1] = "Distance";
    /** Displacement added to  vertex position.  Transformed and scaled with associated [[Polyface]]. 3 Data values (x,y.z) per entry.,*/
    AuxChannelDataType[AuxChannelDataType["Vector"] = 2] = "Vector";
    /** Normal -- replaces vertex normal.  Rotated with associated [[Polyface]] transformation. 3 Data values (x,y.z) per entry. */
    AuxChannelDataType[AuxChannelDataType["Normal"] = 3] = "Normal";
})(AuxChannelDataType = exports.AuxChannelDataType || (exports.AuxChannelDataType = {}));
/**  Represents the [[AuxChannel]] data at a single input value. */
class AuxChannelData {
    /** Construct a new [[AuxChannelData]] from input value and vertex values. */
    constructor(input, values) {
        this.input = input;
        this.values = values;
    }
    copyValues(other, thisIndex, otherIndex, blockSize) {
        for (let i = 0; i < blockSize; i++)
            this.values[thisIndex * blockSize + i] = other.values[otherIndex * blockSize + i];
    }
    clone() {
        return new AuxChannelData(this.input, this.values.slice());
    }
    isAlmostEqual(other, tol) {
        const tolerance = tol ? tol : 1.0E-8;
        return Math.abs(this.input - other.input) < tolerance && PointHelpers_1.NumberArray.isAlmostEqual(this.values, other.values, tolerance);
    }
}
exports.AuxChannelData = AuxChannelData;
/**  Represents a single [[PolyfaceAuxData]] channel. A channel  may represent a single scalar value such as stress or temperature or may represent displacements from vertex position or replacements for normals. */
class AuxChannel {
    /** create a [[AuxChannel]] */
    constructor(data, dataType, name, inputName) {
        this.data = data;
        this.dataType = dataType;
        this.name = name;
        this.inputName = inputName;
    }
    clone() {
        const clonedData = [];
        for (const data of this.data)
            clonedData.push(data.clone());
        return new AuxChannel(clonedData, this.dataType, this.name, this.inputName);
    }
    isAlmostEqual(other, tol) {
        if (this.dataType !== other.dataType ||
            this.name !== other.name ||
            this.inputName !== other.inputName ||
            this.data.length !== other.data.length)
            return false;
        for (let i = 0; i < this.data.length; i++)
            if (!this.data[i].isAlmostEqual(other.data[i], tol))
                return false;
        return true;
    }
    /** return true if the data for this channel is of scalar type (single data entry per value) */
    get isScalar() { return this.dataType === AuxChannelDataType.Distance || this.dataType === AuxChannelDataType.Scalar; }
    /** return the number of data values per entry (1 for scalar, 3 for point or vector */
    get entriesPerValue() { return this.isScalar ? 1 : 3; }
    /** return value count */
    get valueCount() { return 0 === this.data.length ? 0 : this.data[0].values.length / this.entriesPerValue; }
    /** return the range of the scalar data. (undefined if not scalar) */
    get scalarRange() {
        if (!this.isScalar)
            return undefined;
        const range = Range_1.Range1d.createNull();
        for (const data of this.data) {
            range.extendArray(data.values);
        }
        return range;
    }
}
exports.AuxChannel = AuxChannel;
/**  The `PolyfaceAuxData` structure contains one or more analytical data channels for each vertex of a `Polyface`.
 * Typically a `Polyface` will contain only vertex data required for its basic display,the vertex position, normal
 * and possibly texture parameter.  The `PolyfaceAuxData` structure contains supplemental data that is generally computed
 *  in an analysis program or other external data source.  This can be scalar data used to either overide the vertex colors through *Thematic Colorization* or
 *  XYZ data used to deform the mesh by adjusting the vertex postions or normals.
 */
class PolyfaceAuxData {
    constructor(channels, indices) {
        this.channels = channels;
        this.indices = indices;
    }
    clone() {
        const clonedChannels = [];
        for (const channel of this.channels)
            clonedChannels.push(channel.clone());
        return new PolyfaceAuxData(clonedChannels, this.indices.slice());
    }
    isAlmostEqual(other, tol) {
        if (!PointHelpers_1.NumberArray.isExactEqual(this.indices, other.indices) || this.channels.length !== other.channels.length)
            return false;
        for (let i = 0; i < this.channels.length; i++)
            if (!this.channels[i].isAlmostEqual(other.channels[i], tol))
                return false;
        return true;
    }
    createForVisitor() {
        const visitorChannels = [];
        for (const parentChannel of this.channels) {
            const visitorChannelData = [];
            for (const parentChannelData of parentChannel.data) {
                visitorChannelData.push(new AuxChannelData(parentChannelData.input, []));
            }
            visitorChannels.push(new AuxChannel(visitorChannelData, parentChannel.dataType, parentChannel.name, parentChannel.inputName));
        }
        return new PolyfaceAuxData(visitorChannels, []);
    }
}
exports.PolyfaceAuxData = PolyfaceAuxData;
/**
 * A Polyface is n abstract mesh structure (of unspecified implementation) that provides a PolyfaceVisitor
 * to iterate over its facets.
 */
class Polyface extends GeometryQuery_1.GeometryQuery {
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
            return this.data.isAlmostEqual(other.data) && PointHelpers_1.NumberArray.isExactEqual(this._facetStart, other._facetStart) &&
                PointHelpers_1.NumberArray.isExactEqual(this._facetToFaceData, other._facetToFaceData);
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
        return new IndexedPolyface(this.data.clone(), this._facetStart.slice(), this._facetToFaceData.slice());
    }
    cloneTransformed(transform) {
        const result = this.clone();
        result.tryTransformInPlace(transform);
        return result;
    }
    reverseIndices() { this.data.reverseIndices(this._facetStart); }
    reverseNormals() { this.data.reverseNormals(); }
    /** return face data using a facet index. This is the REFERENCE to the FacetFaceData, not a copy. Returns undefined if none found. */
    tryGetFaceData(i) {
        const faceIndex = this._facetToFaceData[i];
        if (faceIndex >= this.data.face.length)
            return undefined;
        return this.data.face[faceIndex];
    }
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
            sourcePoints.getPoint3dAt(i, xyz);
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
            for (let i = 0; i < source._facetStart.length; i++) { // Expect facet start and ends for points to match normals
                const i0 = source._facetStart[i];
                const i1 = source._facetStart[i + 1];
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
            for (let i = 0; i < source._facetStart.length; i++) { // Expect facet start and ends for points to match normals
                const i0 = source._facetStart[i];
                const i1 = source._facetStart[i + 1];
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
    /** @returns Return the total number of param indices in zero-terminated style, which includes
     * * all the indices in the packed zero-based table
     * * one additional index for the zero-terminator of each facet.
     * @note Note that all index arrays (point, normal, param, color) have the same counts, so there
     * is not a separate query for each of them.
     */
    get zeroTerminatedIndexCount() { return this.data.pointIndex.length + this._facetStart.length - 1; }
    static create(needNormals = false, needParams = false, needColors = false) {
        return new IndexedPolyface(new PolyfaceData_1.PolyfaceData(needNormals, needParams, needColors));
    }
    /** add (a clone of ) a point. return its 0 based index.
     * @returns Returns the zero-based index of the added point.
     */
    addPoint(point) { this.data.point.pushXYZ(point.x, point.y, point.z); return this.data.point.length - 1; }
    /** add a point.
     * @returns Returns the zero-based index of the added point.
     */
    addPointXYZ(x, y, z) { this.data.point.push(Point3dVector3d_1.Point3d.create(x, y, z)); return this.data.point.length - 1; }
    addParam(param) {
        if (!this.data.param)
            this.data.param = [];
        this.data.param.push(param.clone());
        return this.data.param.length - 1;
    }
    addParamXY(x, y) {
        if (!this.data.param)
            this.data.param = [];
        this.data.param.push(Point2dVector2d_1.Point2d.create(x, y));
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
        this.data.normal.push(Point3dVector3d_1.Vector3d.create(x, y, z));
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
            if (!areIndicesValid(this.data.normalIndex, lengthA, lengthB, this.data.normal))
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
    numEdgeInFacet(facetIndex) {
        if (this.isValidFacetIndex(facetIndex))
            return this._facetStart[facetIndex + 1] - this._facetStart[facetIndex];
        return 0;
    }
    isValidFacetIndex(index) { return index >= 0 && index + 1 < this._facetStart.length; }
    /** ASSUME valid facet index . .. return its start index in index arrays. */
    facetIndex0(index) { return this._facetStart[index]; }
    /** ASSUME valid facet index . .. return its end index in index arrays. */
    facetIndex1(index) { return this._facetStart[index + 1]; }
    /** create a visitor for this polyface */
    createVisitor(numWrap = 0) { return IndexedPolyfaceVisitor.create(this, numWrap); }
    range(transform, result) { return this.data.range(result, transform); }
    extendRange(range, transform) { this.data.range(range, transform); }
    /** Given the index of a facet, return the data pertaining to the face it is a part of. */
    getFaceDataByFacetIndex(facetIndex) {
        return this.data.face[this._facetToFaceData[facetIndex]];
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
        const facetStart = this._facetToFaceData.length;
        if (facetStart >= this._facetStart.length)
            return false;
        if (0 === endFacetIndex) // The default for endFacetIndex is really the last facet
            endFacetIndex = this._facetStart.length; // Last facetStart index corresponds to the next facet if we were to create one
        const faceData = FacetFaceData.createNull();
        const visitor = IndexedPolyfaceVisitor.create(this, 0);
        if (!visitor.moveToReadIndex(facetStart)) { // Move visitor to first facet of new face
            return false;
        }
        // If parameter range is provided (by the polyface planeset clipper) then use it
        const paramDefined = this.data.param !== undefined;
        const setParamRange = faceData.paramRange.isNull && paramDefined;
        do {
            for (let i = 0; i < visitor.numEdgesThisFacet; i++) {
                if (setParamRange && visitor.param !== undefined)
                    faceData.paramRange.extendPoint(visitor.param[i]);
            }
        } while (visitor.moveToNextFacet() && visitor.currentReadIndex() < endFacetIndex);
        if (paramDefined && !(this.data.param.length === 0) && faceData.paramDistanceRange.isNull)
            faceData.setParamDistanceRangeFromNewFaceData(this, facetStart, endFacetIndex);
        this.data.face.push(faceData);
        const faceDataIndex = this.data.face.length - 1;
        for (let i = this._facetToFaceData.length; i < endFacetIndex; i++)
            this._facetToFaceData.push(0 === this._facetStart[i] ? 0 : faceDataIndex);
        return true;
    }
    /** TODO: IMPLEMENT */
    checkIfClosedByEdgePairing() {
        return false;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleIndexedPolyface(this);
    }
}
exports.IndexedPolyface = IndexedPolyface;
class IndexedPolyfaceVisitor extends PolyfaceData_1.PolyfaceData {
    // to be called from static factory method that validates the polyface ...
    constructor(facets, numWrap) {
        super(facets.data.normalCount > 0, facets.data.paramCount > 0, facets.data.colorCount > 0);
        this._polyface = facets;
        this._numWrap = numWrap;
        if (facets.data.auxData)
            this.auxData = facets.data.auxData.createForVisitor();
        this.reset();
        this._numEdges = 0;
        this._nextFacetIndex = 0;
        this._currentFacetIndex = -1;
    }
    get numEdgesThisFacet() { return this._numEdges; }
    static create(polyface, numWrap) {
        return new IndexedPolyfaceVisitor(polyface, numWrap);
    }
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
    moveToNextFacet() {
        if (this._nextFacetIndex !== this._currentFacetIndex)
            return this.moveToReadIndex(this._nextFacetIndex);
        this._nextFacetIndex++;
        return true;
    }
    reset() {
        this.moveToReadIndex(0);
        this._nextFacetIndex = 0; // so immediate moveToNextFacet stays here.
    }
    /**
     * Attempts to extract the distance parameter for the face of a given point index.
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
        return faceData.convertParamToDistance(this.param[index], result);
    }
    /**
     * Attempts to extract the normalized parameter (0,1) for the face of a given point index.
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
        return faceData.convertParamToNormalized(this.param[index], result);
    }
    currentReadIndex() { return this._currentFacetIndex; }
    clientPointIndex(i) { return this.pointIndex[i]; }
    clientParamIndex(i) { return this.paramIndex ? this.paramIndex[i] : -1; }
    clientNormalIndex(i) { return this.normalIndex ? this.normalIndex[i] : -1; }
    clientColorIndex(i) { return this.colorIndex ? this.colorIndex[i] : -1; }
    clientAuxIndex(i) { return this.auxData ? this.auxData.indices[i] : -1; }
}
exports.IndexedPolyfaceVisitor = IndexedPolyfaceVisitor;
//# sourceMappingURL=Polyface.js.map