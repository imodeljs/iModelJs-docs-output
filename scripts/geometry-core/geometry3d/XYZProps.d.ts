/** @module CartesianGeometry */
import { Matrix3d } from "./Matrix3d";
/**
 * interface for class with `x` and `y` as number properties.
 * @public
 */
export interface WritableXAndY {
    /** x coordinate */
    x: number;
    /** y coordinate */
    y: number;
}
/**
 * interface for class with `z` as number property.
 * @public
 */
export interface WriteableHasZ {
    /** z coordinate */
    z: number;
}
/**
 * interface for class with `x`, `y`, `z` as number property.
 * @public
 */
export interface WritableXYAndZ extends WritableXAndY, WriteableHasZ {
}
/**
 * interface for class with named properties `low` and `high`, both being `WriteableXAndY`
 * @public
 */
export interface WritableLowAndHighXY {
    /** low x,y coordinates */
    low: WritableXAndY;
    /** high x,y,z coordinates */
    high: WritableXAndY;
}
/**
 * interface for class with named properties `low` and `high`, both being `WriteableXYAndZ`
 * @public
 */
export interface WritableLowAndHighXYZ {
    /** low x,y,z coordinates */
    low: WritableXYAndZ;
    /** High x,y,z coordinates */
    high: WritableXYAndZ;
}
/**
 * interface for readable `z` number members.
 * @public
 */
export declare type HasZ = Readonly<WriteableHasZ>;
/**
 * interface for readable `x` and `y` number members.
 * @public
 */
export declare type XAndY = Readonly<WritableXAndY>;
/**
 * interface for type with readable `x`, `y`, `z` number members.
 * @public
 */
export declare type XYAndZ = Readonly<WritableXYAndZ>;
/**
 * interface for type with readable `low` and `high` members which have `x` and `y` number members.
 * @public
 */
export declare type LowAndHighXY = Readonly<WritableLowAndHighXY>;
/**
 * interface for type with readable `low` and `high` members which have `x`, `y`, and `z` number members.
 * @public
 */
export declare type LowAndHighXYZ = Readonly<WritableLowAndHighXYZ>;
/**
 * interface for variant json (one of)
 * * (individually optional) `x`, `y`, `z`
 * * number array
 * @public
 */
export declare type XYZProps = {
    x?: number;
    y?: number;
    z?: number;
} | number[];
/**
 * interface for variant json (one of)
 * * (individually optional) `x`, `y`
 * * number array
 * @public
 */
export declare type XYProps = {
    x?: number;
    y?: number;
} | number[];
/**
 * interface for variant json (one of)
 * * array of number arrays, with one matrix row in each array
 * * flat array of numbers, in row-mor order
 * * `Matrix3d` object
 * @public
 */
export declare type Matrix3dProps = number[][] | Matrix3d | number[];
/**
 * interface for variant json (one of)
 * * array of number arrays, with each low level array containing 4 numbers of a transform row (qx, qy, qz, ax)
 * * flat array of 12 numbers, in row-major order for the 3 rows fo 4 values
 * * `Transform` object
 * @public
 */
export declare type TransformProps = number[][] | number[] | {
    origin: XYZProps;
    matrix: Matrix3dProps;
};
/**
 *  interface for variant json representing a Range3d
 * * pair of `XYZProps` named `low` and `high`
 * * array of `XYZProps`
 * @public
 */
export declare type Range3dProps = {
    low: XYZProps;
    high: XYZProps;
} | XYZProps[];
/**
 *  interface for variant json representing a Range2d
 * * pair of `XYProps` named `low` and `high`
 * * array of `XYProps`
 * @public
 */
export declare type Range2dProps = {
    low: XYProps;
    high: XYProps;
} | XYProps[];
/**
 *  interface for variant json representing a Range1d
 * * pair of `number` named `low` and `high`
 * * array of `number`
 * @public
 */
export declare type Range1dProps = {
    low: number;
    high: number;
} | number[];
//# sourceMappingURL=XYZProps.d.ts.map