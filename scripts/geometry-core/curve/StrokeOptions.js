"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
/* tslint:disable:variable-name no-empty */
/** tolerance blob for various stroking methods.
 *
 * * Across many applications, the critical concepts are:   chordTol, angleTol, maxEdgeLength
 * * Chord error is an distance measured from a curve or facet to its approximating stroke or facet.
 * * angle is the angle between two contiguous strokes or across a facet edge.
 * * maxEdgeLength is the length of a stroke or a edge of a facet.
 *
 * It is rare for all three to be active at once:
 * * Nearly all stroke and facet use cases will apply an angle tolerance.
 * * * For curves, 15 degrees is typical
 * * * For facets, 22.5 degrees is typical.
 * * * Halving the angle tolerance will (roughly) make curves get twice as many strokes, and surfaces get 4 times as many facets.
 * * * The angle tolerance has the useful property that its effect is independent of scale of that data.  If data is suddenly scaled into millimeters rather than meters, the facet counts remain the same.
 * * When creating output for devicies such as 3D printing will want a chord tolerance.
 * * For graphics display, use an angle tolerance of around 15 degrees and an chord tolerance which is the size of several pixels.
 * * Analysis meshes (e.g. Finite Elements) commonly need to apply maxEdgeLength.
 * * * Using maxEdgeLength for graphics probably produces too many facets.   For example, it causes long cylinders to get many nearly-square facets instead of the samll number of long quads usually used for graphics.
 * * Facet tolerances are, as the Pirates' Code, guidelines, not absolute rules.   Facet and stroke code may ignore tolerances in awkward situations.
 * * If multiple tolerances are in effect, the actual count will usually be based on the one that demands the most strokes or facets, unless it is so high that it violates some upper limit on the number of facets on an arc or a section of a curve.
 *
 */
class StrokeOptions {
    constructor() {
        /** whether or not to triangulate each added facet */
        this.shouldTriangulate = false;
        this.defaultCircleStrokes = 16;
    }
    get needParams() { return this._needParams !== undefined ? this._needParams : false; }
    set needParams(value) { this._needParams = value; }
    get needNormals() { return this._needNormals !== undefined ? this._needNormals : false; }
    set needNormals(value) { this._needNormals = value; }
    get hasMaxEdgeLength() { return this.maxEdgeLength !== undefined && this.maxEdgeLength > 0.0; }
    // return stroke count which is the larger of the minCount or count needed for edge length condition.
    applyMaxEdgeLength(minCount, totalLength) {
        if (this.maxEdgeLength && this.maxEdgeLength > 0.0 && minCount * this.maxEdgeLength < totalLength) {
            minCount = Geometry_1.Geometry.stepCount(this.maxEdgeLength, totalLength, minCount);
        }
        return minCount;
    }
    // return stroke count which is the larger of the existing count or count needed for angle condition for given sweepRadians
    // defaultStepRadians is assumed to be larger than zero.
    applyAngleTol(minCount, sweepRadians, defaultStepRadians) {
        return StrokeOptions.applyAngleTol(this, minCount, sweepRadians, defaultStepRadians);
    }
    static applyAngleTol(options, minCount, sweepRadians, defaultStepRadians) {
        sweepRadians = Math.abs(sweepRadians);
        let stepRadians = defaultStepRadians ? defaultStepRadians : Math.PI / 8.0;
        if (options && options.angleTol && options.angleTol.radians > 0.0)
            stepRadians = options.angleTol.radians;
        if (minCount * stepRadians < sweepRadians)
            minCount = Geometry_1.Geometry.stepCount(stepRadians, sweepRadians, minCount);
        return minCount;
    }
    /**
     *
     * @param options
     * @param minCount smallest allowed count
     * @param edgeLength
     */
    static applyMaxEdgeLength(options, minCount, edgeLength) {
        if (edgeLength < 0)
            edgeLength = -edgeLength;
        if (minCount < 1)
            minCount = 1;
        if (options && options.maxEdgeLength && options.maxEdgeLength * minCount < edgeLength) {
            minCount = Math.ceil(edgeLength / options.maxEdgeLength + 0.99999);
        }
        return minCount;
    }
    applyTolerancesToArc(radius, sweepRadians = Math.PI * 2) {
        let numStrokes = 1;
        numStrokes = this.applyAngleTol(numStrokes, sweepRadians, Math.PI * 0.25);
        numStrokes = this.applyMaxEdgeLength(numStrokes, sweepRadians * radius);
        numStrokes = this.applyChordTol(numStrokes, radius, sweepRadians);
        numStrokes = this.applyMinStrokesPerPrimitive(numStrokes);
        return numStrokes;
    }
    // return stroke count which is the larger of existing count or count needed for circular arc chord tolerance condition.
    applyChordTol(minCount, radius, sweepRadians) {
        if (this.chordTol && this.chordTol > 0.0 && this.chordTol < radius) {
            const a = this.chordTol;
            const stepRadians = 2.0 * Math.acos((1.0 - a / radius));
            minCount = Geometry_1.Geometry.stepCount(stepRadians, sweepRadians, minCount);
        }
        return minCount;
    }
    applyMinStrokesPerPrimitive(minCount) {
        if (this.minStrokesPerPrimitive !== undefined && Number.isFinite(this.minStrokesPerPrimitive)
            && this.minStrokesPerPrimitive > minCount)
            minCount = this.minStrokesPerPrimitive;
        return minCount;
    }
    static createForCurves() {
        const options = new StrokeOptions();
        options.angleTol = Geometry_1.Angle.createDegrees(15.0);
        return options;
    }
    static createForFacets() {
        const options = new StrokeOptions();
        options.angleTol = Geometry_1.Angle.createDegrees(22.5);
        return options;
    }
}
exports.StrokeOptions = StrokeOptions;
//# sourceMappingURL=StrokeOptions.js.map