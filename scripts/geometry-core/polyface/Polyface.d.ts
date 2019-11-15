/** @module Polyface */
import { Point2d } from "../geometry3d/Point2dVector2d";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { GeometryQuery } from "../curve/GeometryQuery";
import { GeometryHandler } from "../geometry3d/GeometryHandler";
import { PolyfaceData } from "./PolyfaceData";
import { FacetFaceData } from "./FacetFaceData";
/**
 * A Polyface is n abstract mesh structure (of unspecified implementation) that provides a PolyfaceVisitor
 * to iterate over its facets.
 * @public
 */
export declare abstract class Polyface extends GeometryQuery {
    /** String name for schema properties */
    readonly geometryCategory = "polyface";
    /** Underlying polyface data. */
    data: PolyfaceData;
    protected constructor(data: PolyfaceData);
    /** create and return a visitor for this concrete polyface. */
    abstract createVisitor(_numWrap: number): PolyfaceVisitor;
    /** Return the flag indicating if the mesh display must assume both sides are visible. */
    /** set the flag indicating if the mesh display must assume both sides are visible. */
    twoSided: boolean;
    /**
       * Check validity of indices into a data array.
       * * It is valid to have  both indices and data undefined.
       * * It is NOT valid for just one to be defined.
       * * Index values at indices[indexPositionA <= i < indexPositionB] must be valid indices to the data array.
       * @param indices array of indices.
       * @param indexPositionA first index to test
       * @param indexPositionB one past final index to test
       * @param data data array.  Only its length is referenced.
       */
    static areIndicesValid(indices: number[] | undefined, indexPositionA: number, indexPositionB: number, data: any | undefined, dataLength: number): boolean;
    /**
     * Returns true if this polyface has no facets.
     */
    abstract readonly isEmpty: boolean;
}
/**
 * An `IndexedPolyface` is a set of facets which can have normal, param, and color arrays with independent point, normal, param, and color indices.
 * @public
 */
