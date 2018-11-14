import { ClipPlaneContainment } from "./ClipUtils";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { BSplineCurve3d } from "../bspline/BSplineCurve";
import { UnionOfConvexClipPlaneSets } from "./UnionOfConvexClipPlaneSets";
/**
 * Bit mask type for easily keeping track of defined vs undefined values and which parts of a clipping shape
 * should or should not be used.
 */
export declare const enum ClipMask {
    None = 0,
    XLow = 1,
    XHigh = 2,
    YLow = 4,
    YHigh = 8,
    ZLow = 16,
    ZHigh = 32,
    XAndY = 15,
    All = 63
}
/**
 * Cache structure that holds a ClipPlaneSet and various parameters for adding new ClipPlanes to the set. This structure
 * will typically be fed to an additive function that will append new ClipPlanes to the cache based on these parameters.
 */
export declare class PlaneSetParamsCache {
    clipPlaneSet: UnionOfConvexClipPlaneSets;
    zLow: number;
    zHigh: number;
    isMask: boolean;
    invisible: boolean;
    limitValue: number;
    localOrigin: Point3d;
    focalLength: number;
    constructor(zLow: number, zHigh: number, localOrigin?: Point3d, isMask?: boolean, isInvisible?: boolean, focalLength?: number);
}
/** Base class for clipping implementations that use
 *
 * * A ClipPlaneSet designated "clipPlanes"
 * * A ClipPlaneSet designated "maskPlanes"
 * * an "invisible" flag
 */
export declare abstract class ClipPrimitive {
    protected _clipPlanes?: UnionOfConvexClipPlaneSets;
    protected _maskPlanes?: UnionOfConvexClipPlaneSets;
    protected _invisible: boolean;
    abstract fetchClipPlanesRef(): UnionOfConvexClipPlaneSets | undefined;
    abstract fetchMaskPlanesRef(): UnionOfConvexClipPlaneSets | undefined;
    abstract readonly invisible: boolean;
    protected constructor(planeSet?: UnionOfConvexClipPlaneSets | undefined, isInvisible?: boolean);
    abstract toJSON(): any;
    /**
     * Return (if possible) the range box around the clipper after a transform.
     * Note that well formed clippers can have unbounded volumes -- having a bounded range is only possible for special
     * clippers such as polygons swept through a volume with front and back planes.
     */
    abstract getRange(returnMaskRange: boolean, transform: Transform, result?: Range3d): Range3d | undefined;
    abstract multiplyPlanesTimesMatrix(matrix: Matrix4d): boolean;
    /** Apply a transform to the clipper (e.g. transform all planes) */
    transformInPlace(transform: Transform): boolean;
    /** Sets both the clip plane set and the mask set visibility */
    setInvisible(invisible: boolean): void;
    containsZClip(): boolean;
    /**
     * Determines whether the given points fall inside or outside the set. If this set is defined by masking planes,
     * will check the mask planes only, provided that ignoreMasks is false. Otherwise, will check the clipplanes member.
     */
    classifyPointContainment(points: Point3d[], ignoreMasks: boolean): ClipPlaneContainment;
    static isLimitEdge(limitValue: number, point0: Point3d, point1: Point3d): boolean;
    /** Add an unbounded plane set (a) to the right of the line defined by two points, and (b) "ahead" of
     *  the start point (set is pushed to the set located within the PlaneSetParamsCache object given). This method can be used
     *  in the development of ClipShapes, by ClipShapes.
     */
    static addOutsideEdgeSetToParams(x0: number, y0: number, x1: number, y1: number, pParams: PlaneSetParamsCache, isInvisible?: boolean): void;
    /**
     * Add a plane set representative of a 3d object based on the given array of 2d points and 3d parameters of the PlaneSetParamsCache,
     * where the returned value is stored in the params object given. The original points array given is not modified. This method
     * can be used in the development of ClipShapes, by ClipShapes.
     */
    static addShapeToParams(shape: Point3d[], pFlags: number[], pParams: PlaneSetParamsCache): void;
}
/**
 * A clipping volume defined by a shape (an array of 3d points using only x and y dimensions).
 * May be given either a ClipPlaneSet to store directly, or an array of polygon points as well as other parameters
 * for parsing clipplanes from the shape later.
 */
