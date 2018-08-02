"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
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
        this.aLeft = new Float64Array(n);
        this.aDiag = new Float64Array(n);
        this.aRight = new Float64Array(n);
        this.b = new Float64Array(n);
        this.x = new Float64Array(n);
        this.Reset();
    }
    // Reset to RawMatrix state with all coefficients zero
    Reset() {
        this.dataState = DataState.RawMatrix;
        const n = this.aDiag.length;
        for (let i = 0; i < n; i++) {
            this.aLeft[i] = this.aRight[i] = this.aDiag[i] = this.b[i] = this.x[i] = 0.0;
        }
    }
    // Install data in a row of the matrix
    SetRow(row, left, diag, right) {
        this.aLeft[row] = left;
        this.aDiag[row] = diag;
        this.aRight[row] = right;
    }
    // Add to row of matrix
    AddToRow(row, left, diag, right) {
        this.aLeft[row] += left;
        this.aDiag[row] += diag;
        this.aRight[row] += right;
    }
    // Install data in the right side (B) vector
    SetB(row, bb) {
        this.b[row] = bb;
    }
    // Add to an entry in the right side (B) vector
    AddToB(row, bb) {
        this.b[row] += bb;
    }
    // Access data from the right side (B) vector
    GetB(row) {
        return this.b[row];
    }
    // Install data in the solution (X) vector
    SetX(row, xx) {
        this.x[row] = xx;
    }
    // Access data frin the solution (X) vector
    GetX(row) {
        return this.x[row];
    }
    // Get method for matrix and vector order
    Order() {
        return this.aDiag.length;
    }
    // Compute product of AX and save as B
    MultiplyAX() {
        if (this.dataState === DataState.FactorFailed) {
            return false;
        }
        else if (this.dataState === DataState.FactorOK) {
            const n = this.aDiag.length;
            const nm1 = n - 1;
            for (let i = 0; i < nm1; i++) {
                this.b[i] = this.aDiag[i] * this.x[i] + this.aRight[i] * this.x[i + 1];
            }
            this.b[nm1] = this.aDiag[nm1] * this.x[nm1];
            for (let i = nm1; i > 0; i--) {
                this.b[i] += this.aLeft[i] * this.b[i - 1];
            }
            return true;
        }
        else {
            const n = this.aDiag.length;
            const nm1 = n - 1;
            this.b[0] = this.aDiag[0] * this.x[0] + this.aRight[0] * this.x[1];
            let i;
            for (i = 1; i < nm1; i++) {
                this.b[i] = this.aLeft[i] * this.x[i - 1] + this.aDiag[i] * this.x[i] + this.aRight[i] * this.x[i + 1];
            }
            this.b[nm1] = this.aLeft[nm1] * this.x[n - 2] + this.aDiag[i] * this.x[nm1];
            return true;
        }
    }
    // Compute product of AX and save as B
    MultiplyAXPoints(pointX, pointB) {
        pointB.length = 0;
        while (pointB.length < pointX.length)
            pointB.push(PointVector_1.Point3d.create());
        pointB.length = pointX.length;
        if (this.dataState === DataState.FactorFailed) {
            return false;
        }
        else if (this.dataState === DataState.FactorOK) {
            const n = this.aDiag.length;
            const nm1 = n - 1;
            for (let i = 0; i < nm1; i++) {
                PointVector_1.Point3d.add2Scaled(pointX[i], this.aDiag[i], pointX[i + 1], this.aRight[i], pointB[i]);
            }
            PointVector_1.Point3d.createScale(pointX[nm1], this.aDiag[nm1], pointB[nm1]);
            for (let i = nm1; i > 0; i--) {
                pointB[i].plusScaled(pointB[i - 1], this.aLeft[i], pointB[i]);
            }
            return true;
        }
        else {
            const n = this.aDiag.length;
            const nm1 = n - 1;
            PointVector_1.Point3d.add2Scaled(pointX[0], this.aDiag[0], pointX[1], this.aRight[0], pointB[0]);
            let i;
            for (i = 1; i < nm1; i++) {
                PointVector_1.Point3d.add3Scaled(pointX[i - 1], this.aLeft[i], pointX[i], this.aDiag[i], pointX[i + 1], this.aRight[i], pointB[i]);
            }
            PointVector_1.Point3d.add2Scaled(pointX[n - 2], this.aLeft[nm1], pointX[nm1], this.aDiag[nm1], pointB[nm1]);
            return true;
        }
    }
    // Multiply the stored factors together to return to plain matrix form
    Defactor() {
        if (this.dataState === DataState.RawMatrix) {
            return true;
        }
        if (this.dataState === DataState.FactorFailed) {
            return false;
        }
        const n = this.aDiag.length;
        const nm1 = n - 1;
        for (let i = nm1; i > 0; i--) {
            this.aDiag[i] += this.aLeft[i] * this.aRight[i - 1];
            this.aLeft[i] *= this.aDiag[i - 1];
        }
        this.dataState = DataState.RawMatrix;
        return true;
    }
    // Factor the tridiagonal matrix to LU parts. b, x, not altered
    Factor() {
        if (this.dataState === DataState.FactorOK) {
            return true;
        }
        if (this.dataState !== DataState.RawMatrix) {
            return false;
        }
        this.dataState = DataState.FactorFailed;
        const n1 = this.aDiag.length - 1; // Last pivot index
        // Eliminate in subdiagonal.
        for (let i = 0; i < n1; i++) {
            const r = Geometry_1.Geometry.conditionalDivideFraction(this.aLeft[i + 1], this.aDiag[i]);
            if (!r)
                return false;
            this.aLeft[i + 1] = r;
            this.aDiag[i + 1] -= r * this.aRight[i];
        }
        this.dataState = DataState.FactorOK;
        return true;
    }
    // Solve AX=B. A is left in factored state. B unchanged.
    FactorAndBackSubstitute() {
        const n = this.aDiag.length;
        const n1 = n - 1;
        if (!this.Factor())
            return false;
        // Apply Linv to B, same sequence as was done to A:
        for (let i = 0; i < n; i++) {
            this.x[i] = this.b[i];
        }
        for (let i = 1; i < n; i++) {
            this.x[i] -= this.aLeft[i] * this.x[i - 1];
        }
        // Print ("LU  LinvB B");
        // overwrite X with solution of U * X = Linv B, where RHS is already in X...
        // All diagonals are known to be nonzero. Really.  Really???
        this.x[n1] /= this.aDiag[n1];
        for (let i = n1 - 1; i >= 0; i--) {
            this.x[i] = (this.x[i] - this.aRight[i] * this.x[i + 1]) / this.aDiag[i];
        }
        return true;
    }
    // Solve AX=B. A is left in factored state. B unchanged. vectorB and vectorX may be the same array
    FactorAndBackSubstitutePointArrays(vectorB, vectorX) {
        const n = this.aDiag.length;
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
            a = this.aLeft[i];
            vectorX[i].x -= a * vectorX[i - 1].x;
            vectorX[i].y -= a * vectorX[i - 1].y;
            vectorX[i].z -= a * vectorX[i - 1].z;
        }
        // Print ("LU  LinvB B");
        // overwrite X with solution of U * X = Linv B, where RHS is already in X...
        // All diagonals are known to be nonzero. Really.  Really???
        b = 1.0 / this.aDiag[n1];
        vectorX[n1].x *= b;
        vectorX[n1].y *= b;
        vectorX[n1].z *= b;
        for (let i = n1 - 1; i >= 0; i--) {
            a = this.aRight[i];
            b = 1.0 / this.aDiag[i];
            vectorX[i].x = (vectorX[i].x - a * vectorX[i + 1].x) * b;
            vectorX[i].y = (vectorX[i].y - a * vectorX[i + 1].y) * b;
            vectorX[i].z = (vectorX[i].z - a * vectorX[i + 1].z) * b;
        }
        return true;
    }
    // Allocate a complete copy
    Copy() {
        const n = this.aDiag.length;
        const B = new TriDiagonalSystem(n);
        for (let i = 0; i < n; i++) {
            B.aLeft[i] = this.aLeft[i];
            B.aDiag[i] = this.aDiag[i];
            B.aRight[i] = this.aRight[i];
            B.x[i] = this.x[i];
            B.b[i] = this.b[i];
        }
        B.dataState = this.dataState;
        return B;
    }
    // return an array form that may be useful for display ...
    flatten() {
        const n = this.aDiag.length;
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push([i, [this.aLeft[i], this.aDiag[i], this.aRight[i]], this.x[i], this.b[i]]);
        }
        return data;
    }
    // return an array form that may be useful for display ...
    flattenWithPoints(xyzB) {
        const n = this.aDiag.length;
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push([i, [this.aLeft[i], this.aDiag[i], this.aRight[i]], this.x[i], xyzB[i].toJSON()]);
        }
        return data;
    }
}
exports.TriDiagonalSystem = TriDiagonalSystem;
//# sourceMappingURL=TriDiagonalSystem.js.map