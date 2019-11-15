import { IndexedXYZCollection } from "../geometry3d/IndexedXYZCollection";
import { BarycentricTriangle } from "../geometry3d/BarycentricTriangle";
import { Angle } from "../geometry3d/Angle";
/** @module Polyface */
/**
 * * Context for constructing triangulations between linestrings with dis-similar point counts and distribution.
 * @internal
 */
export declare class GreedyTriangulationBetweenLineStrings {
    private _vector1;
    private constructor();
    private _turnRadians;
    private isForwardVector;
    private isPlanarBase;
    /**
     * Starting at start in source, examine points to see how long they are close to being "in plane"
     * * child interval begins at parent.begin
     * * child interval end initializes at trialEnd and grows.
     * * child must be predefined by caller
     * * Return the accepted interval
     */
    private advanceToPlanarLimit;
    private _triangleA1?;
    private _triangleB1?;
    private _triangleA2?;
    private _triangleB2?;
    private _triangleA3?;
    private _triangleB3?;
    private _bestTriangle?;
    private _workTriangle?;
    /** evaluate aspect ratios to select heuristically best triangles with given index intervals.
     * (ASSUME NO DUPLICATES, as in caller.)
     */
    private addGreedy;
    private _xyzA;
    private _xyzB;
    private _forwardA;
    private _forwardB;
    private _crossA;
    private _crossB;
    /**
     * Working from start to finish, emit triangles with heuristic lookahead to get pleasing matching between the linestrings.
     * @param pointsA
     * @param pointsB
     * @param handler
     */
    emitTriangles(pointsA: IndexedXYZCollection, pointsB: IndexedXYZCollection, handler: (triangle: BarycentricTriangle) => void): void;
    /**
     * Run triangle logic on inputs with no duplicates.
     * @param pointsA
     * @param pointsB
     * @param handler
     */
    private emitTrianglesGo;
    /** Default angle for considering two vectors to be colinear */
    static defaultNearColinearAngle: Angle;
    static createContext(planarTurnAngle?: Angle): GreedyTriangulationBetweenLineStrings;
}
//# sourceMappingURL=GreedyTriangulationBetweenLineStrings.d.ts.map