export declare class ClipShape extends ClipPrimitive {
    protected _polygon: Point3d[];
    protected _zLow: number | undefined;
    protected _zHigh: number | undefined;
    protected _isMask: boolean;
    protected _zLowValid: boolean;
    protected _zHighValid: boolean;
    protected _bCurve: BSplineCurve3d | undefined;
    protected _transformValid: boolean;
    protected _transformFromClip: Transform | undefined;
    protected _transformToClip: Transform | undefined;
    protected constructor(polygon?: Point3d[], zLow?: number, zHigh?: number, transform?: Transform, isMask?: boolean, invisible?: boolean);
    /** Returns true if this ClipShape is marked as invisible. */
    readonly invisible: boolean;
    /** Return this transformFromClip, which may be undefined. */
    readonly transformFromClip: Transform | undefined;
    /** Return this transformToClip, which may be undefined. */
    readonly transformToClip: Transform | undefined;
    /** Returns true if this ClipShape's transforms are currently set. */
    readonly transformValid: boolean;
    /** Returns true if this ClipShape's lower z boundary is set. */
    readonly zLowValid: boolean;
    /** Returns true if this ClipShape's upper z boundary is set. */
    readonly zHighValid: boolean;
    /** Return this zLow, which may be undefined. */
    readonly zLow: number | undefined;
    /** Return this zHigh, which may be undefined. */
    readonly zHigh: number | undefined;
    /** Returns a reference to this ClipShape's polygon array. */
    readonly polygon: Point3d[];
    /** Return this bspline curve, which may be undefined. */
    readonly bCurve: BSplineCurve3d | undefined;
    /** Returns true if this ClipShape is a masking set. */
    readonly isMask: boolean;
    /**
     * Returns true if this ClipShape has been parsed, and currently contains a ClipPlaneSet in its cache.
     * This does not take into account validity of the ClipPlanes, given that the polygon array might have changed.
     */
    arePlanesDefined(): boolean;
    /** Sets the polygon points array of this ClipShape to the array given (by reference). */
    setPolygon(polygon: Point3d[]): void;
    /**
     * If the clip plane set is already stored, return it. Otherwise, parse the clip planes out of the shape
     * defined by the set of polygon points.
     */
    fetchClipPlanesRef(): UnionOfConvexClipPlaneSets;
    /**
     * If the masking clip plane set is already stored, return it. Otherwise, parse the mask clip planes out of the shape
     * defined by the set of polygon points.
     */
    fetchMaskPlanesRef(): UnionOfConvexClipPlaneSets | undefined;
    /**
     * Initialize the members of the ClipShape class that may at times be undefined.
     * zLow and zHigh default to Number.MAX_VALUE, and the transform defaults to an identity transform
     */
    initSecondaryProps(isMask: boolean, zLow?: number, zHigh?: number, transform?: Transform): void;
    toJSON(): any;
    static fromJSON(json: any, result?: ClipShape): ClipShape | undefined;
    /** Returns a new ClipShape that is a deep copy of the ClipShape given */
    static createFrom(other: ClipShape, result?: ClipShape): ClipShape;
    /** Create a new ClipShape from an array of points that make up a 2d shape (stores a deep copy of these points). */
    static createShape(polygon?: Point3d[], zLow?: number, zHigh?: number, transform?: Transform, isMask?: boolean, invisible?: boolean, result?: ClipShape): ClipShape | undefined;
    /**
     * Create a ClipShape that exists as a 3 dimensional box of the range given. Optionally choose to
     * also store this shape's zLow and zHigh members from the range through the use of a ClipMask.
     */
    static createBlock(extremities: Range3d, clipMask: ClipMask, isMask?: boolean, invisible?: boolean, transform?: Transform, result?: ClipShape): ClipShape;
    /** Creates a new ClipShape with undefined members and a polygon points array of zero length. */
    static createEmpty(isMask?: boolean, invisible?: boolean, transform?: Transform, result?: ClipShape): ClipShape;
    /** Checks to ensure that the member polygon has an area, and that the polygon is closed. */
    readonly isValidPolygon: boolean;
    /** Returns a deep copy of this instance of ClipShape, storing in an optional result */
    clone(result?: ClipShape): ClipShape;
    /** Given the current polygon data, parses clip planes that together form an object, storing the result in the set given, either clipplanes or maskplanes. */
    private parseClipPlanes;
    /** Given a start and end point, populate the given UnionOfConvexClipPlaneSets with ConvexClipPlaneSets defining the bounded region of linear planes. Returns true if successful. */
    private parseLinearPlanes;
    /** Given a convex polygon defined as an array of points, populate the given UnionOfConvexClipPlaneSets with ConvexClipPlaneSets defining the bounded region. Returns true if successful. */
    private parseConvexPolygonPlanes;
    /** Given a concave polygon defined as an array of points, populate the given UnionOfConvexClipPlaneSets with multiple ConvexClipPlaneSets defining the bounded region. Returns true if successful. */
    private parseConcavePolygonPlanes;
    /** Get the 3-dimensional range that this combination of ClipPlanes bounds in space. Returns the range/result
     *  if successful, otherwise, returns undefined. Transform will only be used for transforming the polygon points if clipplanes/maskplanes
     *  have not yet been set. Otherwise, we return the range of the planes without an applied transform.
     */
    getRange(returnMaskRange?: boolean, transform?: Transform, result?: Range3d): Range3d | undefined;
    /** Return true if the point lies inside/on this polygon (or not inside/on if this polygon is a mask). Otherwise, return false. */
    pointInside(point: Point3d, onTolerance?: number): boolean;
    transformInPlace(transform: Transform): boolean;
    multiplyPlanesTimesMatrix(matrix: Matrix4d): boolean;
    readonly isXYPolygon: boolean;
    /** Transform the input point using this instance's transformToClip member */
    performTransformToClip(point: Point3d): void;
    /** Transform the input point using this instance's transformFromClip member */
    performTransformFromClip(point: Point3d): void;
}
//# sourceMappingURL=ClipPrimitive.d.ts.map