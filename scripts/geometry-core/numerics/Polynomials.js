"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const PointVector_1 = require("../PointVector");
// import { Angle, AngleSweep, Geometry } from "../Geometry";
const Geometry_1 = require("../Geometry");
const GrowableArray_1 = require("../GrowableArray");
// import { Arc3d } from "../curve/Arc3d";
/* tslint:disable:variable-name*/
class Degree2PowerPolynomial {
    constructor(c0 = 0, c1 = 0, c2 = 0) {
        this.coffs = [c0, c1, c2];
    }
    /**
     * * Return 2 duplicate roots in double root case.
     * @returns 0, 1, or 2 solutions of the usual quadratic (a*x*x + b * x + c = 0)
     */
    static solveQuadratic(a, b, c) {
        const b1 = Geometry_1.Geometry.conditionalDivideFraction(b, a);
        const c1 = Geometry_1.Geometry.conditionalDivideFraction(c, a);
        if (b1 !== undefined && c1 !== undefined) {
            // now solving xx + b1*x + c1 = 0 -- i.e. implied "a" coefficient is 1 . .
            const q = b1 * b1 - 4 * c1;
            if (q > 0) {
                const e = Math.sqrt(q);
                // e is positive, so this sorts algebraically
                return [0.5 * (-b1 - e), 0.5 * (-b1 + e)];
            }
            if (q < 0)
                return undefined;
            const root = -0.5 * b1;
            return [root, root];
        }
        // "divide by a" failed.  solve bx + c = 0
        const x = Geometry_1.Geometry.conditionalDivideFraction(-c, b);
        if (x !== undefined)
            return [x];
        return undefined;
    }
    addConstant(a) {
        this.coffs[0] += a;
    }
    // Add s * (a + b*x)^2 to the quadratic coefficients
    addSquaredLinearTerm(a, b, s = 1) {
        this.coffs[0] += s * (a * a);
        this.coffs[1] += s * (2.0 * a * b);
        this.coffs[2] += s * (b * b);
    }
    realRoots() {
        const ss = Degree2PowerPolynomial.solveQuadratic(this.coffs[2], this.coffs[1], this.coffs[0]);
        if (ss && ss.length > 1) {
            if (ss[0] > ss[1]) {
                const temp = ss[0];
                ss[0] = ss[1];
                ss[1] = temp;
            }
        }
        return ss;
    }
    /**
     * Evaluate the quadratic at x.
     */
    evaluate(x) {
        return this.coffs[0] + x * (this.coffs[1] + x * this.coffs[2]);
    }
    /**
     * Evaluate the bezier function at a parameter value.  (i.e. summ the basis functions times coefficients)
     * @param u parameter for evaluation
     */
    evaluateDerivative(x) {
        return this.coffs[1] + 2 * x * this.coffs[2];
    }
    // Factor the polyonmial as c0 + c1 * x + c2 * x*x = y0 + c2 * (x-x0)^2
    tryGetVertexFactorization() {
        const x = Geometry_1.Geometry.conditionalDivideFraction(-this.coffs[1], 2.0 * this.coffs[2]);
        if (x !== undefined) {
            const y = this.evaluate(x);
            return { c: this.coffs[2], x0: x, y0: y };
        }
        return undefined;
    }
    static fromRootsAndC2(root0, root1, c2 = 1) {
        return new Degree2PowerPolynomial(c2 * root0 * root1, -c2 * (root0 + root1), c2);
    }
}
exports.Degree2PowerPolynomial = Degree2PowerPolynomial;
class Degree3PowerPolynomial {
    constructor(c0 = 0, c1 = 0, c2 = 0, c3 = 1) {
        this.coffs = [c0, c1, c2, c3];
    }
    addConstant(a) {
        this.coffs[0] += a;
    }
    // Add s * (a + b*x)^2 to the quadratic coefficients
    addSquaredLinearTerm(a, b, s = 1) {
        this.coffs[0] += s * (a * a);
        this.coffs[1] += s * (2.0 * a * b);
        this.coffs[2] += s * (b * b);
    }
    /**
     * Evaluate the polynomial at x
     * @param u parameter for evaluation
     */
    evaluate(x) {
        return this.coffs[0] + x * (this.coffs[1] + x * (this.coffs[2] + x * this.coffs[3]));
    }
    /**
     * Evaluate the polynomial derivative
     * @param u parameter for evaluation
     */
    evaluateDerivative(x) {
        return this.coffs[1] + x * (2.0 * this.coffs[2] + x * 3.0 * this.coffs[3]);
    }
    static fromRootsAndC3(root0, root1, root2, c3 = 1.0) {
        return new Degree3PowerPolynomial(-c3 * root0 * root1 * root2, c3 * (root0 * root1 + root1 * root2 + root0 * root2), -c3 * (root0 + root1 + root2), c3);
    }
}
exports.Degree3PowerPolynomial = Degree3PowerPolynomial;
class Degree4PowerPolynomial {
    constructor(c0 = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0) {
        this.coffs = [c0, c1, c2, c3, c4];
    }
    addConstant(a) {
        this.coffs[0] += a;
    }
    /**
     * Evaluate the polynomial
     * @param x x coordinate for evaluation
     */
    evaluate(x) {
        return this.coffs[0] + x * (this.coffs[1] + x * (this.coffs[2] + x * (this.coffs[3] + x * this.coffs[4])));
    }
    /**
     * Evaluate the derivative
     * @param x x coordinate for evaluation
     */
    evaluateDerivative(x) {
        return (this.coffs[1] + x * (2.0 * this.coffs[2] + x * (3.0 * this.coffs[3] + x * 4.0 * this.coffs[4])));
    }
    static fromRootsAndC4(root0, root1, root2, root3, c4 = 1) {
        return new Degree4PowerPolynomial(c4 * (root0 * root1 * root2 * root3), -c4 * (root0 * root1 * root2 + root0 * root1 * root3 + root0 * root2 * root3 + root1 * root2 * root3), c4 * (root0 * root1 + root0 * root2 + root0 * root3 + root1 * root2 + root1 * root3 + root2 * root3), -c4 * (root0 + root1 + root2 + root3), c4);
    }
}
exports.Degree4PowerPolynomial = Degree4PowerPolynomial;
class TorusImplicit {
    constructor(majorRadiusR, minorRadiusr) {
        this.majorRadius = majorRadiusR;
        this.minorRadius = minorRadiusr;
    }
    // Return size of box (e.g. for use as scale factor)
    boxSize() {
        return (Math.abs(this.majorRadius) + Math.abs(this.minorRadius));
    }
    /** @returns a scale factor appropriate to control the magnitude of the implicit function. */
    implicitFunctionScale() {
        const a = this.boxSize();
        if (a === 0.0)
            return 1.0;
        return 1.0 / (a * a * a * a);
    }
    // Implicit equation for the torus is ...
    // (x^2+y^2+z^2+(R^2-r^2))^2 = 4 R^2(x^2+y^2)
    // x,y,z are weighted,
    // (x^2+y^2+z^2+(R^2-r^2)w^2)^2 = 4 R^2 w^2 (x^2+y^2)
    evaluateImplicitFunctionXYZ(x, y, z) {
        const rho2 = x * x + y * y;
        const z2 = z * z;
        const R2 = this.majorRadius * this.majorRadius;
        const r2 = this.minorRadius * this.minorRadius;
        const f = rho2 + z2 + (R2 - r2);
        const g = 4.0 * R2 * rho2;
        return (f * f - g) * this.implicitFunctionScale();
    }
    evaluateImplicitFunctionPoint(xyz) {
        return this.evaluateImplicitFunctionXYZ(xyz.x, xyz.y, xyz.z);
    }
    evaluateImplicitFunctionXYZW(x, y, z, w) {
        const rho2 = x * x + y * y;
        const z2 = z * z;
        const w2 = w * w;
        const R2 = this.majorRadius * this.majorRadius;
        const r2 = this.minorRadius * this.minorRadius;
        const f = rho2 + z2 + w2 * (R2 - r2);
        const g = w2 * 4.0 * R2 * rho2;
        return (f * f - g) * this.implicitFunctionScale();
    }
    // public intersectRay(ray: Ray3d, rayFractions: number, points: Point3d, maxHit: number) {}
    evaluateThetaPhi(theta, phi) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        // theta=0 point
        const x0 = this.majorRadius + this.minorRadius * Math.cos(phi);
        const z0 = this.minorRadius * Math.sin(phi);
        return PointVector_1.Point3d.create(c * x0, s * x0, z0);
    }
    evaluateDerivativesThetaPhi(theta, phi, dxdTheta, dxdPhi) {
        const cTheta = Math.cos(theta);
        const sTheta = Math.sin(theta);
        const bx = this.minorRadius * Math.cos(phi);
        const bz = this.minorRadius * Math.sin(phi);
        const x0 = this.majorRadius + bx;
        PointVector_1.Vector3d.create(-x0 * sTheta, x0 * cTheta, 0.0, dxdTheta);
        PointVector_1.Vector3d.create(-cTheta * bz, -sTheta * bz, bx, dxdPhi);
    }
    evaluateThetaPhiDistance(theta, phi, distance) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        // theta=0 point
        const x0 = this.majorRadius + distance * Math.cos(phi);
        const z0 = distance * Math.sin(phi);
        return PointVector_1.Point3d.create(c * x0, s * x0, z0);
    }
    /** Given an xyz coordinate in the local system of the toroid, compute the torus parametrization
     * * theta = angular coordinate in xy plane
     * * phi = angular coordinate in minor circle.
     * * distance = distance from major circle
     * * rho = distance from origin to xy part of the input.
     * @param xyz space point in local coordinates.
     * @return object with properties theta, phi, distance, rho
     */
    XYZToThetaPhiDistance(xyz) {
        const rho = xyz.magnitudeXY();
        const majorRadiusFactor = Geometry_1.Geometry.conditionalDivideFraction(this.majorRadius, rho);
        let safeMajor;
        let majorCirclePoint;
        if (majorRadiusFactor) {
            safeMajor = true;
            majorCirclePoint = PointVector_1.Point3d.create(majorRadiusFactor * xyz.x, majorRadiusFactor * xyz.y, 0.0);
        }
        else {
            safeMajor = false;
            majorCirclePoint = PointVector_1.Point3d.create(xyz.x, xyz.y, 0.0);
        }
        const theta = safeMajor ? Math.atan2(xyz.y, xyz.x) : 0.0;
        const vectorFromMajorCircle = PointVector_1.Vector3d.createStartEnd(majorCirclePoint, xyz);
        const distance = vectorFromMajorCircle.magnitude();
        const drho = rho - this.majorRadius;
        let safePhi;
        let phi;
        if (xyz.z === 0.0 && drho === 0.0) {
            phi = 0.0;
            safePhi = false;
        }
        else {
            phi = Math.atan2(xyz.z, drho);
            safePhi = true;
        }
        return { theta: (theta), phi: (phi), distance: (distance), rho: (rho), safePhi: safeMajor && safePhi };
    }
}
exports.TorusImplicit = TorusImplicit;
/**
 * evaluation methods for an implicit sphere `x*x + y*y + z*z - r*r = 0`.
 */
