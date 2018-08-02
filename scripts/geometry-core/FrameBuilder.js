"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
// import { Point2d } from "./Geometry2d";
/* tslint:disable:variable-name jsdoc-format no-empty */
const Geometry_1 = require("./Geometry");
const PointVector_1 = require("./PointVector");
const Transform_1 = require("./Transform");
const CurvePrimitive_1 = require("./curve/CurvePrimitive");
const CurveChain_1 = require("./curve/CurveChain");
const BSplineCurve_1 = require("./bspline/BSplineCurve");
const Arc3d_1 = require("./curve/Arc3d");
const LineSegment3d_1 = require("./curve/LineSegment3d");
const LineString3d_1 = require("./curve/LineString3d");
const PointHelpers_1 = require("./PointHelpers");
/**
 * Helper class to accumulate points and vectors until there is enough data to define a coordinate system.
 *
 * * For the common case of building a right handed frame:
 *
 * ** create the FrameBuilder and make calls to announcePoint and announceVector.
 * ** the frame will be fully determined by an origin and two vectors.
 * ** the first call to announcePoint will set the origin.
 * **  additional calls to announcePoint will produce announceVector call with the vector from the origin.
 * ** After each announcement, call getValidatedFrame(false)
 * ** getValidatedFrame will succeed when it has two independent vectors.
 * *  to build a left handed frame,
 *
 * **  an origin and 3 independent vectors are required.
 * **  annouce as above, but query wtih getValidatedFrame (true).
 * **  this will use the third vector to select right or left handed frame.
 */