export declare class IndexedPolyface extends Polyface {
    /** Test if other is an instance of `IndexedPolyface` */
    isSameGeometryClass(other: any): boolean;
    /** Tests for equivalence between two IndexedPolyfaces. */
    isAlmostEqual(other: any): boolean;
    /**
     * Returns true if either the point array or the point index array is empty.
     */
    readonly isEmpty: boolean;
    /**
     * * apply the transform to points
     * * apply the (inverse transpose of) the matrix part to normals
     * * If determinant is negative, also
     *   * negate normals
     *   * reverse index order around each facet.
     * @param transform
     */
    tryTransformInPlace(transform: Transform): boolean;
    /** Return a deep clone. */
    clone(): IndexedPolyface;
    /** Return a deep clone with transformed points and normals */
    cloneTransformed(transform: Transform): IndexedPolyface;
    /** Reverse the order of indices around all facets. */
    reverseIndices(): void;
    /** Reverse the direction of all normal vectors. */
    reverseNormals(): void;
    /**
     * * index to the index array entries for a specific facet.
     * * the facet count is facetStart.length - 1
     * * facet [f] indices run from facetStart[f] to upper limit facetStart[f+1].
     * * Note the array is initialized with one entry.
     */
    protected _facetStart: number[];
    /**
     * * For facet i, _facetToFaceData[i] is the index of the faceData entry for the facet.
     * * _facetToFaceData has one entry per facet.
     */
    protected _facetToFaceData: number[];
    /** return face data using a facet index. This is the REFERENCE to the FacetFaceData, not a copy. Returns undefined if none found. */
    tryGetFaceData(i: number): FacetFaceData | undefined;
    /**
     * Constructor for a new polyface.
     * @param data PolyfaceData arrays to capture.
     * @param facetStart optional array of facet start indices (e.g. known during clone)
     * @param facetToFacetData optional array of face identifiers (e.g. known during clone)
     */
    protected constructor(data: PolyfaceData, facetStart?: number[], facetToFaceData?: number[]);
    /**
     * * Add facets from source to this polyface.
     * * optionally reverse the facets.
     * * optionally apply a transform to points.
     * * will only copy param, normal, color, and face data if we are already tracking them AND/OR the source contains them
     */
    addIndexedPolyface(source: IndexedPolyface, reversed: boolean, transform: Transform | undefined): void;
    /** Return the total number of param indices in zero-terminated style, which includes
     * * all the indices in the packed zero-based table
     * * one additional index for the zero-terminator of each facet.
     * @note Note that all index arrays (point, normal, param, color) have the same counts, so there
     * is not a separate query for each of them.
     */
    readonly zeroTerminatedIndexCount: number;
    /** Create an empty facet set, with coordinate and index data to be supplied later.
     * @param needNormals true if normals will be constructed
     * @param needParams true if uv parameters will be constructed
     * @param needColors true if colors will e constructed.
     */
    static create(needNormals?: boolean, needParams?: boolean, needColors?: boolean, twoSided?: boolean): IndexedPolyface;
    /** add (a clone of ) a point. return its 0 based index.
     * @param point point coordinates
     * @param priorIndex optional index of prior point to check for repeated coordinates
     * @returns Returns the zero-based index of the added or reused point.
     */
    addPoint(point: Point3d, priorIndex?: number): number;
    /** add a point.
     * @returns Returns the zero-based index of the added point.
     */
    addPointXYZ(x: number, y: number, z: number): number;
    /** Add a uv param.
     * @returns 0-based index of the added param.
     */
    addParam(param: Point2d): number;
    /** Add a uv parameter to the parameter array.
     * @param priorIndexA first index to check for possible duplicate value.
     * @param priorIndexB second index to check for possible duplicate value.
     * @returns 0-based index of the added or reused param.
     */
    addParamUV(u: number, v: number, priorIndexA?: number, priorIndexB?: number): number;
    /** Add a normal vector
     * @param priorIndexA first index to check for possible duplicate value.
     * @param priorIndexB second index to check for possible duplicate value.
     * @returns 0-based index of the added or reused normal.
     */
    addNormal(normal: Vector3d, priorIndexA?: number, priorIndexB?: number): number;
    /** Add a normal vector given by direct coordinates
     * @returns 0-based index of the added or reused param.
     */
    addNormalXYZ(x: number, y: number, z: number): number;
    /** Add a color
     * @returns 0-based index of the added or reused color.
     */
    addColor(color: number): number;
    /** Add a point index with edge visibility flag. */
    addPointIndex(index: number, visible?: boolean): void;
    /** Add a normal index */
    addNormalIndex(index: number): void;
    /** Add a param index */
    addParamIndex(index: number): void;
    /** Add a color index */
    addColorIndex(index: number): void;
    /** clean up the open facet.  return the returnValue (so caller can easily return cleanupOpenFacet("message")) */
    cleanupOpenFacet(): void;
    /** announce the end of construction of a facet.
     *
     * * The "open" facet is checked for:
     *
     * **  Same number of indices among all active index arrays --  point, normal, param, color
     * **  All indices are within bounds of the respective data arrays.
     * *  in error cases, all index arrays are trimmed back to the size when previous facet was terminated.
     * *  "undefined" return is normal.   Any other return is a description of an error.
     */
    terminateFacet(validateAllIndices?: boolean): any;
    /**
     * All terminated facets added since the declaration of the previous face
     * will be grouped into a new face with their own 2D range.
     */
    /** (read-only property) number of facets */
    readonly facetCount: number;
    /** (read-only property) number of faces */
    readonly faceCount: number;
    /** (read-only property) number of points */
    readonly pointCount: number;
    /** (read-only property) number of colors */
    readonly colorCount: number;
    /** (read-only property) number of parameters */
    readonly paramCount: number;
    /** (read-only property) number of normals */
    readonly normalCount: number;
    /** Return the number of edges in a particular facet. */
    numEdgeInFacet(facetIndex: number): number;
    /** test if `index` is a valid facet index. */
    isValidFacetIndex(index: number): boolean;
    /** ASSUME valid facet index . .. return its start index in index arrays. */
    facetIndex0(index: number): number;
    /** ASSUME valid facet index . .. return its end index in index arrays. */
    facetIndex1(index: number): number;
    /** create a visitor for this polyface */
    createVisitor(numWrap?: number): PolyfaceVisitor;
    /** Return the range of (optionally transformed) points in this mesh. */
    range(transform?: Transform, result?: Range3d): Range3d;
    /** Extend `range` with coordinates from this mesh */
    extendRange(range: Range3d, transform?: Transform): void;
    /** Given the index of a facet, return the data pertaining to the face it is a part of. */
    getFaceDataByFacetIndex(facetIndex: number): FacetFaceData;
    /**
     * All terminated facets since the last face declaration will be mapped to a single new FacetFaceData object
     * using facetToFaceData[]. FacetFaceData holds the 2D range of the face. Returns true if successful, false otherwise.
     */
    setNewFaceData(endFacetIndex?: number): boolean;
    /** Second step of double dispatch:  call `handler.handleIndexedPolyface(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
}
/**
 * A PolyfaceVisitor manages data while walking through facets.
 *
 * * The polyface visitor holds data for one facet at a time.
 * * The caller can request the position in the addressed facets as a "readIndex."
 * * The readIndex value (as a number) is not promised to be sequential. (I.e. it might be a simple facet count or might be
 * @public
 */
export interface PolyfaceVisitor extends PolyfaceData {
    /** Load data for the facet with given index. */
    moveToReadIndex(index: number): boolean;
    /** Return  the readIndex of the currently loaded facet */
    currentReadIndex(): number;
    /** Load data for the next facet. */
    moveToNextFacet(): boolean;
    /** Reset to initial state for reading all facets sequentially with moveToNextFacet */
    reset(): void;
    /** Return the point index of vertex i within the currently loaded facet */
    clientPointIndex(i: number): number;
    /** Return the param index of vertex i within the currently loaded facet */
    clientParamIndex(i: number): number;
    /** Return the normal index of vertex i within the currently loaded facet */
    clientNormalIndex(i: number): number;
    /** Return the color index of vertex i within the currently loaded facet */
    clientColorIndex(i: number): number;
    /** Return the aux data index of vertex i within the currently loaded facet */
    clientAuxIndex(i: number): number;
    /** return the client polyface */
    clientPolyface(): Polyface;
    /** Set the number of vertices to replicate in visitor arrays. */
    setNumWrap(numWrap: number): void;
    /** clear the contents of all arrays.  Use this along with transferDataFrom methods to build up new facets */
    clearArrays(): void;
    /** transfer data from a specified index of the other visitor as new data in this visitor. */
    pushDataFrom(other: PolyfaceVisitor, index: number): void;
    /** transfer interpolated data from the other visitor.
     * * all data values are interpolated at `fraction` between `other` values at index0 and index1.
     */
    pushInterpolatedDataFrom(other: PolyfaceVisitor, index0: number, fraction: number, index1: number): void;
}
/**
 * An `IndexedPolyfaceVisitor` is an iterator-like object that "visits" facets of a mesh.
 * * The visitor extends a `PolyfaceData ` class, so it can at any time hold all the data of a single facet.
 * @public
 */
export declare class IndexedPolyfaceVisitor extends PolyfaceData implements PolyfaceVisitor {
    private _currentFacetIndex;
    private _nextFacetIndex;
    private _numWrap;
    private _numEdges;
    private _polyface;
    private constructor();
    /** Return the client polyface object. */
    clientPolyface(): Polyface;
    /** Set the number of vertices duplicated (e.g. 1 for start and end) in arrays in the visitor. */
    setNumWrap(numWrap: number): void;
    /** Return the number of edges in the current facet.
     * * Not that if this visitor has `numWrap` greater than zero, the number of edges is smaller than the number of points.
     */
    readonly numEdgesThisFacet: number;
    /** Create a visitor for iterating the facets of `polyface`, with indicated number of points to be added to each facet to produce closed point arrays
     * Typical wrap counts are:
     * * 0 -- leave the point arrays with "missing final edge"
     * * 1 -- add point 0 as closure point
     * * 2 -- add points 0 and 1 as closure and wrap point.  This is useful when vertex visit requires two adjacent vectors, e.g. for cross products.
     */
    static create(polyface: IndexedPolyface, numWrap: number): IndexedPolyfaceVisitor;
    /** Advance the iterator to a particular facet in the client polyface */
    moveToReadIndex(facetIndex: number): boolean;
    /** Advance the iterator to a the 'next' facet in the client polyface */
    moveToNextFacet(): boolean;
    /** Reset the iterator to start at the first facet of the polyface. */
    reset(): void;
    /**
     * Attempts to extract the distance parameter for the given vertex index on the current facet
     * Returns the distance parameter as a point. Returns undefined on failure.
     */
    tryGetDistanceParameter(index: number, result?: Point2d): Point2d | undefined;
    /**
     * Attempts to extract the normalized parameter (0,1) for the given vertex index on the current facet.
     * Returns the normalized parameter as a point. Returns undefined on failure.
     */
    tryGetNormalizedParameter(index: number, result?: Point2d): Point2d | undefined;
    /** Return the index (in the client polyface) of the current facet */
    currentReadIndex(): number;
    /** Return the point index of vertex i within the currently loaded facet */
    clientPointIndex(i: number): number;
    /** Return the param index of vertex i within the currently loaded facet */
    clientParamIndex(i: number): number;
    /** Return the normal index of vertex i within the currently loaded facet */
    clientNormalIndex(i: number): number;
    /** Return the color index of vertex i within the currently loaded facet */
    clientColorIndex(i: number): number;
    /** Return the aux data index of vertex i within the currently loaded facet */
    clientAuxIndex(i: number): number;
    /** clear the contents of all arrays.  Use this along with transferDataFrom methods to build up new facets */
    clearArrays(): void;
    /** transfer data from a specified index of the other visitor as new data in this visitor. */
    pushDataFrom(other: PolyfaceVisitor, index: number): void;
    /** transfer interpolated data from the other visitor.
     * * all data values are interpolated at `fraction` between `other` values at index0 and index1.
     */
    pushInterpolatedDataFrom(other: PolyfaceVisitor, index0: number, fraction: number, index1: number): void;
}
//# sourceMappingURL=Polyface.d.ts.map