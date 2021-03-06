import { Point3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { IStrokeHandler, GeometryHandler } from "../geometry3d/GeometryHandler";
import { StrokeOptions } from "./StrokeOptions";
import { CurvePrimitive } from "../curve/CurvePrimitive";
import { StrokeCountMap } from "../curve/Query/StrokeCountMap";
import { GeometryQuery } from "./GeometryQuery";
import { CurveChain } from "./CurveCollection";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { LineString3d } from "./LineString3d";
import { Range3d } from "../geometry3d/Range";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { CurveLocationDetail } from "./CurveLocationDetail";
import { VariantCurveExtendParameter } from "./CurveExtendMode";
/**
 * * Annotation of an interval of a curve.
 * * The interval is marked with two pairs of numbers:
 * * * fraction0, fraction1 = fraction parameters along the child curve
 * * * distance0,distance1 = distances within containing CurveChainWithDistanceIndex
 * @public
 */
export declare class PathFragment {
    /** distance along parent to this fragment start */
    chainDistance0: number;
    /** distance along parent to this fragment end */
    chainDistance1: number;
    /** Fractional position of this fragment start within its curve primitive. */
    childFraction0: number;
    /** Fractional position of this fragment end within its curve primitive.. */
    childFraction1: number;
    /** Curve primitive of this fragment */
    childCurve: CurvePrimitive;
    /** Create a fragment with complete fraction, distance and child data. */
    constructor(childFraction0: number, childFraction1: number, distance0: number, distance1: number, childCurve: CurvePrimitive);
    /**
     * Return true if the distance is within the distance limits of this fragment.
     * @param distance
     */
    containsChainDistance(distance: number): boolean;
    /**
     * Return true if this fragment addresses `curve` and brackets `fraction`
     * @param distance
     */
    containsChildCurveAndChildFraction(curve: CurvePrimitive, fraction: number): boolean;
    /** Convert distance to local fraction, and apply that to interpolate between the stored curve fractions.
     * Note that proportional calculation does NOT account for nonuniform parameterization in the child curve.
     */
    chainDistanceToInterpolatedChildFraction(distance: number): number;
    /** Convert chainDistance to true chidFraction, using detailed moveSignedDistanceFromFraction
     */
    chainDistanceToAccurateChildFraction(chainDistance: number): number;
    /** Return the scale factor to map childCurve fraction derivatives to chain fraction derivatives
     * @param globalDistance total length of the global curve.
     */
    fractionScaleFactor(globalDistance: number): number;
    /** Reverse the fraction and distance data.
     * * each child fraction `f` is replaced by `1-f`
     * * each `chainDistance` is replaced by `totalDistance-chainDistance`
     */
    reverseFractionsAndDistances(totalDistance: number): void;
    /**
     * convert a fractional position on the childCurve to distance in the chain space.
     * * Return value is SIGNED -- will be negative when fraction < this.childFraction0.
     * @param fraction fraction along the curve within this fragment
     */
    childFractionTChainDistance(fraction: number): number;
}
/**
 * `CurveChainWithDistanceIndex` is a CurvePrimitive whose fractional parameterization is proportional to true
 * distance along a CurveChain.
 * * The curve chain can be any type derived from CurveChain.
 * * * i.e. either a `Path` or a `Loop`
 * @public
 */
export declare class CurveChainWithDistanceIndex extends CurvePrimitive {
    /** String name for schema properties */
    readonly curvePrimitiveType = "curveChainWithDistanceIndex";
    private _path;
    private _fragments;
    private _totalLength;
    /** Test if other is a `CurveChainWithDistanceIndex` */
    isSameGeometryClass(other: GeometryQuery): boolean;
    private constructor();
    /**
     * Create a clone, transformed and with its own distance index.
     * @param transform transform to apply in the clone.
     */
    cloneTransformed(transform: Transform): CurvePrimitive | undefined;
    /** Reference to the contained path.
     * * Do not modify the path.  The distance index will be wrong.
     */
    readonly path: CurveChain;
    /** Return a deep clone */
    clone(): CurvePrimitive | undefined;
    /** Ask if the curve is within tolerance of a plane.
     * @returns Returns true if the curve is completely within tolerance of the plane.
     */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** return the start point of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result?: Point3d): Point3d;
    /** Return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result?: Point3d): Point3d;
    /** Add strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Ask the curve to announce points and simple subcurve fragments for stroking.
     * See IStrokeHandler for description of the sequence of the method calls.
     */
    emitStrokableParts(dest: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /**
     * construct StrokeCountMap for each child, accumulating data to stroke count map for this primitive.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap evolving parent map.
     */
    computeAndAttachRecursiveStrokeCounts(options?: StrokeOptions, parentStrokeMap?: StrokeCountMap): void;
    /** Second step of double dispatch:  call `this._path.dispatchToGeometryHandler (handler)`
     * * Note that this exposes the children individually to the handler.
     */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed)
     */
    extendRange(rangeToExtend: Range3d, transform?: Transform): void;
    /**
     *
     * * Curve length is always positive.
     * @returns Returns a (high accuracy) length of the curve between fractional positions
     * @returns Returns the length of the curve.
     */
    curveLengthBetweenFractions(fraction0: number, fraction1: number): number;
    /**
     * Capture (not clone) a path into a new `CurveChainWithDistanceIndex`
     * @param primitives primitive array to be CAPTURED (not cloned)
     */
    static createCapture(path: CurveChain, options?: StrokeOptions): CurveChainWithDistanceIndex | undefined;
    /**
     * Resolve a fraction of the CurveChain to a PathFragment
     * @param distance
     * @param allowExtrapolation
     */
    protected chainDistanceToFragment(distance: number, allowExtrapolation?: boolean): PathFragment | undefined;
    /**
     * Convert distance along the chain to fraction along the chain.
     * @param distance distance along the chain
     */
    chainDistanceToChainFraction(distance: number): number;
    /**
     * Resolve a fraction within a specific curve to a fragment.
     * @param curve
     * @param fraction
     */
    protected curveAndChildFractionToFragment(curve: CurvePrimitive, fraction: number): PathFragment | undefined;
    /**
     * Returns the total length of curves.
     */
    curveLength(): number;
    /**
     * Returns the total length of the path.
     * * This is exact (and simple property lookup) because the true lengths were summed at construction time.
     */
    quickLength(): number;
    /**
     * Return the point (x,y,z) on the curve at fractional position along the chain.
     * @param fraction fractional position along the geometry.
     * @returns Returns a point on the curve.
     */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Return the point (x,y,z) and derivative on the curve at fractional position.
     *
     * * Note that this derivative is "derivative of xyz with respect to fraction."
     * * this derivative shows the speed of the "fractional point" moving along the curve.
     * * this is not generally a unit vector.  use fractionToPointAndUnitTangent for a unit vector.
     * @param fraction fractional position along the geometry.
     * @returns Returns a ray whose origin is the curve point and direction is the derivative with respect to the fraction.
     */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /**
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     * @param fraction fractional position on the curve
     * @param result optional receiver for the result.
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     */
    fractionToPointAndUnitTangent(fraction: number, result?: Ray3d): Ray3d;
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    /** Attempt to transform in place.
     * * Warning: If any child fails, this object becomes invalid.  But that should never happen.
     */
    tryTransformInPlace(transform: Transform): boolean;
    /** Reverse the curve's data so that its fractional stroking moves in the opposite direction. */
    reverseInPlace(): void;
    /**
     * Test for equality conditions:
     * * Mismatched totalLength is a quick exit condition
     * * If totalLength matches, recurse to the path for matching primitives.
     * @param other
     */
    isAlmostEqual(other: GeometryQuery): boolean;
    /** Implement moveSignedDistanceFromFraction.
     * * See `CurvePrimitive` for parameter details.
     * * The returned location directly identifies fractional position along the CurveChainWithDistanceIndex, and has pointer to an additional detail for the child curve.
     */
    moveSignedDistanceFromFraction(startFraction: number, signedDistance: number, allowExtension: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    /** Search for the curve point that is closest to the spacePoint.
     * * The CurveChainWithDistanceIndex invokes the base class CurvePrimitive method, which
     *     (via a handler) determines a CurveLocation detail among the children.
     * * The returned detail directly identifies fractional position along the CurveChainWithDistanceIndex, and has pointer to an additional detail for the child curve.
     * @param spacePoint point in space
     * @param extend true to extend the curve (NOT USED)
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint: Point3d, extend: VariantCurveExtendParameter): CurveLocationDetail | undefined;
}
//# sourceMappingURL=CurveChainWithDistanceIndex.d.ts.map