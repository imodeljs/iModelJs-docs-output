"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const StrokeCountMap_1 = require("./StrokeCountMap");
const CurveCollection_1 = require("../CurveCollection");
const ParityRegion_1 = require("../ParityRegion");
const LineString3d_1 = require("../LineString3d");
const Loop_1 = require("../Loop");
const Point3dVector3d_1 = require("../../geometry3d/Point3dVector3d");
const Geometry_1 = require("../../Geometry");
// cspell:word remapa
/**
 * abstract methods for callbacks during sweeps of collections of StrokeCount Structures.
 * * A set of StrokeCountMaps are to be visited multiple times.
 * * The logic that controls the sweep is as below.
 * * The callback object controls the number of sweeps and can adapt its action to the respective sweeps.
 * * Note that a "false" from cb.startPass() terminates passes for this chainIndex and primitiveIndex, but all others exit the whole sequence.
 * * This logic occurs 2 or three levels deep
 *   * outer level is "chains".   Simple swept path or loops have only one outer; parity regions have one outer per loop of the parity region
 *   * second level is primitive within chain.
 *     * If the primitives in a set are "single component", second level is lowest.
 *        * startSweep() and endSweep() calls are two parameters, with undefined componentIndex
 *     * If the primitives in a set are multi-component, there is a third level looping through corresponding components.
 * `
 *    if (!cb.startSweeps (chainIndex, primitiveIndex, componentIndex))
 *      return false;
 *    for (let pass = 0;cb.startPass (pass); pass++){
 *      for (each map in working set)
 *            if (!cb.visit (pass, map)) return false;
 *       if (!cb.endPass ()) return false;
 *        }
 *      }
 * if (!cb.endSweeps (chainIndex, primitiveIndex, componentIndex)) return false;
 * return true;
 * `
 * @internal
 */
class StrokeCountMapMultipassVisitor {
    /**
     * called to announce the beginning of one or more sweeps through related StrokeCountMap's
     * @param chainIndex index of loop or path within the various contours.
     * @param primitiveIndex index of primitive within the loop or path.
     * @param componentIndex optional component index.
     * @returns the number of sweeps to perform.
     */
    startSweeps(_chainIndex, _primitiveIndex, _componentIndex) { return true; }
    /**
     * announce the end of handling for particular chainIndex and primitiveIndex;
     * @return true to continue outer loops.
     */
    endSweeps(_chainIndex, _primitiveIndex, _componentIndex) { return true; }
}
exports.StrokeCountMapMultipassVisitor = StrokeCountMapMultipassVisitor;
/**
 * * pass 1: determine max numStroke
 * * pass 2: impose max numStroke
 * @internal
 */
class StrokeCountMapVisitorApplyMaxCount extends StrokeCountMapMultipassVisitor {
    constructor() {
        super();
        this.myMap = StrokeCountMap_1.StrokeCountMap.createWithComponentIndex();
    }
    /** set up for a pass through corresponding maps. */
    startPass(pass) {
        if (pass === 0) {
            this.myMap.numStroke = 0;
            return true;
        }
        else if (pass === 1) {
            // nothing to change == numStroke will be applied to each primitive.
            return true;
        }
        // all other pass numbers are rejected ...
        return false;
    }
    /** visit one of the set of corresponding maps. */
    visit(pass, map) {
        if (pass === 0) {
            if (map.numStroke > this.myMap.numStroke)
                this.myMap.numStroke = map.numStroke;
            return true;
        }
        else if (pass === 1) {
            // apply the max from prior pass
            map.numStroke = this.myMap.numStroke;
            return true;
        }
        // no other pass values should happen -- canceled by startPass.
        return false;
    }
    endPass(_pass) { return true; }
}
exports.StrokeCountMapVisitorApplyMaxCount = StrokeCountMapVisitorApplyMaxCount;
/**
 * * pass 1: determine max curveLength among maps presented.
 * * pass 2: set the a0 and a1 values to 0 and that max distance
 * @internal
 */
