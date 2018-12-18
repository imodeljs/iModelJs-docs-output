/** @module Numerics */
import { Point2d, Vector2d } from "../geometry3d/Point2dVector2d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { OptionalGrowableFloat64Array, GrowableFloat64Array } from "../geometry3d/GrowableFloat64Array";
import { Point4d } from "../geometry4d/Point4d";
export declare class Degree2PowerPolynomial {
    coffs: number[];
    constructor(c0?: number, c1?: number, c2?: number);
    /**
     * * Return 2 duplicate roots in double root case.
     * @returns 0, 1, or 2 solutions of the usual quadratic (a*x*x + b * x + c = 0)
     */
    static solveQuadratic(a: number, b: number, c: number): number[] | undefined;
    addConstant(a: number): void;
    addSquaredLinearTerm(a: number, b: number, s?: number): void;
    realRoots(): number[] | undefined;
    /**
     * Evaluate the quadratic at x.
     */
    evaluate(x: number): number;
    /**
     * Evaluate the bezier function at a parameter value.  (i.e. summ the basis functions times coefficients)
     * @param u parameter for evaluation
     */
    evaluateDerivative(x: number): number;
    tryGetVertexFactorization(): {
        x0: number;
        y0: number;
        c: number;
    } | undefined;
    static fromRootsAndC2(root0: number, root1: number, c2?: number): Degree2PowerPolynomial;
}
export declare class Degree3PowerPolynomial {
    coffs: number[];
    constructor(c0?: number, c1?: number, c2?: number, c3?: number);
    addConstant(a: number): void;
    addSquaredLinearTerm(a: number, b: number, s?: number): void;
    /**
     * Evaluate the polynomial at x
     * @param u parameter for evaluation
     */
    evaluate(x: number): number;
    /**
     * Evaluate the polynomial derivative
     * @param u parameter for evaluation
     */
    evaluateDerivative(x: number): number;
    static fromRootsAndC3(root0: number, root1: number, root2: number, c3?: number): Degree3PowerPolynomial;
}
export declare class Degree4PowerPolynomial {
    coffs: number[];
    constructor(c0?: number, c1?: number, c2?: number, c3?: number, c4?: number);
    addConstant(a: number): void;
    /**
     * Evaluate the polynomial
     * @param x x coordinate for evaluation
     */
    evaluate(x: number): number;
    /**
     * Evaluate the derivative
     * @param x x coordinate for evaluation
     */
    evaluateDerivative(x: number): number;
    static fromRootsAndC4(root0: number, root1: number, root2: number, root3: number, c4?: number): Degree4PowerPolynomial;
}
export declare class TorusImplicit {
    majorRadius: number;
    minorRadius: number;
    constructor(majorRadiusR: number, minorRadiusr: number);
    boxSize(): number;
    /** @returns a scale factor appropriate to control the magnitude of the implicit function. */
    implicitFunctionScale(): number;
    evaluateImplicitFunctionXYZ(x: number, y: number, z: number): number;
    evaluateImplicitFunctionPoint(xyz: Point3d): number;
    evaluateImplicitFunctionXYZW(x: number, y: number, z: number, w: number): number;
    evaluateThetaPhi(theta: number, phi: number): Point3d;
    evaluateDerivativesThetaPhi(theta: number, phi: number, dxdTheta: Vector3d, dxdPhi: Vector3d): void;
    evaluateThetaPhiDistance(theta: number, phi: number, distance: number): Point3d;
    /** Given an xyz coordinate in the local system of the toroid, compute the torus parametrization
     * * theta = angular coordinate in xy plane
     * * phi = angular coordinate in minor circle.
     * * distance = distance from major circle
     * * rho = distance from origin to xy part of the input.
     * @param xyz space point in local coordinates.
     * @return object with properties theta, phi, distance, rho
     */
    XYZToThetaPhiDistance(xyz: Point3d): {
        theta: number;
        phi: number;
        distance: number;
        rho: number;
        safePhi: boolean;
    };
}
/**
 * evaluation methods for an implicit sphere `x*x + y*y + z*z - r*r = 0`.
 */
