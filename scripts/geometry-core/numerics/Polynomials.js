"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
// import { Angle, AngleSweep, Geometry } from "../Geometry";
const Geometry_1 = require("../Geometry");
const GrowableFloat64Array_1 = require("../geometry3d/GrowableFloat64Array");
// import { Arc3d } from "../curve/Arc3d";
// cspell:word Cardano
// cspell:word CCminusSS
/* tslint:disable:variable-name*/
/**
 * degree 2 (quadratic) polynomial in for y = c0 + c1*x + c2*x^2
 * @internal
 */
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
    /** Add `a` to the constant term. */
    addConstant(a) {
        this.coffs[0] += a;
    }
    /** Add  `s * (a + b*x)^2` to the quadratic coefficients */
    addSquaredLinearTerm(a, b, s = 1) {
        this.coffs[0] += s * (a * a);
        this.coffs[1] += s * (2.0 * a * b);
        this.coffs[2] += s * (b * b);
    }
    /** Return the real roots of this polynomial */
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
    /** Evaluate the quadratic at x. */
    evaluate(x) {
        return this.coffs[0] + x * (this.coffs[1] + x * this.coffs[2]);
    }
    /**
     * Evaluate the bezier function at a parameter value.  (i.e. sum the basis functions times coefficients)
     * @param u parameter for evaluation
     */
    evaluateDerivative(x) {
        return this.coffs[1] + 2 * x * this.coffs[2];
    }
    /** Factor the polynomial in to the form `y0 + c * (x-x0)^2)`, i.e. complete the square. */
    tryGetVertexFactorization() {
        const x = Geometry_1.Geometry.conditionalDivideFraction(-this.coffs[1], 2.0 * this.coffs[2]);
        if (x !== undefined) {
            const y = this.evaluate(x);
            return { c: this.coffs[2], x0: x, y0: y };
        }
        return undefined;
    }
    /** Construct a quadratic from input form `c2 * (x-root0) * (x-root1)` */
    static fromRootsAndC2(root0, root1, c2 = 1) {
        return new Degree2PowerPolynomial(c2 * root0 * root1, -c2 * (root0 + root1), c2);
    }
}
exports.Degree2PowerPolynomial = Degree2PowerPolynomial;
/**
 * degree 3 (cubic) polynomial in for y = c0 + c1*x + c2*x^2 + c3*x^3
 * @internal
 */
class Degree3PowerPolynomial {
    constructor(c0 = 0, c1 = 0, c2 = 0, c3 = 1) {
        this.coffs = [c0, c1, c2, c3];
    }
    /** Add `a` to the constant term. */
    addConstant(a) {
        this.coffs[0] += a;
    }
    /** Add `s * (a + b*x)^2` to the cubic */
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
    /** Construct a cubic from the form `c3 * (x-root0) * (x - root1) * (x- root2)` */
    static fromRootsAndC3(root0, root1, root2, c3 = 1.0) {
        return new Degree3PowerPolynomial(-c3 * root0 * root1 * root2, c3 * (root0 * root1 + root1 * root2 + root0 * root2), -c3 * (root0 + root1 + root2), c3);
    }
}
exports.Degree3PowerPolynomial = Degree3PowerPolynomial;
/**
 * degree 4 (quartic) polynomial in for y = c0 + c1*x + c2*x^2 + c4*x^4
 * @internal
 */
class Degree4PowerPolynomial {
    constructor(c0 = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0) {
        this.coffs = [c0, c1, c2, c3, c4];
    }
    /** Add `a` to the constant term. */
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
    /** Construct a quartic from the form `c3 * (x-root0) * (x - root1) * (x- root2) * (x-root3)` */
    static fromRootsAndC4(root0, root1, root2, root3, c4 = 1) {
        return new Degree4PowerPolynomial(c4 * (root0 * root1 * root2 * root3), -c4 * (root0 * root1 * root2 + root0 * root1 * root3 + root0 * root2 * root3 + root1 * root2 * root3), c4 * (root0 * root1 + root0 * root2 + root0 * root3 + root1 * root2 + root1 * root3 + root2 * root3), -c4 * (root0 + root1 + root2 + root3), c4);
    }
}
exports.Degree4PowerPolynomial = Degree4PowerPolynomial;
/**
 * polynomial services for an implicit torus with
 * * z axis is "through the donut hole"
 * * `majorRadius` is the radius of the circle "around the z axis"
 * * `minorRadius` is the radius of circles around the major circle
 * * for simple xyz the implicit form is
 *   * `(x^2+y^2+z^2+(R^2-r^2))^2 = 4 R^2(x^2+y^2)`
 * * In weighted form
 *   * `(x^2+y^2+z^2+(R^2-r^2)w^2)^2 = 4 R^2 w^2 (x^2+y^2)`
 * @internal
 */