class StrokeCountMapVisitorApplyMaxCurveLength extends StrokeCountMapMultipassVisitor {
    constructor() {
        super();
        this.maxCurveLength = 0.0;
    }
    /** set up for a pass through corresponding maps. */
    startPass(pass) {
        if (pass === 0) {
            this.maxCurveLength = 0;
            return true;
        }
        else if (pass === 1) {
            // nothing to change == numStroke will be applied to each primitive.
            return true;
        }
        // all other pass numbers are rejected ...
        return false;
    }
    /** visit one of the set of corresponding maps. */
    visit(pass, map) {
        if (pass === 0) {
            this.maxCurveLength = Geometry_1.Geometry.maxXY(map.curveLength, this.maxCurveLength);
            return true;
        }
        else if (pass === 1) {
            // apply the max from prior pass
            map.a0 = 0.0;
            map.a1 = this.maxCurveLength;
            return true;
        }
        // no other pass values should happen -- canceled by startPass.
        return false;
    }
    endPass(_pass) { return true; }
}
exports.StrokeCountMapVisitorApplyMaxCurveLength = StrokeCountMapVisitorApplyMaxCurveLength;
/**
 * class `StrokeCountChain` contains:
 * * `maps` = an array of `StrokeCountMap`
 * * `parent` = parent CurveCollection.
 *
 * An instance is normally created with either a `Path` or `Loop` as the parent.
 */
class StrokeCountChain {
    constructor(parent, options) {
        this.parent = parent;
        this.maps = [];
        this.options = options;
    }
    static createForCurveChain(chain, options) {
        const result = new StrokeCountChain(chain, options);
        result.parent = chain;
        // A chain can only contain primitives !!!!
        for (const p of chain.children) {
            p.computeAndAttachRecursiveStrokeCounts(options);
            if (p.strokeData)
                result.maps.push(p.strokeData);
        }
        return result;
    }
    getStrokes() {
        const ls = LineString3d_1.LineString3d.create();
        if (this.options) {
            if (this.options.needNormals || this.options.needParams) {
                ls.ensureEmptyFractions();
                ls.ensureEmptyDerivatives();
                ls.ensureEmptyUVParams();
            }
        }
        for (const m of this.maps) {
            if (m.primitive)
                m.primitive.addMappedStrokesToLineString3D(m, ls);
        }
        return ls;
    }
    /** internal form of  */
    static applySummed01LimitsWithinArray(maps, incomingSum) {
        let movingSum = incomingSum;
        for (const m of maps) {
            m.a0 += movingSum;
            if (m.componentData) {
                m.a1 = this.applySummed01LimitsWithinArray(m.componentData, m.a0);
            }
            else {
                m.a1 += movingSum;
            }
            movingSum = m.a1;
        }
        return movingSum;
    }
    /**
     * walk the maps in the array.
     * * in maps with no component data
     *   * increment map.a0 and map.a1 by the incoming distance a0
     * * in maps with component data:
     *   * recurse through the component array.
     *   * increment map.a0 by the incoming a0.
     *   * returned a1 from the componentData array becomes a1
     * @returns upper value of a1 in final map.
     * @param maps
     * @param incomingSum lower value to add to a0 for first map.
     */
    applySummed01Limits(incomingSum) {
        return StrokeCountChain.applySummed01LimitsWithinArray(this.maps, incomingSum);
    }
}
exports.StrokeCountChain = StrokeCountChain;
/**
 * class `StrokeCountSection`\
 * * contains an array of `StrokeCountChain`.
 * * Hence it is the internal node level of a (1-level-deep) tree of `StrokeCountChain`
 * @internal
 */
