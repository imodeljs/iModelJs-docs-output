/** @module Serialization */
import { Angle, AngleSweep } from "../Geometry";
import { Plane3dByOriginAndUnitNormal, Ray3d } from "../AnalyticGeometry";
import { Point3d, Vector3d, Point2d, Vector2d } from "../PointVector";
import { Transform, Matrix3d } from "../Transform";
import { Range1d, Range2d, Range3d } from "../Range";
import { CurvePrimitive, GeometryQuery } from "../curve/CurvePrimitive";
import { Point4d, Matrix4d, Map4d } from "../numerics/Geometry4d";
import { Path, Loop, ParityRegion, UnionRegion, BagOfCurves } from "../curve/CurveChain";
import { IndexedPolyface } from "../polyface/Polyface";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { BSplineSurface3d, BSplineSurface3dH } from "../bspline/BSplineSurface";
import { Sphere } from "../solid/Sphere";
import { Cone } from "../solid/Cone";
import { Box } from "../solid/Box";
import { TorusPipe } from "../solid/TorusPipe";
import { LinearSweep } from "../solid/LinearSweep";
import { RotationalSweep } from "../solid/RotationalSweep";
import { RuledSweep } from "../solid/RuledSweep";
import { LineSegment3d } from "../curve/LineSegment3d";
import { TransitionSpiral3d } from "../curve/TransitionSpiral";
import { LineString3d } from "../curve/LineString3d";
import { PointString3d } from "../curve/PointString3d";
import { ClipPlane } from "../clipping/ClipPlane";
import { GrowableFloat64Array, GrowableXYZArray } from "../GrowableArray";
import { UnionOfConvexClipPlaneSets } from "../clipping/UnionOfConvexClipPlaneSets";
import { BSplineCurve3dH } from "../bspline/BSplineCurve3dH";
export declare class Sample {
    static readonly point2d: Point2d[];
    static readonly point3d: Point3d[];
    /** Return an array of Point3d, with x,y,z all stepping through a range of values.
     * x varies fastest, then y then z
     */
    static createPoint3dLattice(low: number, step: number, high: number): Point3d[];
    /** Return an array of Point2d, with x,y all stepping through a range of values.
     * x varies fastest, then y
     */
    static createPoint2dLattice(low: number, step: number, high: number): Point2d[];
    static readonly point4d: Point4d[];
    static createNonZeroVectors(): Vector3d[];
    static readonly vector2d: Vector2d[];
    static createRange3ds(): Range3d[];
    static createRectangleXY(x0: number, y0: number, ax: number, ay: number, z?: number): Point3d[];
    static createUnitCircle(numPoints: number): Point3d[];
    static createLShapedPolygon(x0: number, y0: number, ax: number, ay: number, bx: number, by: number, z?: number): Point3d[];
    static createClipPlanes(): ClipPlane[];
    /**
     * * A first-quadrant unit square
     * * Two squares -- first and fourth quadrant unit squares
     * * Three squares -- first, second and fourtn quarant unit squares
     */
    static createClipPlaneSets(): UnionOfConvexClipPlaneSets[];
    static createBsplineCurves(): BSplineCurve3d[];
    static createBspline3dHCurves(): BSplineCurve3dH[];
    static createPlane(x: number, y: number, z: number, u: number, v: number, w: number): Plane3dByOriginAndUnitNormal;
    static createRay(x: number, y: number, z: number, u: number, v: number, w: number): Ray3d;
    static readonly plane3dByOriginAndUnitNormal: Plane3dByOriginAndUnitNormal[];
    static readonly ray3d: Ray3d[];
    static readonly angle: Angle[];
    static readonly angleSweep: AngleSweep[];
    static readonly lineSegment3d: LineSegment3d[];
    static createLineStrings(): LineString3d[];
    static readonly range1d: Range1d[];
    static readonly range2d: Range2d[];
    static readonly range3d: Range3d[];
    static createMatrix3dArray(): Matrix3d[];
    static createInvertibleTransforms(): Transform[];
    /** Return an array of Matrix3d with various skew and scale.  This includes at least:
     * * identity
     * * 3 disinct diagonals.
     * * The distinct diagonal base with smaller value added to
     *    other 6 spots in succession.
     * * the distinct diagonals with all others also smaller nonzeros.
     */
    static createScaleSkewMatrix3d(): Matrix3d[];
    /** Return an array of singular Matrix3d.  This includes at least:
     * * all zeros
     * * one nonzero column
     * * two independent columns, third is zero
     * * two independent columns, third is sum of those
     * * two independent columns, third is copy of one
     */
    static createSingularMatrix3d(): Matrix3d[];
    /**
     * Return an array of rigid transforms.  This includes (at least)
     * * Identity
     * * translation with identity matrix
     * * rotation around origin and arbitrary vector
     * * rotation around space point and arbitrary vector
     */
    static createRigidTransforms(): Transform[];
    /**
     * Return a single rigid transform with all terms nonzero.
     */
    static createMessyRigidTransform(): Transform;
    static createRigidAxes(): Matrix3d[];
    static createMatrix4ds(includeIrregular?: boolean): Matrix4d[];
    static createMap4ds(): Map4d[];
    static createSimplePaths(withGaps?: boolean): Path[];
    static createSimplePointStrings(): PointString3d[];
    static createSimpleLoops(): Loop[];
    /**
     *
     * @param dx0 distance along x axis at y=0
     * @param dy vertical rise
     * @param dx1 distance along x axis at y=dy
     * @param numPhase number of phases of the jump.
     * @param dyReturn y value for return to origin.  If 0, the wave ends at y=0 after then final "down" with one extra horizontal dx0
     *     If nonzero, rise to that y value, return to x=0, and return down to origin.
     *
     */
    static createSquareWave(origin: Point3d, dx0: number, dy: number, dx1: number, numPhase: number, dyReturn: number): Point3d[];
    /** append to a linestring, taking steps along given vector directions
     * If the linestring is empty, a 000 point is added.
     * @param linestring LineString3d to receive points.
     * @param numPhase number of phases of the sawtooth
     * @param vectors any number of vector steps.
     */
    static appendPhases(linestring: LineString3d, numPhase: number, ...vectors: Vector3d[]): void;
    static createSimpleXYPointLoops(): Point3d[][];
    static createSimpleParityRegions(): ParityRegion[];
    static createSimpleUnions(): UnionRegion[];
    static createBagOfCurves(): BagOfCurves[];
    static createSmoothCurvePrimitives(size?: number): CurvePrimitive[];
    static createSimpleIndexedPolyfaces(gridMultiplier: number): IndexedPolyface[];
    /**
     * Build a mesh that is a (possibly skewed) grid in a plane.
     * @param origin "lower left" coordinate
     * @param vectorX step in "X" direction
     * @param vectorY step in "Y" direction
     * @param numXVertices number of vertices in X direction
     * @param numYVertices number of vertices in y direction
     * @param createParams true to create parameters, with paramter value `(i,j)` for point at (0 based) vertex in x,y directions
     * @param createNormals true to create a (single) normal indexed from all facets
     * @param createColors true to create a single color on each quad.  (shared between its triangles)
     * @note edgeVisible is false only on the diagonals
     */
    static createTriangularUnitGridPolyface(origin: Point3d, vectorX: Vector3d, vectorY: Vector3d, numXVertices: number, numYVertices: number, createParams?: boolean, createNormals?: boolean, createColors?: boolean): IndexedPolyface;
    static createXYGrid(numU: number, numV: number, dX?: number, dY?: number): Point3d[];
    static createXYGridBsplineSurface(numU: number, numV: number, orderU: number, orderV: number): BSplineSurface3d | undefined;
    static createWeightedXYGridBsplineSurface(numU: number, numV: number, orderU: number, orderV: number, weight00?: number, weight10?: number, weight01?: number, weight11?: number): BSplineSurface3dH | undefined;
    static createSimpleLinearSweeps(): LinearSweep[];
    /**
     * Create an array of primitives with an arc centerd at origin and a line segment closing back to the arc start.
     * This can be bundled into Path or Loop by caller.
     */
    static createCappedArcPrimitives(radius: number, startDegrees: number, endDegrees: number): CurvePrimitive[];
    /** Return a Path structure for a segment of arc, with closure segment */
    static createCappedArcPath(radius: number, startDegrees: number, endDegrees: number): Path;
    /** Return a Loop structure for a segment of arc, with closure segment */
    static createCappedArcLoop(radius: number, startDegrees: number, endDegrees: number): Loop;
    static createSimpleRotationalSweeps(): RotationalSweep[];
    static createSpheres(): Sphere[];
    static createEllipsoids(): Sphere[];
    static createCones(): Cone[];
    static createTorusPipes(): TorusPipe[];
    static createBoxes(): Box[];
    /** create an array of points for a rectangle with corners (x0,y0,z) and (x1,y1,z)
     */
    static createRectangle(x0: number, y0: number, x1: number, y1: number, z?: number, closed?: boolean): Point3d[];
    static createRuledSweeps(): RuledSweep[];
    /**
     *
     * @param a0 first entry
     * @param delta step between entries
     * @param n number of entries
     */
    static createGrowableArrayCountedSteps(a0: number, delta: number, n: number): GrowableFloat64Array;
    /**
     *
     * @param radius first entry
     * @param numEdge number of edges of chorded circle.  Angle step is 2PI/numEdge (whether or not closed)
     * @param closed true to include final point (i.e. return numEdge+1 points)
     */
    static createGrowableArrayCirclePoints(radius: number, numEdge: number, closed?: boolean, centerX?: number, centerY?: number, data?: GrowableXYZArray): GrowableXYZArray;
    private static pushIfDistinct;
    private static appendToFractalEval;
    /**
     * For each edge of points, construct a transform (with scale, rotate, and translate) that spreads the patter out along the edge.
     * Repeat recursively for each edge
     * @returns Returns an array of recusively generated fractal points
     * @param poles level-0 (coarse) polygon whose edges are to be replaced by recursive fractals
     * @param pattern pattern to map to each edge of poles (and to edges of the recursion)
     * @param numRecursion  number of recursions
     * @param perpendicularFactor factor to apply to perpendicular sizing.
     */
    static createRecursvieFractalPolygon(poles: Point3d[], pattern: Point2d[], numRecursion: number, perpendicularFactor: number): Point3d[];
    /** Primary shape is a "triangle" with lower edge pushed in so it becomes a mild nonconvex quad.
     *  Fractal effects are gentle.
     */
    static nonConvexQuadSimpleFractal(numRecursion: number, perpendicularFactor: number): Point3d[];
    /** Diamond with simple wave fractal */
    static createFractalDiamonConvexPattern(numRecursion: number, perpendicularFactor: number): Point3d[];
    static createFractalSquareReversingPattern(numRecursion: number, perpendicularFactor: number): Point3d[];
    static createFractalLReversingPatterh(numRecursion: number, perpendicularFactor: number): Point3d[];
    /** Fractal with fewer concavity changes.... */
    static createFractalLMildConcavePatter(numRecursion: number, perpendicularFactor: number): Point3d[];
    /** append interpolated points from the array tail to the target. */
    static appendSplits(points: Point3d[], target: Point3d, numSplit: number, includeTarget: boolean): void;
    /**
     *
     * @param numSplitAB number of extra points on edge AB
     * @param numSplitBC number of extra points on edge BC
     * @param numSplitCA number of extra points on edge CA
     * @param wrap true to replicate vertexA at end
     * @param xyzA vertexA
     * @param xyzB vertexB
     * @param xyzC vertexC
     */
    static createTriangleWithSplitEdges(numSplitAB: number, numSplitBC: number, numSplitCA: number, wrap?: boolean, xyzA?: Point3d, xyzB?: Point3d, xyzC?: Point3d): Point3d[];
    static createCenteredBoxEdges(ax?: number, ay?: number, az?: number, cx?: number, cy?: number, cz?: number, geometry?: GeometryQuery[]): GeometryQuery[];
    static createSimpleTransitionSpirals(): TransitionSpiral3d[];
}
//# sourceMappingURL=GeometrySamples.d.ts.map