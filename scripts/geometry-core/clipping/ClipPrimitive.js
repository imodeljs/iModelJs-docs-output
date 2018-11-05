"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const ClipPlane_1 = require("./ClipPlane");
const ConvexClipPlaneSet_1 = require("./ConvexClipPlaneSet");
const PointVector_1 = require("../PointVector");
const Range_1 = require("../Range");
const Transform_1 = require("../Transform");
const Geometry_1 = require("../Geometry");
const PointHelpers_1 = require("../PointHelpers");
const UnionOfConvexClipPlaneSets_1 = require("./UnionOfConvexClipPlaneSets");
const Triangulation_1 = require("../topology/Triangulation");
/** Internal helper class holding XYZ components that serves as a representation of polygon edges defined by clip planes */
class PolyEdge {
    constructor(origin, next, normal, z) {
        this.origin = PointVector_1.Point3d.create(origin.x, origin.y, z);
        this.next = PointVector_1.Point3d.create(next.x, next.y, z);
        this.normal = normal;
    }
}
/**
 * Cache structure that holds a ClipPlaneSet and various parameters for adding new ClipPlanes to the set. This structure
 * will typically be fed to an additive function that will append new ClipPlanes to the cache based on these parameters.
 */
class PlaneSetParamsCache {
    constructor(zLow, zHigh, localOrigin, isMask = false, isInvisible = false, focalLength = 0.0) {
        this.clipPlaneSet = UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createEmpty();
        this.zLow = zLow;
        this.zHigh = zHigh;
        this.isMask = isMask;
        this.invisible = isInvisible;
        this.focalLength = focalLength;
        this.limitValue = 0;
        this.localOrigin = localOrigin ? localOrigin : PointVector_1.Point3d.create();
    }
}
exports.PlaneSetParamsCache = PlaneSetParamsCache;
/** Base class for clipping implementations that use
 *
 * * A ClipPlaneSet designated "clipPlanes"
 * * A ClipPlaneSet designated "maskPlanes"
 * * an "invisible" flag
 */