class StrokeCountSection {
    constructor(parent) { this.parent = parent; this.chains = []; }
    /**
     * construct array of arrays of `StrokeCountMap`s
     * @param parent
     */
    static createForParityRegionOrChain(parent, options) {
        const result = new StrokeCountSection(parent);
        if (parent instanceof ParityRegion_1.ParityRegion) {
            for (const child of parent.children) {
                const p = StrokeCountChain.createForCurveChain(child, options);
                result.chains.push(p);
            }
        }
        else if (parent instanceof CurveCollection_1.CurveChain) {
            result.chains.push(StrokeCountChain.createForCurveChain(parent, options));
        }
        return result;
    }
    /** test if all sections have the same structure. */
    static areSectionsCompatible(sections, enforceCounts) {
        if (sections.length < 2)
            return true; // hm.. don't know if that is useful, but nothing to check here.
        const numChains = sections[0].chains.length;
        for (let i = 1; i < sections.length; i++) {
            // first level: must match number of paths or loops
            if (sections[i].chains.length !== numChains)
                return false;
            // second level: must have same number of primitives in each path or loop
            for (let j = 0; j < sections[0].chains.length; j++) {
                const numPrimitive = sections[0].chains[j].maps.length;
                if (sections[i].chains[j].maps.length !== numPrimitive)
                    return false;
                for (let k = 0; k < numPrimitive; k++) {
                    if (!sections[0].chains[j].maps[k].isCompatibleComponentStructure(sections[i].chains[j].maps[k], enforceCounts))
                        return false;
                }
            }
        }
        return true;
    }
    /** Within each section, sweep accumulate curveLength field, recording entry and exit sum in each map.
     * * In expected use, (a0,a1) are (0,a) where a is the (previously computed) max length among corresponding maps up and down the section arrays.
     */
    static remapa0a1WithinEachChain(sections) {
        for (const section of sections) {
            for (const chain of section.chains) {
                chain.applySummed01Limits(0.0);
            }
        }
    }
    static applyMultipassVisitorCallbackNoComponents(sections, chainIndex, primitiveIndex, componentIndex, callback) {
        const numSection = sections.length;
        if (!callback.startSweeps(chainIndex, primitiveIndex, componentIndex))
            return false;
        if (componentIndex === undefined) {
            // there are corresponding primitives directly at the section, chain, primitive index:
            for (let pass = 0;; pass++) {
                if (!callback.startPass(pass))
                    break;
                for (let sectionIndex = 0; sectionIndex < numSection; sectionIndex++)
                    if (!callback.visit(pass, sections[sectionIndex].chains[chainIndex].maps[primitiveIndex]))
                        return false;
                if (!callback.endPass(pass))
                    return false;
            }
        }
        else {
            // there are corresponding primitives at the section, chain, primitive,componentIndex
            // there are corresponding primitives directly at the section, chain, primitive index:
            for (let pass = 0;; pass++) {
                if (!callback.startPass(pass))
                    break;
                for (let sectionIndex = 0; sectionIndex < numSection; sectionIndex++)
                    if (!callback.visit(pass, sections[sectionIndex].chains[chainIndex].maps[primitiveIndex].componentData[componentIndex]))
                        return false;
                if (!callback.endPass(pass))
                    return false;
            }
        }
        if (!callback.endSweeps(chainIndex, primitiveIndex, componentIndex))
            return false;
        return true;
    }
    /**
     * Walk through the sections, emitting callbacks delimiting groups of corresponding primitives.
     * @param sections array of sections (possibly a single path or loop at each section, or possibly a set of parity loops.)
     * @param callback object to be notified during the traversal
     */
    static runMultiPassVisitorAtCorrespondingPrimitives(sections, callback) {
        const numChainPerSection = sections[0].chains.length;
        for (let chainIndex = 0; chainIndex < numChainPerSection; chainIndex++) {
            const numPrimitive = sections[0].chains[chainIndex].maps.length;
            for (let primitiveIndex = 0; primitiveIndex < numPrimitive; primitiveIndex++) {
                if (sections[0].chains[chainIndex].maps[primitiveIndex].componentData) {
                    const numComponent = sections[0].chains[chainIndex].maps[primitiveIndex].componentData.length;
                    for (let i = 0; i < numComponent; i++)
                        if (!this.applyMultipassVisitorCallbackNoComponents(sections, chainIndex, primitiveIndex, i, callback))
                            return false;
                }
                else {
                    if (!this.applyMultipassVisitorCallbackNoComponents(sections, chainIndex, primitiveIndex, undefined, callback))
                        return false;
                }
            }
        }
        return true;
    }
    /**
     * * Confirm that all sections in the array have the same structure.
     * * Within each corresponding set of entries, apply the max count to all.
     * @param sections array of per-section stroke count entries
     */
    static enforceStrokeCountCompatibility(sections) {
        if (sections.length < 2)
            return true;
        if (!StrokeCountSection.areSectionsCompatible(sections, false))
            return false;
        const visitor = new StrokeCountMapVisitorApplyMaxCount();
        this.runMultiPassVisitorAtCorrespondingPrimitives(sections, visitor);
        return true;
    }
    /**
     * * Confirm that all sections in the array have the same structure.
     * * Within each corresponding set of entries up and down the sections, set curveLength as the maximum of the respective curve lengths.
     * * Along each section, sum curveLengths (which were just reset) to get consistent along-chain parameters
     * @param sections array of per-section stroke count entries
     */
    static enforceCompatibleDistanceSums(sections) {
        if (sections.length < 2)
            return true;
        if (!StrokeCountSection.areSectionsCompatible(sections, false))
            return false;
        const visitor = new StrokeCountMapVisitorApplyMaxCurveLength();
        this.runMultiPassVisitorAtCorrespondingPrimitives(sections, visitor);
        this.remapa0a1WithinEachChain(sections);
        return true;
    }
    /**
     * Return stroked form of the section.
     */
    getStrokes() {
        if (this.chains.length === 1) {
            return this.chains[0].getStrokes();
        }
        else {
            const region = ParityRegion_1.ParityRegion.create();
            for (const c of this.chains) {
                const strokes = c.getStrokes();
                if (strokes instanceof LineString3d_1.LineString3d)
                    region.tryAddChild(Loop_1.Loop.create(strokes));
            }
            return region;
        }
    }
    /**
     * Given two compatible stroke sets (as returned by getStrokes) extend a range
     * with the distances between corresponding points.
     * * Each set of strokes may be:
     *   * linestring
     *   * ParityRegion
     *   * CurveChain (Loop or Path)
     * @param strokeA first set of strokes
     * @param strokeB second set of strokes
     * @param rangeToExtend caller-allocated range to be extended.
     * @returns true if structures are compatible.
     */
    static extendDistanceRangeBetweenStrokes(strokeA, strokeB, rangeToExtend) {
        if (!strokeA.isSameGeometryClass(strokeB))
            return false;
        if (strokeA instanceof LineString3d_1.LineString3d) {
            if (!(strokeB instanceof LineString3d_1.LineString3d))
                return false;
            if (strokeA.numPoints() === strokeB.numPoints()) {
                const n = strokeA.numPoints();
                const pointA = Point3dVector3d_1.Point3d.create();
                const pointB = Point3dVector3d_1.Point3d.create();
                const allPointA = strokeA.packedPoints;
                const allPointB = strokeB.packedPoints;
                for (let i = 0; i < n; i++) {
                    allPointA.getPoint3dAtCheckedPointIndex(i, pointA);
                    allPointB.getPoint3dAtCheckedPointIndex(i, pointB);
                    rangeToExtend.extendX(pointA.distance(pointB));
                }
                return true;
            }
        }
        else if (strokeA instanceof ParityRegion_1.ParityRegion) {
            if (!(strokeB instanceof ParityRegion_1.ParityRegion))
                return false;
            const childrenA = strokeA.children;
            const childrenB = strokeB.children;
            const n = childrenA.length;
            if (n === childrenB.length) {
                for (let i = 0; i < n; i++) {
                    if (!this.extendDistanceRangeBetweenStrokes(childrenA[i], childrenB[i], rangeToExtend))
                        return false;
                }
                return true;
            }
        }
        else if (strokeA instanceof CurveCollection_1.CurveChain) {
            if (!(strokeB instanceof CurveCollection_1.CurveChain))
                return false;
            const childrenA = strokeA.children;
            const childrenB = strokeB.children;
            const n = childrenA.length;
            if (n === childrenB.length) {
                for (let i = 0; i < n; i++) {
                    if (!this.extendDistanceRangeBetweenStrokes(childrenA[i], childrenB[i], rangeToExtend))
                        return false;
                }
                return true;
            }
        }
        return false;
    }
}
exports.StrokeCountSection = StrokeCountSection;
//# sourceMappingURL=StrokeCountChain.js.map