export declare class SphereImplicit {
    radius: number;
    constructor(r: number);
    evaluateImplicitFunction(x: number, y: number, z: number): number;
    evaluateImplicitFunctionXYZW(wx: number, wy: number, wz: number, w: number): number;
    XYZToThetaPhiR(xyz: Point3d): {
        theta: number;
        phi: number;
        r: number;
        valid: boolean;
    };
    evaluateThetaPhi(thetaRadians: number, phiRadians: number): Point3d;
    evaluateDerivativesThetaPhi(theta: number, phi: number, dxdTheta: Vector3d, dxdPhi: Vector3d): void;
}
/** AnalyticRoots has static methods for solving quadratic, cubic, and quartic equations.
 *
 */
export declare class AnalyticRoots {
    static readonly EQN_EPS = 1e-9;
    static readonly s_safeDivideFactor = 1e-14;
    static readonly s_quadricRelTol = 1e-14;
    static readonly sTestWindow = 0.000001;
    /** Absolute zero test with a tolerance that has worked well for the analytic root use case . . . */
    static IsZero(x: number): boolean;
    /** Without actually doing a division, test if (x/y) is small.
     * @param x numerator
     * @param y denominator
     * @param abstol absolute tolerance
     * @param reltol relative tolerance
     */
    static isSmallRatio(x: number, y: number, abstol?: number, reltol?: number): boolean;
    static cbrt(x: number): number;
    /**
     * Try to divide `numerator/denominator` and place the result (or defaultValue) in `values[offset]`
     * @param values array of values.  `values[offset]` will be replaced.
     * @param numerator numerator for division.
     * @param denominator denominator for division.
     * @param defaultValue value to save if denominator is too small to divide.
     * @param offset index of value to replace.
     */
    static SafeDivide(values: Float64Array, numerator: number, denominator: number, defaultValue: number | undefined, offset: number): boolean;
    private static checkRootProximity;
    private static NewtonMethodAdjustment;
    private static improveSortedRoots;
    /**
     * Append (if defined) value to results.
     * @param value optional value to append
     * @param results growning array
     */
    private static appendSolution;
    /**
     * Append 2 solutions -- note that both are required args, no option of omitting as in single solution case
     * @param value1
     * @param value2
     * @param results
     */
    private static append2Solutions;
    /**
     * If `co/c1` is a safed division, append it to the values array.
     * @param c0 numerator
     * @param c1 denominaotr
     * @param values array to expand
     */
    static appendLinearRoot(c0: number, c1: number, values: GrowableFloat64Array): void;
    static mostDistantFromMean(data: GrowableFloat64Array | undefined): number;
    /**
     * Append 0, 1, or 2 solutions of a quadratic to the values array.
     * @param c array of coefficients for quadratic `c[0] + c[1] * x + c[2] * x*x`
     * @param values array to be expanded.
     */
    static appendQuadraticRoots(c: Float64Array | number[], values: GrowableFloat64Array): void;
    private static addConstant;
    /** return roots of a cubic c0 + c1 *x + c2 * x^2 + c2 * x3.
     * In the usual case where c0 is non-zero, there are either 1 or 3 roots.
     * But if c0 is zero the (0, 1, or 2) roots of the lower order equation
     */
    private static appendCubicRootsUnsorted;
    static appendCubicRoots(c: Float64Array | number[], results: GrowableFloat64Array): void;
    static appendQuarticRoots(c: Float64Array | number[], results: GrowableFloat64Array): void;
    private static appendCosSinRadians;
    static appendImplicitLineUnitCircleIntersections(alpha: number, beta: number, gamma: number, cosValues: OptionalGrowableFloat64Array, sinValues: OptionalGrowableFloat64Array, radiansValues: OptionalGrowableFloat64Array, reltol?: number): number;
}
export declare class PowerPolynomial {
    static degreeKnownEvaluate(coff: Float64Array, degree: number, x: number): number;
    static Evaluate(coff: Float64Array, x: number): number;
    static Accumulate(coffP: Float64Array, coffQ: Float64Array, scaleQ: number): number;
    static Zero(coff: Float64Array): void;
}
export declare class TrigPolynomial {
    static readonly SmallAngle: number;
    static readonly S: Float64Array;
    static readonly C: Float64Array;
    static readonly W: Float64Array;
    static readonly CW: Float64Array;
    static readonly SW: Float64Array;
    static readonly SC: Float64Array;
    static readonly SS: Float64Array;
    static readonly CC: Float64Array;
    static readonly WW: Float64Array;
    static readonly CCminusSS: Float64Array;
    static SolveAngles(coff: Float64Array, nominalDegree: number, referenceCoefficient: number, radians: number[]): boolean;
    static readonly coeffientRelTol = 1e-12;
    static SolveUnitCircleImplicitQuadricIntersection(axx: number, axy: number, ayy: number, ax: number, ay: number, a1: number, radians: number[]): boolean;
    static SolveUnitCircleEllipseIntersection(cx: number, cy: number, ux: number, uy: number, vx: number, vy: number, ellipseRadians: number[], circleRadians: number[]): boolean;
    static SolveUnitCircleHomogeneousEllipseIntersection(cx: number, cy: number, cw: number, ux: number, uy: number, uw: number, vx: number, vy: number, vw: number, ellipseRadians: number[], circleRadians: number[]): boolean;
}
export declare class SmallSystem {
    /**
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection.
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment2dXYTransverseIntersectionUnbounded(a0: Point2d, a1: Point2d, b0: Point2d, b1: Point2d, result: Vector2d): boolean;
    /**
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection using only xy parts
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dXYTransverseIntersectionUnbounded(a0: Point3d, a1: Point3d, b0: Point3d, b1: Point3d, result: Vector2d): boolean;
    /**
     * Return true if lines (a0,a1) to (b0, b1) have a simple intersection using only xy parts of WEIGHTED 4D Points
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param hA0 homogeneous start point of line a
     * @param hA1 homogeneous end point of line a
     * @param hB0 homogeneous start point of line b
     * @param hB1 homogeneous end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dHXYTransverseIntersectionUnbounded(hA0: Point4d, hA1: Point4d, hB0: Point4d, hB1: Point4d, result?: Vector2d): Vector2d | undefined;
    /**
     * Return the line fraction at which the (homogeneous) line is closest to a space point as viewed in xy only.
     * @param hA0 homogeneous start point of line a
     * @param hA1 homogeneous end point of line a
     * @param spacePoint homogeneous point in space
     */
    static lineSegment3dHXYClosestPointUnbounded(hA0: Point4d, hA1: Point4d, spacePoint: Point4d): number | undefined;
    /**
     * Return the line fraction at which the line is closest to a space point as viewed in xy only.
     * @param pointA0 start point
     * @param pointA1 end point
     * @param spacePoint homogeneous point in space
     */
    static lineSegment3dXYClosestPointUnbounded(pointA0: Point3d, pointA1: Point3d, spacePoint: Point3d): number | undefined;
    /**
     * Return true if lines (a0,a1) to (b0, b1) have closest approach (go by each other) in 3d
     * Return the fractional (not xy) coordinates in result.x, result.y
     * @param a0 start point of line a
     * @param a1  end point of line a
     * @param b0  start point of line b
     * @param b1 end point of line b
     * @param result point to receive fractional coordinates of intersection.   result.x is fraction on line a. result.y is fraction on line b.
     */
    static lineSegment3dClosestApproachUnbounded(a0: Point3d, a1: Point3d, b0: Point3d, b1: Point3d, result: Vector2d): boolean;
    static linearSystem2d(ux: number, vx: number, // first row of matrix
    uy: number, vy: number, // second row of matrix
    cx: number, cy: number, // right side
    result: Vector2d): boolean;
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
    static linearSystem3d(axx: number, axy: number, axz: number, // first row of matrix
    ayx: number, ayy: number, ayz: number, // second row of matrix
    azx: number, azy: number, azz: number, // second row of matrix
    cx: number, cy: number, cz: number, // right side
    result?: Vector3d): Vector3d | undefined;
}
//# sourceMappingURL=Polynomials.d.ts.map