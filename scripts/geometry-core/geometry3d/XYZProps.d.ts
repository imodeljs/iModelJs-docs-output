/** @module CartesianGeometry */
import { Matrix3d } from "./Matrix3d";
export interface IsNullCheck {
    isNull(): boolean;
}
export interface WritableXAndY {
    x: number;
    y: number;
}
export interface WriteableHasZ {
    z: number;
}
export interface WritableXYAndZ extends XAndY, WriteableHasZ {
}
export interface WritableLowAndHighXY {
    low: WritableXAndY;
    high: WritableXAndY;
}
export interface WritableLowAndHighXYZ {
    low: WritableXYAndZ;
    high: WritableXYAndZ;
}
export declare type HasZ = Readonly<WriteableHasZ>;
export declare type XAndY = Readonly<WritableXAndY>;
export declare type XYAndZ = Readonly<WritableXYAndZ>;
export declare type LowAndHighXY = Readonly<WritableLowAndHighXY>;
export declare type LowAndHighXYZ = Readonly<WritableLowAndHighXYZ>;
export declare type XYZProps = {
    x?: number;
    y?: number;
    z?: number;
} | number[];
export declare type XYProps = {
    x?: number;
    y?: number;
} | number[];
export declare type Matrix3dProps = number[][] | Matrix3d | number[];
export declare type TransformProps = number[][] | number[] | {
    origin: XYZProps;
    matrix: Matrix3dProps;
};
export declare type Range3dProps = {
    low: XYZProps;
    high: XYZProps;
} | XYZProps[];
export declare type Range2dProps = {
    low: XYProps;
    high: XYProps;
} | XYProps[];
export declare type Range1dProps = {
    low: number;
    high: number;
} | number[];
//# sourceMappingURL=XYZProps.d.ts.map