class FrameBuilder {
    clear() { this.origin = undefined; this.vector0 = undefined; this.vector1 = undefined; this.vector2 = undefined; }
    constructor() { this.clear(); }
    /** Try to assemble the data into a nonsingular transform.
     *
     * * If allowLeftHanded is false, vector0 and vector1 determine a right handed coordinate system.
     * * if allowLeftHanded is true, the z vector of the right handed system can be flipped to agree with vector2 direction.
     */
    getValidatedFrame(allowLeftHanded = false) {
        if (this.origin && this.vector0 && this.vector1) {
            if (!allowLeftHanded) {
                const matrix = Transform_1.RotMatrix.createRigidFromColumns(this.vector0, this.vector1, 0 /* XYZ */);
                if (matrix)
                    return Transform_1.Transform.createOriginAndMatrix(this.origin, matrix);
                // uh oh -- vector1 was not really independent.  clear everything after vector0.
                this.vector1 = this.vector2 = undefined;
            }
            else if (this.vector2) {
                const matrix = Transform_1.RotMatrix.createRigidFromColumns(this.vector0, this.vector1, 0 /* XYZ */);
                if (matrix) {
                    if (this.vector0.tripleProduct(this.vector1, this.vector2) < 0)
                        matrix.scaleColumns(1.0, 1.0, -1.0);
                    return Transform_1.Transform.createOriginAndMatrix(this.origin, matrix);
                }
                // uh oh again -- clear vector1 and vector2, reannounce vector2 as possible vector1??
                const vector2 = this.vector2;
                this.vector1 = this.vector2 = undefined;
                this.announceVector(vector2);
            }
        }
        return undefined;
    }
    // If vector0 is known but vector1 is not, make vector1 the cross of the upvector and vector0
    applyDefaultUpVector(vector) {
        if (vector && this.vector0 && !this.vector1 && !vector.isParallelTo(this.vector0)) {
            this.vector1 = vector.crossProduct(this.vector0);
        }
    }
    hasOrigin() { return this.origin !== undefined; }
    /** Return the number of vectors saved.   Because the save process checkes numerics, this should be the rank of the system.
     */
    savedVectorCount() {
        if (!this.vector0)
            return 0;
        if (!this.vector1)
            return 1;
        if (!this.vector2)
            return 2;
        return 3;
    }
    /** announce a new point.  If this point is different from the origin, also announce the vector from the origin.*/
    announcePoint(point) {
        if (!this.origin) {
            this.origin = point.clone();
            return this.savedVectorCount();
        }
        // the new point may provide an additional vector
        if (this.origin.isAlmostEqual(point))
            return this.savedVectorCount();
        return this.announceVector(this.origin.vectorTo(point));
    }
    announceVector(vector) {
        if (vector.isAlmostZero())
            return this.savedVectorCount();
        if (!this.vector0) {
            this.vector0 = vector;
            return 1;
        }
        if (!this.vector1) {
            if (!vector.isParallelTo(this.vector0)) {
                this.vector1 = vector;
                return 2;
            }
            return 1;
        }
        // vector0 and vector1 are independent.
        if (!this.vector2) {
            const unitPerpendicular = this.vector0.unitCrossProduct(this.vector1);
            if (unitPerpendicular && !Geometry_1.Geometry.isSameCoordinate(0, unitPerpendicular.dotProduct(vector))) {
                this.vector2 = vector;
                return 3;
            }
        }
        // fall through if prior vectors are all there -- no need for the new one.
        return 3;
    }
    /** Inspect the content of the data.  Announce points and vectors.   Return when savedVectorCount becomes
     * sufficient for a coordinate system.
     */
    announce(data) {
        if (this.savedVectorCount() > 1)
            return;
        if (data instanceof PointVector_1.Point3d)
            this.announcePoint(data);
        else if (data instanceof PointVector_1.Vector3d)
            this.announceVector(data);
        else if (Array.isArray(data)) {
            for (const child of data) {
                if (this.savedVectorCount() > 1)
                    break;
                this.announce(child);
            }
        }
        else if (data instanceof CurvePrimitive_1.CurvePrimitive) {
            if (data instanceof LineSegment3d_1.LineSegment3d) {
                this.announcePoint(data.startPoint());
                this.announcePoint(data.endPoint());
            }
            else if (data instanceof Arc3d_1.Arc3d) {
                const ray = data.fractionToPointAndDerivative(0.0);
                this.announcePoint(ray.origin);
                this.announceVector(ray.direction);
                this.announceVector(data.matrix.columnZCrossVector(ray.direction));
            }
            else if (data instanceof LineString3d_1.LineString3d) {
                for (const point of data.points) {
                    this.announcePoint(point);
                    if (this.savedVectorCount() > 1)
                        break;
                }
            }
            else if (data instanceof BSplineCurve_1.BSplineCurve3d) {
                const point = PointVector_1.Point3d.create();
                for (let i = 0; this.savedVectorCount() < 2; i++) {
                    if (data.getPole(i, point) instanceof PointVector_1.Point3d)
                        this.announcePoint(point);
                    else
                        break;
                }
            }
            // TODO: unknown curve type.  Stroke? FrenetFrame?
        }
        else if (data instanceof CurveChain_1.CurveCollection) {
            if (data.children)
                for (const child of data.children) {
                    this.announce(child);
                    if (this.savedVectorCount() > 1)
                        break;
                }
        }
    }
    /** create a localToWorld frame for the given data.
     *
     * *  origin is at first point
     * *  x axis in direction of first nonzero vector present or implied by the input.
     * *  y axis is perpendicular to x and contains (in positive side) the next vector present or implied by the input.
     */
    static createRightHandedFrame(defaultUpVector, ...params) {
        const builder = new FrameBuilder();
        for (const data of params) {
            builder.announce(data);
            builder.applyDefaultUpVector(defaultUpVector);
            const result = builder.getValidatedFrame(false);
            if (result !== undefined)
                return result;
        }
        // try direct evaluation of curve primitives?
        for (const data of params) {
            if (data instanceof CurveChain_1.CurveCollection) {
                const children = data.children;
                if (children) {
                    for (const curve of children) {
                        if (curve instanceof CurvePrimitive_1.CurvePrimitive) {
                            const frenetFrame = curve.fractionToFrenetFrame(0.0);
                            if (frenetFrame)
                                return frenetFrame;
                        }
                    }
                }
            }
        }
        return undefined;
    }
    /** create a map with
     * *  transform0 = the local to world
     * *  transform1 = world to local
     * * ideally all points in local xy plane
     */
    static createRightHandedLocalToWorld(...params) {
        const builder = new FrameBuilder();
        for (const data of params) {
            builder.announce(data);
            const localToWorld = builder.getValidatedFrame(false);
            if (localToWorld !== undefined)
                return localToWorld;
        }
        return undefined;
    }
    /**
     * try to create a frame whose xy plane is through points.
     *
     * *  if 3 or more distinct points are present, the x axis is from the first point to the most distance, and y direction is toward the
     * point most distant from that line.
     * @param points array of points
     */
    static createFrameToDistantPoints(points) {
        if (points.length > 2) {
            const origin = points[0].clone();
            const vector01 = PointVector_1.Vector3d.create();
            PointHelpers_1.Point3dArray.vectorToMostDistantPoint(points, points[0], vector01);
            const vector02 = PointVector_1.Vector3d.create();
            PointHelpers_1.Point3dArray.vectorToPointWithMaxCrossProductMangitude(points, origin, vector01, vector02);
            const matrix = Transform_1.RotMatrix.createRigidFromColumns(vector01, vector02, 0 /* XYZ */);
            if (matrix)
                return Transform_1.Transform.createRefs(origin, matrix);
        }
        return undefined;
    }
    /**
     * Create the localToWorld transform from a range to axes of its parent coordinate system.
     * @param range [in] range to inpsect
     * @param fractionX  [in] fractonal coordinate of frame origin x
     * @param fractionY [in] fractional coordinate of frame origin y
     * @param fractionZ [in] fractgional coordinate of frame origin z
     * @param scaleSelect [in] selects size of localToWorld axes.
     * @param defaultAxisLength [in] if true and any axis length is 0, that axis vector takes this physical length.
     */
    static createLocalToWorldTransformInRange(range, scaleSelect = 2 /* NonUniformRangeContainment */, fractionX = 0, fractionY = 0, fractionZ = 0, defaultAxisLength = 1.0) {
        if (range.isNull())
            return Transform_1.Transform.createIdentity();
        let a = 1.0;
        let b = 1.0;
        let c = 1.0;
        if (scaleSelect === 1 /* LongestRangeDirection */) {
            a = b = c = Geometry_1.Geometry.correctSmallMetricDistance(range.maxLength(), defaultAxisLength);
        }
        else if (scaleSelect === 2 /* NonUniformRangeContainment */) {
            a = Geometry_1.Geometry.correctSmallMetricDistance(range.xLength(), defaultAxisLength) * Geometry_1.Geometry.maxAbsDiff(fractionX, 0, 1);
            b = Geometry_1.Geometry.correctSmallMetricDistance(range.yLength(), defaultAxisLength) * Geometry_1.Geometry.maxAbsDiff(fractionY, 0, 1);
            c = Geometry_1.Geometry.correctSmallMetricDistance(range.zLength(), defaultAxisLength) * Geometry_1.Geometry.maxAbsDiff(fractionZ, 0, 1);
        }
        return Transform_1.Transform.createRefs(range.fractionToPoint(fractionX, fractionY, fractionZ), Transform_1.RotMatrix.createScale(a, b, c));
    }
}
exports.FrameBuilder = FrameBuilder;
//# sourceMappingURL=FrameBuilder.js.map