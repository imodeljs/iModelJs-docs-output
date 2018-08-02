import { Point3d } from "../PointVector";
export declare class TriDiagonalSystem {
    private aLeft;
    private aRight;
    private aDiag;
    private b;
    private x;
    private dataState;
    constructor(n: number);
    Reset(): void;
    SetRow(row: number, left: number, diag: number, right: number): void;
    AddToRow(row: number, left: number, diag: number, right: number): void;
    SetB(row: number, bb: number): void;
    AddToB(row: number, bb: number): void;
    GetB(row: number): number;
    SetX(row: number, xx: number): void;
    GetX(row: number): number;
    Order(): number;
    MultiplyAX(): boolean;
    MultiplyAXPoints(pointX: Point3d[], pointB: Point3d[]): boolean;
    Defactor(): boolean;
    Factor(): boolean;
    FactorAndBackSubstitute(): boolean;
    FactorAndBackSubstitutePointArrays(vectorB: Point3d[], vectorX: Point3d[]): boolean;
    Copy(): TriDiagonalSystem;
    flatten(): any;
    flattenWithPoints(xyzB: Point3d[]): any;
}
