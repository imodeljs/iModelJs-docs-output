/** @module Curve */
import { MomentData } from "../geometry4d/MomentData";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { CurvePrimitive } from "./CurvePrimitive";
import { AnyCurve } from "./CurveChain";
import { IStrokeHandler } from "../geometry3d/GeometryHandler";
/**
 * Class to visit curve primitives and accumulate wire moment integrations.
 * @internal
 */
export declare class CurveWireMomentsXYZ implements IStrokeHandler {
    private _activeMomentData;
    private _gaussMapper;
    constructor(numGaussPoints?: number);
    readonly momentData: MomentData;
    startParentCurvePrimitive(_cp: CurvePrimitive): void;
    startCurvePrimitive(_cp: CurvePrimitive): void;
    endCurvePrimitive(_cp: CurvePrimitive): void;
    endParentCurvePrimitive(_cp: CurvePrimitive): void;
    announceIntervalForUniformStepStrokes(cp: CurvePrimitive, numStrokes: number, fraction0: number, fraction1: number): void;
    announceSegmentInterval(_cp: CurvePrimitive, point0: Point3d, point1: Point3d, _numStrokes: number, _fraction0: number, _fraction1: number): void;
    announcePointTangent(_xyz: Point3d, _fraction: number, _tangent: Vector3d): void;
    /** Recurse to leaf-level primitives */
    visitLeaves(root: AnyCurve): void;
}
//# sourceMappingURL=CurveWireMomentsXYZ.d.ts.map