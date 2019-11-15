import { ConvexClipPlaneSet } from "./ConvexClipPlaneSet";
import { ClipPlaneContainment } from "./ClipUtils";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { UnionOfConvexClipPlaneSets } from "./UnionOfConvexClipPlaneSets";
/**
 * Bit mask type for referencing subsets of 6 planes of range box.
 * @public
 */
export declare enum ClipMaskXYZRangePlanes {
    /** no planes */
    None = 0,
    /** low x plane */
    XLow = 1,
    /** high x plane */
    XHigh = 2,
    /** low y plane */
    YLow = 4,
    /** high y plane */
    YHigh = 8,
    /** low z plane */
    ZLow = 16,
    /** high z plane */
    ZHigh = 32,
    /** all x and y planes, neither z plane */
    XAndY = 15,
    /** all 6 planes */
    All = 63
}
/**
 * * ClipPrimitive is a base class for clipping implementations that use
 *   * A ClipPlaneSet designated "clipPlanes"
 *   * an "invisible" flag
 * * When constructed directly, objects of type ClipPrimitive (directly, not through a derived class) will have just planes
 * * Derived classes (e.g. ClipShape) carry additional data of a swept shape.
 * * ClipPrimitive can be constructed with no planes.
 *     * Derived class is responsible for filling the plane sets.
 *     * At discretion of derived classes, plane construction can be done at construction time or "on demand when" queries call `ensurePlaneSets ()`
 * * ClipPrimitive can be constructed with planes (and no derived class).
 * @public
 */
export declare class ClipPrimitive {
    /** The (union of) convex regions. */
    protected _clipPlanes?: UnionOfConvexClipPlaneSets;
    /** If true, pointInside inverts the sense of the pointInside for the _clipPlanes */
    protected _invisible: boolean;
    /** Get a reference to the `UnionOfConvexClipPlaneSets`.
     *  * It triggers construction of the sets by `this.ensurePlaneSets()`.
     *  * Derived class typically caches the set on the first such call.
     */
    fetchClipPlanesRef(): UnionOfConvexClipPlaneSets | undefined;
    /** Ask if this primitive is a hole. */
    readonly invisible: boolean;
    protected constructor(planeSet?: UnionOfConvexClipPlaneSets | undefined, isInvisible?: boolean);
    /**
     * Create a ClipPrimitive, capturing the supplied plane set as the clip planes.
     * @param planes clipper
     * @param isInvisible true to invert sense of the test
     */
    static createCapture(planes: UnionOfConvexClipPlaneSets | ConvexClipPlaneSet | undefined, isInvisible?: boolean): ClipPrimitive;
    /** Emit json form of the clip planes */
    toJSON(): any;
    /**
     * Returns true if the planes are present.
     * * This can be false (for instance) if a ClipShape is holding a polygon but has not yet been asked to construct the planes.
     */
    arePlanesDefined(): boolean;
    /** Return a deep clone  */
    clone(): ClipPrimitive;
    /**
     * * trigger (if needed)  computation of plane sets (if applicable) in the derived class.
     * * Base class is no op.
     * * In derived class, on first call create planes sets from defining data (e.g. swept shape).
     * * In derived class, if planes are present leave them alone.
     */
    ensurePlaneSets(): void;
    /** Return true if the point lies inside/on this polygon (or not inside/on if this polygon is a mask). Otherwise, return false.
     * * Note that a derived class may choose to (a) implement its own test using its defining data, or (b) accept this implementation using planes that it inserted in the base class.
     */
    pointInside(point: Point3d, onTolerance?: number): boolean;
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     */
    multiplyPlanesByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /** Apply a transform to the clipper (e.g. transform all planes) */
    transformInPlace(transform: Transform): boolean;
    /** Sets both the clip plane set and the mask set visibility */
    setInvisible(invisible: boolean): void;
    /**
     * Return true if any plane of the primary clipPlanes has (a) non-zero z component in its normal vector and (b) finite distance from origin.
     */
    containsZClip(): boolean;
    /**
     * Quick test of whether the given points fall completely inside or outside.
     * @param points points to test
     * @param ignoreInvisibleSetting if true, do the test with the clip planes and return that, ignoring the invisible setting.
     */
    classifyPointContainment(points: Point3d[], ignoreInvisibleSetting: boolean): ClipPlaneContainment;
    /** Promote json object form to class instance
     * * First try to convert to a ClipShape
     * * then try as a standalone instance of the base class ClipPrimitive.
     */
    static fromJSON(json: any): ClipPrimitive | undefined;
    /** Specific converter producing the base class ClipPrimitive. */
    static fromJSONClipPrimitive(json: any): ClipPrimitive | undefined;
}
/**
 * A clipping volume defined by a shape (an array of 3d points using only x and y dimensions).
 * May be given either a ClipPlaneSet to store directly, or an array of polygon points as well as other parameters
 * for parsing clipplanes from the shape later.
 * @public
 */
