/** @module Curve */
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { Polyface } from "../polyface/Polyface";
import { CurvePrimitive } from "./CurvePrimitive";
import { CurveCollection } from "./CurveCollection";
import { SolidPrimitive } from "../solid/SolidPrimitive";
import { CoordinateXYZ } from "./CoordinateXYZ";
import { PointString3d } from "./PointString3d";
import { BSpline2dNd } from "../bspline/BSplineSurface";
/** Describes the category of a [[GeometryQuery]], enabling type-switching like:
 * ```ts
 *   function processGeometryQuery(q: GeometryQuery): void {
 *     if ("solid" === q.geometryCategory)
 *       alert("Solid type = " + q.solidPrimitiveType; // compiler knows q is an instance of SolidPrimitive
 *    // ...etc...
 * ```
 *
 * Each string maps to a particular subclass of [[GeometryQuery]]:
 *  - "polyface" => [[Polyface]]
 *  - "curvePrimitive" => [[CurvePrimitive]]
 *  - "curveCollection" => [[CurveCollection]]
 *  - "solid" => [[SolidPrimitive]]
 *  - "point" => [[CoordinateXYZ]]
 *  - "pointCollection" => [[PointString3d]]
 *  - "bsurf" => [[BSpline2dNd]]  (which is an intermediate class shared by [[BSplineSurface3d]] and [[BSplineSurface3dH]])
 *
 *  @see [[AnyGeometryQuery]]
 * @public
 */
export declare type GeometryQueryCategory = "polyface" | "curvePrimitive" | "curveCollection" | "solid" | "point" | "pointCollection" | "bsurf";
/** Union type for subclasses of [[GeometryQuery]]. Specific subclasses can be discriminated at compile- or run-time using [[GeometryQuery.geometryCategory]].
 * @public
 */
export declare type AnyGeometryQuery = Polyface | CurvePrimitive | CurveCollection | SolidPrimitive | CoordinateXYZ | PointString3d | BSpline2dNd;
/** Queries to be supported by Curve, Surface, and Solid objects */
/**
 * * `GeometryQuery` is an abstract base class with (abstract) methods for querying curve, solid primitive, mesh, and bspline surfaces
 * @public
 */
export declare abstract class GeometryQuery {
    /** Type discriminator. */
    abstract readonly geometryCategory: GeometryQueryCategory;
    /** return the range of the entire (tree) GeometryQuery */
    range(transform?: Transform, result?: Range3d): Range3d;
    /** extend rangeToExtend by the range of this geometry multiplied by the transform */
    abstract extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /** Attempt to transform in place.
     *
     * * LineSegment3d, Arc3d, LineString3d, BsplineCurve3d always succeed.
     * * Some geometry types may fail if scaling is non-uniform.
     */
    abstract tryTransformInPlace(transform: Transform): boolean;
    /** try to move the geometry by dx,dy,dz */
    tryTranslateInPlace(dx: number, dy?: number, dz?: number): boolean;
    /** return a transformed clone.
     */
    abstract cloneTransformed(transform: Transform): GeometryQuery | undefined;
    /** return a clone */
    abstract clone(): GeometryQuery | undefined;
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    readonly children: GeometryQuery[] | undefined;
    /** test if (other instanceof this.Type).  REQUIRED IN ALL CONCRETE CLASSES */
    abstract isSameGeometryClass(other: GeometryQuery): boolean;
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    /**
     * * "double dispatch" call pattern.
     * * User code implements a `GeometryHandler` with specialized methods to handle `LineSegment3d`, `Arc3d` etc as relevant to its use case.
     * * Each such `GeometryQuery` class implements this method as a one-line method containing the appropriate call such as `handler.handleLineSegment3d ()`
     * * This allows each type-specific method to be called without a switch or `instanceof` test.
     * @param handler handler to be called by the particular geometry class
     */
    abstract dispatchToGeometryHandler(handler: GeometryHandler): any;
}
//# sourceMappingURL=GeometryQuery.d.ts.map