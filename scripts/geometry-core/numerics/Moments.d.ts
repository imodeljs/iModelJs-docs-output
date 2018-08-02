/** @module Numerics */
import { XYZ, Point3d, Vector3d } from "../PointVector";
import { RotMatrix, Transform } from "../Transform";
import { Matrix4d } from "../numerics/Geometry4d";
export declare class MomentData {
    origin: Point3d;
    sums: Matrix4d;
    /** the maapping between principal and world system.
     * * This set up with its inverse already constructed.
     */
    localToWorldMap: Transform;
    /** radii of gyration (square roots of principal second moments)
     */
    radiusOfGyration: Vector3d;
    private constructor();
    static momentTensorFromInertiaProducts(products: RotMatrix): RotMatrix;
    static sortColumnsForIncreasingMoments(axes: RotMatrix, moments: Vector3d): void;
    static pointsToPrincipalAxes(points: Point3d[]): MomentData;
    /**
     * Compute principal axes from inertial products
     * @param origin The origin used for the inertia products.
     * @param inertiaProducts The inertia products -- sums or integrals of [xx,xy,xz,xw; yx,yy, yz,yw; zx,zy,zz,zw; wx,wy,wz,w]
     */
    static inertiaProductsToPrincipalAxes(origin: XYZ, inertiaProducts: Matrix4d): MomentData | undefined;
    clearSums(origin?: Point3d): void;
    accumulatePointMomentsFromOrigin(points: Point3d[]): void;
    shiftSumsToCentroid(): boolean;
}