export declare class ClipShape extends ClipPrimitive {
    /** Points of the polygon, in the xy plane of the local coordinate system.  */
    protected _polygon: Point3d[];
    /** optional low z (in local coordinates) */
    protected _zLow?: number;
    /** optional high z (in local coordinates) */
    protected _zHigh?: number;
    /** true if this is considered a hole (keep geometry outside of the polygon.) */
    protected _isMask: boolean;
    /** transform from local to world */
    protected _transformFromClip?: Transform;
    /** Transform from world to local */
    protected _transformToClip?: Transform;
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
    /** Return true if this ClipShape has a local to world transform */
    readonly transformIsValid: boolean;
    /** Return this zLow, which may be undefined. */
    readonly zLow: number | undefined;
    /** Return this zHigh, which may be undefined. */
    readonly zHigh: number | undefined;
    /** Returns a reference to this ClipShape's polygon array. */
    readonly polygon: Point3d[];
    /** Returns true if this ClipShape is a masking set. */
    readonly isMask: boolean;
    /** Sets the polygon points array of this ClipShape to the array given (by reference). */
    setPolygon(polygon: Point3d[]): void;
    /**
     * * If the ClipShape's associated `UnionOfConvexClipPlaneSets` is defined, do nothing.
     * * If the ClipShape's associated `UnionOfConvexClipPlaneSets` is undefined, generate it from the `ClipShape` and transform.
     */
    ensurePlaneSets(): void;
    /**
     * Initialize the members of the ClipShape class that may at times be undefined.
     * zLow and zHigh default to Number.MAX_VALUE, and the transform defaults to an identity transform
     */
    initSecondaryProps(isMask: boolean, zLow?: number, zHigh?: number, transform?: Transform): void;
    /** emit json object form */
    toJSON(): any;
    /** parse `json` to a clip shape. */
    static fromClipShapeJSON(json: any, result?: ClipShape): ClipShape | undefined;
    /** Returns a new ClipShape that is a deep copy of the ClipShape given */
    static createFrom(other: ClipShape, result?: ClipShape): ClipShape;
    /** Create a new ClipShape from an array of points that make up a 2d shape (stores a deep copy of these points). */
    static createShape(polygon?: Point3d[], zLow?: number, zHigh?: number, transform?: Transform, isMask?: boolean, invisible?: boolean, result?: ClipShape): ClipShape | undefined;
    /**
     * Create a ClipShape that exists as a 3 dimensional box of the range given. Optionally choose to
     * also store this shape's zLow and zHigh members from the range through the use of a RangePlaneBitMask.
     */
    static createBlock(extremities: Range3d, clipMask: ClipMaskXYZRangePlanes, isMask?: boolean, invisible?: boolean, transform?: Transform, result?: ClipShape): ClipShape;
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
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     */
    multiplyPlanesByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /** Apply `transform` to the local to world (`transformFromClip`) transform.
     * * The world to local transform (`transformToClip` is recomputed from the (changed) `transformToClip`
     * * the transform is passed to the base class to be applied to clip plane form of the clipper.
     */
    transformInPlace(transform: Transform): boolean;
    /** Return true if
     * * at least one point is defined
     * * The local to world transform (transformFromClip) either
     *   * is undefined
     *   * has no xy parts in its column Z (local frame Z is parallel to global Z)
     */
    readonly isXYPolygon: boolean;
    /** Transform the input point using this instance's transformToClip member */
    performTransformToClip(point: Point3d): void;
    /** Transform the input point using this instance's transformFromClip member */
    performTransformFromClip(point: Point3d): void;
}
//# sourceMappingURL=ClipPrimitive.d.ts.map