class SphereImplicit {
    constructor(r) { this.radius = r; }
    // Evaluate the implicit function at space point
    // @param [in] xyz coordinates
    evaluateImplicitFunction(x, y, z) {
        return x * x + y * y + z * z - this.radius * this.radius;
    }
    // Evaluate the implicit function at weighted space point (wx/w, wy/w, wz/w)
    // @param [in] wx (preweighted) x coordinate
    // @param [in] wy (preweighted) y coordinate
    // @param [in] wz (preweighted) z coordinate
    // @param [in] w  weight
    evaluateImplicitFunctionXYZW(wx, wy, wz, w) {
        if (w === 0.0)
            return 0.0;
        return (wx * wx + wy * wy + wz * wz) - this.radius * this.radius * w * w;
    }
    XYZToThetaPhiR(xyz) {
        const rhoSquared = xyz.x * xyz.x + xyz.y * xyz.y;
        const rho = Math.sqrt(rhoSquared);
        const r = Math.sqrt(rhoSquared + xyz.z * xyz.z);
        let theta;
        let phi;
        let valid;
        if (r === 0.0) {
            theta = phi = 0.0;
            valid = false;
        }
        else {
            phi = Math.atan2(xyz.z, rho); // At least one of these is nonzero
            if (rhoSquared !== 0.0) {
                theta = Math.atan2(xyz.y, xyz.x);
                valid = true;
            }
            else {
                theta = 0.0;
                valid = false;
            }
        }
        return { theta: (theta), phi: (phi), r: (r), valid: (valid) };
    }
    // public intersectRay(ray: Ray3d, maxHit: number): {rayFractions: number, points: Point3d} {
    //   const q = new Degree2PowerPolynomial();
    //   // Ray is (origin.x + s * direction.x, etc)
    //   // squared distance from origin is (origin.x + s*direction.x)^2 + etc
    //   // sphere radius in local system is 1.
    //   q.addSquaredLinearTerm(ray.origin.x, ray.direction.x);
    //   q.addSquaredLinearTerm(ray.origin.y, ray.direction.y);
    //   q.addSquaredLinearTerm(ray.origin.z, ray.direction.z);
    //   q.addConstant(-this.radius * this.radius);
    //   let ss = [];
    //   let n = q.realRoots(ss);
    //   if (n > maxHit)
    //     n = maxHit;
    //   let rayFractions;
    //   let points;
    //   for (let i = 0; i < n; i++) {
    //     rayFractions[i] = ss[i];
    //     points[i] = Point3d. // What is the equivalent of FromSumOf in TS?
    //   }
    // Compute the point on the surface at specified angles
    // @param [in] theta major circle angle.
    // @param [in] phi minor circle angle.
    // @return point on surface
    evaluateThetaPhi(thetaRadians, phiRadians) {
        const rc = this.radius * Math.cos(thetaRadians);
        const rs = this.radius * Math.sin(thetaRadians);
        const cosPhi = Math.cos(phiRadians);
        const sinPhi = Math.sin(phiRadians);
        return PointVector_1.Point3d.create(rc * cosPhi, rs * cosPhi, this.radius * sinPhi);
    }
    // Compute derivatives of the point on the surface at specified angles
    // @param [in] theta major circle angle.
    // @param [in] phi minor circle angle.
    // @param [out] dXdTheta derivative wrt theta
    // @param [out] dXdPhi derivative wrt phi
    evaluateDerivativesThetaPhi(theta, phi, dxdTheta, dxdPhi) {
        const rc = this.radius * Math.cos(theta);
        const rs = this.radius * Math.sin(theta);
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        PointVector_1.Vector3d.create(-rs * cosPhi, rc * cosPhi, 0.0, dxdTheta);
        PointVector_1.Vector3d.create(-rc * sinPhi, -rs * sinPhi, this.radius * cosPhi, dxdPhi);
    }
}
exports.SphereImplicit = SphereImplicit;
/** AnalyticRoots has static methods for solving quadratic, cubic, and quartic equations.
 *
 */
