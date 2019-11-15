/** @module CartesianGeometry */
import { AxisOrder } from "../Geometry";
import { Angle } from "./Angle";
import { Matrix3d } from "./Matrix3d";
/**
 * * OrderedRotationAngles represents a non-trivial rotation using three simple axis rotation angles, and an order in which to apply them.
 * * This class accommodates application-specific interpretation of "Multiplying 3 rotation matrices" with regard to
 *   * Whether a "vector" is a "row" or a "column"
 *   * The order in which the X,Y, Z rotations are applied.
 * * Within the imodel geometry library, the preferred rotation order is encapsulated in `YawPitchRollAngles`.
 * @alpha
 */
export declare class OrderedRotationAngles {
    private _x;
    private _y;
    private _z;
    private _order;
    private static _sTreatVectorsAsColumns;
    private constructor();
    /** (Property accessor) Return the `AxisOrder` controlling matrix multiplication order. */
    readonly order: AxisOrder;
    /** (Property accessor) Return the strongly typed angle of rotation around x. */
    readonly xAngle: Angle;
    /** (Property accessor) Return the strongly typed angle of rotation around y. */
    readonly yAngle: Angle;
    /** (Property accessor) Return the strongly typed angle of rotation around z. */
    readonly zAngle: Angle;
    /** (Property accessor) Return the angle of rotation around x, in degrees */
    readonly xDegrees: number;
    /** (Property accessor) Return the angle of rotation around y, in degrees */
    readonly xRadians: number;
    /** (Property accessor) Return the angle of rotation around z, in degrees */
    readonly yDegrees: number;
    /** (Property accessor) Return the angle of rotation around x, in radians */
    readonly yRadians: number;
    /** (Property accessor) Return the angle of rotation around y, in radians */
    readonly zDegrees: number;
    /** (Property accessor) Return the angle of rotation around z, in radians */
    readonly zRadians: number;
    /** (Property accessor) flag controlling whether vectors are treated as rows or as columns */
    /** (Property set) flag controlling whether vectors are treated as rows or as columns */
    static treatVectorsAsColumns: boolean;
    /** Create an OrderedRotationAngles from three angles and an ordering in which to apply them when rotating.
     * @param xRotation rotation around x
     * @param yRotation rotation around y
     * @param zRotation rotation around z
     * @param axisOrder right to left order of axis names identifies the order that rotations are applied to xyz data.
     */
    static createAngles(xRotation: Angle, yRotation: Angle, zRotation: Angle, order: AxisOrder, result?: OrderedRotationAngles): OrderedRotationAngles;
    /** Create an OrderedRotationAngles from three angles (in radians) and an ordering in which to apply them when rotating. */
    static createRadians(xRadians: number, yRadians: number, zRadians: number, order: AxisOrder, result?: OrderedRotationAngles): OrderedRotationAngles;
    /** Create an OrderedRotationAngles from three angles (in degrees) and an ordering in which to apply them when rotating. */
    static createDegrees(xDegrees: number, yDegrees: number, zDegrees: number, order: AxisOrder, result?: OrderedRotationAngles): OrderedRotationAngles;
    /** Create an OrderedRotationAngles from a 3x3 rotational matrix, given the ordering of axis rotations that the matrix derives from. */
    static createFromMatrix3d(matrix: Matrix3d, order: AxisOrder, result?: OrderedRotationAngles): OrderedRotationAngles;
    /** Create a 3x3 rotational matrix from this OrderedRotationAngles. */
    toMatrix3d(result?: Matrix3d): Matrix3d;
}
//# sourceMappingURL=OrderedRotationAngles.d.ts.map