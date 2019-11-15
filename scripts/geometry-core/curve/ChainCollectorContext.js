"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const CurveCollection_1 = require("./CurveCollection");
const CurvePrimitive_1 = require("./CurvePrimitive");
const Path_1 = require("./Path");
/**
 * Manage a growing array of arrays of curve primitives that are to be joined "head to tail" in paths.
 * * The caller makes a sequence of calls to announce individual primitives.
 * * Ordering so "head to tail" is obvious is the caller's responsibility.
 * * This class manages the tedium of distinguishing isolated primitives, paths, and multiple paths.
 * * Construction logic makes each chain internally continuous, i.e. suitable for being a Path.
 * * Chaining only occurs between primitives that are consecutive in the announcement stream.
 * * Usage pattern is
 *   * initialization: `context = new ChainCollectorContext (makeClones: boolean)`
 *   * many times: `   context.announceCurvePrimitive (primitive)`
 *   * end:        ` result = context.grabResults ()`
 * @internal
 */
class ChainCollectorContext {
    /** Initialize with an empty array of chains.
     * @param makeClones if true, all CurvePrimitives sent to `announceCurvePrimitive` is immediately cloned.  If false, the reference to the original curve is maintained.
     */
    constructor(makeClones) {
        this._chains = [];
        this._makeClones = makeClones;
    }
    /**
     * Push a new chain with an optional first primitive.
     */
    pushNewChain(primitive) {
        const chain = [];
        if (primitive)
            chain.push(primitive);
        this._chains.push(chain);
    }
    findOrCreateTailChain() {
        if (this._chains.length === 0)
            this.pushNewChain();
        return this._chains[this._chains.length - 1];
    }
    /** Announce a curve primitive
     * * If possible, append it to the current chain.
     * * Otherwise start a new chain.
     */
    announceCurvePrimitive(candidate) {
        if (candidate) {
            if (this._makeClones) {
                const candidate1 = candidate.clone();
                if (!candidate1 || !(candidate1 instanceof CurvePrimitive_1.CurvePrimitive))
                    return;
                this.transferMarkup(candidate, candidate1);
                candidate = candidate1;
            }
            const activeChain = this.findOrCreateTailChain();
            if (activeChain.length === 0 || !ChainCollectorContext.needBreakBetweenPrimitives(activeChain[activeChain.length - 1], candidate))
                activeChain.push(candidate);
            else
                this.pushNewChain(candidate);
        }
    }
    /** Transfer markup (e.g. isCutAtStart, isCutAtEnd) from source to destination */
    transferMarkup(source, dest) {
        if (source && dest) {
            dest.startCut = source.startCut;
            dest.endCut = source.endCut;
        }
    }
    /** turn an array of curve primitives into the simplest possible strongly typed curve structure.
     * * The input array is assumed to be connected appropriately to act as the curves of a Path.
     * * When a path is created the curves array is CAPTURED.
     */
    promoteArrayToCurves(curves) {
        if (curves.length === 0)
            return undefined;
        if (curves.length === 1)
            return curves[0];
        return Path_1.Path.createArray(curves);
    }
    /** Return the collected results, structured as the simplest possible type. */
    grabResult() {
        const chains = this._chains;
        if (chains.length === 0)
            return undefined;
        if (chains.length === 1)
            return this.promoteArrayToCurves(chains[0]);
        const bag = CurveCollection_1.BagOfCurves.create();
        for (const chain of chains) {
            const q = this.promoteArrayToCurves(chain);
            bag.tryAddChild(q);
        }
        return bag;
    }
    /** test if there is a break between primitiveA and primitiveB, due to any condition such as
     * * primitiveA.isCutAtEnd
     * * primitiveB.isCutAtStart
     * * physical gap between primitives.
     */
    static needBreakBetweenPrimitives(primitiveA, primitiveB, isXYOnly = false) {
        if (primitiveA === undefined)
            return true;
        if (primitiveB === undefined)
            return true;
        if (primitiveA.endCut !== undefined)
            return true;
        if (primitiveB.startCut !== undefined)
            return true;
        ChainCollectorContext._workPointA = primitiveA.endPoint(ChainCollectorContext._workPointA);
        ChainCollectorContext._workPointB = primitiveA.startPoint(ChainCollectorContext._workPointB);
        return isXYOnly
            ? ChainCollectorContext._workPointA.isAlmostEqualXY(ChainCollectorContext._workPointB)
            : ChainCollectorContext._workPointA.isAlmostEqual(ChainCollectorContext._workPointB);
    }
}
exports.ChainCollectorContext = ChainCollectorContext;
//# sourceMappingURL=ChainCollectorContext.js.map