/** @module Numerics */
import { BeJSONFunctions, Angle } from "../Geometry";
export declare class Complex implements BeJSONFunctions {
    private _myX;
    x: any;
    private _myY;
    y: any;
    constructor(x?: number, y?: number);
    set(x?: number, y?: number): void;
    setFrom(other: Complex): void;
    clone(): Complex;
    isAlmostEqual(other: Complex): boolean;
    static create(x?: number, y?: number, result?: Complex): Complex;
    plus(other: Complex, result?: Complex): Complex;
    minus(other: Complex, result?: Complex): Complex;
    times(other: Complex, result?: Complex): Complex;
    /** multiply {this * x+i*y}. That is, the second Complex value exists via the args without being formally created as an instance. */
    timesXY(x: number, y: number, result?: Complex): Complex;
    magnitude(): number;
    angle(): Angle;
    distance(other: Complex): number;
    magnitudeSquared(): number;
    divide(other: Complex, result?: Complex): Complex | undefined;
    sqrt(result?: Complex): Complex;
    setFromJSON(json?: any): void;
    static fromJSON(json?: any): Complex;
    /**
     * Convert an Complex to a JSON object.
     * @return {*} [x,y]
     */
    toJSON(): any;
}
//# sourceMappingURL=Complex.d.ts.map