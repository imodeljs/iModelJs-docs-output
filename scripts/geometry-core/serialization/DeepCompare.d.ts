/** @module Serialization */
/**
 * Utilities to compare json objects by search through properties.
 * @internal
 */
export declare class DeepCompare {
    /** Statistical accumulations during searchers. */
    typeCounts: {
        "numbers": number;
        "arrays": number;
        "functions": number;
        "objects": number;
        "strings": number;
        "booleans": number;
        "undefined": number;
    };
    /** Counts of property names encountered during various searches. */
    propertyCounts: {
        [key: string]: any;
    };
    /** Array of error descriptions. */
    errorTracker: any[];
    /** relative tolerance for declaring numeric values equal. */
    numberRelTol: number;
    constructor(numberRelTol?: number);
    /** test if _a and _b are within tolerance.
     * * If not, push error message to errorTracker.
     */
    compareNumber(_a: number, _b: number): boolean;
    private compareArray;
    private compareObject;
    private announce;
    /** Main entry for comparing deep json objects.
     * * errorTracker, typeCounts, and propertyCounts are cleared.
     */
    compare(a: any, b: any, tolerance?: number): boolean;
    private compareInternal;
}
//# sourceMappingURL=DeepCompare.d.ts.map