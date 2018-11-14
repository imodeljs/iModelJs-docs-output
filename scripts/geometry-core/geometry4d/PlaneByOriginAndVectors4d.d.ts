/** @module Numerics */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Point4d } from "./Point4d";
/**
 * A Plane4dByOriginAndVectors is a 4d origin and pair of 4d "vectors" defining a 4d plane.
 *
 * * The parameterization of the plane is    `X = A + U*t + V*v`
 * * The unit coefficient of pointA makes this like a Plane3dByOriginAndVectors. Hence it is not a barycentric combination of 4d points.
 */
export declare class PlaneByOriginAndVectors4d {
    origin: Point4d;
    vectorU: Point4d;
    vectorV: Point4d;
    private constructor();
    /** @returns Return a clone of this plane */
    clone(result?: PlaneByOriginAndVectors4d): PlaneByOriginAndVectors4d;
    /** copy all content from other plane */
    setFrom(other: PlaneByOriginAndVectors4d): void;
    /** @returns Return true if origin, vectorU, and vectorV pass isAlmostEqual. */
    isAlmostEqual(other: PlaneByOriginAndVectors4d): boolean;
    /** Create a plane with (copies of) origin, vectorU, vectorV parameters
     */
    static createOriginAndVectors(origin: Point4d, vectorU: Point4d, vectorV: Point4d, result?: PlaneByOriginAndVectors4d): PlaneByOriginAndVectors4d;
    /** Set all numeric data from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    setOriginAndVectorsXYZW(x0: number, y0: number, z0: number, w0: number, ux: number, uy: number, uz: number, uw: number, vx: number, vy: number, vz: number, vw: number): PlaneByOriginAndVectors4d;
    /** Copy the contents of origin, vectorU, vectorV parameters to respective member variables */
    setOriginAndVectors(origin: Point4d, vectorU: Point4d, vectorV: Point4d): PlaneByOriginAndVectors4d;
    /** Create from complete list of (x,y,z,w) in origin, vectorU, and vectorV */
    static createOriginAndVectorsXYZW(x0: number, y0: number, z0: number, w0: number, ux: number, uy: number, uz: number, uw: number, vx: number, vy: number, vz: number, vw: number, result?: PlaneByOriginAndVectors4d): PlaneByOriginAndVectors4d;
    static createOriginAndTargets3d(origin: Point3d, targetU: Point3d, targetV: Point3d, result?: PlaneByOriginAndVectors4d): PlaneByOriginAndVectors4d;
    fractionToPoint(u: number, v: number, result?: Point4d): Point4d;
    static createXYPlane(result?: PlaneByOriginAndVectors4d): PlaneByOriginAndVectors4d;
}
//# sourceMappingURL=PlaneByOriginAndVectors4d.d.ts.map