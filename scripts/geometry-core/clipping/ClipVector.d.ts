/** @module CartesianGeometry */
import { ClipPrimitive } from "./ClipPrimitive";
import { ClipPlaneContainment } from "./ClipUtils";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
/** Class holding an array structure of shapes defined by `ClipPrimitive`
 * * The `ClipVector` defines an intersection of the member `ClipPrimitive` regions.
 * * In the most common usage, one of the `ClipPrimitive` will be an outer region, and all others are holes with marker flag indicating that they outside of each hole is live.
 * @public
 */
export declare class ClipVector {
    private _clips;
    /** range acting as first filter.
     * * This is understood as overall range limit, not as precise planes.
     * * applying any rotation to the whole ClipVector generally expands this range, rather than exactly transforming its planes.
     */
    boundingRange: Range3d;
    /** Returns a reference to the array of ClipShapes. */
    readonly clips: ClipPrimitive[];
    private constructor();
    /** Returns true if this ClipVector contains a ClipPrimitive. */
    readonly isValid: boolean;
    /** Create a ClipVector with an empty set of ClipShapes. */
    static createEmpty(result?: ClipVector): ClipVector;
    /** Create a ClipVector from an array of ClipPrimitives (or derived classes) (capture the pointers) */
    static createCapture(clips: ClipPrimitive[], result?: ClipVector): ClipVector;
    /** Create a ClipVector from (clones of) an array of ClipPrimitives */
    static create(clips: ClipPrimitive[], result?: ClipVector): ClipVector;
    /** Create a deep copy of another ClipVector */
    clone(result?: ClipVector): ClipVector;
    /** Parse this ClipVector into a JSON object. */
    toJSON(): any;
    /** Parse a JSON object into a new ClipVector. */
    static fromJSON(json: any, result?: ClipVector): ClipVector;
    /** Empties out the array of ClipShapes. */
    clear(): void;
    /** Append a deep copy of the given ClipPrimitive to this ClipVector. */
    appendClone(clip: ClipPrimitive): void;
    /** Append a reference of the given ClipPrimitive to this ClipVector. */
    appendReference(clip: ClipPrimitive): void;
    /** Create and append a new ClipPrimitive to the array given a shape as an array of points. Returns true if successful. */
    appendShape(shape: Point3d[], zLow?: number, zHigh?: number, transform?: Transform, isMask?: boolean, invisible?: boolean): boolean;
    /** Returns true if the given point lies inside all of this ClipVector's ClipShapes (by rule of intersection). */
    pointInside(point: Point3d, onTolerance?: number): boolean;
    /** Transforms this ClipVector to a new coordinate-system.
     * Note that if the transform has rotate and scale the boundingRange member expands.
     * Returns true if successful.
     */
    transformInPlace(transform: Transform): boolean;
    /**
     * A simple way of packaging this ClipVector's ClipShape points into a multidimensional array, while also
     * taking into account each ClipPrimitive's individual transforms.
     *
     * ClipPrimitives OTHER THAN ClipShape are ignored.
     *
     * Information out:
     *  - All of the loop points are stored in the multidimensional Point3d array given (will return unchanged upon failure)
     *  - If given a transform, will be set from the transformFromClip of the first ClipPrimitive
     *  - The ClipMask of the final ClipPrimitive is stored in the returned array at index 0
     *  - The last valid zLow found is stored in the returned array at index 1
     *  - The last valid zHigh found is stored in the returned array at index 2
     */
    extractBoundaryLoops(loopPoints: Point3d[][], transform?: Transform): number[];
    /** Sets this ClipVector and all of its members to the visibility specified. */
    setInvisible(invisible: boolean): void;
    /** For every clip, parse the member point array into the member clip plane object (only for clipPlanes member, not the mask) */
    parseClipPlanes(): void;
    /**
     * Multiply all ClipPlanes DPoint4d by matrix.
     * @param matrix matrix to apply.
     * @param invert if true, use in verse of the matrix.
     * @param transpose if true, use the transpose of the matrix (or inverse, per invert parameter)
     * * Note that if matrixA is applied to all of space, the matrix to send to this method to get a corresponding effect on the plane is the inverse transpose of matrixA
     * * Callers that will apply the same matrix to many planes should pre-invert the matrix for efficiency.
     * * Both params default to true to get the full effect of transforming space.
     * @param matrix matrix to apply
     * @returns false if matrix inversion fails.
     */
    multiplyPlanesByMatrix4d(matrix: Matrix4d, invert?: boolean, transpose?: boolean): boolean;
    /**
     * Determines whether the given points fall inside or outside this set of ClipShapes. If any set is defined by masking planes,
     * checks the mask planes only, provided that ignoreMasks is false. Otherwise, checks the _clipplanes member.
     */
    classifyPointContainment(points: Point3d[], ignoreMasks?: boolean): ClipPlaneContainment;
    /**
     * Determines whether a 3D range lies inside or outside this set of ClipShapes. If any set is defined by masking planes,
     * checks the mask planes only, provided that ignoreMasks is false. Otherwise, checks the _clipplanes member.
     */
    classifyRangeContainment(range: Range3d, ignoreMasks: boolean): ClipPlaneContainment;
    /**
     * For an array of points (making up a LineString), tests whether the segment between each point lies inside the ClipVector.
     * If true, returns true immediately.
     */
    isAnyLineStringPointInside(points: Point3d[]): boolean;
    /** Note: Line segments are used to represent 1 dimensional intervals here, rather than segments. */
    sumSizes(intervals: Segment1d[], begin: number, end: number): number;
    private static readonly _TARGET_FRACTION_SUM;
    /**
     * For an array of points that make up a LineString, develops a line segment between each point pair,
     * and returns true if all segments lie inside this ClipVector.
     */
    isLineStringCompletelyContained(points: Point3d[]): boolean;
}
//# sourceMappingURL=ClipVector.d.ts.map