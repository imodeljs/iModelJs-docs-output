/** @module Bspline */
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Point4d } from "../geometry4d/Point4d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { StrokeOptions } from "../curve/StrokeOptions";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { IStrokeHandler } from "../geometry3d/GeometryHandler";
import { LineString3d } from "../curve/LineString3d";
import { KnotVector } from "./KnotVector";
import { Bezier1dNd } from "./Bezier1dNd";
import { UnivariateBezier } from "../numerics/BezierPolynomials";
/**
 * Base class for CurvePrimitve (necessarily 3D) with _polygon.
 * * This has a Bezier1dNd polygon as a member, and implements dimension-indendent methods
 * * This exists to support BezeierCurve3d and BezierCurve3dH.
 * * The implementations of "pure 3d" queries is based on calling `getPolePoint3d`.
 * * This has the subtle failure difference that `getPolePoint3d` call with a valid index on on a 3d curve always succeeds, but on 3dH curve fails when weight is zero.
 */
export declare abstract class BezierCurveBase extends CurvePrimitive {
    protected _polygon: Bezier1dNd;
    /** data blocks accessible by concrete class.   Initialized to correct blockSize in constructor. */
    protected _workData0: Float64Array;
    protected _workData1: Float64Array;
    /**
     * *_workPoint0 and _workPoint1 are conventional 3d points
     * * create by constructor
     * * accessbile by derived classes
     * */
    protected _workPoint0: Point3d;
    protected _workPoint1: Point3d;
    protected constructor(blockSize: number, data: Float64Array);
    /** reverse the poles in place */
    reverseInPlace(): void;
    /** saturate the pole in place, using knot intervals from `spanIndex` of the `knotVector` */
    saturateInPlace(knotVector: KnotVector, spanIndex: number): boolean;
    readonly degree: number;
    readonly order: number;
    readonly numPoles: number;
    /** Get pole `i` as a Point3d.
     * * For 3d curve, this is simple a pole access, and only fails (return `undefined`) for invalid index
     * * For 4d curve, this deweights the homogeneous pole and can fail due to 0 weight.
     */
    abstract getPolePoint3d(i: number, point?: Point3d): Point3d | undefined;
    /** Get pole `i` as a Point4d.
     * * For 3d curve, this accesses the simple pole and returns with weight 1.
     * * For 4d curve, this accesses the (weighted) pole.
     */
    abstract getPolePoint4d(i: number, point?: Point4d): Point4d | undefined;
    setInterval(a: number, b: number): void;
    fractionToParentFraction(fraction: number): number;
    /** Return a stroke count appropriate for given stroke options. */
    abstract strokeCount(options?: StrokeOptions): number;
    /** append stroke points to a linestring, based on `strokeCount` and `fractionToPoint` from derived class*/
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** announce intervals with stroke counts */
    emitStrokableParts(handler: IStrokeHandler, _options?: StrokeOptions): void;
    /** Return a simple array of arrays with the control points as `[[x,y,z],[x,y,z],..]` */
    copyPolesAsJsonArray(): any[];
    /** return true if all poles are on a plane. */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    polygonLength(): number;
    startPoint(): Point3d;
    endPoint(): Point3d;
    quickLength(): number;
    /** Concrete classes must implement extendRange . . .  */
    abstract extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    protected _workBezier?: UnivariateBezier;
    protected _workCoffsA?: Float64Array;
    protected _workCoffsB?: Float64Array;
    /**
     * set up the _workBezier members with specific order.
     * * Try to reuse existing members if their sizes match.
     * * Ignore members corresponding to args that are 0 or negative.
     * @param primaryBezierOrder order of expected bezier
     * @param orderA length of _workCoffsA (simple array)
     * @param orderB length of _workdCoffsB (simple array)
     */
    protected allocateAndZeroBezierWorkData(primaryBezierOrder: number, orderA: number, orderB: number): void;
}
//# sourceMappingURL=BezierCurveBase.d.ts.map