class ClipPrimitive {
    constructor(planeSet, isInvisible = false) {
        this._clipPlanes = planeSet;
        this._invisible = isInvisible;
    }
    /** Apply a transform to the clipper (e.g. transform all planes) */
    transformInPlace(transform) {
        if (this._clipPlanes)
            this._clipPlanes.transformInPlace(transform);
        if (this._maskPlanes)
            this._maskPlanes.transformInPlace(transform);
        return true;
    }
    /** Sets both the clip plane set and the mask set visibility */
    setInvisible(invisible) {
        this._invisible = invisible;
        if (this._clipPlanes)
            this._clipPlanes.setInvisible(invisible);
        if (this._maskPlanes)
            this._maskPlanes.setInvisible(invisible);
    }
    containsZClip() {
        if (this.fetchClipPlanesRef() !== undefined)
            for (const convexSet of this._clipPlanes.convexSets)
                for (const plane of convexSet.planes)
                    if (Math.abs(plane.inwardNormalRef.z) > 1.0e-6 && Math.abs(plane.distance) !== Number.MAX_VALUE)
                        return true;
        return false;
    }
    /**
     * Determines whether the given points fall inside or outside the set. If this set is defined by masking planes,
     * will check the mask planes only, provided that ignoreMasks is false. Otherwise, will check the clipplanes member.
     */
    classifyPointContainment(points, ignoreMasks) {
        if (this.fetchMaskPlanesRef() !== undefined) {
            if (ignoreMasks)
                return 1 /* StronglyInside */;
            switch (this._maskPlanes.classifyPointContainment(points, true)) {
                case 1 /* StronglyInside */:
                    return 3 /* StronglyOutside */;
                case 3 /* StronglyOutside */:
                    return 1 /* StronglyInside */;
                case 2 /* Ambiguous */:
                    return 2 /* Ambiguous */;
            }
        }
        return (this.fetchClipPlanesRef() === undefined) ? 1 /* StronglyInside */ : this._clipPlanes.classifyPointContainment(points, false);
    }
    static isLimitEdge(limitValue, point0, point1) {
        const tol = 1.0e-5 * limitValue;
        // High x-limit...
        if (Math.abs(point0.x - limitValue) < tol && Math.abs(point1.x - limitValue) < tol)
            return true;
        // Low x-limit...
        if (Math.abs(point0.x + limitValue) < tol && Math.abs(point1.x + limitValue) < tol)
            return true;
        // high y limit ...
        if (Math.abs(point0.y - limitValue) < tol && Math.abs(point1.y - limitValue) < tol)
            return true;
        // low y limit ...
        if (Math.abs(point0.y + limitValue) < tol && Math.abs(point1.y + limitValue) < tol)
            return true;
        return false;
    }
    /** Add an unbounded plane set (a) to the right of the line defined by two points, and (b) "ahead" of
     *  the start point (set is pushed to the set located within the PlaneSetParamsCache object given). This method can be used
     *  in the development of ClipShapes, by ClipShapes.
     */
    static addOutsideEdgeSetToParams(x0, y0, x1, y1, pParams, isInvisible = false) {
        const unit0 = PointVector_1.Vector3d.create();
        const vec0 = PointVector_1.Vector3d.create(x1 - x0, y1 - y0, 0.0);
        const point0 = PointVector_1.Point3d.create(x0 + pParams.localOrigin.x, y0 + pParams.localOrigin.y, 0.0);
        vec0.normalize(unit0);
        const unit1 = PointVector_1.Vector3d.create(unit0.y, -unit0.x, 0.0);
        const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
        convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(unit1, point0, isInvisible));
        convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(unit0, point0, isInvisible));
        convexSet.addZClipPlanes(isInvisible, pParams.zLow, pParams.zHigh);
        pParams.clipPlaneSet.convexSets.push(convexSet);
    }
    /**
     * Add a plane set representative of a 3d object based on the given array of 2d points and 3d parameters of the PlaneSetParamsCache,
     * where the returned value is stored in the params object given. The original points array given is not modified. This method
     * can be used in the development of ClipShapes, by ClipShapes.
     */
    static addShapeToParams(shape, pFlags, pParams) {
        const pPoints = shape.slice(0);
        // Add the closure point
        if (!pPoints[0].isExactEqual(pPoints[pPoints.length - 1]))
            pPoints.push(pPoints[0].clone());
        const area = PointHelpers_1.PolygonOps.areaXY(pPoints);
        const n = pPoints.length;
        const point0 = PointVector_1.Point3d.create();
        const point1 = PointVector_1.Point3d.create();
        const vector0 = PointVector_1.Vector3d.create();
        const vector1 = PointVector_1.Vector3d.create();
        const point0Local = PointVector_1.Point3d.create();
        let point1Local = PointVector_1.Point3d.create();
        const zVector = PointVector_1.Vector3d.create(0, 0, 1);
        let normal;
        let tangent;
        const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
        const reverse = area < 0.0;
        for (let i = 0; i < n; i++, point0.setFrom(point1), point0Local.setFrom(point1Local)) {
            point1Local = pPoints[i % n];
            point1Local.plus(pParams.localOrigin, point1);
            if (i && !point1.isAlmostEqual(point0, 1.0e-8)) {
                const bIsLimitPlane = ClipPrimitive.isLimitEdge(pParams.limitValue, point0Local, point1Local);
                const isInterior = (0 === (pFlags[i - 1] & 1)) || bIsLimitPlane;
                if (!pParams.focalLength) {
                    tangent = PointVector_1.Vector3d.createFrom(point1.minus(point0));
                    normal = zVector.crossProduct(tangent).normalize(); // Assumes that cross product is never zero vector
                    if (reverse)
                        normal.negate(normal);
                    convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(normal, point0, pParams.invisible, isInterior));
                }
                else {
                    vector1.setFrom(point1);
                    vector0.setFrom(point0);
                    normal = vector1.crossProduct(vector0).normalize();
                    if (reverse)
                        normal.negate();
                    convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(normal, 0.0, pParams.invisible, isInterior));
                }
            }
        }
        convexSet.addZClipPlanes(pParams.invisible, pParams.zLow, pParams.zHigh);
        if (convexSet.planes.length !== 0)
            pParams.clipPlaneSet.convexSets.push(convexSet);
    }
}
exports.ClipPrimitive = ClipPrimitive;
/**
 * A clipping volume defined by a shape (an array of 3d points using only x and y dimensions).
 * May be given either a ClipPlaneSet to store directly, or an array of polygon points as well as other parameters
 * for parsing clipplanes from the shape later.
 */
