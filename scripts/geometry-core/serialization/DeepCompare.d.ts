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
    private compareArray;
    private compareObject;
    private announce;
    compare(a: any, b: any, tolerance?: number): boolean;
    private compareInternal;
}
//# sourceMappingURL=DeepCompare.d.ts.map