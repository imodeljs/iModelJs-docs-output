"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
/* tslint:disable:variable-name jsdoc-format no-empty */
const Point3dVector3d_1 = require("./Point3dVector3d");
const IndexedXYZCollection_1 = require("./IndexedXYZCollection");
const Range_1 = require("./Range");
const GrowableXYZArray_1 = require("./GrowableXYZArray");
//
// remarks: point array variants . . .
//  * [[x,y,z], ...]
//  * [[Point3d, Point3d]
//  * [GrowableXYZArray, ..]
//
/**
 * "no-op" base class for stream handlers
 * @internal
 */
class PointStreamXYZHandlerBase {
    startChain(_chainData, _isLeaf) { }
    handleXYZ(_x, _y, _z) { }
    endChain(_chainData, _isLeaf) { }
}
exports.PointStreamXYZHandlerBase = PointStreamXYZHandlerBase;
/** Base class for handling points in pairs.
 * * Callers implement handleXYZXYZ to receive point pairs.
 * * Callers may implement startChain and endChain.
 *   * Beware that if startChain is implemented it must call super.startChain () to reset internal x0, y0,z0 to undefined.
 *   * If that is not done, a point pair will appear from the end of previous chain to start of new chain.
 *   * This (intermediate base) class does NOT override startChain
 */
class PointStreamXYZXYZHandlerBase extends PointStreamXYZHandlerBase {
    handleXYZ(x, y, z) {
        if (this._x0 !== undefined)
            this.handleXYZXYZ(this._x0, this._y0, this._z0, x, y, z);
        this._x0 = x;
        this._y0 = y;
        this._z0 = z;
    }
    startChain(_chainData, _isLeaf) {
        this._x0 = this._y0 = this._z0 = undefined;
    }
    /**
     * Handler function called successively for each point0, point1 pair.  Concrete class should implement this.
     * @param _x0 x coordinate at point 0
     * @param _y0 y coordinate of point 0
     * @param _z0 z coordinate of point 0
     * @param _x1 x coordinate of point 1
     * @param _y1 y coordinate of point 1
     * @param _z1 z coordinate of point 1
     */
    handleXYZXYZ(_x0, _y0, _z0, _x1, _y1, _z1) { }
}
exports.PointStreamXYZXYZHandlerBase = PointStreamXYZXYZHandlerBase;
/**
 * Concrete class to handle startChain, handleXYZ and endChain calls and return a (one-level deep array of
 * GrowableXYZArray
 */
class PointStreamGrowableXYZArrayCollector extends PointStreamXYZHandlerBase {
    startChain(_chainData, _isLeaf) {
        this._currentData = undefined;
    }
    handleXYZ(x, y, z) {
        if (!this._currentData)
            this._currentData = new GrowableXYZArray_1.GrowableXYZArray();
        this._currentData.pushXYZ(x, y, z);
    }
    endChain(_chainData, _isLeaf) {
        if (this._currentData !== undefined) {
            if (this._pointArrays === undefined)
                this._pointArrays = [];
            this._pointArrays.push(this._currentData);
            this._currentData = undefined;
        }
    }
    /** Return MultiLineStringDataVariant as an array of GrowableXYZArray */
    claimArrayOfGrowableXYZArray() {
        const result = this._pointArrays;
        this._pointArrays = undefined;
        return result;
    }
}
exports.PointStreamGrowableXYZArrayCollector = PointStreamGrowableXYZArrayCollector;
/**
 * PointStream handler to collect the range of points.
 */
class PointStreamRangeCollector extends PointStreamXYZHandlerBase {
    constructor() {
        super(...arguments);
        this._range = Range_1.Range3d.createNull();
    }
    handleXYZ(x, y, z) {
        if (!this._range)
            this._range = Range_1.Range3d.createNull();
        this._range.extendXYZ(x, y, z);
    }
    claimResult() {
        const range = this._range;
        this._range = undefined;
        if (!range)
            return Range_1.Range3d.createNull();
        return range;
    }
}
exports.PointStreamRangeCollector = PointStreamRangeCollector;
class PointStringDeepXYZArrayCollector {
    /**
     *
     * @param xyzFunction function to map (x,y,z) to the leaf object type in the arrays.
     */
    constructor(xyzFunction) {
        this._xyzFunction = xyzFunction;
        this._resultStack = [];
        // create the [0] placeholder.
        this._resultStack.push([]);
    }
    startChain(_chainData, _isLeaf) {
        this._resultStack.push([]);
    }
    handleXYZ(x, y, z) {
        this._resultStack[this._resultStack.length - 1].push(this._xyzFunction(x, y, z));
    }
    endChain(_chainData, _isLeaf) {
        const q = this._resultStack[this._resultStack.length - 1];
        this._resultStack.pop();
        this._resultStack[this._resultStack.length - 1].push(q);
    }
    claimResult() {
        const r = this._resultStack[0];
        if (r.length === 1)
            return r[0];
        return r;
    }
}
exports.PointStringDeepXYZArrayCollector = PointStringDeepXYZArrayCollector;
/**
 * class for converting variant point data into more specific forms.
 * @internal
 */
class VariantPointDataStream {
    /** Invoke a callback with each x,y,z from an array of points in variant forms.
     * @param startChainCallback called to announce the beginning of points (or recursion)
     * @param pointCallback (index, x,y,z) = function to receive point coordinates one by one
     * @param endChainCallback called to announce the end of handling of an array.
     */
    static streamXYZ(data, handler) {
        let numPoint = 0;
        if (Array.isArray(data)) {
            // If the first entry is a point, expect the entire array to be points.
            // otherwise recurse to each member of this array.
            if (data.length > 0 && Point3dVector3d_1.Point3d.isAnyImmediatePointType(data[0])) {
                handler.startChain(data, true);
                for (const p of data) {
                    const x = Point3dVector3d_1.Point3d.accessX(p);
                    const y = Point3dVector3d_1.Point3d.accessY(p);
                    const z = Point3dVector3d_1.Point3d.accessZ(p, 0);
                    if (x !== undefined && y !== undefined)
                        handler.handleXYZ(x, y, z);
                    numPoint++;
                }
                handler.endChain(data, true);
            }
            else {
                // This is an array that does not immediately have points.
                handler.startChain(data, false);
                for (const child of data) {
                    numPoint += this.streamXYZ(child, handler);
                }
                handler.endChain(data, false);
            }
        }
        else if (data instanceof IndexedXYZCollection_1.IndexedXYZCollection) {
            handler.startChain(data, true);
            const q = VariantPointDataStream._workPoint = Point3dVector3d_1.Point3d.create(0, 0, 0, VariantPointDataStream._workPoint);
            for (let i = 0; i < data.length; i++) {
                data.getPoint3dAtCheckedPointIndex(i, q);
                numPoint++;
                handler.handleXYZ(q.x, q.y, q.z);
            }
            handler.endChain(data, true);
        }
        return numPoint;
    }
}
exports.VariantPointDataStream = VariantPointDataStream;
//# sourceMappingURL=PointStreaming.js.map