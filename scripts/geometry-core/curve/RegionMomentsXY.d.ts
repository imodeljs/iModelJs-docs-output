/** @module Curve */
import { MomentData } from "../geometry4d/MomentData";
import { NullGeometryHandler } from "../geometry3d/GeometryHandler";
import { Arc3d } from "./Arc3d";
import { LineString3d } from "./LineString3d";
import { LineSegment3d } from "./LineSegment3d";
import { Loop } from "./Loop";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
import { TransitionSpiral3d } from "./TransitionSpiral";
import { CurvePrimitive } from "./CurvePrimitive";
import { ParityRegion } from "./ParityRegion";
import { UnionRegion } from "./UnionRegion";
/**
 * Implementation class for computing XY area moments.
 * @internal
 */
export declare class RegionMomentsXY extends NullGeometryHandler {
    private _activeMomentData?;
    private _point0;
    private _point1;
    /** Accumulate (independent) integrations over
     * * origin to chord of the arc.
     * * origin to the "cap" between the chord and arc.
     */
    handleArc3d(arc: Arc3d): void;
    /** Accumulate integrals over the (triangular) areas from the origin to each line segment */
    handleLineString3d(ls: LineString3d): void;
    /** Accumulate integrals over the (triangular) area from the origin to this line segment */
    handleLineSegment3d(segment: LineSegment3d): void;
    /** Accumulate integrals from origin to all primitives in the chain. */
    handleLoop(loop: Loop): MomentData | undefined;
    /**
     * ASSUMPTIONS FOR ORIENTATION AND CONTAINMENT ISSUES
     * * Largest area is outer
     * * All others are interior (and not overlapping)
     * Hence
     * * Outer area sign must be positive -- negate all integrations as needed
     * * Outer area signs must be positive -- negate all integrations as needed
     * @param region
     */
    handleParityRegion(region: ParityRegion): MomentData | undefined;
    /** Accumulate (as simple addition) products over each component of the union region. */
    handleUnionRegion(region: UnionRegion): MomentData | undefined;
    private _strokeOptions?;
    private getStrokeOptions;
    /** Single curve primitive (not loop . . .).
     * * stroke the curve
     * * accumulate stroke array.
     */
    handleCurvePrimitive(cp: CurvePrimitive): void;
    /** handle strongly typed  BSplineCurve3d  as generic curve primitive */
    handleBSplineCurve3d(g: BSplineCurve3d): void;
    /** handle strongly typed  BSplineCurve3dH  as generic curve primitive */
    handleBSplineCurve3dH(g: BSplineCurve3dH): void;
    /** handle strongly typed  TransitionSpiral as generic curve primitive  */
    handleTransitionSpiral(g: TransitionSpiral3d): void;
}
//# sourceMappingURL=RegionMomentsXY.d.ts.map