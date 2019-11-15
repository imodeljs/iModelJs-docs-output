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
const Range_1 = require("../geometry3d/Range");
const PointHelpers_1 = require("../geometry3d/PointHelpers");
/** The data types of [[AuxChannel]].  The scalar types are used to produce thematic  vertex colors.
 * @public
*/
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
/**  Represents the [[AuxChannel]] data at a single input value.
 * @public
*/
class AuxChannelData {
    /** Construct a new [[AuxChannelData]] from input value and vertex values. */
    constructor(input, values) {
        this.input = input;
        this.values = values;
    }
    /** Copy blocks of size `blockSize` from (blocked index) `thisIndex` in this AuxChannelData to (blockIndex) `otherIndex` of `other` */
    copyValues(other, thisIndex, otherIndex, blockSize) {
        for (let i = 0; i < blockSize; i++)
            this.values[thisIndex * blockSize + i] = other.values[otherIndex * blockSize + i];
    }
    /** return a deep copy */
    clone() {
        return new AuxChannelData(this.input, this.values.slice());
    }
    /** toleranced comparison of the `input` and `value` fields.
     * * Default tolernace is 1.0e-8
     */
    isAlmostEqual(other, tol) {
        const tolerance = tol ? tol : 1.0E-8;
        return Math.abs(this.input - other.input) < tolerance && PointHelpers_1.NumberArray.isAlmostEqual(this.values, other.values, tolerance);
    }
}
exports.AuxChannelData = AuxChannelData;
/**  Represents a single [[PolyfaceAuxData]] channel. A channel  may represent a single scalar value such as stress or temperature or may represent displacements from vertex position or replacements for normals.
 * @public
*/
class AuxChannel {
    /** create a [[AuxChannel]] */
    constructor(data, dataType, name, inputName) {
        this.data = data;
        this.dataType = dataType;
        this.name = name;
        this.inputName = inputName;
    }
    /** Return a deep clone */
    clone() {
        const clonedData = [];
        for (const data of this.data)
            clonedData.push(data.clone());
        return new AuxChannel(clonedData, this.dataType, this.name, this.inputName);
    }
    /** toleranced comparison of contents. */
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
 * @public
 */
class PolyfaceAuxData {
    constructor(channels, indices) {
        this.channels = channels;
        this.indices = indices;
    }
    /** return a deep clone */
    clone() {
        const clonedChannels = [];
        for (const channel of this.channels)
            clonedChannels.push(channel.clone());
        return new PolyfaceAuxData(clonedChannels, this.indices.slice());
    }
    /** deep test for equality.
     * * Exact equality for discrete number arrays.
     * * approximate test for coordinate data.
     */
    isAlmostEqual(other, tol) {
        if (!PointHelpers_1.NumberArray.isExactEqual(this.indices, other.indices) || this.channels.length !== other.channels.length)
            return false;
        for (let i = 0; i < this.channels.length; i++)
            if (!this.channels[i].isAlmostEqual(other.channels[i], tol))
                return false;
        return true;
    }
    /**
     * class level almostEqual test, allowing either or both to be undefined at point of call.
     * @param left
     * @param right
     * @param tol
     */
    static isAlmostEqual(left, right, tol) {
        if (left === right) // This catches double undefined !!!
            return true;
        if (left && right)
            return left.isAlmostEqual(right, tol);
        return false;
    }
    /** Create a PolyfaceAuxData for use by a facet iterator  */
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
//# sourceMappingURL=AuxData.js.map