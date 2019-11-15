"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
// import { Geometry, Angle, AngleSweep } from "../Geometry";
const MomentData_1 = require("../geometry4d/MomentData");
const CurvePrimitive_1 = require("./CurvePrimitive");
const CurveCollection_1 = require("./CurveCollection");
const Quadrature_1 = require("../numerics/Quadrature");
const Geometry_1 = require("../Geometry");
/**
 * Class to visit curve primitives and accumulate wire moment integrations.
 * @internal
 */
class CurveWireMomentsXYZ {
    constructor(numGaussPoints = 5) {
        this._activeMomentData = MomentData_1.MomentData.create();
        this._activeMomentData.needOrigin = true;
        this._gaussMapper = new Quadrature_1.GaussMapper(numGaussPoints);
    }
    get momentData() { return this._activeMomentData; }
    startParentCurvePrimitive(_cp) { }
    startCurvePrimitive(_cp) { }
    endCurvePrimitive(_cp) { }
    endParentCurvePrimitive(_cp) { }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        this.startCurvePrimitive(cp);
        if (numStrokes < 1)
            numStrokes = 1;
        const df = 1.0 / numStrokes;
        let scaleFactor, fraction;
        for (let i = 1; i <= numStrokes; i++) {
            const fractionA = Geometry_1.Geometry.interpolate(fraction0, (i - 1) * df, fraction1);
            const fractionB = i === numStrokes ? fraction1 : Geometry_1.Geometry.interpolate(fraction0, (i) * df, fraction1);
            const numGauss = this._gaussMapper.mapXAndW(fractionA, fractionB);
            for (let k = 0; k < numGauss; k++) {
                fraction = this._gaussMapper.gaussX[k];
                const ray = cp.fractionToPointAndDerivative(fraction);
                scaleFactor = this._gaussMapper.gaussW[k] * ray.direction.magnitude();
                this._activeMomentData.accumulateScaledOuterProduct(ray.origin, scaleFactor);
            }
        }
    }
    announceSegmentInterval(_cp, point0, point1, _numStrokes, _fraction0, _fraction1) {
        this._activeMomentData.accumulateLineMomentsXYZ(point0, point1);
    }
    announcePointTangent(_xyz, _fraction, _tangent) {
        // umm ... this should not happen.  We need to know intervals. The other functions should have prevented this.
    }
    /** Recurse to leaf-level primitives */
    visitLeaves(root) {
        if (root instanceof CurvePrimitive_1.CurvePrimitive)
            root.emitStrokableParts(this);
        else if (root instanceof CurveCollection_1.CurveCollection) {
            if (root.children !== undefined)
                for (const child of root.children) {
                    this.visitLeaves(child);
                }
        }
    }
}
exports.CurveWireMomentsXYZ = CurveWireMomentsXYZ;
//# sourceMappingURL=CurveWireMomentsXYZ.js.map