class TorusImplicit {
    constructor(majorRadius, minorRadius) {
        this.majorRadius = majorRadius;
        this.minorRadius = minorRadius;
    }
    /** Return sum of (absolute) major and minor radii, which is (half) the box size in x and y directions */
    boxSize() {
        return (Math.abs(this.majorRadius) + Math.abs(this.minorRadius));
    }
    /** Return scale factor appropriate to control the magnitude of the implicit function. */
    implicitFunctionScale() {
        const a = this.boxSize();
        if (a === 0.0)
            return 1.0;
        return 1.0 / (a * a * a * a);
    }
    /**
     * At space point (x,y,z) evaluate the implicit form of the torus (See `ImplicitTorus`)
     */
    evaluateImplicitFunctionXYZ(x, y, z) {
        const rho2 = x * x + y * y;
        const z2 = z * z;
        const R2 = this.majorRadius * this.majorRadius;
        const r2 = this.minorRadius * this.minorRadius;
        const f = rho2 + z2 + (R2 - r2);
        const g = 4.0 * R2 * rho2;
        return (f * f - g) * this.implicitFunctionScale();
    }
    /** Evaluate the implicit function at a point. */
    evaluateImplicitFunctionPoint(xyz) {
        return this.evaluateImplicitFunctionXYZ(xyz.x, xyz.y, xyz.z);
    }
    /** Evaluate the implicit function at homogeneous coordinates */
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
    /** Evaluate the surface point at angles (in radians) on the major and minor circles. */
    evaluateThetaPhi(thetaRadians, phiRadians) {
        const c = Math.cos(thetaRadians);
        const s = Math.sin(thetaRadians);
        // theta=0 point
        const x0 = this.majorRadius + this.minorRadius * Math.cos(phiRadians);
        const z0 = this.minorRadius * Math.sin(phiRadians);
        return Point3dVector3d_1.Point3d.create(c * x0, s * x0, z0);
    }
    /** Evaluate partial derivatives at angles (int radians) on major and minor circles. */
    evaluateDerivativesThetaPhi(thetaRadians, phiRadians, dxdTheta, dxdPhi) {
        const cTheta = Math.cos(thetaRadians);
        const sTheta = Math.sin(thetaRadians);
        const bx = this.minorRadius * Math.cos(phiRadians);
        const bz = this.minorRadius * Math.sin(phiRadians);
        const x0 = this.majorRadius + bx;
        Point3dVector3d_1.Vector3d.create(-x0 * sTheta, x0 * cTheta, 0.0, dxdTheta);
        Point3dVector3d_1.Vector3d.create(-cTheta * bz, -sTheta * bz, bx, dxdPhi);
    }
    /** Evaluate space point at major and minor angles (in radians) and distance from major hoop. */
    evaluateThetaPhiDistance(thetaRadians, phiRadians, distance) {
        const c = Math.cos(thetaRadians);
        const s = Math.sin(thetaRadians);
        // theta=0 point
        const x0 = this.majorRadius + distance * Math.cos(phiRadians);
        const z0 = distance * Math.sin(phiRadians);
        return Point3dVector3d_1.Point3d.create(c * x0, s * x0, z0);
    }
    /** Given an xyz coordinate in the local system of the toroid, compute the torus parametrization
     * * theta = angular coordinate in xy plane
     * * phi = angular coordinate in minor circle.
     * * distance = distance from major circle
     * * rho = distance from origin to xy part of the input.
     * @param xyz space point in local coordinates.
     * @return object with properties theta, phi, distance, rho
     */
    xyzToThetaPhiDistance(xyz) {
        const rho = xyz.magnitudeXY();
        const majorRadiusFactor = Geometry_1.Geometry.conditionalDivideFraction(this.majorRadius, rho);
        let safeMajor;
        let majorCirclePoint;
        if (majorRadiusFactor) {
            safeMajor = true;
            majorCirclePoint = Point3dVector3d_1.Point3d.create(majorRadiusFactor * xyz.x, majorRadiusFactor * xyz.y, 0.0);
        }
        else {
            safeMajor = false;
            majorCirclePoint = Point3dVector3d_1.Point3d.create(xyz.x, xyz.y, 0.0);
        }
        const theta = safeMajor ? Math.atan2(xyz.y, xyz.x) : 0.0;
        const vectorFromMajorCircle = Point3dVector3d_1.Vector3d.createStartEnd(majorCirclePoint, xyz);
        const distance = vectorFromMajorCircle.magnitude();
        const dRho = rho - this.majorRadius;
        let safePhi;
        let phi;
        if (xyz.z === 0.0 && dRho === 0.0) {
            phi = 0.0;
            safePhi = false;
        }
        else {
            phi = Math.atan2(xyz.z, dRho);
            safePhi = true;
        }
        return { theta: (theta), phi: (phi), distance: (distance), rho: (rho), safePhi: safeMajor && safePhi };
    }
}
exports.TorusImplicit = TorusImplicit;
/**
 * evaluation methods for an implicit sphere
 * * xyz function `x*x + y*y + z*z - r*r = 0`.
 * * xyzw function `x*x + y*y + z*z - r*r*w*w = 0`.
 * @internal
 */