class ClipShape extends ClipPrimitive {
    constructor(polygon = [], zLow, zHigh, transform, isMask = false, invisible = false) {
        super(undefined, invisible); // ClipPlaneSets will be set up later after storing points
        this._isMask = false;
        this._zLowValid = false;
        this._zHighValid = false;
        this._transformValid = false;
        this._polygon = polygon;
        this.initSecondaryProps(isMask, zLow, zHigh, transform);
    }
    /** Returns true if this ClipShape is marked as invisible. */
    get invisible() { return this._invisible; }
    /** Return this transformFromClip, which may be undefined. */
    get transformFromClip() { return this._transformFromClip; }
    /** Return this transformToClip, which may be undefined. */
    get transformToClip() { return this._transformToClip; }
    /** Returns true if this ClipShape's transforms are currently set. */
    get transformValid() { return this._transformValid; }
    /** Returns true if this ClipShape's lower z boundary is set. */
    get zLowValid() { return this._zLowValid; }
    /** Returns true if this ClipShape's upper z boundary is set. */
    get zHighValid() { return this._zHighValid; }
    /** Return this zLow, which may be undefined. */
    get zLow() { return this._zLow; }
    /** Return this zHigh, which may be undefined. */
    get zHigh() { return this._zHigh; }
    /** Returns a reference to this ClipShape's polygon array. */
    get polygon() { return this._polygon; }
    /** Return this bspline curve, which may be undefined. */
    get bCurve() { return this._bCurve; }
    /** Returns true if this ClipShape is a masking set. */
    get isMask() { return this._isMask; }
    /**
     * Returns true if this ClipShape has been parsed, and currently contains a ClipPlaneSet in its cache.
     * This does not take into account validity of the ClipPlanes, given that the polygon array might have changed.
     */
    arePlanesDefined() {
        if (this._isMask)
            return this._maskPlanes !== undefined;
        return this._clipPlanes !== undefined;
    }
    /** Sets the polygon points array of this ClipShape to the array given (by reference). */
    setPolygon(polygon) {
        // Add closure point
        if (!polygon[0].isAlmostEqual(polygon[polygon.length - 1]))
            polygon.push(polygon[0].clone());
        this._polygon = polygon;
    }
    /**
     * If the clip plane set is already stored, return it. Otherwise, parse the clip planes out of the shape
     * defined by the set of polygon points.
     */
    fetchClipPlanesRef() {
        if (this._clipPlanes !== undefined)
            return this._clipPlanes;
        this._clipPlanes = UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createEmpty();
        this.parseClipPlanes(this._clipPlanes);
        if (this._transformValid)
            this._clipPlanes.transformInPlace(this._transformFromClip);
        return this._clipPlanes;
    }
    /**
     * If the masking clip plane set is already stored, return it. Otherwise, parse the mask clip planes out of the shape
     * defined by the set of polygon points.
     */
    fetchMaskPlanesRef() {
        if (!this._isMask)
            return undefined;
        if (this._maskPlanes !== undefined)
            return this._maskPlanes;
        this._maskPlanes = UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createEmpty();
        this.parseClipPlanes(this._maskPlanes);
        if (this._transformValid)
            this._maskPlanes.transformInPlace(this._transformFromClip);
        return this._maskPlanes;
    }
    /**
     * Initialize the members of the ClipShape class that may at times be undefined.
     * zLow and zHigh default to Number.MAX_VALUE, and the transform defaults to an identity transform
     */
    initSecondaryProps(isMask, zLow, zHigh, transform) {
        this._isMask = isMask;
        this._zLowValid = (zLow !== undefined);
        this._zLow = zLow;
        this._zHighValid = (zHigh !== undefined);
        this._zHigh = zHigh;
        this._transformValid = (transform !== undefined);
        if (false !== this._transformValid) {
            this._transformFromClip = transform;
            this._transformToClip = transform.inverse(); // could be undefined
        }
        else {
            this._transformFromClip = Transform_1.Transform.createIdentity();
            this._transformToClip = Transform_1.Transform.createIdentity();
        }
    }
    toJSON() {
        const val = {};
        val.shape = {};
        val.shape.points = [];
        for (const pt of this._polygon)
            val.shape.points.push(pt.toJSON());
        if (this.invisible)
            val.shape.invisible = true;
        if (this._transformFromClip && !this._transformFromClip.isIdentity)
            val.shape.trans = this._transformFromClip.toJSON();
        if (this.isMask)
            val.shape.mask = true;
        if (typeof (this.zLow) !== "undefined" && this.zLow !== -Number.MAX_VALUE)
            val.shape.zlow = this.zLow;
        if (typeof (this.zHigh) !== "undefined" && this.zHigh !== Number.MAX_VALUE)
            val.shape.zhigh = this.zHigh;
        return val;
    }
    static fromJSON(json, result) {
        if (!json.shape)
            return undefined;
        const points = [];
        if (json.shape.points)
            for (const pt of json.shape.points)
                points.push(PointVector_1.Point3d.fromJSON(pt));
        let trans;
        if (json.shape.trans)
            trans = Transform_1.Transform.fromJSON(json.shape.trans);
        let zLow;
        if (json.shape.zlow)
            zLow = json.shape.zlow;
        let zHigh;
        if (json.shape.zhigh)
            zHigh = json.shape.zhigh;
        let isMask = false;
        if (json.shape.mask)
            isMask = json.shape.mask;
        let invisible = false;
        if (json.shape.invisible)
            invisible = true;
        return ClipShape.createShape(points, zLow, zHigh, trans, isMask, invisible, result);
    }
    /** Returns a new ClipShape that is a deep copy of the ClipShape given */
    static createFrom(other, result) {
        const retVal = ClipShape.createEmpty(false, false, undefined, result);
        retVal._invisible = other._invisible;
        for (const point of other._polygon) {
            retVal._polygon.push(point.clone());
        }
        retVal._isMask = other._isMask;
        retVal._zLow = other._zLow;
        retVal._zHigh = other._zHigh;
        retVal._zLowValid = other._zLowValid;
        retVal._zHighValid = other._zHighValid;
        retVal._transformValid = other._transformValid;
        retVal._transformToClip = other._transformToClip ? other._transformToClip.clone() : undefined;
        retVal._transformFromClip = other._transformFromClip ? other._transformFromClip.clone() : undefined;
        retVal._bCurve = other._bCurve ? other._bCurve.clone() : undefined;
        // TODO: COPY _gpa AS WELL, ONCE IT IS IMPLEMENTED
        return retVal;
    }
    /** Create a new ClipShape from an array of points that make up a 2d shape (stores a deep copy of these points). */
    static createShape(polygon = [], zLow, zHigh, transform, isMask = false, invisible = false, result) {
        if (polygon.length < 3)
            return undefined;
        const pPoints = polygon.slice(0);
        // Add closure point
        if (!pPoints[0].isExactEqual(pPoints[pPoints.length - 1]))
            pPoints.push(pPoints[0]);
        if (result) {
            result._clipPlanes = undefined; // Start as undefined
            result._maskPlanes = undefined; // Start as undefined
            result._invisible = invisible;
            result._polygon = pPoints;
            result.initSecondaryProps(isMask, zLow, zHigh, transform);
            return result;
        }
        else {
            return new ClipShape(pPoints, zLow, zHigh, transform, isMask, invisible);
        }
    }
    /**
     * Create a ClipShape that exists as a 3 dimensional box of the range given. Optionally choose to
     * also store this shape's zLow and zHigh members from the range through the use of a ClipMask.
     */
    static createBlock(extremities, clipMask, isMask = false, invisible = false, transform, result) {
        const low = extremities.low;
        const high = extremities.high;
        const blockPoints = [];
        for (let i = 0; i < 5; i++)
            blockPoints.push(PointVector_1.Point3d.create());
        blockPoints[0].x = blockPoints[3].x = blockPoints[4].x = low.x;
        blockPoints[1].x = blockPoints[2].x = high.x;
        blockPoints[0].y = blockPoints[1].y = blockPoints[4].y = low.y;
        blockPoints[2].y = blockPoints[3].y = high.y;
        return ClipShape.createShape(blockPoints, (0 /* None */ !== (clipMask & 16 /* ZLow */)) ? low.z : undefined, 0 /* None */ !== (clipMask & 32 /* ZHigh */) ? high.z : undefined, transform, isMask, invisible, result);
    }
    /** Creates a new ClipShape with undefined members and a polygon points array of zero length. */
    static createEmpty(isMask = false, invisible = false, transform, result) {
        if (result) {
            result._clipPlanes = undefined;
            result._maskPlanes = undefined;
            result._invisible = invisible;
            result._bCurve = undefined;
            result._polygon.length = 0;
            result.initSecondaryProps(isMask, undefined, undefined, transform);
            return result;
        }
        return new ClipShape([], undefined, undefined, transform, isMask, invisible);
    }
    /** Checks to ensure that the member polygon has an area, and that the polygon is closed. */
    get isValidPolygon() {
        if (this._polygon.length < 3)
            return false;
        if (!this._polygon[0].isExactEqual(this._polygon[this._polygon.length - 1]))
            return false;
        return true;
    }
    /** Returns a deep copy of this instance of ClipShape, storing in an optional result */
    clone(result) {
        return ClipShape.createFrom(this, result);
    }
    /** Given the current polygon data, parses clip planes that together form an object, storing the result in the set given, either clipplanes or maskplanes. */
    parseClipPlanes(set) {
        const points = this._polygon;
        if (points.length === 3 && !this._isMask && points[0].isExactEqual(points[points.length - 1])) {
            this.parseLinearPlanes(set, this._polygon[0], this._polygon[1]);
            return true;
        }
        const direction = PointHelpers_1.PolygonOps.testXYPolygonTurningDirections(points);
        if (0 !== direction) {
            this.parseConvexPolygonPlanes(set, this._polygon, direction);
            return true;
        }
        else {
            this.parseConcavePolygonPlanes(set, this._polygon);
            return false;
        }
    }
    /** Given a start and end point, populate the given UnionOfConvexClipPlaneSets with ConvexClipPlaneSets defining the bounded region of linear planes. Returns true if successful. */
    parseLinearPlanes(set, start, end, cameraFocalLength) {
        // Handles the degenerate case of 2 distinct points (used by select by line).
        const normal = start.vectorTo(end);
        if (normal.magnitude() === 0.0)
            return false;
        normal.normalize(normal);
        const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
        if (cameraFocalLength === undefined) {
            const perpendicular = PointVector_1.Vector2d.create(-normal.y, normal.x);
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(normal.x, normal.y), PointVector_1.Point3d.createFrom(start), this._invisible));
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(-normal.x, -normal.y), PointVector_1.Point3d.createFrom(end), this._invisible));
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(perpendicular.x, perpendicular.y), PointVector_1.Point3d.createFrom(start), this._invisible));
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(-perpendicular.x, -perpendicular.y), PointVector_1.Point3d.createFrom(start), this._invisible));
        }
        else {
            const start3d = PointVector_1.Point3d.create(start.x, start.y, -cameraFocalLength);
            const end3d = PointVector_1.Point3d.create(end.x, end.y, -cameraFocalLength);
            const vecEnd3d = PointVector_1.Vector3d.createFrom(end3d);
            const perpendicular = vecEnd3d.crossProduct(PointVector_1.Vector3d.createFrom(start3d)).normalize();
            let endNormal = PointVector_1.Vector3d.createFrom(start3d).crossProduct(perpendicular).normalize();
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(perpendicular, 0.0, this._invisible));
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(endNormal, 0.0, this._invisible));
            perpendicular.negate();
            endNormal = vecEnd3d.crossProduct(perpendicular).normalize();
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(perpendicular, 0.0, this._invisible));
            convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(endNormal, 0.0, this._invisible));
        }
        convexSet.addZClipPlanes(this._invisible, this._zLow, this._zHigh);
        set.addConvexSet(convexSet);
        return true;
    }
    /** Given a convex polygon defined as an array of points, populate the given UnionOfConvexClipPlaneSets with ConvexClipPlaneSets defining the bounded region. Returns true if successful. */
    parseConvexPolygonPlanes(set, polygon, direction, cameraFocalLength) {
        const samePointTolerance = 1.0e-8; // This could possibly be replaced with more widely used constants
        const edges = [];
        const reverse = (direction < 0) !== this._isMask;
        for (let i = 0; i < polygon.length - 1; i++) {
            const z = (cameraFocalLength === undefined) ? 0.0 : -cameraFocalLength;
            const dir = PointVector_1.Vector2d.createFrom((polygon[i + 1].minus(polygon[i])));
            const magnitude = dir.magnitude();
            dir.normalize(dir);
            if (magnitude > samePointTolerance) {
                const normal = PointVector_1.Vector2d.create(reverse ? dir.y : -dir.y, reverse ? -dir.x : dir.x);
                edges.push(new PolyEdge(polygon[i], polygon[i + 1], normal, z));
            }
        }
        if (edges.length < 3) {
            return false;
        }
        if (this._isMask) {
            const last = edges.length - 1;
            for (let i = 0; i <= last; i++) {
                const edge = edges[i];
                const prevEdge = edges[i ? (i - 1) : last];
                const nextEdge = edges[(i === last) ? 0 : (i + 1)];
                const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
                const prevNormal = edge.normal.minus(prevEdge.normal);
                const nextNormal = edge.normal.minus(nextEdge.normal);
                prevNormal.normalize(prevNormal);
                nextNormal.normalize(nextNormal);
                // Create three-sided fans from each edge.   Note we could define the correct region
                // with only two planes for edge, but cannot then designate the "interior" status of the edges accurately.
                convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(prevNormal.x, prevNormal.y), edge.origin, this._invisible, true));
                convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(edge.normal.x, edge.normal.y), edge.origin, this._invisible, false));
                convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(nextNormal.x, nextNormal.y), nextEdge.origin, this._invisible, true));
                convexSet.addZClipPlanes(this._invisible, this._zLow, this._zHigh);
                set.addConvexSet(convexSet);
            }
            set.addOutsideZClipSets(this._invisible, this._zLow, this._zHigh);
        }
        else {
            const convexSet = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
            if (cameraFocalLength === undefined) {
                for (const edge of edges)
                    convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndPoint(PointVector_1.Vector3d.create(edge.normal.x, edge.normal.y), edge.origin));
            }
            else {
                if (reverse)
                    for (const edge of edges)
                        convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.createFrom(edge.origin).crossProduct(PointVector_1.Vector3d.createFrom(edge.next)).normalize(), 0.0));
                else
                    for (const edge of edges)
                        convexSet.planes.push(ClipPlane_1.ClipPlane.createNormalAndDistance(PointVector_1.Vector3d.createFrom(edge.next).crossProduct(PointVector_1.Vector3d.createFrom(edge.origin)).normalize(), 0.0));
            }
            convexSet.addZClipPlanes(this._invisible, this._zLow, this._zHigh);
            set.addConvexSet(convexSet);
        }
        return true;
    }
    /** Given a concave polygon defined as an array of points, populate the given UnionOfConvexClipPlaneSets with multiple ConvexClipPlaneSets defining the bounded region. Returns true if successful. */
    parseConcavePolygonPlanes(set, polygon, cameraFocalLength) {
        const triangulatedPolygon = Triangulation_1.Triangulator.earcutSingleLoop(polygon);
        Triangulation_1.Triangulator.cleanupTriangulation(triangulatedPolygon);
        triangulatedPolygon.announceFaceLoops((_graph, edge) => {
            if (!edge.isMaskSet(1 /* EXTERIOR */)) {
                const convexFacetPoints = edge.collectAroundFace((node) => {
                    if (!node.isMaskSet(1 /* EXTERIOR */))
                        return PointVector_1.Point3d.create(node.x, node.y, 0);
                });
                // parseConvexPolygonPlanes expects a closed loop (pushing the reference doesn't matter)
                convexFacetPoints.push(convexFacetPoints[0]);
                const direction = PointHelpers_1.PolygonOps.testXYPolygonTurningDirections(convexFacetPoints); // ###TODO: Can we expect a direction coming out of graph facet?
                this.parseConvexPolygonPlanes(set, convexFacetPoints, direction, cameraFocalLength);
            }
            return true;
        });
        return true;
    }
    /** Get the 3-dimensional range that this combination of ClipPlanes bounds in space. Returns the range/result
     *  if successful, otherwise, returns undefined. Transform will only be used for transforming the polygon points if clipplanes/maskplanes
     *  have not yet been set. Otherwise, we return the range of the planes without an applied transform.
     */
    getRange(returnMaskRange = false, transform, result) {
        let zHigh = Number.MAX_VALUE;
        let zLow = -Number.MAX_VALUE;
        transform = (transform === undefined) ? Transform_1.Transform.createIdentity() : transform;
        if (this._transformToClip !== undefined)
            transform.setMultiplyTransformTransform(transform, this._transformFromClip);
        if ((!returnMaskRange && this._isMask) || this._polygon === undefined)
            return undefined;
        if (this._zLowValid)
            zLow = this._zLow;
        if (this._zHighValid)
            zHigh = this._zHigh;
        const range = Range_1.Range3d.createNull(result);
        for (const point of this._polygon) {
            const shapePts = [
                PointVector_1.Point3d.create(point.x, point.y, zLow),
                PointVector_1.Point3d.create(point.x, point.y, zHigh),
            ];
            transform.multiplyPoint3dArray(shapePts, shapePts);
            range.extend(shapePts[0], shapePts[1]);
        }
        if (range.isNull) {
            return undefined;
        }
        return range;
    }
    /** Return true if the point lies inside/on this polygon (or not inside/on if this polygon is a mask). Otherwise, return false. */
    pointInside(point, onTolerance = Geometry_1.Geometry.smallMetricDistanceSquared) {
        if (this.fetchMaskPlanesRef() !== undefined)
            return !this._maskPlanes.isPointOnOrInside(point, onTolerance);
        return this.fetchClipPlanesRef().isPointOnOrInside(point, onTolerance);
    }
    transformInPlace(transform) {
        if (transform.isIdentity)
            return true;
        super.transformInPlace(transform);
        if (this._transformValid)
            transform.multiplyTransformTransform(this._transformFromClip, this._transformFromClip);
        else
            this._transformFromClip = transform;
        this._transformToClip = this._transformFromClip.inverse(); // could be undefined
        this._transformValid = true;
        return true;
    }
    multiplyPlanesTimesMatrix(matrix) {
        if (this._isMask)
            return false;
        this._clipPlanes = UnionOfConvexClipPlaneSets_1.UnionOfConvexClipPlaneSets.createEmpty();
        this._maskPlanes = undefined;
        this.parseClipPlanes(this._clipPlanes);
        this._clipPlanes.multiplyPlanesByMatrix(matrix);
        return true;
    }
    get isXYPolygon() {
        if (this._polygon.length === 0) // Note: This is a lenient check, as points array could also contain less than 3 points (not a polygon)
            return false;
        if (this._transformFromClip === undefined)
            return true;
        const testPoint = PointVector_1.Vector3d.create(0.0, 0.0, 1.0);
        this._transformFromClip.multiplyVectorXYZ(testPoint.x, testPoint.y, testPoint.z, testPoint);
        return testPoint.magnitudeXY() < 1.0e-8;
    }
    /** Transform the input point using this instance's transformToClip member */
    performTransformToClip(point) {
        if (this._transformToClip !== undefined)
            this._transformToClip.multiplyPoint3d(point);
    }
    /** Transform the input point using this instance's transformFromClip member */
    performTransformFromClip(point) {
        if (this._transformFromClip !== undefined)
            this._transformFromClip.multiplyPoint3d(point);
    }
}
exports.ClipShape = ClipShape;
//# sourceMappingURL=ClipPrimitive.js.map