class AnalyticRoots {
    /** Absolute zero test with a tolerance that has worked well for the analytic root use case . . . */
    static IsZero(x) {
        return Math.abs(x) < this.EQN_EPS;
    }
    /** Without actually doing a division, test if (x/y) is small.
     * @param x numerator
     * @param y denominator
     * @param abstol absolute tolerance
     * @param reltol relative tolerance
     */
    static isSmallRatio(x, y, abstol = 1.0e-9, reltol = 8.0e-16) {
        return Math.abs(x) <= abstol || Math.abs(x) < reltol * Math.abs(y);
    }
    // @returns the principal (always real) cube root of x.
    static cbrt(x) {
        return ((x) > 0.0 ? Math.pow((x), 1.0 / 3.0) : ((x) < 0.0 ? -Math.pow(-(x), 1.0 / 3.0) : 0.0));
    }
    /**
     * Try to divide `numerator/denominator` and place the result (or defaultValue) in `values[offset]`
     * @param values array of values.  `values[offset]` will be replaced.
     * @param numerator numerator for division.
     * @param denominator denominator for division.
     * @param defaultValue value to save if denominator is too small to divide.
     * @param offset index of value to replace.
     */
    static SafeDivide(values, numerator, denominator, defaultValue = 0.0, offset) {
        if (Math.abs(denominator) > (this.s_safeDivideFactor * Math.abs(numerator))) {
            values[offset] = numerator / denominator;
            return true;
        }
        values[offset] = defaultValue;
        return false;
    }
    // Used in NewtonMethod for testing if a root has been adjusted past its bounding region
    static checkRootProximity(roots, i) {
        if (i === 0) {
            return roots.at(i) < roots.at(i + 1);
        }
        else if (i > 0 && i + 1 < roots.length) {
            return (roots.at(i) > roots.at(i - 1)) && (roots.at(i) < roots.at(i + 1));
        }
        else {
            return (roots.at(i) > roots.at(i - 1));
        }
    }
    static NewtonMethodAdjustment(coffs, root, order) {
        if (order === 3) {
            const f = coffs[0] + root * (coffs[1] + root * (coffs[2] + root * coffs[3]));
            const df = coffs[1] + root * (2.0 * coffs[2] + root * 3.0 * coffs[3]);
            return f / df;
        }
        else if (order === 4) {
            const f = coffs[0] + root * (coffs[1] + root * (coffs[2] + root * (coffs[3] + root * coffs[4])));
            const df = coffs[1] + root * (2.0 * coffs[2] + root * (3.0 * coffs[3] + root * 4.0 * coffs[4]));
            return f / df;
        }
        else {
            return 0;
        }
    }
    static improveSortedRoots(coffs, degree, roots) {
        const relTol = 1.0e-10;
        // Loop through each root
        for (let i = 0; i < roots.length; i++) {
            let dx = this.NewtonMethodAdjustment(coffs, roots.at(i), degree);
            if (!dx)
                continue; // skip if newton step had divide by zero.
            const originalValue = roots.at(i);
            let counter = 0;
            let convergenceCounter = 0;
            // Loop through applying changes to found root until dx is diminished or counter is hit
            while (dx !== 0 && (counter < 10)) {
                // consider it converged if two successive iterations satisfy the (not too demanding) tolerance.
                if (Math.abs(dx) < relTol * (1.0 + Math.abs(roots.at(i)))) {
                    if (++convergenceCounter > 1)
                        break;
                }
                else {
                    convergenceCounter = 0;
                }
                const rootDX = roots.at(i) - dx;
                roots.reassign(i, rootDX);
                // If root is thrown past one of its neighboring roots, unstable condition is assumed.. revert
                // to originally found root
                if (!this.checkRootProximity(roots, i)) {
                    roots.reassign(i, originalValue);
                    break;
                }
                dx = this.NewtonMethodAdjustment(coffs, roots.at(i), degree);
                counter++;
            }
        }
    }
    /**
     * Append (if defined) value to results.
     * @param value optional value to append
     * @param results growning array
     */
    static appendSolution(value, results) {
        if (value !== undefined) {
            results.push(value);
        }
    }
    /**
     * Append 2 solutions -- note that both are required args, no option of omitting as in single solution case
     * @param value1
     * @param value2
     * @param results
     */
    static append2Solutions(valueA, valueB, results) {
        results.push(valueA);
        results.push(valueB);
    }
    /**
     * If `co/c1` is a safed division, append it to the values array.
     * @param c0 numerator
     * @param c1 denominaotr
     * @param values array to expand
     */
    static appendLinearRoot(c0, c1, values) {
        AnalyticRoots.appendSolution(Geometry_1.Geometry.conditionalDivideFraction(-c0, c1), values);
    }
    // Search an array for the value which is farthest from the average of all the values.
    static mostDistantFromMean(data) {
        if (!data || data.length === 0)
            return 0;
        let a = 0.0; // to become the sum and finally the average.
        for (let i = 0; i < data.length; i++)
            a += data.at(i);
        a /= data.length;
        let dMax = 0.0;
        let result = data.at(0);
        for (let i = 0; i < data.length; i++) {
            const d = Math.abs(data.at(i) - a);
            if (d < dMax) {
                dMax = d;
                result = data.at(i);
            }
        }
        return result;
    }
    /**
     * Append 0, 1, or 2 solutions of a quadratic to the values array.
     * @param c array of coefficients for quadratic `c[0] + c[1] * x + c[2] * x*x`
     * @param values array to be expanded.
     */
    static appendQuadraticRoots(c, values) {
        // Normal form: x^2 + 2px + q = 0
        const divFactor = Geometry_1.Geometry.conditionalDivideFraction(1.0, c[2]);
        if (!divFactor) {
            this.appendLinearRoot(c[0], c[1], values);
            return;
        }
        const p = 0.5 * c[1] * divFactor;
        const q = c[0] * divFactor;
        const D = p * p - q;
        if (this.IsZero(D)) {
            this.appendSolution(-p, values);
            return;
        }
        else if (D < 0) {
            return;
        }
        else if (D > 0) {
            const sqrt_D = Math.sqrt(D);
            this.append2Solutions(sqrt_D - p, -sqrt_D - p, values);
            return;
        }
        return;
    }
    static addConstant(value, data) {
        for (let i = 0; i < data.length; i++)
            data.reassign(i, data.at(i) + value);
    }
    /** return roots of a cubic c0 + c1 *x + c2 * x^2 + c2 * x3.
     * In the usual case where c0 is non-zero, there are either 1 or 3 roots.
     * But if c0 is zero the (0, 1, or 2) roots of the lower order equation
     */
    static appendCubicRootsUnsorted(c, results) {
        let A;
        let B;
        let C;
        let sq_A;
        let p;
        let q;
        let cb_p;
        let D;
        // normal form: x^3 + Ax^2 + Bx + C = 0
        const scaleFactor = Geometry_1.Geometry.conditionalDivideFraction(1.0, c[3]);
        if (!scaleFactor) {
            this.appendQuadraticRoots(c, results);
            return;
        }
        // It is a real cubic.  There MUST be at least one real solution . . .
        A = c[2] * scaleFactor;
        B = c[1] * scaleFactor;
        C = c[0] * scaleFactor;
        /*  substitute x = y - A/3 to eliminate quadric term:
            f = y^3 +3py + 2q = 0
            f' = 3y^2 + p
                local min/max at Y = +-sqrt (-p)
                f(+Y) = -p sqrt(-p) + 3p sqrt (-p) + 2q = 2 p sqrt (-p) + 2q
        */
        sq_A = A * A;
        p = (3.0 * B - sq_A) / 9.0;
        q = 1.0 / 2 * (2.0 / 27 * A * sq_A - 1.0 / 3 * A * B + C);
        // Use Cardano's formula
        cb_p = p * p * p;
        D = q * q + cb_p;
        const origin = A / (-3.0);
        if (D >= 0.0 && this.IsZero(D)) {
            if (this.IsZero(q)) {
                // One triple solution
                results.push(origin);
                results.push(origin);
                results.push(origin);
                return;
            }
            else {
                // One single and one double solution
                const u = this.cbrt(-q);
                if (u < 0) {
                    results.push(origin + 2 * u);
                    results.push(origin - u);
                    results.push(origin - u);
                    return;
                }
                else {
                    results.push(origin - u);
                    results.push(origin - u);
                    results.push(origin + 2 * u);
                    return;
                }
            }
        }
        else if (D <= 0) {
            const phi = 1.0 / 3 * Math.acos(-q / Math.sqrt(-cb_p));
            const t = 2 * Math.sqrt(-p);
            results.push(origin + t * Math.cos(phi));
            results.push(origin - t * Math.cos(phi + Math.PI / 3));
            results.push(origin - t * Math.cos(phi - Math.PI / 3));
            return;
        }
        else {
            const sqrt_D = Math.sqrt(D);
            const u = this.cbrt(sqrt_D - q);
            const v = -(this.cbrt(sqrt_D + q));
            results.push(origin + u + v);
            return;
        }
    }
    static appendCubicRoots(c, results) {
        this.appendCubicRootsUnsorted(c, results);
        results.sort();
    }
    static appendQuarticRoots(c, results) {
        const coeffs = new Float64Array(4); // at various times .. coefficients of quadratic an cubic intermediates.
        let u;
        let v;
        let A;
        let B;
        let C;
        let D;
        let sq_A;
        let p;
        let q;
        let r;
        // normal form: x^4 + Ax^3 + Bx^2 + Cx + D = 0
        const coffScale = new Float64Array(1);
        if (!this.SafeDivide(coffScale, 1.0, c[4], 0.0, 0)) {
            this.appendCubicRoots(c, results);
            return;
        }
        A = c[3] * coffScale[0];
        B = c[2] * coffScale[0];
        C = c[1] * coffScale[0];
        D = c[0] * coffScale[0];
        const origin = -0.25 * A;
        /*  substitute x = y - A/4 to eliminate cubic term:
            x^4 + px^2 + qx + r = 0 */
        sq_A = A * A;
        p = -3.0 / 8 * sq_A + B;
        q = 0.125 * sq_A * A - 0.5 * A * B + C;
        r = -3.0 / 256 * sq_A * sq_A + 1.0 / 16 * sq_A * B - 1.0 / 4 * A * C + D;
        const tempStack = new GrowableArray_1.GrowableFloat64Array();
        if (this.IsZero(r)) {
            // no absolute term: y(y^3 + py + q) = 0
            coeffs[0] = q;
            coeffs[1] = p;
            coeffs[2] = 0;
            coeffs[3] = 1;
            this.appendCubicRootsUnsorted(coeffs, results);
            results.push(0); // APPLY ORIGIN ....
            this.addConstant(origin, results);
            return;
        }
        else {
            // Solve the resolvent cubic
            coeffs[0] = 1.0 / 2 * r * p - 1.0 / 8 * q * q;
            coeffs[1] = -r;
            coeffs[2] = -1.0 / 2 * p;
            coeffs[3] = 1;
            this.appendCubicRootsUnsorted(coeffs, tempStack);
            const z = this.mostDistantFromMean(tempStack);
            // ... to build two quadric equations
            u = z * z - r;
            v = 2 * z - p;
            if (this.isSmallRatio(u, r)) {
                u = 0;
            }
            else if (u > 0) {
                u = Math.sqrt(u);
            }
            else {
                return;
            }
            if (this.isSmallRatio(v, p)) {
                v = 0;
            }
            else if (v > 0) {
                v = Math.sqrt(v);
            }
            else {
                for (let i = 0; i < tempStack.length; i++) {
                    results.push(tempStack.at(i));
                }
                return;
            }
            coeffs[0] = z - u;
            coeffs[1] = ((q < 0) ? (-v) : (v));
            coeffs[2] = 1;
            this.appendQuadraticRoots(coeffs, results);
            coeffs[0] = z + u;
            coeffs[1] = ((q < 0) ? (v) : (-v));
            coeffs[2] = 1;
            this.appendQuadraticRoots(coeffs, results);
        }
        // resubstitute
        this.addConstant(origin, results);
        results.sort();
        this.improveSortedRoots(c, 4, results);
        return;
    }
    static appendCosSinRadians(c, s, cosValues, sinValues, radiansValues) {
        if (cosValues)
            cosValues.push(c);
        if (sinValues)
            sinValues.push(s);
        if (radiansValues)
            radiansValues.push(Math.atan2(s, c));
    }
    /*-----------------------------------------------------------------
     Solve the simultaneous equations
     <pre>
                   alpha + beta*c + gamma*s = 0
                   c*c + s*s = 1
  
     @param c1P OUT x cosine component of first solution point
     @param s1P OUT y sine component of first solution point
     @param c2P OUT x cosine component of second solution point
     @param s2P OUT y sine component of second solution point
     @param solutionType OUT One of the following values:
    <pre>
        -2 -- all coefficients identically 0.   The entire c,s plane -- and therefore
            the entire unit circle -- is a solution.
        -1 -- beta,gamma are zero, alpha is not.   There is no line defined.  There are
            no solutions.
        0 -- the line is well defined, but passes completely outside the unit circle.
                In this case, (c1,s1) is the circle point closest to the line
                and (c2,s2) is the line point closest to the circle.
        1 -- the line is tangent to the unit circle.  As tangency is identified at
                numerical precision, faithful interpretation of the coefficients
                may allow for some distance from line to circle. (c1,s1) is returned
                as the closest circle point, (c2,s2) the line point.  These are
                nominally the same but may differ due to the tolerance
                decision.
        2 -- two simple intersections.
    </pre>
  
      @param alpha => constant coefficient on line
     @param beta => x cosine coefficient on line
     @param gamma => y sine coefficient on line
     @param reltol => relative tolerance for tangencies
     @return the (nonnegative) solution count.
  
    @remarks Here is an example of the tangible meaning of the coefficients and
    the cryptic 5-way solution type separation.
    Point X on a 3D ellipse at parameter space angle theta is given by
        X = C + U cos(theta) + V sin(theta)
    where C,U,V are (respectively) center, 0 degree, and 90 degree vectors.
    A plane has normal N and is at distance a from the origin.  X is on the plane if
        X.N = a
    i.e.
        C.N + U.N cos(theta) + V.N sin(theta) = a
    i.e.
        C.N - a + U.N cos(theta) + V.N sin(theta) = 0
    i.e.
        alpha = C.N - a
        beta =  U.N
        gamma = V.N
    If the ellipse is parallel to the plane, both beta and gamma are zero.  These are
    the two degenerat cases.  If alpha is also zero the entire ellipse is completely
    in the plane.   If alpha is nonzero the ellipse is completely out of plane.
  
    If the ellipse plane is NOT parallel, there are zero, one, or two solutions according as
    the ellipse is completly on one side, tangent or is properly split by the plane.
  
     @bsihdr                                       EarlinLutz      12/97
    +---------------+---------------+---------------+---------------+------*/
    static appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, cosValues, sinValues, radiansValues, reltol = 1.0e-14) {
        let twoTol;
        const delta2 = beta * beta + gamma * gamma;
        const alpha2 = alpha * alpha;
        let solutionType = 0;
        if (reltol < 0.0) {
            twoTol = 0.0;
        }
        else {
            twoTol = 2.0 * reltol;
        }
        if (delta2 <= 0.0) {
            solutionType = (alpha === 0) ? -2 : -1;
        }
        else {
            const lambda = -alpha / delta2;
            const a2 = alpha2 / delta2;
            const D2 = 1.0 - a2;
            if (D2 < -twoTol) {
                const delta = Math.sqrt(delta2);
                const iota = (alpha < 0) ? (1.0 / delta) : (-1.0 / delta);
                this.appendCosSinRadians(lambda * beta, lambda * gamma, cosValues, sinValues, radiansValues);
                this.appendCosSinRadians(beta * iota, gamma * iota, cosValues, sinValues, radiansValues);
                solutionType = 0;
            }
            else if (D2 < twoTol) {
                const delta = Math.sqrt(delta2);
                const iota = (alpha < 0) ? (1.0 / delta) : (-1.0 / delta);
                this.appendCosSinRadians(lambda * beta, lambda * gamma, cosValues, sinValues, radiansValues);
                this.appendCosSinRadians(beta * iota, gamma * iota, cosValues, sinValues, radiansValues);
                solutionType = 1;
            }
            else {
                const mu = Math.sqrt(D2 / delta2);
                /* c0,s0 = closest approach of line to origin */
                const c0 = lambda * beta;
                const s0 = lambda * gamma;
                this.appendCosSinRadians(c0 - mu * gamma, s0 + mu * beta, cosValues, sinValues, radiansValues);
                this.appendCosSinRadians(c0 + mu * gamma, s0 - mu * beta, cosValues, sinValues, radiansValues);
                solutionType = 2;
            }
        }
        return solutionType;
    }
}
AnalyticRoots.EQN_EPS = 1.0e-9;
AnalyticRoots.s_safeDivideFactor = 1.0e-14;
AnalyticRoots.s_quadricRelTol = 1.0e-14;
AnalyticRoots.sTestWindow = 1.0e-6;
exports.AnalyticRoots = AnalyticRoots;
class PowerPolynomial {
    // Evaluate a standard basis polynomial.
    static degreeKnownEvaluate(coff, degree, x) {
        if (degree < 0) {
            return 0.0;
        }
        let p = coff[degree];
        for (let i = degree - 1; i >= 0; i--)
            p = x * p + coff[i];
        return p;
    }
    // Evaluate a standard basis polynomial
    static Evaluate(coff, x) {
        const degree = coff.length - 1;
        return this.degreeKnownEvaluate(coff, degree, x);
    }
    // Accumulate Q*scale into P.  Both are treated as full degree.
    //         (Expect Address exceptions if P is smaller than Q)
    // Returns degree of result as determined by comparing leading coefficients to zero
    static Accumulate(coffP, coffQ, scaleQ) {
        let degreeP = coffP.length - 1;
        const degreeQ = coffQ.length - 1;
        for (let i = 0; i <= degreeQ; i++) {
            coffP[i] += scaleQ * coffQ[i];
        }
        while (degreeP >= 0 && coffP[degreeP] === 0.0) {
            degreeP--;
        }
        return degreeP;
    }
    // Zero all coefficients in a polynomial
    static Zero(coff) {
        for (let i = 0; i < coff.length; i++) {
            coff[i] = 0.0;
        }
    }
}
exports.PowerPolynomial = PowerPolynomial;
class TrigPolynomial {
    /// Solve a polynomial created from trigonometric condition using
    /// Trig.S, Trig.C, Trig.W.  Solution logic includes inferring angular roots
    /// corresponding zero leading coefficients (roots at infinity)
    /// <param name="coff">Coefficients</param>
    /// <param name="nominalDegree">degree of the polynomial under most complex
    ///     root case.  If there are any zero coefficients up to this degree, a single root
    ///     "at infinity" is recorded as its corresponding angular parameter at negative pi/2
    /// <param name="referenceCoefficient">A number which represents the size of coefficients
    ///     at various stages of computation.  A small fraction of this will be used as a zero
    ///     tolerance</param>
    /// <param name="angles">Roots are placed here. Assumed preallocated with adequate size.</param>
    /// <param name="numRoots">Number of roots  .  Zero roots is possible. (Passed as array of size
    /// one to pass-by-reference)</param>
    /// Returns false if equation is all zeros.   This usually means any angle is a solution.
    // ------------------------------------------------------------------------------------------------
    // Solve a standard basis polynomial.   Immediately use the roots as ordinates
    //            in rational polynomials for sine and cosine, and convert to angle via arctan
    static SolveAngles(coff, nominalDegree, referenceCoefficient, radians) {
        let maxCoff = Math.abs(referenceCoefficient);
        let a;
        radians.length = 0;
        const relTol = this.SmallAngle;
        for (let i = 0; i <= nominalDegree; i++) {
            a = Math.abs(coff[i]);
            if (a > maxCoff) {
                maxCoff = a;
            }
        }
        const coffTol = relTol * maxCoff;
        let degree = nominalDegree;
        while (degree > 0 && (Math.abs(coff[degree - 1]) <= coffTol)) {
            degree--;
        }
        // let bstat = false;
        const roots = new GrowableArray_1.GrowableFloat64Array();
        if (degree === -1) {
            // Umm.   Dunno.   Nothing there.
            // bstat = false;
        }
        else {
            // bstat = true;
            if (degree === 0) {
                // p(t) is a nonzero constant
                // No roots, but not degenerate.
                // bstat = true;
            }
            else if (degree === 1) {
                // p(t) = coff[1] * t + coff[0]...
                roots.push(-coff[0] / coff[1]);
            }
            else if (degree === 2) {
                AnalyticRoots.appendQuadraticRoots(coff, roots);
            }
            else if (degree === 3) {
                AnalyticRoots.appendCubicRoots(coff, roots);
            }
            else if (degree === 4) {
                AnalyticRoots.appendQuarticRoots(coff, roots);
            }
            else {
                // TODO: WILL WORK WITH BEZIER SOLVER
                // bstat = false;
            }
            if (roots.length > 0) {
                // Each solution t represents an angle with
                //  Math.Cos(theta)=C(t)/W(t),  ,sin(theta)=S(t)/W(t)
                // Division by W has no effect on Atan2 calculations, so we just compute S(t),C(t)
                for (let i = 0; i < roots.length; i++) {
                    const ss = PowerPolynomial.Evaluate(this.S, roots.at(i));
                    const cc = PowerPolynomial.Evaluate(this.C, roots.at(i));
                    radians.push(Math.atan2(ss, cc));
                }
                // Each leading zero at the front of the coefficients corresponds to a root at -PI/2.
                // Only make one entry....
                // for (int i = degree; i < nominalDegree; i++)
                if (degree < nominalDegree) {
                    radians.push(-0.5 * Math.PI);
                }
            }
        }
        return radians.length > 0;
    }
    /// <summary> Compute intersections of unit circle x^2 + y 2 = 1 with general quadric
    ///         axx*x^2 + axy*x*y + ayy*y^2 + ax * x + ay * y + a1 = 0
    /// Solutions are returned as angles. Sine and Cosine of the angles are the x,y results.
    /// <param name="axx">Coefficient of x^2</param>
    /// <param name="axy">Coefficient of xy</param>
    /// <param name="ayy">Coefficient of y^2</param>
    /// <param name="ax">Coefficient of x</param>
    /// <param name="ay">Coefficient of y</param>
    /// <param name="a1">Constant coefficient</param>
    /// <param name="angles">solution angles</param>
    /// <param name="numAngle">number of solution angles (Passed as array to make changes to reference)</param>
    static SolveUnitCircleImplicitQuadricIntersection(axx, axy, ayy, ax, ay, a1, radians) {
        const Coffs = new Float64Array(5);
        PowerPolynomial.Zero(Coffs);
        let degree = 2;
        if (Math.hypot(axx, axy, ayy) > TrigPolynomial.coeffientRelTol * Math.hypot(ax, ay, a1)) {
            PowerPolynomial.Accumulate(Coffs, this.CW, ax);
            PowerPolynomial.Accumulate(Coffs, this.SW, ay);
            PowerPolynomial.Accumulate(Coffs, this.WW, a1);
            PowerPolynomial.Accumulate(Coffs, this.SS, ayy);
            PowerPolynomial.Accumulate(Coffs, this.CC, axx);
            PowerPolynomial.Accumulate(Coffs, this.SC, axy);
            degree = 4;
        }
        else {
            PowerPolynomial.Accumulate(Coffs, this.C, ax);
            PowerPolynomial.Accumulate(Coffs, this.S, ay);
            PowerPolynomial.Accumulate(Coffs, this.W, a1);
            degree = 2;
        }
        let maxCoff = 0.0;
        maxCoff = Math.max(maxCoff, Math.abs(axx), Math.abs(ayy), Math.abs(axy), Math.abs(ax), Math.abs(ay), Math.abs(a1));
        const b = this.SolveAngles(Coffs, degree, maxCoff, radians);
        /*
        for (const theta of angles) {
          const c = theta.cos();
          const s = theta.sin();
          console.log({
            angle: theta, co: c, si: s,
            f: axx * c * c + axy * c * s + ayy * s * s + ax * c + ay * s + a1});
      } */
        return b;
    }
    /// <summary> Compute intersections of unit circle x^2 + y 2 = 1 with the ellipse
    ///         (x,y) = (cx + ux Math.Cos + vx sin, cy + uy Math.Cos + vy sin)
    /// Solutions are returned as angles in the ellipse space.
    /// <param name="cx">center x</param>
    /// <param name="cy">center y</param>
    /// <param name="ux">0 degree vector x</param>
    /// <param name="uy">0 degree vector y</param>
    /// <param name="vx">90 degree vector x</param>
    /// <param name="vy">90 degree vector y</param>
    /// <param name="ellipseAngles">solution angles in ellipse parameter space</param>
    /// <param name="circleAngles">solution angles in circle parameter space</param>
    /// <param name="numAngle">number of solution angles (passed as an array to change reference)</param>
    static SolveUnitCircleEllipseIntersection(cx, cy, ux, uy, vx, vy, ellipseRadians, circleRadians) {
        circleRadians.length = 0;
        const acc = ux * ux + uy * uy;
        const acs = 2.0 * (ux * vx + uy * vy);
        const ass = vx * vx + vy * vy;
        const ac = 2.0 * (ux * cx + uy * cy);
        const asi = 2.0 * (vx * cx + vy * cy);
        const a = cx * cx + cy * cy - 1.0;
        const boolstat = this.SolveUnitCircleImplicitQuadricIntersection(acc, acs, ass, ac, asi, a, ellipseRadians);
        for (const radians of ellipseRadians) {
            const cc = Math.cos(radians);
            const ss = Math.sin(radians);
            const x = cx + ux * cc + vx * ss;
            const y = cy + uy * cc + vy * ss;
            circleRadians.push(Math.atan2(y, x));
        }
        return boolstat;
    }
}
// Constants taken from Angle.cpp (may be later moved to a constants module)
TrigPolynomial.SmallAngle = 1.0e-11;
// Standard Basis coefficients for rational sine numerator.
TrigPolynomial.S = Float64Array.from([0.0, 2.0, -2.0]);
// Standard Basis coefficients for rational cosine numerator.
TrigPolynomial.C = Float64Array.from([1.0, -2.0]);
// Standard Basis coefficients for rational denominator.
TrigPolynomial.W = Float64Array.from([1.0, -2.0, 2.0]);
// Standard Basis coefficients for cosine*weight numerator
TrigPolynomial.CW = Float64Array.from([1.0, -4.0, 6.0, -4.0]);
// Standard Basis coefficients for sine*weight numerator
TrigPolynomial.SW = Float64Array.from([0.0, 2.0, -6.0, 8.0, -4.0]);
// Standard Basis coefficients for sine*cosine numerator
TrigPolynomial.SC = Float64Array.from([0.0, 2.0, -6.0, 4.0]);
// Standard Basis coefficients for sine^2 numerator
TrigPolynomial.SS = Float64Array.from([0.0, 0.0, 4.0, -8.0, 4.0]);
// Standard Basis coefficients for cosine^2 numerator
TrigPolynomial.CC = Float64Array.from([1.0, -4.0, 4.0]);
// Standard Basis coefficients for weight^2
TrigPolynomial.WW = Float64Array.from([1.0, -4.0, 8.0, -8.0, 4.0]);
// Standard Basis coefficients for (Math.Cos^2 - sine^2) numerator
TrigPolynomial.CCminusSS = Float64Array.from([1.0, -4.0, 0.0, 8.0, -4.0]);
TrigPolynomial.coeffientRelTol = 1.0e-12;
exports.TrigPolynomial = TrigPolynomial;
class SmallSystem {
    /**
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection.
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment2dXYTransverseIntersectionUnbounded(a0, a1, b0, b1, result) {
        const ux = a1.x - a0.x;
        const uy = a1.y - a0.y;
        const vx = b1.x - b0.x;
        const vy = b1.y - b0.y;
        const cx = b0.x - a0.x;
        const cy = b0.y - a0.y;
        const uv = Geometry_1.Geometry.crossProductXYXY(ux, uy, vx, vy);
        const cv = Geometry_1.Geometry.crossProductXYXY(cx, cy, vx, vy);
        const cu = Geometry_1.Geometry.crossProductXYXY(ux, uy, cx, cy);
        const s = Geometry_1.Geometry.conditionalDivideFraction(cv, uv);
        const t = Geometry_1.Geometry.conditionalDivideFraction(cu, uv);
        if (s !== undefined && t !== undefined) {
            result.set(s, -t);
            return true;
        }
        result.set(0, 0);
        return false;
    }
    /**
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection using only xy parts
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dXYTransverseIntersectionUnbounded(a0, a1, b0, b1, result) {
        const ux = a1.x - a0.x;
        const uy = a1.y - a0.y;
        const vx = b1.x - b0.x;
        const vy = b1.y - b0.y;
        const cx = b0.x - a0.x;
        const cy = b0.y - a0.y;
        const uv = Geometry_1.Geometry.crossProductXYXY(ux, uy, vx, vy);
        const cv = Geometry_1.Geometry.crossProductXYXY(cx, cy, vx, vy);
        const cu = Geometry_1.Geometry.crossProductXYXY(ux, uy, cx, cy);
        const s = Geometry_1.Geometry.conditionalDivideFraction(cv, uv);
        const t = Geometry_1.Geometry.conditionalDivideFraction(cu, uv);
        if (s !== undefined && t !== undefined) {
            result.set(s, -t);
            return true;
        }
        result.set(0, 0);
        return false;
    }
    /**
     * Return true if lines (a0,a1) to (b0, b1) have closest approach (go by each other) in 3d
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dClosestApproachUnbounded(a0, a1, b0, b1, result) {
        const ux = a1.x - a0.x;
        const uy = a1.y - a0.y;
        const uz = a1.z - a0.z;
        const vx = b1.x - b0.x;
        const vy = b1.y - b0.y;
        const vz = b1.z - b0.z;
        const cx = b0.x - a0.x;
        const cy = b0.y - a0.y;
        const cz = b0.z - a0.z;
        const uu = Geometry_1.Geometry.dotProductXYZXYZ(ux, uy, uz, ux, uy, uz);
        const vv = Geometry_1.Geometry.dotProductXYZXYZ(vx, vy, vz, vx, vy, vz);
        const uv = Geometry_1.Geometry.dotProductXYZXYZ(ux, uy, uz, vx, vy, vz);
        const cu = Geometry_1.Geometry.dotProductXYZXYZ(cx, cy, cz, ux, uy, uz);
        const cv = Geometry_1.Geometry.dotProductXYZXYZ(cx, cy, cz, vx, vy, vz);
        return SmallSystem.linearSystem2d(uu, -uv, uv, -vv, cu, cv, result);
    }
    static linearSystem2d(ux, vx, // first row of matrix
    uy, vy, // second row of matrix
    cx, cy, // right side
    result) {
        const uv = Geometry_1.Geometry.crossProductXYXY(ux, uy, vx, vy);
        const cv = Geometry_1.Geometry.crossProductXYXY(cx, cy, vx, vy);
        const cu = Geometry_1.Geometry.crossProductXYXY(ux, uy, cx, cy);
        const s = Geometry_1.Geometry.conditionalDivideFraction(cv, uv);
        const t = Geometry_1.Geometry.conditionalDivideFraction(cu, uv);
        if (s !== undefined && t !== undefined) {
            result.set(s, t);
            return true;
        }
        result.set(0, 0);
        return false;
    }
    /**
     * Solve a linear system
     * * x equation: `ux *u * vx * v + wx * w = cx`
     * * y equation: `uy *u * vy * v + wy * w = cy`
     * * z equation: `uz *u * vz * v + wz * w = cz`
     * @param axx row 0, column 0 coefficient
     * @param axy row 0, column 1 coefficient
     * @param axz row 0, column 1 coefficient
     * @param ayx row 1, column 0 coefficient
     * @param ayy row 1, column 1 coefficient
     * @param ayz row 1, column 2 coefficient
     * @param azx row 2, column 0 coefficient
     * @param azy row 2, column 1 coefficient
     * @param azz row 2, column 2 coefficient
     * @param cx right hand side row 0 coefficient
     * @param cy right hand side row 1 coefficient
     * @param cz right hand side row 2 coeficient
     * @param result optional result.
     */
    static linearSystem3d(axx, axy, axz, // first row of matrix
    ayx, ayy, ayz, // second row of matrix
    azx, azy, azz, // second row of matrix
    cx, cy, cz, // right side
    result) {
        // determinants of various combinations of columns ...
        const detXYZ = Geometry_1.Geometry.tripleProduct(axx, ayx, azx, axy, ayy, azy, axz, ayz, azz);
        const detCYZ = Geometry_1.Geometry.tripleProduct(cx, cy, cz, axy, ayy, azy, axz, ayz, azz);
        const detXCZ = Geometry_1.Geometry.tripleProduct(axx, ayx, azx, cx, cy, cz, axz, ayz, azz);
        const detXYC = Geometry_1.Geometry.tripleProduct(cx, cy, cz, axy, ayy, azy, cx, cy, cz);
        const s = Geometry_1.Geometry.conditionalDivideFraction(detCYZ, detXYZ);
        const t = Geometry_1.Geometry.conditionalDivideFraction(detXCZ, detXYZ);
        const u = Geometry_1.Geometry.conditionalDivideFraction(detXYC, detXYZ);
        if (s !== undefined && t !== undefined && t !== undefined) {
            return PointVector_1.Vector3d.create(s, t, u, result);
        }
        return undefined;
    }
}
exports.SmallSystem = SmallSystem;
//# sourceMappingURL=Polynomials.js.map