class SphereImplicit {
    constructor(r) { this.radius = r; }
    /** Evaluate the implicit function at coordinates x,y,z */
    evaluateImplicitFunction(x, y, z) {
        return x * x + y * y + z * z - this.radius * this.radius;
    }
    /** Evaluate the implicit function at homogeneous coordinates x,y,z,w */
    evaluateImplicitFunctionXYZW(wx, wy, wz, w) {
        return (wx * wx + wy * wy + wz * wz) - this.radius * this.radius * w * w;
    }
    /** Given an xyz coordinate in the local system of the toroid, compute the sphere parametrization
     * * theta = angular coordinate in xy plane
     * * phi = rotation from xy plane towards z axis.
     * @param xyz space point in local coordinates.
     * @return object with properties thetaRadians, phi, r
     */
    xyzToThetaPhiR(xyz) {
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
        return { thetaRadians: (theta), phiRadians: (phi), r: (r), valid: (valid) };
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
    /** Compute the point on a sphere at angular coordinates.
     * @param thetaRadians latitude angle
     * @param phiRadians longitude angle
     */
    evaluateThetaPhi(thetaRadians, phiRadians) {
        const rc = this.radius * Math.cos(thetaRadians);
        const rs = this.radius * Math.sin(thetaRadians);
        const cosPhi = Math.cos(phiRadians);
        const sinPhi = Math.sin(phiRadians);
        return Point3dVector3d_1.Point3d.create(rc * cosPhi, rs * cosPhi, this.radius * sinPhi);
    }
    /** Compute the derivatives with respect to spherical angles.
     * @param thetaRadians latitude angle
     * @param phiRadians longitude angle
     */
    evaluateDerivativesThetaPhi(thetaRadians, phiRadians, dxdTheta, dxdPhi) {
        const rc = this.radius * Math.cos(thetaRadians);
        const rs = this.radius * Math.sin(thetaRadians);
        const cosPhi = Math.cos(phiRadians);
        const sinPhi = Math.sin(phiRadians);
        Point3dVector3d_1.Vector3d.create(-rs * cosPhi, rc * cosPhi, 0.0, dxdTheta);
        Point3dVector3d_1.Vector3d.create(-rc * sinPhi, -rs * sinPhi, this.radius * cosPhi, dxdPhi);
    }
}
exports.SphereImplicit = SphereImplicit;
/** AnalyticRoots has static methods for solving quadratic, cubic, and quartic equations.
 * @internal
 *
 */
class AnalyticRoots {
    /** Absolute zero test with a tolerance that has worked well for the analytic root use case . . . */
    static isZero(x) {
        return Math.abs(x) < this._EQN_EPS;
    }
    /** Without actually doing a division, test if (x/y) is small.
     * @param x numerator
     * @param y denominator
     * @param absTol absolute tolerance
     * @param relTol relative tolerance
     */
    static isSmallRatio(x, y, absTol = 1.0e-9, relTol = 8.0e-16) {
        return Math.abs(x) <= absTol || Math.abs(x) < relTol * Math.abs(y);
    }
    /** Return the (real, signed) principal cube root of x */
    static cbrt(x) {
        return ((x) > 0.0
            ? Math.pow((x), 1.0 / 3.0)
            : ((x) < 0.0
                ? -Math.pow(-(x), 1.0 / 3.0)
                : 0.0));
    }
    /**
     * Try to divide `numerator/denominator` and place the result (or defaultValue) in `values[offset]`
     * @param values array of values.  `values[offset]` will be replaced.
     * @param numerator numerator for division.
     * @param denominator denominator for division.
     * @param defaultValue value to save if denominator is too small to divide.
     * @param offset index of value to replace.
     */
    static safeDivide(values, numerator, denominator, defaultValue = 0.0, offset) {
        if (Math.abs(denominator) > (this._safeDivideFactor * Math.abs(numerator))) {
            values[offset] = numerator / denominator;
            return true;
        }
        values[offset] = defaultValue;
        return false;
    }
    // Used in NewtonMethod for testing if a root has been adjusted past its bounding region
    static checkRootProximity(roots, i) {
        if (i === 0) { // Case 1: Beginning Root (check root following it)
            return roots.atUncheckedIndex(i) < roots.atUncheckedIndex(i + 1);
        }
        else if (i > 0 && i + 1 < roots.length) { // Case 2: Middle Root (check roots before and after)
            return (roots.atUncheckedIndex(i) > roots.atUncheckedIndex(i - 1)) && (roots.atUncheckedIndex(i) < roots.atUncheckedIndex(i + 1));
        }
        else { // Case 3: End root (check preceding root)
            return (roots.atUncheckedIndex(i) > roots.atUncheckedIndex(i - 1));
        }
    }
    static newtonMethodAdjustment(coffs, root, degree) {
        let p = coffs[degree];
        let q = 0.0;
        for (let i = degree - 1; i >= 0; i--) {
            q = p + root * q;
            p = coffs[i] + root * p;
        }
        if (Math.abs(q) >= 1.0e-14 * (1.0 + Math.abs(root))) {
            return p / q;
        }
        return undefined;
    }
    static improveRoots(coffs, degree, roots, restrictOrderChanges) {
        const relTol = 1.0e-10;
        // Loop through each root
        for (let i = 0; i < roots.length; i++) {
            let dx = this.newtonMethodAdjustment(coffs, roots.atUncheckedIndex(i), degree);
            if (dx === undefined || dx === 0.0)
                continue; // skip if newton step had divide by zero.
            const originalValue = roots.atUncheckedIndex(i);
            let counter = 0;
            let convergenceCounter = 0;
            // Loop through applying changes to found root until dx is diminished or counter is hit
            while (dx !== undefined && dx !== 0.0 && (counter < 10)) {
                // consider it converged if two successive iterations satisfy the (not too demanding) tolerance.
                if (Math.abs(dx) < relTol * (1.0 + Math.abs(roots.atUncheckedIndex(i)))) {
                    if (++convergenceCounter > 1)
                        break;
                }
                else {
                    convergenceCounter = 0;
                }
                const rootDX = roots.atUncheckedIndex(i) - dx;
                roots.reassign(i, rootDX);
                // If root is thrown past one of its neighboring roots, unstable condition is assumed.. revert
                // to originally found root
                if (restrictOrderChanges && !this.checkRootProximity(roots, i)) {
                    roots.reassign(i, originalValue);
                    break;
                }
                dx = this.newtonMethodAdjustment(coffs, roots.atUncheckedIndex(i), degree);
                counter++;
            }
        }
    }
    /**
     * Append (if defined) value to results.
     * @param value optional value to append
     * @param results growing array
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
     * If `co/c1` is a safe division, append it to the values array.
     * @param c0 numerator
     * @param c1 denominator
     * @param values array to expand
     */
    static appendLinearRoot(c0, c1, values) {
        AnalyticRoots.appendSolution(Geometry_1.Geometry.conditionalDivideFraction(-c0, c1), values);
    }
    /**
     * * Compute the mean of all the entries in `data`
     * * Return the data value that is farthest away
     */
    static mostDistantFromMean(data) {
        if (!data || data.length === 0)
            return 0;
        let a = 0.0; // to become the sum and finally the average.
        for (let i = 0; i < data.length; i++)
            a += data.atUncheckedIndex(i);
        a /= data.length;
        let dMax = 0.0;
        let result = data.atUncheckedIndex(0);
        for (let i = 0; i < data.length; i++) {
            const d = Math.abs(data.atUncheckedIndex(i) - a);
            if (d > dMax) {
                dMax = d;
                result = data.atUncheckedIndex(i);
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
        if (this.isZero(D)) {
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
    /** Add `a` to the constant term. */
    static addConstant(value, data) {
        for (let i = 0; i < data.length; i++)
            data.reassign(i, data.atUncheckedIndex(i) + value);
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
        // Use Cardano formula
        cb_p = p * p * p;
        D = q * q + cb_p;
        const origin = A / (-3.0);
        if (D >= 0.0 && this.isZero(D)) {
            if (this.isZero(q)) {
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
        else if (D <= 0) { // three real solutions
            const phi = 1.0 / 3 * Math.acos(-q / Math.sqrt(-cb_p));
            const t = 2 * Math.sqrt(-p);
            results.push(origin + t * Math.cos(phi));
            results.push(origin - t * Math.cos(phi + Math.PI / 3));
            results.push(origin - t * Math.cos(phi - Math.PI / 3));
            this.improveRoots(c, 3, results, false);
            return;
        }
        else { // One real solution
            const sqrt_D = Math.sqrt(D);
            const u = this.cbrt(sqrt_D - q);
            const v = -(this.cbrt(sqrt_D + q));
            results.push(origin + u + v);
            this.improveRoots(c, 3, results, false);
            return;
        }
    }
    /** Compute roots of cubic 'c[0] + c[1] * x + c[2] * x^2 + c[3] * x^3 */
    static appendCubicRoots(c, results) {
        this.appendCubicRootsUnsorted(c, results);
        results.sort();
    }
    /** Compute roots of quartic 'c[0] + c[1] * x + c[2] * x^2 + c[3] * x^3 + c[4] * x^4 */
    static appendQuarticRoots(c, results) {
        const coffs = new Float64Array(4); // at various times .. coefficients of quadratic an cubic intermediates.
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
        if (!this.safeDivide(coffScale, 1.0, c[4], 0.0, 0)) {
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
        const tempStack = new GrowableFloat64Array_1.GrowableFloat64Array();
        if (this.isZero(r)) {
            // no absolute term: y(y^3 + py + q) = 0
            coffs[0] = q;
            coffs[1] = p;
            coffs[2] = 0;
            coffs[3] = 1;
            this.appendCubicRootsUnsorted(coffs, results);
            results.push(0); // APPLY ORIGIN ....
            this.addConstant(origin, results);
            return;
        }
        else {
            // Solve the resolvent cubic
            coffs[0] = 1.0 / 2 * r * p - 1.0 / 8 * q * q;
            coffs[1] = -r;
            coffs[2] = -1.0 / 2 * p;
            coffs[3] = 1;
            this.appendCubicRootsUnsorted(coffs, tempStack);
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
                    results.push(tempStack.atUncheckedIndex(i));
                }
                return;
            }
            coffs[0] = z - u;
            coffs[1] = ((q < 0) ? (-v) : (v));
            coffs[2] = 1;
            this.appendQuadraticRoots(coffs, results);
            coffs[0] = z + u;
            coffs[1] = ((q < 0) ? (v) : (-v));
            coffs[2] = 1;
            this.appendQuadraticRoots(coffs, results);
        }
        // substitute
        this.addConstant(origin, results);
        results.sort();
        this.improveRoots(c, 4, results, true);
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
    /**
     * * Solve the simultaneous equations in variables`c` and`s`:
     *   * A line: `alpha + beta*c + gamma*s = 0`
     *   * The unit circle 'c*c + s*s = 1`
     * * Solution values are returned as 0, 1, or 2(c, s) pairs
     * * Return value indicates one of these solution states:
     *   * -2 -- all coefficients identically 0.   The entire c, s plane-- and therefore the entire unit circle-- is a solution.
     *   * -1 -- beta, gamma are zero, alpha is not.There is no line defined.There are no solutions.
     *   * 0 -- the line is well defined, but passes completely outside the unit circle.
     *     * In this case, (c1, s1) is the circle point closest to the line and(c2, s2) is the line point closest to the circle.
     * * 1 -- the line is tangent to the unit circle.
     *   * Tangency is determined by tolerances, which calls a "close approach" point a tangency.
     *    * (c1, s1) is the closest circle point
     *    * (c2, s2) is the line point.
     * * 2 -- two simple intersections.
     * @param alpha constant coefficient on line
     * @param beta x cosine coefficient on line
     * @param gamma y sine coefficient on line
     * @param relTol relative tolerance for tangencies
     * @param cosValues (caller allocated) array to receive solution `c` values
     * @param sinValues (caller allocated) array to receive solution `s` values
     * @param radiansValues (caller allocated) array to receive solution radians values.
     */
    static appendImplicitLineUnitCircleIntersections(alpha, beta, gamma, cosValues, sinValues, radiansValues, relTol = 1.0e-14) {
        let twoTol;
        const delta2 = beta * beta + gamma * gamma;
        const alpha2 = alpha * alpha;
        let solutionType = 0;
        if (relTol < 0.0) {
            twoTol = 0.0;
        }
        else {
            twoTol = 2.0 * relTol;
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
exports.AnalyticRoots = AnalyticRoots;
AnalyticRoots._EQN_EPS = 1.0e-9;
AnalyticRoots._safeDivideFactor = 1.0e-14;
/**
 * manipulations of polynomials with where `coff[i]` multiplies x^i
 * @internal
 */
class PowerPolynomial {
    /** Evaluate a standard basis polynomial at `x`, with `degree` possibly less than `coff.length` */
    static degreeKnownEvaluate(coff, degree, x) {
        if (degree < 0) {
            return 0.0;
        }
        let p = coff[degree];
        for (let i = degree - 1; i >= 0; i--)
            p = x * p + coff[i];
        return p;
    }
    /** Evaluate the standard basis polynomial of degree `coff.length` at `x` */
    static evaluate(coff, x) {
        const degree = coff.length - 1;
        return this.degreeKnownEvaluate(coff, degree, x);
    }
    /**
     * * Accumulate Q*scale into P.Both are treated as full degree.
     * * (Expect Address exceptions if P is smaller than Q)
     * * Returns degree of result as determined by comparing trailing coefficients to zero
     */
    static accumulate(coffP, coffQ, scaleQ) {
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
    /** Zero all coefficients */
    static zero(coff) {
        for (let i = 0; i < coff.length; i++) {
            coff[i] = 0.0;
        }
    }
}
exports.PowerPolynomial = PowerPolynomial;
/**
 * manipulation of polynomials with powers of sine and cosine
 * @internal
 */
class TrigPolynomial {
    /**
     *  Solve a polynomial created from trigonometric condition using
     * Trig.S, Trig.C, Trig.W.  Solution logic includes inferring angular roots
     * corresponding zero leading coefficients (roots at infinity)
     * @param coff Coefficients
     * @param nominalDegree degree of the polynomial under most complex
     *     root case.  If there are any zero coefficients up to this degree, a single root
     *     "at infinity" is recorded as its corresponding angular parameter at negative pi/2
     * @param referenceCoefficient A number which represents the size of coefficients
     *     at various stages of computation.  A small fraction of this will be used as a zero
     *     tolerance
     * @param angles Roots are placed here. Assumed preallocated with adequate size.
     * @param numRoots Number of roots  .  Zero roots is possible. (Passed as array of size
     * one to pass-by-reference)
     * Returns false if equation is all zeros.   This usually means any angle is a solution.
     */
    static solveAngles(coff, nominalDegree, referenceCoefficient, radians) {
        let maxCoff = Math.abs(referenceCoefficient);
        let a;
        radians.length = 0;
        const relTol = this._smallAngle;
        for (let i = 0; i <= nominalDegree; i++) {
            a = Math.abs(coff[i]);
            if (a > maxCoff) {
                maxCoff = a;
            }
        }
        const coffTol = relTol * maxCoff;
        let degree = nominalDegree;
        while (degree > 0 && (Math.abs(coff[degree]) <= coffTol)) {
            degree--;
        }
        // let status = false;
        const roots = new GrowableFloat64Array_1.GrowableFloat64Array();
        if (degree === -1) {
            // Umm.   Dunno.   Nothing there.
            // status = false;
        }
        else {
            // status = true;
            if (degree === 0) {
                // p(t) is a nonzero constant
                // No roots, but not degenerate.
                // status = true;
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
                // status = false;
            }
            if (roots.length > 0) {
                // Each solution t represents an angle with
                //  Math.Cos(theta)=C(t)/W(t),  ,sin(theta)=S(t)/W(t)
                // Division by W has no effect on Atan2 calculations, so we just compute S(t),C(t)
                for (let i = 0; i < roots.length; i++) {
                    const ss = PowerPolynomial.evaluate(this.S, roots.atUncheckedIndex(i));
                    const cc = PowerPolynomial.evaluate(this.C, roots.atUncheckedIndex(i));
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
    /**
     * Compute intersections of unit circle `x ^ 2 + y 2 = 1` with general quadric
     * `axx * x ^ 2 + axy * x * y + ayy * y ^ 2 + ax * x + ay * y + a1 = 0`
     * Solutions are returned as angles.Sine and Cosine of the angles are the x, y results.
     * @param axx  Coefficient of x ^ 2
     * @param axy  Coefficient of xy
     * @param ayy  Coefficient of y ^ 2
     * @param ax  Coefficient of x
     * @param ay  Coefficient of y
     * @param a1  Constant coefficient
     * @param angles  solution angles
     * @param numAngle  number of solution angles(Passed as array to make changes to reference)
     */
    static solveUnitCircleImplicitQuadricIntersection(axx, axy, ayy, ax, ay, a1, radians) {
        const Coffs = new Float64Array(5);
        PowerPolynomial.zero(Coffs);
        let degree = 2;
        if (Geometry_1.Geometry.hypotenuseXYZ(axx, axy, ayy) > TrigPolynomial._coefficientRelTol * Geometry_1.Geometry.hypotenuseXYZ(ax, ay, a1)) {
            PowerPolynomial.accumulate(Coffs, this.CW, ax);
            PowerPolynomial.accumulate(Coffs, this.SW, ay);
            PowerPolynomial.accumulate(Coffs, this.WW, a1);
            PowerPolynomial.accumulate(Coffs, this.SS, ayy);
            PowerPolynomial.accumulate(Coffs, this.CC, axx);
            PowerPolynomial.accumulate(Coffs, this.SC, axy);
            degree = 4;
        }
        else {
            PowerPolynomial.accumulate(Coffs, this.C, ax);
            PowerPolynomial.accumulate(Coffs, this.S, ay);
            PowerPolynomial.accumulate(Coffs, this.W, a1);
            degree = 2;
        }
        let maxCoff = 0.0;
        maxCoff = Math.max(maxCoff, Math.abs(axx), Math.abs(ayy), Math.abs(axy), Math.abs(ax), Math.abs(ay), Math.abs(a1));
        const b = this.solveAngles(Coffs, degree, maxCoff, radians);
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
    /**
     * Compute intersections of unit circle x^2 + y 2 = 1 with the ellipse
     *         (x,y) = (cx + ux Math.Cos + vx sin, cy + uy Math.Cos + vy sin)
     * Solutions are returned as angles in the ellipse space.
     * @param cx center x
     * @param cy center y
     * @param ux 0 degree vector x
     * @param uy 0 degree vector y
     * @param vx 90 degree vector x
     * @param vy 90 degree vector y
     * @param ellipseRadians solution angles in ellipse parameter space
     * @param circleRadians solution angles in circle parameter space
     */
    static solveUnitCircleEllipseIntersection(cx, cy, ux, uy, vx, vy, ellipseRadians, circleRadians) {
        circleRadians.length = 0;
        const acc = ux * ux + uy * uy;
        const acs = 2.0 * (ux * vx + uy * vy);
        const ass = vx * vx + vy * vy;
        const ac = 2.0 * (ux * cx + uy * cy);
        const asi = 2.0 * (vx * cx + vy * cy);
        const a = cx * cx + cy * cy - 1.0;
        const status = this.solveUnitCircleImplicitQuadricIntersection(acc, acs, ass, ac, asi, a, ellipseRadians);
        for (const radians of ellipseRadians) {
            const cc = Math.cos(radians);
            const ss = Math.sin(radians);
            const x = cx + ux * cc + vx * ss;
            const y = cy + uy * cc + vy * ss;
            circleRadians.push(Math.atan2(y, x));
        }
        return status;
    }
    /**
     * Compute intersections of unit circle x^2 + y 2 = w^2 with the ellipse
     *         (x,y) = (cx + ux Math.Cos + vx sin, cy + uy Math.Cos + vy sin)/ (cw + uw Math.Cos + vw * Math.Sin)
     * Solutions are returned as angles in the ellipse space.
     * @param cx center x
     * @param cy center y
     * @param cw center w
     * @param ux 0 degree vector x
     * @param uy 0 degree vector y
     * @param uw 0 degree vector w
     * @param vx 90 degree vector x
     * @param vy 90 degree vector y
     * @param vw 90 degree vector w
     * @param ellipseRadians solution angles in ellipse parameter space
     * @param circleRadians solution angles in circle parameter space
     */
    static solveUnitCircleHomogeneousEllipseIntersection(cx, cy, cw, ux, uy, uw, vx, vy, vw, ellipseRadians, circleRadians) {
        circleRadians.length = 0;
        const acc = ux * ux + uy * uy - uw * uw;
        const acs = 2.0 * (ux * vx + uy * vy - uw * vw);
        const ass = vx * vx + vy * vy - vw * vw;
        const ac = 2.0 * (ux * cx + uy * cy - uw * cw);
        const asi = 2.0 * (vx * cx + vy * cy - vw * cw);
        const a = cx * cx + cy * cy - cw * cw;
        const status = this.solveUnitCircleImplicitQuadricIntersection(acc, acs, ass, ac, asi, a, ellipseRadians);
        for (const radians of ellipseRadians) {
            const cc = Math.cos(radians);
            const ss = Math.sin(radians);
            const x = cx + ux * cc + vx * ss;
            const y = cy + uy * cc + vy * ss;
            circleRadians.push(Math.atan2(y, x));
        }
        return status;
    }
}
exports.TrigPolynomial = TrigPolynomial;
// tolerance for small angle decision.
TrigPolynomial._smallAngle = 1.0e-11;
/** Standard Basis coefficients for rational sine numerator. */
TrigPolynomial.S = Float64Array.from([0.0, 2.0, -2.0]);
/** Standard Basis coefficients for rational cosine numerator. */
TrigPolynomial.C = Float64Array.from([1.0, -2.0]);
/** Standard Basis coefficients for rational denominator. */
TrigPolynomial.W = Float64Array.from([1.0, -2.0, 2.0]);
/** Standard Basis coefficients for cosine*weight numerator */
TrigPolynomial.CW = Float64Array.from([1.0, -4.0, 6.0, -4.0]);
/** Standard Basis coefficients for sine*weight numerator */
TrigPolynomial.SW = Float64Array.from([0.0, 2.0, -6.0, 8.0, -4.0]);
/** Standard Basis coefficients for sine*cosine numerator */
TrigPolynomial.SC = Float64Array.from([0.0, 2.0, -6.0, 4.0]);
/** Standard Basis coefficients for sine^2 numerator */
TrigPolynomial.SS = Float64Array.from([0.0, 0.0, 4.0, -8.0, 4.0]);
/** Standard Basis coefficients for cosine^2 numerator */
TrigPolynomial.CC = Float64Array.from([1.0, -4.0, 4.0]);
/** Standard Basis coefficients for weight^2 */
TrigPolynomial.WW = Float64Array.from([1.0, -4.0, 8.0, -8.0, 4.0]);
/** Standard Basis coefficients for (Math.Cos^2 - sine^2) numerator */
TrigPolynomial.CCminusSS = Float64Array.from([1.0, -4.0, 0.0, 8.0, -4.0]);
TrigPolynomial._coefficientRelTol = 1.0e-12;
/**
 * static methods for commonly appearing sets of equations in 2 or 3 variables
 * @public
 */
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
     * * (ax0,ay0) to (ax0+ux,ay0+uy) are line A.
     * * (bx0,by0) to (bx0+vx,by0+vy) are lineB.
     * * Return true if the lines have a simple intersection.
     * * Return the fractional (not xy) coordinates in result.x, result.y
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegmentXYUVTransverseIntersectionUnbounded(ax0, ay0, ux, uy, bx0, by0, vx, vy, result) {
        const cx = bx0 - ax0;
        const cy = by0 - ay0;
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
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection using only xy parts of WEIGHTED 4D Points
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param hA0 homogeneous start point of line a
     * @param hA1 homogeneous end point of line a
     * @param hB0 homogeneous start point of line b
     * @param hB1 homogeneous end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dHXYTransverseIntersectionUnbounded(hA0, hA1, hB0, hB1, result) {
        // Considering only x,y,w parts....
        // Point Q along B is (in full homogeneous)  `(1-lambda) B0 + lambda 1`
        // PointQ is colinear with A0,A1 when the determinant det (A0,A1,Q) is zero.  (Each column takes xyw parts)
        const alpha0 = Geometry_1.Geometry.tripleProduct(hA0.x, hA1.x, hB0.x, hA0.y, hA1.y, hB0.y, hA0.w, hA1.w, hB0.w);
        const alpha1 = Geometry_1.Geometry.tripleProduct(hA0.x, hA1.x, hB1.x, hA0.y, hA1.y, hB1.y, hA0.w, hA1.w, hB1.w);
        const fractionB = Geometry_1.Geometry.conditionalDivideFraction(-alpha0, alpha1 - alpha0);
        if (fractionB !== undefined) {
            const beta0 = Geometry_1.Geometry.tripleProduct(hB0.x, hB1.x, hA0.x, hB0.y, hB1.y, hA0.y, hB0.w, hB1.w, hA0.w);
            const beta1 = Geometry_1.Geometry.tripleProduct(hB0.x, hB1.x, hA1.x, hB0.y, hB1.y, hA1.y, hB0.w, hB1.w, hA1.w);
            const fractionA = Geometry_1.Geometry.conditionalDivideFraction(-beta0, beta1 - beta0);
            if (fractionA !== undefined)
                return Point2dVector2d_1.Vector2d.create(fractionA, fractionB, result);
        }
        return undefined;
    }
    /**
     * Return the line fraction at which the (homogeneous) line is closest to a space point as viewed in xy only.
     * @param hA0 homogeneous start point of line a
     * @param hA1 homogeneous end point of line a
     * @param spacePoint homogeneous point in space
     */
    static lineSegment3dHXYClosestPointUnbounded(hA0, hA1, spacePoint) {
        // Considering only x,y,w parts....
        // weighted difference of (A1 w0 - A0 w1) is (cartesian) tangent vector along the line as viewed.
        // The perpendicular (pure vector) W = (-y,x) flip is the direction of projection
        // Point Q along A is (in full homogeneous)  `(1-lambda) A0 + lambda 1 A1`
        // PointQ is colinear with spacePoint and and W when the xyw homogeneous determinant | Q W spacePoint | is zero.
        const tx = hA1.x * hA0.w - hA0.x * hA1.w;
        const ty = hA1.y * hA0.w - hA0.y * hA1.w;
        const det0 = Geometry_1.Geometry.tripleProduct(hA0.x, -ty, spacePoint.x, hA0.y, tx, spacePoint.y, hA0.w, 0, spacePoint.w);
        const det1 = Geometry_1.Geometry.tripleProduct(hA1.x, -ty, spacePoint.x, hA1.y, tx, spacePoint.y, hA1.w, 0, spacePoint.w);
        return Geometry_1.Geometry.conditionalDivideFraction(-det0, det1 - det0);
    }
    /**
     * Return the line fraction at which the line is closest to a space point as viewed in xy only.
     * @param pointA0 start point
     * @param pointA1 end point
     * @param spacePoint homogeneous point in space
     */
    static lineSegment3dXYClosestPointUnbounded(pointA0, pointA1, spacePoint) {
        // Considering only x,y parts....
        const ux = pointA1.x - pointA0.x;
        const uy = pointA1.y - pointA0.y;
        const uu = ux * ux + uy * uy;
        const vx = spacePoint.x - pointA0.x;
        const vy = spacePoint.y - pointA0.y;
        const uv = ux * vx + uy * vy;
        return Geometry_1.Geometry.conditionalDivideFraction(uv, uu);
    }
    /**
     * Return the line fraction at which the line is closest to a space point
     * @param pointA0 start point
     * @param pointA1 end point
     * @param spacePoint homogeneous point in space
     */
    static lineSegment3dClosestPointUnbounded(pointA0, pointA1, spacePoint) {
        // Considering only x,y parts....
        const ux = pointA1.x - pointA0.x;
        const uy = pointA1.y - pointA0.y;
        const uz = pointA1.z - pointA0.z;
        const uu = ux * ux + uy * uy + uz * uz;
        const vx = spacePoint.x - pointA0.x;
        const vy = spacePoint.y - pointA0.y;
        const vz = spacePoint.z - pointA0.z;
        const uv = ux * vx + uy * vy + uz * vz;
        return Geometry_1.Geometry.conditionalDivideFraction(uv, uu);
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
        return this.ray3dXYZUVWClosestApproachUnbounded(a0.x, a0.y, a0.z, a1.x - a0.x, a1.y - a0.y, a1.z - a0.z, b0.x, b0.y, b0.z, b1.x - b0.x, b1.y - b0.y, b1.z - b0.z, result);
    }
    /**
     * Return true if lines (a0,a1) to (b0, b1) have closest approach (go by each other) in 3d
     * Return the fractional (not xy) coordinates as x and y parts of a Point2d.
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static ray3dXYZUVWClosestApproachUnbounded(ax, ay, az, au, av, aw, bx, by, bz, bu, bv, bw, result) {
        const cx = bx - ax;
        const cy = by - ay;
        const cz = bz - az;
        const uu = Geometry_1.Geometry.hypotenuseSquaredXYZ(au, av, aw);
        const vv = Geometry_1.Geometry.hypotenuseSquaredXYZ(bu, bv, bw);
        const uv = Geometry_1.Geometry.dotProductXYZXYZ(au, av, aw, bu, bv, bw);
        const cu = Geometry_1.Geometry.dotProductXYZXYZ(cx, cy, cz, au, av, aw);
        const cv = Geometry_1.Geometry.dotProductXYZXYZ(cx, cy, cz, bu, bv, bw);
        return SmallSystem.linearSystem2d(uu, -uv, uv, -vv, cu, cv, result);
    }
    /**
     * Solve the pair of linear equations
     * * `ux * x + vx + y = cx`
     * * `uy * x + vy * y = cy`
     * @param ux xx coefficient
     * @param vx xy coefficient
     * @param uy yx coefficient
     * @param vy yy coefficient
     * @param cx x right hand side
     * @param cy y right hand side
     * @param result (x,y) solution.  (MUST be preallocated by caller)
     */
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
     * @param cz right hand side row 2 coefficient
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
            return Point3dVector3d_1.Vector3d.create(s, t, u, result);
        }
        return undefined;
    }
    /**
     * * in rowB, replace `rowB[j] += a * rowB[pivot] * rowA[j] / rowA[pivot]` for `j>pivot`
     * @param rowA row that does not change
     * @param pivotIndex index of pivot (divisor) in rowA.
     * @param rowB row where elimination occurs.
     */
    static eliminateFromPivot(rowA, pivotIndex, rowB, a) {
        const n = rowA.length;
        let q = Geometry_1.Geometry.conditionalDivideFraction(rowB[pivotIndex], rowA[pivotIndex]);
        if (q === undefined)
            return false;
        q *= a;
        for (let j = pivotIndex + 1; j < n; j++)
            rowB[j] += q * rowA[j];
        return true;
    }
    /**
     * Solve a pair of bilinear equations
     * * First equation: `a0 + b0 * u + c0 * v + d0 * u * v = 0`
     * * Second equation: `a0 + b0 * u + c0 * v + d0 * u * v = 0`
     */
    static solveBilinearPair(a0, b0, c0, d0, a1, b1, c1, d1) {
        // constant linear, and quadratic coefficients for c0 + c1 * u + c2 * u*u = 0
        const e0 = Geometry_1.Geometry.crossProductXYXY(a0, a1, c0, c1);
        const e1 = Geometry_1.Geometry.crossProductXYXY(b0, b1, c0, c1) + Geometry_1.Geometry.crossProductXYXY(a0, a1, d0, d1);
        const e2 = Geometry_1.Geometry.crossProductXYXY(b0, b1, d0, d1);
        const uRoots = Degree2PowerPolynomial.solveQuadratic(e2, e1, e0);
        if (uRoots === undefined)
            return undefined;
        const uv = [];
        for (const u of uRoots) {
            const v0 = Geometry_1.Geometry.conditionalDivideFraction(-(a0 + b0 * u), c0 + d0 * u);
            const v1 = Geometry_1.Geometry.conditionalDivideFraction(-(a1 + b1 * u), c1 + d1 * u);
            if (v0 !== undefined)
                uv.push(Point2dVector2d_1.Point2d.create(u, v0));
            else if (v1 !== undefined)
                uv.push(Point2dVector2d_1.Point2d.create(u, v1));
        }
        return uv;
    }
}
exports.SmallSystem = SmallSystem;
/**
 * * bilinear expression
 * * `f(u,v) = a + b * u * c * v + d * u * v`
 * @internal
 */
class BilinearPolynomial {
    /**
     *
     * @param a constant coefficient
     * @param b `u` coefficient
     * @param c `v` coefficient
     * @param d `u*v` coefficient
     */
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
    /**
     * Evaluate the bilinear expression at u,v
     */
    evaluate(u, v) {
        return this.a + this.b * u + v * (this.c + this.d * u);
    }
    /** Create a bilinear polynomial z=f(u,v) given z values at 00, 10, 01, 11.
     */
    static createUnitSquareValues(f00, f10, f01, f11) {
        return new BilinearPolynomial(f00, f10, f10, f11 - f10 - f01);
    }
    /**
     * Solve the simultaneous equations
     * * `p(u,v) = pValue`
     * * `q(u,v) = qValue`
     * @param p
     * @param pValue
     * @param q
     * @param qValue
     */
    static solvePair(p, pValue, q, qValue) {
        return SmallSystem.solveBilinearPair(p.a - pValue, p.b, p.c, p.d, q.a - qValue, q.b, q.c, q.d);
    }
}
exports.BilinearPolynomial = BilinearPolynomial;
//# sourceMappingURL=Polynomials.js.map