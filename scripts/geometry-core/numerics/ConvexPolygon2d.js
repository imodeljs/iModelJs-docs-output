"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Numerics */
const PointVector_1 = require("../PointVector");
const Range_1 = require("../Range");
const Geometry_1 = require("../Geometry");
class Ray2d {
    constructor(origin, direction) {
        this._origin = origin;
        this._direction = direction;
    }
    static createOriginAndTarget(origin, target) {
        return new Ray2d(origin.clone(), origin.vectorTo(target));
    }
    static createOriginAndDirection(origin, direction) {
        return new Ray2d(origin.clone(), direction.clone());
    }
    static createOriginAndDirectionCapture(origin, direction) {
        return new Ray2d(origin, direction);
    }
    get origin() { return this._origin; }
    get direction() { return this._direction; }
    /**
     *  Return a ray that is parallel at distance to the left, specified as fraction of the ray's direction vector.
     */
    parallelRay(leftFraction) {
        return new Ray2d(this._origin.addForwardLeft(0.0, leftFraction, this._direction), this._direction);
    }
    CCWPerpendicularRay() {
        return new Ray2d(this._origin, this._direction.rotate90CCWXY());
    }
    CWPerpendicularRay() {
        return new Ray2d(this._origin, this._direction.rotate90CWXY());
    }
    normalizeDirectionInPlace() {
        if (this._direction.normalize(this._direction)) {
            return true;
        }
        else {
            this._direction.x = 1.0;
            this._direction.y = 0.0;
            // magnitude = 0.0;
            return false;
        }
    }
    /**
     * Intersect this ray (ASSUMED NORMALIZED) with unbounded line defined by points.
     *  (The normalization assumption affects test for parallel vectors.)
     *  Fraction and dhds passed as number[] to use by reference... Sticking to return of true and false in the case fraction is zero after
     *  a true safe divide
     */
    intersectUnboundedLine(linePointA, linePointB, fraction, dhds) {
        const lineDirection = linePointA.vectorTo(linePointB);
        const vector0 = linePointA.vectorTo(this._origin);
        const h0 = vector0.crossProduct(lineDirection);
        dhds[0] = this._direction.crossProduct(lineDirection);
        // h = h0 + s * dh
        const ff = Geometry_1.Geometry.conditionalDivideFraction(-h0, dhds[0]);
        if (ff !== undefined) {
            fraction[0] = ff;
            return true;
        }
        else {
            fraction[0] = 0.0;
            return false;
        }
    }
    /** return the ray fraction where point projects to the ray */
    projectionFraction(point) {
        return this._origin.vectorTo(point).fractionOfProjectionToVector(this._direction);
    }
    /** return the fraction of projection to the perpendicular ray */
    perpendicularProjectionFraction(point) {
        const uv = this._direction.crossProduct(this._origin.vectorTo(point));
        const uu = this._direction.magnitudeSquared();
        // Want zero returned if failure case, not undefined
        return Geometry_1.Geometry.safeDivideFraction(uv, uu, 0.0);
    }
    /** Return point from origin plus a scaled vector */
    fractionToPoint(f) {
        return this._origin.plusScaled(this._direction, f);
    }
}
exports.Ray2d = Ray2d;
class ConvexPolygon2d {
    constructor(points) {
        this._hullPoints = [];
        // Deep copy of points array given
        for (const point of points) {
            this._hullPoints.push(point);
        }
    }
    /** Create the hull */
    static createHull(points) {
        return new ConvexPolygon2d(ConvexPolygon2d.computeConvexHull(points));
    }
    /** Create the hull. First try to use the points as given. */
    static createHullIsValidCheck(points) {
        if (ConvexPolygon2d.isValidConvexHull(points))
            return new ConvexPolygon2d(points);
        else
            return new ConvexPolygon2d(ConvexPolygon2d.computeConvexHull(points));
    }
    /** Return a reference of the hull points. */
    get points() {
        return this._hullPoints;
    }
    /** Test if hull points are a convex, CCW polygon */
    static isValidConvexHull(points) {
        if (points.length < 3)
            return false;
        const n = points.length;
        for (let i = 0; i < n; i++) {
            const i1 = (i + 1) % n;
            const i2 = (i + 2) % n;
            if (points[i].crossProductToPoints(points[i1], points[i2]) < 0.0)
                return false;
        }
        return true;
    }
    /** Return true if the convex hull (to the left of the edges) contains the test point */
    containsPoint(point) {
        let xy0 = this._hullPoints[this._hullPoints.length - 1];
        // double tol = -1.0e-20;  negative tol!!
        for (const i of this._hullPoints) {
            const xy1 = i;
            const c = xy0.crossProductToPoints(xy1, point);
            if (c < 0.0)
                return false;
            xy0 = i;
        }
        return true;
    }
    /** Return the largest outside. (return 0 if in or on) */
    distanceOutside(xy) {
        let maxDistance = 0.0;
        const n = this._hullPoints.length;
        let xy0 = this._hullPoints[n - 1];
        // double tol = -1.0e-20;  // negative tol!!
        for (let i = 0; i < n; i++) {
            const xy1 = this._hullPoints[i];
            const c = xy0.crossProductToPoints(xy1, xy);
            if (c < 0.0) {
                const ray = Ray2d.createOriginAndTarget(xy0, xy1);
                const s = ray.projectionFraction(xy);
                let d = 0.0;
                if (s < 0.0)
                    d = xy0.distance(xy);
                else if (s > 1.0)
                    d = xy1.distance(xy);
                else
                    d = xy.distance(ray.fractionToPoint(s));
                if (d > maxDistance)
                    maxDistance = d;
            }
            xy0 = this._hullPoints[i];
        }
        return maxDistance;
    }
    /** Offset the entire hull (in place) by distance.
     * Returns false if an undefined occurred from normalizing (could occur after changing some hull points already)
     */
    offsetInPlace(distance) {
        const n = this._hullPoints.length;
        if (n >= 3) {
            const hullPoint0 = this._hullPoints[0];
            let edgeA = this._hullPoints[n - 1].vectorTo(hullPoint0);
            edgeA = edgeA.normalize();
            if (edgeA === undefined) {
                return false;
            }
            let perpA = edgeA.rotate90CWXY();
            let edgeB;
            let perpB;
            for (let i = 0; i < n; i++) {
                const j = i + 1;
                edgeB = this._hullPoints[i].vectorTo(j < n ? this._hullPoints[j] : hullPoint0);
                edgeB = edgeB.normalize();
                if (edgeB === undefined) {
                    return false;
                }
                perpB = edgeB.rotate90CWXY();
                const offsetBisector = PointVector_1.Vector2d.createOffsetBisector(perpA, perpB, distance);
                if (offsetBisector === undefined) {
                    return false;
                }
                this._hullPoints[i] = this._hullPoints[i].plus(offsetBisector);
                // PerpA takes up reference to perpB, as perpB will die in new iteration
                perpA = perpB;
            }
        }
        return true;
    }
    /**
     * Return 2 distances bounding the intersection of the ray with a convex hull.
     * ASSUME (for tolerancing) the ray has normalized direction vector.
     * Both negative and positive distances along the ray are possible.
     * Returns range with extremities if less than 3 points, distanceA > distanceB, or if cross product < 0
     */
    clipRay(ray) {
        let distanceA = -Number.MAX_VALUE;
        let distanceB = Number.MAX_VALUE;
        const n = this._hullPoints.length;
        if (n < 3)
            return Range_1.Range1d.createNull();
        let xy0 = this._hullPoints[n - 1];
        for (const xy1 of this._hullPoints) {
            const distance = [];
            const dhds = [];
            if (ray.intersectUnboundedLine(xy0, xy1, distance, dhds)) {
                if (dhds[0] > 0.0) {
                    if (distance[0] < distanceB)
                        distanceB = distance[0];
                }
                else {
                    if (distance[0] > distanceA)
                        distanceA = distance[0];
                }
                if (distanceA > distanceB)
                    return Range_1.Range1d.createNull();
            }
            else {
                // ray is parallel to the edge.
                // Any single point out classifies it all . ..
                if (xy0.crossProductToPoints(xy1, ray.origin) < 0.0)
                    return Range_1.Range1d.createNull();
            }
            // xy1 is reassigned with each new loop
            xy0 = xy1;
        }
        const range = Range_1.Range1d.createNull();
        range.extendX(distanceA);
        range.extendX(distanceB);
        return range;
    }
    /** Return the range of (fractional) ray postions for projections of all points from the arrays. */
    rangeAlongRay(ray) {
        const range = Range_1.Range1d.createNull();
        for (const xy1 of this._hullPoints)
            range.extendX(ray.projectionFraction(xy1));
        return range;
    }
    /** Return the range of (fractional) ray postions for projections of all points from the arrays. */
    rangePerpendicularToRay(ray) {
        const range = Range_1.Range1d.createNull();
        for (const xy1 of this._hullPoints)
            range.extendX(ray.perpendicularProjectionFraction(xy1));
        return range;
    }
    /** Computes the hull of a convex polygon from points given. Returns the hull as a new Point2d array.
     *  Returns an empty hull if less than 3 points are given.
     */
    static computeConvexHull(points) {
        const hull = [];
        const n = points.length;
        if (n < 3)
            return hull;
        // Get deep copy
        const xy1 = points.slice(0, n);
        xy1.sort(Geometry_1.Geometry.lexicalXYLessThan);
        hull.push(xy1[0]); // This is sure to stay
        hull.push(xy1[1]); // This one can be removed in loop.
        // First sweep creates upper hull
        for (let i = 2; i < n; i++) {
            const candidate = xy1[i];
            let top = hull.length - 1;
            while (top > 0 && hull[top - 1].crossProductToPoints(hull[top], candidate) <= 0.0) {
                top--;
                hull.pop();
            }
            hull.push(candidate);
        }
        // Second sweep creates lower hull right to left
        const i0 = hull.length - 1;
        // xy1.back () is already on stack.
        hull.push(xy1[n - 2]);
        for (let i = n - 2; i-- > 0;) {
            const candidate = xy1[i];
            let top = hull.length - 1;
            while (top > i0 && hull[top - 1].crossProductToPoints(hull[top], candidate) <= 0.0) {
                top--;
                hull.pop();
            }
            if (i > 0) // don't replicate start point!!!
                hull.push(candidate);
        }
        return hull;
    }
}
exports.ConvexPolygon2d = ConvexPolygon2d;
//# sourceMappingURL=ConvexPolygon2d.js.map