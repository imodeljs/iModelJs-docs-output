/** @module Serialization */
/** Comparison utilities */
export declare class DeepCompare {
    numberRelTol: number;
    typeCounts: {
        "numbers": number;
        "arrays": number;
        "functions": number;
        "objects": number;
        "strings": number;
        "booleans": number;
        "undefined": number;
    };
    propertyCounts: {
        [key: string]: any;
    };
    errorTracker: any[];
    constructor(numberRelTol?: number);
    compareNumber(_a: number, _b: number): boolean;
    private compareArray(a, b);
    private compareObject(a, b);
    private announce(value);
    compare(a: any, b: any, tolerance?: number): boolean;
    private compareInternal(a, b);
}
