import { Point2d } from "../geometry3d/Point2dVector2d";
import { Range2d } from "../geometry3d/Range";
import { IndexedPolyface } from "./Polyface";
/** module Polyface */
/**
 * Data for a face in a polyface containing facets.
 * This is built up cooperatively by the PolyfaceBuilder and its
 * callers, and stored as a FaceData array in PolyfaceData.
 * @public
 */
export declare class FacetFaceData {
    private _paramDistanceRange;
    private _paramRange;
    /** (property accessor) Return a reference to the distance-scaled parameter range. */
    readonly paramDistanceRange: Range2d;
    /** (property accessor) Return a reference to the parameter range. */
    readonly paramRange: Range2d;
    private constructor();
    /** Create a FacetFaceData with null ranges. */
    static createNull(): FacetFaceData;
    /** Create a deep copy of this FacetFaceData object. */
    clone(result?: FacetFaceData): FacetFaceData;
    /** Restore this FacetFaceData to its null constructor state. */
    setNull(): void;
    /** Return distance-based parameter from stored parameter value. */
    convertParamXYToDistance(x: number, y: number, result?: Point2d): Point2d;
    /** Return normalized (0-1) parameter from stored parameter value. */
    convertParamXYToNormalized(x: number, y: number, result?: Point2d): Point2d;
    /** Return distance-based parameter from stored parameter value. */
    convertParamToDistance(param: Point2d, result?: Point2d): Point2d;
    /** Return normalized (0-1) parameter from stored parameter value. */
    convertParamToNormalized(param: Point2d, result?: Point2d): Point2d;
    /** Scale distance parameters. */
    scaleDistances(distanceScale: number): void;
    /**
     * Sets the param and paramDistance range of this FacetFaceData based on the newly terminated facets that make it up.
     * Takes the polyface itself, the first and last indexes of the facets to be included in the face.
     * Returns true on success, false otherwise.
     */
    setParamDistanceRangeFromNewFaceData(polyface: IndexedPolyface, facetStart: number, facetEnd: number): boolean;
}
//# sourceMappingURL=FacetFaceData.d.ts.map