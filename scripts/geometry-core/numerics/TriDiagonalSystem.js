"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 - present Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Geometry_1 = require("../Geometry");
const PointVector_1 = require("../PointVector");
// Enumerated type lies outside of TriDiagonalSystem, as TSLint prevented declaration within class
var DataState;
(function (DataState) {
    DataState[DataState["RawMatrix"] = 0] = "RawMatrix";
    DataState[DataState["FactorOK"] = 1] = "FactorOK";
    DataState[DataState["FactorFailed"] = 2] = "FactorFailed";
})(DataState || (DataState = {}));
class TriDiagonalSystem {
    constructor(n) {
        this._aLeft = new Float64Array(n);
        this._aDiag = new Float64Array(n);
        this._aRight = new Float64Array(n);
        this._b = new Float64Array(n);
        this._x = new Float64Array(n);
        this.Reset();
    }
    // Reset to RawMatrix state with all coefficients zero
    Reset() {
        this._dataState = DataState.RawMatrix;
        const n = this._aDiag.length;
        for (let i = 0; i < n; i++) {
            this._aLeft[i] = this._aRight[i] = this._aDiag[i] = this._b[i] = this._x[i] = 0.0;
        }
    }
    // Install data in a row of the matrix
    SetRow(row, left, diag, right) {
        this._aLeft[row] = left;
        this._aDiag[row] = diag;
        this._aRight[row] = right;
    }
    // Add to row of matrix
    AddToRow(row, left, diag, right) {
        this._aLeft[row] += left;
        this._aDiag[row] += diag;
        this._aRight[row] += right;
    }
    // Install data in the right side (B) vector
    SetB(row, bb) {
        this._b[row] = bb;
    }
    // Add to an entry in the right side (B) vector
    AddToB(row, bb) {
        this._b[row] += bb;
    }
    // Access data from the right side (B) vector
    GetB(row) {
        return this._b[row];
    }
    // Install data in the solution (X) vector
    SetX(row, xx) {
        this._x[row] = xx;
    }
    // Access data frin the solution (X) vector
    GetX(row) {
        return this._x[row];
    }
    // Get method for matrix and vector order
    Order() {
        return this._aDiag.length;
    }
    // Compute product of AX and save as B
    MultiplyAX() {
        if (this._dataState === DataState.FactorFailed) {
            return false;
        }
        else if (this._dataState === DataState.FactorOK) {
            const n = this._aDiag.length;
            const nm1 = n - 1;
            for (let i = 0; i < nm1; i++) {
                this._b[i] = this._aDiag[i] * this._x[i] + this._aRight[i] * this._x[i + 1];
            }
            this._b[nm1] = this._aDiag[nm1] * this._x[nm1];
            for (let i = nm1; i > 0; i--) {
                this._b[i] += this._aLeft[i] * this._b[i - 1];
            }
            return true;
        }
        else {
            const n = this._aDiag.length;
            const nm1 = n - 1;
            this._b[0] = this._aDiag[0] * this._x[0] + this._aRight[0] * this._x[1];
            let i;
            for (i = 1; i < nm1; i++) {
                this._b[i] = this._aLeft[i] * this._x[i - 1] + this._aDiag[i] * this._x[i] + this._aRight[i] * this._x[i + 1];
            }
            this._b[nm1] = this._aLeft[nm1] * this._x[n - 2] + this._aDiag[i] * this._x[nm1];
            return true;
        }
    }
    // Compute product of AX and save as B
    MultiplyAXPoints(pointX, pointB) {
        pointB.length = 0;
        while (pointB.length < pointX.length)
            pointB.push(PointVector_1.Point3d.create());
        pointB.length = pointX.length;
        if (this._dataState === DataState.FactorFailed) {
            return false;
        }
        else if (this._dataState === DataState.FactorOK) {
            const n = this._aDiag.length;
            const nm1 = n - 1;
            for (let i = 0; i < nm1; i++) {
                PointVector_1.Point3d.createAdd2Scaled(pointX[i], this._aDiag[i], pointX[i + 1], this._aRight[i], pointB[i]);
            }
            PointVector_1.Point3d.createScale(pointX[nm1], this._aDiag[nm1], pointB[nm1]);
            for (let i = nm1; i > 0; i--) {
                pointB[i].plusScaled(pointB[i - 1], this._aLeft[i], pointB[i]);
            }
            return true;
        }
        else {
            const n = this._aDiag.length;
            const nm1 = n - 1;
            PointVector_1.Point3d.createAdd2Scaled(pointX[0], this._aDiag[0], pointX[1], this._aRight[0], pointB[0]);
            let i;
            for (i = 1; i < nm1; i++) {
                PointVector_1.Point3d.createAdd3Scaled(pointX[i - 1], this._aLeft[i], pointX[i], this._aDiag[i], pointX[i + 1], this._aRight[i], pointB[i]);
            }
            PointVector_1.Point3d.createAdd2Scaled(pointX[n - 2], this._aLeft[nm1], pointX[nm1], this._aDiag[nm1], pointB[nm1]);
            return true;
        }
    }
    // Multiply the stored factors together to return to plain matrix form
    Defactor() {
        if (this._dataState === DataState.RawMatrix) {
            return true;
        }
        if (this._dataState === DataState.FactorFailed) {
            return false;
        }
        const n = this._aDiag.length;
        const nm1 = n - 1;
        for (let i = nm1; i > 0; i--) {
            this._aDiag[i] += this._aLeft[i] * this._aRight[i - 1];
            this._aLeft[i] *= this._aDiag[i - 1];
        }
        this._dataState = DataState.RawMatrix;
        return true;
    }
    // Factor the tridiagonal matrix to LU parts. b, x, not altered
    Factor() {
        if (this._dataState === DataState.FactorOK) {
            return true;
        }
        if (this._dataState !== DataState.RawMatrix) {
            return false;
        }
        this._dataState = DataState.FactorFailed;
        const n1 = this._aDiag.length - 1; // Last pivot index
        // Eliminate in subdiagonal.
        for (let i = 0; i < n1; i++) {
            const r = Geometry_1.Geometry.conditionalDivideFraction(this._aLeft[i + 1], this._aDiag[i]);
            if (!r)
                return false;
            this._aLeft[i + 1] = r;
            this._aDiag[i + 1] -= r * this._aRight[i];
        }
        this._dataState = DataState.FactorOK;
        return true;
    }
    // Solve AX=B. A is left in factored state. B unchanged.
    FactorAndBackSubstitute() {
        const n = this._aDiag.length;
        const n1 = n - 1;
        if (!this.Factor())
            return false;
        // Apply Linv to B, same sequence as was done to A:
        for (let i = 0; i < n; i++) {
            this._x[i] = this._b[i];
        }
        for (let i = 1; i < n; i++) {
            this._x[i] -= this._aLeft[i] * this._x[i - 1];
        }
        // Print ("LU  LinvB B");
        // overwrite X with solution of U * X = Linv B, where RHS is already in X...
        // All diagonals are known to be nonzero. Really.  Really???
        this._x[n1] /= this._aDiag[n1];
        for (let i = n1 - 1; i >= 0; i--) {
            this._x[i] = (this._x[i] - this._aRight[i] * this._x[i + 1]) / this._aDiag[i];
        }
        return true;
    }
    // Solve AX=B. A is left in factored state. B unchanged. vectorB and vectorX may be the same array
    FactorAndBackSubstitutePointArrays(vectorB, vectorX) {
        const n = this._aDiag.length;
        if (vectorB.length < n)
            return false;
        while (vectorX.length < n)
            vectorX.push(PointVector_1.Point3d.create(0, 0, 0));
        vectorX.length = n;
        const n1 = n - 1;
        if (!this.Factor())
            return false;
        // Apply Linv to B, same sequence as was done to A:
        if (vectorB !== vectorX) {
            for (let i = 0; i < n; i++) {
                vectorX[i].setFrom(vectorB[i]);
            }
        }
        let a;
        let b;
        for (let i = 1; i < n; i++) {
            a = this._aLeft[i];
            vectorX[i].x -= a * vectorX[i - 1].x;
            vectorX[i].y -= a * vectorX[i - 1].y;
            vectorX[i].z -= a * vectorX[i - 1].z;
        }
        // Print ("LU  LinvB B");
        // overwrite X with solution of U * X = Linv B, where RHS is already in X...
        // All diagonals are known to be nonzero. Really.  Really???
        b = 1.0 / this._aDiag[n1];
        vectorX[n1].x *= b;
        vectorX[n1].y *= b;
        vectorX[n1].z *= b;
        for (let i = n1 - 1; i >= 0; i--) {
            a = this._aRight[i];
            b = 1.0 / this._aDiag[i];
            vectorX[i].x = (vectorX[i].x - a * vectorX[i + 1].x) * b;
            vectorX[i].y = (vectorX[i].y - a * vectorX[i + 1].y) * b;
            vectorX[i].z = (vectorX[i].z - a * vectorX[i + 1].z) * b;
        }
        return true;
    }
    // Allocate a complete copy
    Copy() {
        const n = this._aDiag.length;
        const B = new TriDiagonalSystem(n);
        for (let i = 0; i < n; i++) {
            B._aLeft[i] = this._aLeft[i];
            B._aDiag[i] = this._aDiag[i];
            B._aRight[i] = this._aRight[i];
            B._x[i] = this._x[i];
            B._b[i] = this._b[i];
        }
        B._dataState = this._dataState;
        return B;
    }
    // return an array form that may be useful for display ...
    flatten() {
        const n = this._aDiag.length;
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push([i, [this._aLeft[i], this._aDiag[i], this._aRight[i]], this._x[i], this._b[i]]);
        }
        return data;
    }
    // return an array form that may be useful for display ...
    flattenWithPoints(xyzB) {
        const n = this._aDiag.length;
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push([i, [this._aLeft[i], this._aDiag[i], this._aRight[i]], this._x[i], xyzB[i].toJSON()]);
        }
        return data;
    }
}
exports.TriDiagonalSystem = TriDiagonalSystem;
//# sourceMappingURL=TriDiagonalSystem.js.map