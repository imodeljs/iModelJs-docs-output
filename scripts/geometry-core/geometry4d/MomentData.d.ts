/** @module Numerics */
import { XYZ, Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { Matrix3d } from "../geometry3d/Matrix3d";
import { Matrix4d } from "./Matrix4d";
/**
 * A MomentData structrue carries data used in calculation of moments of inertia.
 * * origin = local origin used as moments are summed.
 * * sums = array of summed moments.
 *   * The [i,j] entry of the sums is a summed or integrated moment for product of axis i and j.
 *      * axes 0,1,2 are x,y,z
 *         * e.g. entry [0,1] is summed product xy
 *      * axis 3 is "w", which is 1 in sums.
 *         * e.g. entry 03 is summed x
 */
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
    static momentTensorFromInertiaProducts(products: Matrix3d): Matrix3d;
    static sortColumnsForIncreasingMoments(axes: Matrix3d, moments: Vector3d): void;
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
//# sourceMappingURL=MomentData.d.ts.map