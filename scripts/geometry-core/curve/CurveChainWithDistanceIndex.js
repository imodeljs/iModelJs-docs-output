"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Curve */
const Geometry_1 = require("../Geometry");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const CurvePrimitive_1 = require("../curve/CurvePrimitive");
const StrokeCountMap_1 = require("../curve/Query/StrokeCountMap");
const CurveCollection_1 = require("./CurveCollection");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const CurveExtendMode_1 = require("./CurveExtendMode");
/**
 * * Annotation of an interval of a curve.
 * * The interval is marked with two pairs of numbers:
 * * * fraction0, fraction1 = fraction parameters along the child curve
 * * * distance0,distance1 = distances within containing CurveChainWithDistanceIndex
 * @public
 */
class PathFragment {
    /** Create a fragment with complete fraction, distance and child data. */
    constructor(childFraction0, childFraction1, distance0, distance1, childCurve) {
        this.childFraction0 = childFraction0;
        this.childFraction1 = childFraction1;
        this.chainDistance0 = distance0;
        this.chainDistance1 = distance1;
        this.childCurve = childCurve;
    }
    /**
     * Return true if the distance is within the distance limits of this fragment.
     * @param distance
     */
    containsChainDistance(distance) {
        return distance >= this.chainDistance0 && distance <= this.chainDistance1;
    }
    /**
     * Return true if this fragment addresses `curve` and brackets `fraction`
     * @param distance
     */
    containsChildCurveAndChildFraction(curve, fraction) {
        return this.childCurve === curve && fraction >= this.childFraction0 && fraction <= this.childFraction1;
    }
    /** Convert distance to local fraction, and apply that to interpolate between the stored curve fractions.
     * Note that proportional calculation does NOT account for nonuniform parameterization in the child curve.
     */
    chainDistanceToInterpolatedChildFraction(distance) {
        return Geometry_1.Geometry.inverseInterpolate(this.childFraction0, this.chainDistance0, this.childFraction1, this.chainDistance1, distance, this.childFraction0); // the interval "must" have nonzero length, division should be safe . ..
    }
    /** Convert chainDistance to true chidFraction, using detailed moveSignedDistanceFromFraction
     */
    chainDistanceToAccurateChildFraction(chainDistance) {
        // The fragments are really expected to do good mappings in their distance range ...
        const childDetail = this.childCurve.moveSignedDistanceFromFraction(this.childFraction0, chainDistance - this.chainDistance0, false);
        return childDetail.fraction;
    }
    /** Return the scale factor to map childCurve fraction derivatives to chain fraction derivatives
     * @param globalDistance total length of the global curve.
     */
    fractionScaleFactor(globalDistance) {
        return globalDistance * (this.childFraction1 - this.childFraction0) / (this.chainDistance1 - this.chainDistance0);
    }
    /** Reverse the fraction and distance data.
     * * each child fraction `f` is replaced by `1-f`
     * * each `chainDistance` is replaced by `totalDistance-chainDistance`
     */
    reverseFractionsAndDistances(totalDistance) {
        const f0 = this.childFraction0;
        const f1 = this.childFraction1;
        const d0 = this.chainDistance0;
        const d1 = this.chainDistance1;
        this.childFraction0 = 1.0 - f1;
        this.childFraction1 = 1.0 - f0;
        this.chainDistance0 = totalDistance - d1;
        this.chainDistance1 = totalDistance - d0;
    }
    /**
     * convert a fractional position on the childCurve to distance in the chain space.
     * * Return value is SIGNED -- will be negative when fraction < this.childFraction0.
     * @param fraction fraction along the curve within this fragment
     */
    childFractionTChainDistance(fraction) {
        let d = this.childCurve.curveLengthBetweenFractions(this.childFraction0, fraction);
        if (fraction < this.childFraction0)
            d = -d;
        return this.chainDistance0 + d;
    }
}
exports.PathFragment = PathFragment;
/** Non-instantiable class to build a distance index for a path. */
class DistanceIndexConstructionContext {
    constructor() {
        this._accumulatedDistance = 0;
        this._fragments = [];
    }
    // ignore curve announcements -- they are repeated in stroke announcements
    startParentCurvePrimitive(_cp) { }
    startCurvePrimitive(_cp) { }
    endParentCurvePrimitive(_cp) { }
    endCurvePrimitive(_cp) { }
    // um .. we need to see curves? how to reject?
    announcePointTangent(_xyz, _fraction, _tangent) { }
    /** Announce numPoints interpolated between point0 and point1, with associated fractions */
    announceSegmentInterval(cp, point0, point1, numStrokes, fraction0, fraction1) {
        let d0 = this._accumulatedDistance;
        if (numStrokes <= 1) {
            this._accumulatedDistance += point0.distance(point1);
            this._fragments.push(new PathFragment(fraction0, fraction1, d0, this._accumulatedDistance, cp));
        }
        else {
            let f1;
            for (let i = 1, f0 = 0.0; i <= numStrokes; i++, f0 = f1) {
                f1 = Geometry_1.Geometry.interpolate(fraction0, i / numStrokes, fraction1);
                d0 = this._accumulatedDistance;
                this._accumulatedDistance += (Math.abs(f1 - f0) * point0.distance(point1));
                this._fragments.push(new PathFragment(f0, f1, d0, this._accumulatedDistance, cp));
            }
        }
    }
    announceIntervalForUniformStepStrokes(cp, numStrokes, fraction0, fraction1) {
        let f1, d, d0;
        for (let i = 1, f0 = fraction0; i <= numStrokes; i++, f0 = f1) {
            f1 = Geometry_1.Geometry.interpolate(fraction0, i / numStrokes, fraction1);
            d = cp.curveLengthBetweenFractions(f0, f1);
            d0 = this._accumulatedDistance;
            this._accumulatedDistance += d;
            this._fragments.push(new PathFragment(f0, f1, d0, this._accumulatedDistance, cp));
        }
    }
    static createPathFragmentIndex(path, options) {
        const handler = new DistanceIndexConstructionContext();
        for (const curve of path.children) {
            curve.emitStrokableParts(handler, options);
        }
        const fragments = handler._fragments;
        return fragments;
    }
}
/**
 * `CurveChainWithDistanceIndex` is a CurvePrimitive whose fractional parameterization is proportional to true
 * distance along a CurveChain.
 * * The curve chain can be any type derived from CurveChain.
 * * * i.e. either a `Path` or a `Loop`
 * @public
 */
