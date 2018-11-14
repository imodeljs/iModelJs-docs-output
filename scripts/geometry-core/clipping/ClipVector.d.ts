/** @module CartesianGeometry */
import { ClipShape } from "./ClipPrimitive";
import { ClipPlaneContainment } from "./ClipUtils";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Segment1d } from "../geometry3d/Segment1d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix4d } from "../geometry4d/Matrix4d";
/** Class holding an array structure of shapes defined by clip plane sets */
export declare class ClipVector {
    private _clips;
    boundingRange: Range3d;
    /** Returns a reference to the array of ClipShapes. */
    readonly clips: ClipShape[];
    private constructor();
    /** Returns true if this ClipVector contains a ClipShape. */
    readonly isValid: boolean;
    /** Create a ClipVector with an empty set of ClipShapes. */
    static createEmpty(result?: ClipVector): ClipVector;
    /** Create a ClipVector from an array of ClipShapes */
    static createClipShapeRefs(clips: ClipShape[], result?: ClipVector): ClipVector;
    /** Create a ClipVector from an array of ClipShapes, each one becoming a deep copy. */
    static createClipShapeClones(clips: ClipShape[], result?: ClipVector): ClipVector;
    /** Create a deep copy of another ClipVector */
    static createFrom(donor: ClipVector, result?: ClipVector): ClipVector;
    /** Parse this ClipVector into a JSON object. */
    toJSON(): any;
    /** Parse a JSON object into a new ClipVector. */
    static fromJSON(json: any, result?: ClipVector): ClipVector;
    /** Returns a deep copy of this ClipVector (optionally stores it in the result param rather than create using new()) */
    clone(result?: ClipVector): ClipVector;
    /** Empties out the array of ClipShapes. */
    clear(): void;
    /** Append a deep copy of the given ClipShape to this ClipVector. */
    appendClone(clip: ClipShape): void;
    /** Append a reference of the given ClipShape to this ClipVector. */
    appendReference(clip: ClipShape): void;
    /** Create and append a new ClipPrimitive to the array given a shape as an array of points. Returns true if successful. */
    appendShape(shape: Point3d[], zLow?: number, zHigh?: number, transform?: Transform, isMask?: boolean, invisible?: boolean): boolean;
    /** Returns the three-dimensional range that this ClipVector spans, which may be null. */
    getRange(transform?: Transform, result?: Range3d): Range3d | undefined;
    /** Returns true if the given point lies inside all of this ClipVector's ClipShapes (by rule of intersection). */
    pointInside(point: Point3d, onTolerance?: number): boolean;
    /** Transforms this ClipVector to a new coordinate-system. Returns true if successful. */
    transformInPlace(transform: Transform): boolean;
    /**
     * A simple way of packaging this ClipVector's ClipShape points into a multidimensional array, while also
     * taking into account each ClipShape's individual transforms.
     *
     * Information out:
     *  - All of the loop points are stored in the multidimensional Point3d array given (will return unchanged upon failure)
     *  - If given a transform, will be set from the transformFromClip of the first ClipShape
     *  - The ClipMask of the final ClipShape is stored in the returned array at index 0
     *  - The last valid zLow found is stored in the returned array at index 1
     *  - The last valid zHigh found is stored in the returned array at index 2
     */
    extractBoundaryLoops(loopPoints: Point3d[][], transform?: Transform): number[];
    /** Sets this ClipVector and all of its members to the visibility specified. */
    setInvisible(invisible: boolean): void;
    /** For every clip, parse the member point array into the member clip plane object (only for clipPlanes member, not the mask) */
    parseClipPlanes(): void;
    /** Returns true if able to successfully multiply all member ClipShape planes by the matrix given. */
    multiplyPlanesTimesMatrix(matrix: Matrix4d): boolean;
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