class CurveChainWithDistanceIndex extends CurvePrimitive_1.CurvePrimitive {
    // final assembly of CurveChainWithDistanceIndex -- caller must create valid fragment index.
    constructor(path, fragments) {
        super();
        /** String name for schema properties */
        this.curvePrimitiveType = "curveChainWithDistanceIndex";
        this._path = path;
        this._fragments = fragments;
        this._totalLength = fragments[fragments.length - 1].chainDistance1;
    }
    /** Test if other is a `CurveChainWithDistanceIndex` */
    isSameGeometryClass(other) { return other instanceof CurveChainWithDistanceIndex; }
    /**
     * Create a clone, transformed and with its own distance index.
     * @param transform transform to apply in the clone.
     */
    cloneTransformed(transform) {
        const c = this._path.clone();
        if (c !== undefined && c instanceof CurveCollection_1.CurveChain && c.tryTransformInPlace(transform))
            return CurveChainWithDistanceIndex.createCapture(c);
        return undefined;
    }
    /** Reference to the contained path.
     * * Do not modify the path.  The distance index will be wrong.
     */
    get path() { return this._path; }
    /** Return a deep clone */
    clone() {
        const c = this._path.clone();
        if (c !== undefined && c instanceof CurveCollection_1.CurveChain)
            return CurveChainWithDistanceIndex.createCapture(c);
        return undefined;
    }
    /** Ask if the curve is within tolerance of a plane.
     * @returns Returns true if the curve is completely within tolerance of the plane.
     */
    isInPlane(plane) {
        for (const c of this._path.children) {
            if (!c.isInPlane(plane))
                return false;
        }
        return true;
    }
    /** return the start point of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result) {
        const c = this._path.cyclicCurvePrimitive(0);
        if (c)
            return c.startPoint(result);
        return Point3dVector3d_1.Point3d.createZero(result);
    }
    /** Return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result) {
        const c = this._path.cyclicCurvePrimitive(-1);
        if (c)
            return c.endPoint(result);
        return Point3dVector3d_1.Point3d.createZero(result);
    }
    /** Add strokes to caller-supplied linestring */
    emitStrokes(dest, options) {
        for (const c of this._path.children) {
            c.emitStrokes(dest, options);
        }
    }
    /** Ask the curve to announce points and simple subcurve fragments for stroking.
     * See IStrokeHandler for description of the sequence of the method calls.
     */
    emitStrokableParts(dest, options) {
        for (const c of this._path.children) {
            c.emitStrokableParts(dest, options);
        }
    }
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options) {
        let numStroke = 0;
        for (const c of this._path.children) {
            numStroke += c.computeStrokeCountForOptions(options);
        }
        return numStroke;
    }
    /**
     * construct StrokeCountMap for each child, accumulating data to stroke count map for this primitive.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap evolving parent map.
     */
    computeAndAttachRecursiveStrokeCounts(options, parentStrokeMap) {
        const myMap = StrokeCountMap_1.StrokeCountMap.createWithCurvePrimitiveAndOptionalParent(this, parentStrokeMap);
        for (const c of this._path.children) {
            c.computeAndAttachRecursiveStrokeCounts(options, myMap);
        }
        CurvePrimitive_1.CurvePrimitive.installStrokeCountMap(this, myMap, parentStrokeMap);
    }
    /** Second step of double dispatch:  call `this._path.dispatchToGeometryHandler (handler)`
     * * Note that this exposes the children individually to the handler.
     */
    dispatchToGeometryHandler(handler) {
        return this._path.dispatchToGeometryHandler(handler);
    }
    /** Extend (increase) `rangeToExtend` as needed to include these curves (optionally transformed)
     */
    extendRange(rangeToExtend, transform) {
        this._path.extendRange(rangeToExtend, transform);
    }
    /**
     *
     * * Curve length is always positive.
     * @returns Returns a (high accuracy) length of the curve between fractional positions
     * @returns Returns the length of the curve.
     */
    curveLengthBetweenFractions(fraction0, fraction1) {
        return Math.abs(fraction1 - fraction0) * this._totalLength;
    }
    /**
     * Capture (not clone) a path into a new `CurveChainWithDistanceIndex`
     * @param primitives primitive array to be CAPTURED (not cloned)
     */
    static createCapture(path, options) {
        if (path.children.length === 0)
            return undefined;
        const fragments = DistanceIndexConstructionContext.createPathFragmentIndex(path, options);
        const result = new CurveChainWithDistanceIndex(path, fragments);
        return result;
    }
    /**
     * Resolve a fraction of the CurveChain to a PathFragment
     * @param distance
     * @param allowExtrapolation
     */
    chainDistanceToFragment(distance, allowExtrapolation = false) {
        const numFragments = this._fragments.length;
        const fragments = this._fragments;
        if (numFragments > 0) {
            if (distance < 0.0)
                return allowExtrapolation ? fragments[0] : undefined;
            if (distance >= this._totalLength)
                return allowExtrapolation ? fragments[numFragments - 1] : undefined;
            // humbug, linear search
            for (const fragment of fragments) {
                if (fragment.containsChainDistance(distance))
                    return fragment;
            }
        }
        return undefined;
    }
    /**
     * Convert distance along the chain to fraction along the chain.
     * @param distance distance along the chain
     */
    chainDistanceToChainFraction(distance) { return distance / this._totalLength; }
    /**
     * Resolve a fraction within a specific curve to a fragment.
     * @param curve
     * @param fraction
     */
    curveAndChildFractionToFragment(curve, fraction) {
        const numFragments = this._fragments.length;
        const fragments = this._fragments;
        if (numFragments > 0) {
            // humbug, linear search
            for (const fragment of fragments) {
                if (fragment.containsChildCurveAndChildFraction(curve, fraction))
                    return fragment;
            }
            if (fraction <= 0)
                return fragments[0];
            if (fraction > 1.0)
                return fragments[numFragments - 1];
        }
        return undefined;
    }
    /**
     * Returns the total length of curves.
     */
    curveLength() {
        return this._totalLength;
    }
    /**
     * Returns the total length of the path.
     * * This is exact (and simple property lookup) because the true lengths were summed at construction time.
     */
    quickLength() {
        return this._totalLength;
    }
    /**
     * Return the point (x,y,z) on the curve at fractional position along the chain.
     * @param fraction fractional position along the geometry.
     * @returns Returns a point on the curve.
     */
    fractionToPoint(fraction, result) {
        const chainDistance = fraction * this._totalLength;
        let fragment = this.chainDistanceToFragment(chainDistance, true);
        if (fragment) {
            const childFraction = fragment.chainDistanceToAccurateChildFraction(chainDistance);
            return fragment.childCurve.fractionToPoint(childFraction, result);
        }
        fragment = this.chainDistanceToFragment(chainDistance, true);
        return this._fragments[0].childCurve.fractionToPoint(0.0, result);
    }
    /** Return the point (x,y,z) and derivative on the curve at fractional position.
     *
     * * Note that this derivative is "derivative of xyz with respect to fraction."
     * * this derivative shows the speed of the "fractional point" moving along the curve.
     * * this is not generally a unit vector.  use fractionToPointAndUnitTangent for a unit vector.
     * @param fraction fractional position along the geometry.
     * @returns Returns a ray whose origin is the curve point and direction is the derivative with respect to the fraction.
     */
    fractionToPointAndDerivative(fraction, result) {
        const distanceAlongPath = fraction * this._totalLength;
        const fragment = this.chainDistanceToFragment(distanceAlongPath, true);
        const curveFraction = fragment.chainDistanceToAccurateChildFraction(distanceAlongPath);
        result = fragment.childCurve.fractionToPointAndDerivative(curveFraction, result);
        const a = this._totalLength / result.direction.magnitude();
        result.direction.scaleInPlace(a);
        return result;
    }
    /**
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     * @param fraction fractional position on the curve
     * @param result optional receiver for the result.
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     */
    fractionToPointAndUnitTangent(fraction, result) {
        const distanceAlongPath = fraction * this._totalLength;
        const fragment = this.chainDistanceToFragment(distanceAlongPath, true);
        const curveFraction = fragment.chainDistanceToAccurateChildFraction(distanceAlongPath);
        result = fragment.childCurve.fractionToPointAndDerivative(curveFraction, result);
        result.direction.normalizeInPlace();
        return result;
    }
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    fractionToPointAnd2Derivatives(fraction, result) {
        const totalLength = this._totalLength;
        const distanceAlongPath = fraction * totalLength;
        const fragment = this.chainDistanceToFragment(distanceAlongPath, true);
        const curveFraction = fragment.chainDistanceToAccurateChildFraction(distanceAlongPath);
        result = fragment.childCurve.fractionToPointAnd2Derivatives(curveFraction, result);
        if (!result)
            return undefined;
        const dotUU = result.vectorU.magnitudeSquared();
        const magU = Math.sqrt(dotUU);
        const dotUV = result.vectorU.dotProduct(result.vectorV);
        const duds = 1.0 / magU;
        const a = duds * duds;
        Point3dVector3d_1.Vector3d.createAdd2Scaled(result.vectorV, a, result.vectorU, -a * dotUV / dotUU, result.vectorV); // IN PLACE update to vectorV.
        result.vectorU.scale(duds);
        // scale for 0..1 parameterization ....
        result.vectorU.scaleInPlace(totalLength);
        result.vectorV.scaleInPlace(totalLength * totalLength);
        return result;
    }
    /** Attempt to transform in place.
     * * Warning: If any child fails, this object becomes invalid.  But that should never happen.
     */
    tryTransformInPlace(transform) {
        let numFail = 0;
        for (const c of this._path.children) {
            if (!c.tryTransformInPlace(transform))
                numFail++;
        }
        return numFail === 0;
    }
    /** Reverse the curve's data so that its fractional stroking moves in the opposite direction. */
    reverseInPlace() {
        this._path.reverseChildrenInPlace();
        const totalLength = this._totalLength;
        for (const fragment of this._fragments)
            fragment.reverseFractionsAndDistances(totalLength);
        for (let i = 0, j = this._fragments.length - 1; i < j; i++, j--) {
            const fragment = this._fragments[i];
            this._fragments[i] = this._fragments[j];
            this._fragments[j] = fragment;
        }
    }
    /**
     * Test for equality conditions:
     * * Mismatched totalLength is a quick exit condition
     * * If totalLength matches, recurse to the path for matching primitives.
     * @param other
     */
    isAlmostEqual(other) {
        if (other instanceof CurveChainWithDistanceIndex) {
            return Geometry_1.Geometry.isSameCoordinate(this._totalLength, other._totalLength)
                && this._path.isAlmostEqual(other._path);
        }
        return false;
    }
    /** Implement moveSignedDistanceFromFraction.
     * * See `CurvePrimitive` for parameter details.
     * * The returned location directly identifies fractional position along the CurveChainWithDistanceIndex, and has pointer to an additional detail for the child curve.
     */
    moveSignedDistanceFromFraction(startFraction, signedDistance, allowExtension, result) {
        const distanceA = startFraction * this._totalLength;
        const distanceB = distanceA + signedDistance;
        const fragmentB = this.chainDistanceToFragment(distanceB, true);
        const childDetail = fragmentB.childCurve.moveSignedDistanceFromFraction(fragmentB.childFraction0, distanceB - fragmentB.chainDistance0, allowExtension, result);
        const endFraction = startFraction + (signedDistance / this._totalLength);
        const chainDetail = CurveLocationDetail_1.CurveLocationDetail.createConditionalMoveSignedDistance(allowExtension, this, startFraction, endFraction, signedDistance, result);
        chainDetail.childDetail = childDetail;
        return chainDetail;
    }
    /** Search for the curve point that is closest to the spacePoint.
     * * The CurveChainWithDistanceIndex invokes the base class CurvePrimitive method, which
     *     (via a handler) determines a CurveLocation detail among the children.
     * * The returned detail directly identifies fractional position along the CurveChainWithDistanceIndex, and has pointer to an additional detail for the child curve.
     * @param spacePoint point in space
     * @param extend true to extend the curve (NOT USED)
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint, extend) {
        // umm... to "extend", would require selective extension of first, last
        let childDetail;
        let aMin = Number.MAX_VALUE;
        const numChildren = this.path.children.length;
        if (numChildren === 1) {
            childDetail = this.path.children[0].closestPoint(spacePoint, extend);
        }
        else {
            const extend0 = [CurveExtendMode_1.CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extend, 0), CurveExtendMode_1.CurveExtendMode.None];
            const extend1 = [CurveExtendMode_1.CurveExtendMode.None, CurveExtendMode_1.CurveExtendOptions.resolveVariantCurveExtendParameterToCurveExtendMode(extend, 1)];
            for (let childIndex = 0; childIndex < numChildren; childIndex++) {
                const child = this.path.children[childIndex];
                const detailA = child.closestPoint(spacePoint, childIndex === 0 ? extend0 : childIndex + 1 === numChildren ? extend1 : false);
                if (detailA && detailA.a < aMin) {
                    aMin = detailA.a;
                    childDetail = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(detailA.curve, detailA.fraction, detailA.point, childDetail);
                    childDetail.a = detailA.a;
                }
            }
        }
        if (!childDetail)
            return undefined;
        const fragment = this.curveAndChildFractionToFragment(childDetail.curve, childDetail.fraction);
        if (fragment) {
            const chainDistance = fragment.childFractionTChainDistance(childDetail.fraction);
            const chainFraction = this.chainDistanceToChainFraction(chainDistance);
            const chainDetail = CurveLocationDetail_1.CurveLocationDetail.createCurveFractionPoint(this, chainFraction, childDetail.point);
            chainDetail.childDetail = childDetail;
            return chainDetail;
        }
        return undefined;
    }
}
exports.CurveChainWithDistanceIndex = CurveChainWithDistanceIndex;
//# sourceMappingURL=CurveChainWithDistanceIndex.js.map