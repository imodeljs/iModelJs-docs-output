"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const CurvePrimitive_1 = require("./CurvePrimitive");
const LineSegment3d_1 = require("./LineSegment3d");
const Ray3d_1 = require("../geometry3d/Ray3d");
const CurveLocationDetail_1 = require("./CurveLocationDetail");
const LineString3d_1 = require("./LineString3d");
const Path_1 = require("./Path");
const Loop_1 = require("./Loop");
const Arc3d_1 = require("./Arc3d");
const CurveCurve_1 = require("./CurveCurve");
const Geometry_1 = require("../Geometry");
const AngleSweep_1 = require("../geometry3d/AngleSweep");
const RegionOps_1 = require("./RegionOps");
/**
 * Classification of contortions at a joint.
 * @internal
 */
var JointMode;
(function (JointMode) {
    JointMode[JointMode["Unknown"] = 0] = "Unknown";
    JointMode[JointMode["Cap"] = 1] = "Cap";
    JointMode[JointMode["Extend"] = 2] = "Extend";
    JointMode[JointMode["Trim"] = -1] = "Trim";
    JointMode[JointMode["JustGeometry"] = 3] = "JustGeometry";
    JointMode[JointMode["Gap"] = 4] = "Gap";
})(JointMode || (JointMode = {}));
/**
 * * control parameters for joint construction.
 * * Decision order is:
 *   * if turn angle is greater than minArcDegrees, make an arc.
 *   * if turn angle is less than or equal maxChamferTurnDegrees, extend curves along tangent to single intersection point.
 *   * if turn angle is greater than maxChamferTurnDegrees,  construct multiple lines that are tangent to the turn circle "from the outside",
 *           with each equal turn less than maxChamferTurnDegrees.
 *   * otherwise make single edge.
 * @public
 */
class JointOptions {
    /** Construct JointOptions.
     * * leftOffsetDistance is required
     * * minArcDegrees and maxChamferDegrees are optional.
     */
    constructor(leftOffsetDistance, minArcDegrees = 180, maxChamferDegrees = 90) {
        /** smallest arc to construct.
         * * If this control angle is large, arcs are never created.
         */
        this.minArcDegrees = 180.0;
        this.maxChamferTurnDegrees = 90;
        this.leftOffsetDistance = 0;
        this.leftOffsetDistance = leftOffsetDistance;
        this.minArcDegrees = minArcDegrees;
        this.maxChamferTurnDegrees = maxChamferDegrees;
    }
    /**
     * Parse a number of JointOptions up to JointOptions:
     * * If leftOffsetDistanceOptions is a number, create a JointOptions with default arc and chamfer values.
     * * If leftOffsetDistanceOrOptions is a JointOptions, return it unchanged.
     * @param leftOffsetDistanceOrOptions
     */
    static create(leftOffsetDistanceOrOptions) {
        if (leftOffsetDistanceOrOptions instanceof JointOptions)
            return leftOffsetDistanceOrOptions;
        // if (Number.isFinite(leftOffsetDistanceOrOptions))
        return new JointOptions(leftOffsetDistanceOrOptions);
    }
    /** return true if the options indicate this amount of turn should be handled with an arc. */
    needArc(theta) {
        return Math.abs(theta.degrees) >= this.minArcDegrees;
    }
    /** Test if turn by theta should be output as single point. */
    numChamferPoints(theta) {
        const degrees = Math.abs(theta.degrees);
        const stepDegrees = Geometry_1.Geometry.clamp(this.maxChamferTurnDegrees, 10, 120);
        if (degrees <= stepDegrees)
            return 1;
        return Math.ceil(degrees / stepDegrees);
    }
}
exports.JointOptions = JointOptions;
/**
 * Description of geometry around a joint.
 * @internal
 */
class Joint {
    // capture references to all data . . .
    constructor(curve0, curve1, swingPoint) {
        this.curve0 = curve0;
        this.curve1 = curve1;
        this.swingPoint = swingPoint;
        this.flexure = JointMode.Unknown;
    }
    /** try to construct an arc transition from ray0 to ray1 with given center. */
    static constructArc(ray0, center, ray1) {
        if (center !== undefined && Geometry_1.Geometry.isSameCoordinate(ray0.origin.distance(center), ray1.origin.distance(center))) {
            const angle = ray0.direction.angleToXY(ray1.direction);
            const vector0 = Point3dVector3d_1.Vector3d.createStartEnd(center, ray0.origin);
            const vector90 = vector0.rotate90CCWXY();
            return Arc3d_1.Arc3d.create(center, vector0, vector90, AngleSweep_1.AngleSweep.createStartEndRadians(0.0, angle.radians));
        }
        return undefined;
    }
    /** Extract a json object of {curve0:data, fraction0:data, curve1:data, fraction1:data} */
    shallowExtract() {
        return { curve0: this.curve0, curve1: this.curve1, fraction0: this.fraction0, fraction1: this.fraction1 };
    }
    /** Establish the nextJoint and previousJoint links from joint0 to joint1. */
    static link(joint0, joint1) {
        joint0.nextJoint = joint1;
        if (joint1)
            joint1.previousJoint = joint0;
        if (joint0.curve1 && joint1 && !joint1.curve0)
            joint1.curve0 = joint0.curve1;
        else if (!joint0.curve1 && joint1 && joint1.curve0)
            joint0.curve1 = joint1.curve0;
    }
    /**
     * * If nextJoint and nextJoint.fraction0 are defined, return them.
     * * Otherwise return defaultValue
     */
    nextJointFraction0(defaultValue) {
        if (this.nextJoint && this.nextJoint.fraction0 !== undefined)
            return this.nextJoint.fraction0;
        return defaultValue;
    }
    static addStrokes(destination, curve) {
        if (curve) {
            curve.emitStrokes(destination);
        }
    }
    static addPoint(destination, point) {
        if (destination.packedPoints.length > 0) {
            const pointA = destination.endPoint();
            if (!pointA.isAlmostEqual(point))
                destination.packedPoints.push(point);
        }
    }
    static collectStrokesFromChain(start, destination, maxTest = 100) {
        let numOut = -2 * maxTest; // allow extra things to happen
        Joint.visitJointsOnChain(start, (joint) => {
            this.addStrokes(destination, joint.jointCurve);
            if (joint.curve1 && joint.fraction1 !== undefined) {
                const fA = joint.fraction1;
                const fB = joint.nextJointFraction0(1.0);
                let curve1;
                if (fA === 0.0 && fB === 1.0)
                    curve1 = joint.curve1.clone();
                else if (fA < fB)
                    curve1 = joint.curve1.clonePartialCurve(fA, fB);
                if (curve1) {
                    if (!joint.jointCurve) {
                        this.addPoint(destination, curve1.startPoint());
                    }
                }
                this.addStrokes(destination, curve1);
            }
            return numOut++ < maxTest;
        }, maxTest);
    }
    static collectPrimitive(destination, primitive) {
        if (primitive)
            destination.push(primitive);
    }
    static collectCurvesFromChain(start, destination, maxTest = 100) {
        let numOut = -2 * maxTest; // allow extra things to happen
        Joint.visitJointsOnChain(start, (joint) => {
            this.collectPrimitive(destination, joint.jointCurve);
            if (joint.curve1 && joint.fraction1 !== undefined) {
                const fA = joint.fraction1;
                const fB = joint.nextJointFraction0(1.0);
                let curve1;
                if (fA === 0.0 && fB === 1.0)
                    curve1 = joint.curve1.clone();
                else if (fA < fB)
                    curve1 = joint.curve1.clonePartialCurve(fA, fB);
                this.collectPrimitive(destination, curve1);
            }
            return numOut++ < maxTest;
        }, maxTest);
    }
    /** Execute `joint.annotateJointMode()` at all joints on the chain. */
    static annotateChain(start, options, maxTest = 100) {
        Joint.visitJointsOnChain(start, (joint) => { joint.annotateJointMode(options); return true; }, maxTest);
    }
    /**
     * Visit joints on a chain.
     * * terminate on `false` return from `callback`
     * @param start first (and, for cyclic chain, final) Joint
     * @param callback function to call with each Joint as a single parameter.
     */
    static visitJointsOnChain(start, callback, maxTest = 100) {
        let joint = start;
        if (joint) {
            let numTest = 0;
            while (joint !== undefined) {
                if (numTest++ >= maxTest + 5)
                    return true;
                if (!callback(joint))
                    return false;
                joint = joint.nextJoint;
                if (joint === start)
                    break;
            }
        }
        return true;
    }
    annotateExtension(options) {
        if (this.curve0 && this.curve1) {
            const ray0 = this.curve0.fractionToPointAndDerivative(1.0); // And we know that is full length ray !
            const ray1 = this.curve1.fractionToPointAndDerivative(0.0); // ditto
            const intersection = Ray3d_1.Ray3d.closestApproachRay3dRay3d(ray0, ray1);
            if (intersection.approachType === CurveLocationDetail_1.CurveCurveApproachType.Intersection) {
                this.fraction0 = 1.0;
                this.fraction1 = 0.0;
                if (intersection.detailA.fraction >= 0.0 && intersection.detailB.fraction <= 0.0) {
                    this.flexure = JointMode.Extend;
                    const theta = ray0.getDirectionRef().angleToXY(ray1.getDirectionRef());
                    if (options.needArc(theta)) {
                        const arc = Joint.constructArc(ray0, this.curve0.baseCurveEnd, ray1);
                        if (arc) {
                            this.fraction0 = 1.0;
                            this.fraction1 = 0.0;
                            this.jointCurve = arc;
                            return;
                        }
                    }
                    const numChamferPoints = options.numChamferPoints(theta);
                    if (numChamferPoints <= 1) {
                        this.jointCurve = LineString3d_1.LineString3d.create(ray0.origin, intersection.detailA.point, ray1.origin);
                        return;
                    }
                    if (numChamferPoints > 1) {
                        // A nontrivial linestring ...
                        const radians0 = theta.radians;
                        const numHalfStep = 2.0 * numChamferPoints;
                        const halfStepRadians = radians0 / numHalfStep;
                        const arc = Joint.constructArc(ray0, this.curve0.baseCurveEnd, ray1);
                        if (arc !== undefined) {
                            const radialFraction = 1 / Math.cos(halfStepRadians);
                            const jointCurve = LineString3d_1.LineString3d.create();
                            this.jointCurve = jointCurve;
                            jointCurve.addPoint(ray0.origin); // possibly extend segment or line string
                            for (let i = 0; i < numChamferPoints; i++) {
                                const arcFraction = (1 + 2 * i) / numHalfStep;
                                jointCurve.addPoint(arc.fractionAndRadialFractionToPoint(arcFraction, radialFraction));
                            }
                            jointCurve.addPoint(ray1.origin); // possibly extend segment or line string.
                            return;
                        }
                    }
                }
            }
            // desperation appears ...
            this.flexure = JointMode.Gap;
            this.jointCurve = LineSegment3d_1.LineSegment3d.create(this.curve0.fractionToPoint(1.0), this.curve1.fractionToPoint(0.0));
            this.fraction0 = 1.0;
            this.fraction1 = 0.0;
        }
    }
    // Select the index at which summed fraction difference is smallest.
    selectIntersectionIndexByFraction(fractionA, fractionB, intersections) {
        let index = -1;
        let aMin = Number.MAX_VALUE;
        for (let i = 0; i < intersections.dataA.length; i++) {
            const a = Math.abs(intersections.dataA[i].fraction - fractionA) + Math.abs(intersections.dataB[i].fraction - fractionB);
            if (a < aMin) {
                aMin = a;
                index = i;
            }
        }
        return index;
    }
    /**
     * Examine the adjacent geometry
     * * set JointMode:  one of Cap Extend, or Trim
     * * set fraction0 and fraction1 of intersection of curve0 and curve1
     * * this REFERENCES curve0, curve1, fraction0, fraction1
     * * this does not reference nextJoint and previousJoint
     */
    annotateJointMode(options) {
        if (this.curve0 && !this.curve1) {
            this.flexure = JointMode.Cap;
            this.fraction0 = 1.0;
        }
        else if (this.curve1 && !this.curve0) {
            this.flexure = JointMode.Cap;
            this.fraction1 = 0.0;
        }
        else if (this.curve0 && this.curve1) {
            const ray0 = this.curve0.fractionToPointAndDerivative(0.0); // And we know that is full length ray !
            const ray1 = this.curve1.fractionToPointAndDerivative(0.0); // ditto
            if (this.curve0 instanceof LineSegment3d_1.LineSegment3d && this.curve1 instanceof LineSegment3d_1.LineSegment3d) {
                // check for direct intersection -- occurs on offset of colinear base segments.
                if (this.curve0.endPoint().isAlmostEqual(this.curve1.startPoint())) {
                    this.fraction0 = 1.0;
                    this.fraction1 = 0.0;
                    this.flexure = JointMode.Trim;
                }
                else {
                    const intersection = Ray3d_1.Ray3d.closestApproachRay3dRay3d(ray0, ray1);
                    if (intersection.approachType === CurveLocationDetail_1.CurveCurveApproachType.Intersection) {
                        this.fraction0 = intersection.detailA.fraction;
                        this.fraction1 = intersection.detailB.fraction;
                        if (this.fraction0 >= 1.0 && this.fraction1 <= 0.0) {
                            this.annotateExtension(options);
                        }
                        else if (this.fraction0 < 1.0 && this.fraction1 > 0.0) {
                            this.flexure = JointMode.Trim;
                        }
                        else if (this.fraction0 > 1.0 && this.fraction1 > 1.0) {
                            this.flexure = JointMode.Gap;
                            this.jointCurve = LineSegment3d_1.LineSegment3d.create(this.curve0.fractionToPoint(1.0), this.curve1.fractionToPoint(0.0));
                            this.fraction0 = 1.0;
                            this.fraction1 = 0.0;
                        }
                    }
                }
            }
            else {
                // generic pair of curves ...
                const intersections = CurveCurve_1.CurveCurve.intersectionXY(this.curve0, false, this.curve1, false);
                const intersectionIndex = this.selectIntersectionIndexByFraction(1.0, 0.0, intersections);
                if (intersectionIndex >= 0) {
                    this.flexure = JointMode.Trim;
                    this.fraction0 = intersections.dataA[intersectionIndex].fraction;
                    this.fraction1 = intersections.dataB[intersectionIndex].fraction;
                }
                else {
                    this.annotateExtension(options);
                }
            }
        }
    }
    /**
     * * Examine the primitive trim fractions between each pair of joints.
     * * If trim fractions indicate the primitive must disappear, replace the joint pair by a new joint pointing at surrounding primitives
     * @param start
     */
    static removeDegeneratePrimitives(start, options, maxTest) {
        /*
        if (Checker.noisy.PolygonOffset)
          console.log("\nENTER removeDegenerates");
        */
        let jointA = start;
        let numRemoved = 0;
        const maxRemove = 1;
        let numTest = 0;
        if (jointA) {
            while (jointA !== undefined && numTest++ < maxTest) {
                const jointB = jointA.nextJoint;
                if (jointA
                    && jointB
                    && jointA.previousJoint
                    && jointB.nextJoint
                    && jointA.fraction1 !== undefined
                    && jointB.fraction0 !== undefined) {
                    const f0 = jointA.fraction1;
                    const f1 = jointB.fraction0;
                    const g0 = jointB.fraction1;
                    const g1 = jointB.nextJoint.fraction0;
                    // f0 and f1 are fractions on the single primitive between these joints.
                    /*
                      if (Checker.noisy.PolygonOffset) {
                        console.log("joint candidate");
                        console.log(prettyPrint(jointA.shallowExtract()));
                        console.log(prettyPrint(jointB.shallowExtract()));
                        console.log("FRACTIONS ", { fA1: f0, fB0: f1 });
                      }
                    */
                    const eliminateF = f0 >= f1 || f0 > 1.0;
                    const eliminateG = (g0 !== undefined && g0 > 1.0)
                        || (g0 !== undefined && g1 !== undefined && g0 >= g1);
                    if (eliminateF && eliminateG) {
                        const jointC = jointB.nextJoint;
                        const newJoint = new Joint(jointA.curve0, jointC.curve1, undefined);
                        Joint.link(jointA.previousJoint, newJoint);
                        Joint.link(newJoint, jointC.nextJoint);
                        newJoint.annotateJointMode(options);
                        newJoint.previousJoint.annotateJointMode(options);
                        if (newJoint.nextJoint)
                            newJoint.nextJoint.annotateJointMode(options);
                        /*
                        if (Checker.noisy.PolygonOffset) {
                          console.log(" NEW DOUBLE CUT");
                          console.log(prettyPrint(newJoint.shallowExtract()));
                        }
                        */
                    }
                    else if (eliminateF) {
                        const newJoint = new Joint(jointA.curve0, jointB.curve1, undefined);
                        Joint.link(jointA.previousJoint, newJoint);
                        Joint.link(newJoint, jointB.nextJoint);
                        newJoint.annotateJointMode(options);
                        newJoint.previousJoint.annotateJointMode(options);
                        newJoint.nextJoint.annotateJointMode(options);
                        /*
                        if (Checker.noisy.PolygonOffset) {
                          console.log(" NEW JOINT");
                          console.log(prettyPrint(newJoint.shallowExtract()));
                        }
                      */
                        numRemoved++;
                        if (jointA === start)
                            start = newJoint;
                        jointA = newJoint;
                        if (numRemoved >= maxRemove) {
                            /*
                            if (Checker.noisy.PolygonOffset)
                              console.log(" EXIT removeDegenerates at maxRemove\n");
                            */
                            return { newStart: start, numJointRemoved: numRemoved };
                        }
                    }
                }
                jointA = jointA.nextJoint;
                if (jointA === start)
                    break;
            }
        }
        return { newStart: start, numJointRemoved: numRemoved };
    }
}
/**
 * Context for building a wire offset.
 * @internal
 */
class PolygonWireOffsetContext {
    /** construct a context. */
    constructor() {
    }
    // Construct a single offset from base points
    static createOffsetSegment(basePointA, basePointB, distance) {
        Point3dVector3d_1.Vector3d.createStartEnd(basePointA, basePointB, this._unitAlong);
        if (this._unitAlong.normalizeInPlace()) {
            this._unitAlong.rotate90CCWXY(this._unitPerp);
            const segment = LineSegment3d_1.LineSegment3d.create(basePointA.plusScaled(this._unitPerp, distance, this._offsetA), basePointB.plusScaled(this._unitPerp, distance, this._offsetB));
            CurveChainWireOffsetContext.applyBasePoints(segment, basePointA.clone(), basePointB.clone());
            return segment;
        }
        return undefined;
    }
    /**
     * Construct curves that are offset from a polygon.
     * * The construction will remove "some" local effects of features smaller than the offset distance, but will not detect self intersection with far-away edges.
     * @param points
     * @param wrap
     * @param offsetDistance
     */
    constructPolygonWireXYOffset(points, wrap, leftOffsetDistanceOrOptions) {
        const options = JointOptions.create(leftOffsetDistanceOrOptions);
        const numPoints = points.length;
        let fragment0 = PolygonWireOffsetContext.createOffsetSegment(points[0], points[1], options.leftOffsetDistance);
        let joint0 = new Joint(undefined, fragment0, points[0]);
        let newJoint;
        let previousJoint = joint0;
        for (let i = 1; i + 1 < numPoints; i++) {
            const fragment1 = PolygonWireOffsetContext.createOffsetSegment(points[i], points[i + 1], options.leftOffsetDistance);
            newJoint = new Joint(fragment0, fragment1, points[i]);
            Joint.link(previousJoint, newJoint);
            previousJoint = newJoint;
            fragment0 = fragment1;
        }
        if (wrap)
            Joint.link(previousJoint, joint0);
        else {
            newJoint = new Joint(fragment0, undefined, points[numPoints - 1]);
            Joint.link(previousJoint, newJoint);
        }
        Joint.annotateChain(joint0, options, numPoints);
        for (let pass = 0; pass++ < 5;) {
            const state = Joint.removeDegeneratePrimitives(joint0, options, numPoints);
            joint0 = state.newStart;
            if (state.numJointRemoved === 0)
                break;
            /*
            if (Checker.noisy.PolygonOffset) {
              console.log("  POST REMOVE DEGENERATES  " + state.numJointRemoved);
              Joint.visitJointsOnChain(joint0, (joint: Joint) => { console.log(prettyPrint(joint.shallowExtract())); return true; });
            }
            */
        }
        // Joint.collectPrimitivesFromChain(joint0, result, numPoints);
        const chain = LineString3d_1.LineString3d.create();
        Joint.collectStrokesFromChain(joint0, chain, numPoints);
        const n = chain.packedPoints.length;
        if (n > 1) {
            if (chain.packedPoints.front().isAlmostEqual(chain.packedPoints.back()))
                return Loop_1.Loop.create(chain);
            else
                return Path_1.Path.create(chain);
        }
        return undefined;
    }
}
exports.PolygonWireOffsetContext = PolygonWireOffsetContext;
PolygonWireOffsetContext._unitAlong = Point3dVector3d_1.Vector3d.create();
PolygonWireOffsetContext._unitPerp = Point3dVector3d_1.Vector3d.create();
PolygonWireOffsetContext._offsetA = Point3dVector3d_1.Point3d.create();
PolygonWireOffsetContext._offsetB = Point3dVector3d_1.Point3d.create();
/**
 * Context for building a wire offset from a Path or Loop of CurvePrimitives
 * @internal
 */
class CurveChainWireOffsetContext {
    /** construct a context. */
    constructor() {
    }
    // Construct a single offset from base points
    static createOffsetSegment(basePointA, basePointB, distanceLeft) {
        Point3dVector3d_1.Vector3d.createStartEnd(basePointA, basePointB, this._unitAlong);
        if (this._unitAlong.normalizeInPlace()) {
            this._unitAlong.rotate90CCWXY(this._unitPerp);
            return LineSegment3d_1.LineSegment3d.create(basePointA.plusScaled(this._unitPerp, distanceLeft, this._offsetA), basePointB.plusScaled(this._unitPerp, distanceLeft, this._offsetB));
        }
        return undefined;
    }
    /**
     * Annotate a CurvePrimitive with properties `baseCurveStart` and `baseCurveEnd`.
     * * return cp
     * @param cp primitive to annotate
     * @param startPoint optional start point
     * @param endPoint optional end point
     */
    static applyBasePoints(cp, startPoint, endPoint) {
        if (cp !== undefined) {
            if (startPoint !== undefined)
                cp.baseCurveStart = startPoint;
            if (endPoint !== undefined)
                cp.baseCurveEnd = endPoint;
        }
        return cp;
    }
    /**
     * Create the offset of a single primitive.
     * * each primitive may be labeled (as an `any` object) with start or end point of base curve:
     *   * `(primitive as any).baseCurveStart: Point3d`
     *   * `(primitive as any).baseCurveEnd: Point3d`
     * @param g primitive to offset
     * @param distanceLeft
     */
    static createSingleOffsetPrimitiveXY(g, distanceLeft) {
        const point0 = g.fractionToPoint(0.0);
        const point1 = g.fractionToPoint(1.0);
        if (g instanceof LineSegment3d_1.LineSegment3d) {
            return this.applyBasePoints(this.createOffsetSegment(point0, point1, distanceLeft), point0, point1);
        }
        else if (g instanceof Arc3d_1.Arc3d) {
            const g1 = g.cloneAtZ();
            if (g1.isCircular) {
                const sign = g1.sweep.sweepRadians * g1.matrix.coffs[8] >= 0.0 ? 1.0 : -1.0;
                const r = g1.matrix.columnXMagnitude();
                const r1 = r - sign * distanceLeft;
                if (r1 >= 0) {
                    const factor = r1 / r;
                    const matrix = g1.matrix;
                    matrix.scaleColumnsInPlace(factor, factor, 1.0);
                    return this.applyBasePoints(Arc3d_1.Arc3d.createRefs(g1.center.clone(), matrix, g1.sweep.clone()), g.startPoint(), g.endPoint());
                }
            }
        }
        else if (g instanceof LineString3d_1.LineString3d) {
            const n = g.numPoints();
            if (n > 1) {
                const offsets = [];
                const pointA = Point3dVector3d_1.Point3d.create();
                const pointB = Point3dVector3d_1.Point3d.create();
                g.packedPoints.getPoint3dAtUncheckedPointIndex(0, pointA);
                for (let i = 1; i < n; i++) {
                    g.packedPoints.getPoint3dAtUncheckedPointIndex(i, pointB);
                    const g1 = this.applyBasePoints(this.createOffsetSegment(pointA, pointB, distanceLeft), pointA.clone(), pointB.clone());
                    if (g1 !== undefined)
                        offsets.push(g1);
                    pointA.setFromPoint3d(pointB);
                }
                return offsets;
            }
        }
        return undefined;
    }
    /**
     * Construct curves that are offset from a Path or Loop
     * * The construction will remove "some" local effects of features smaller than the offset distance, but will not detect self intersection among widely separated edges.
     * * Offset distance is defined as positive to the left.
     * * If offsetDistanceOrOptions is given as a number, default options are applied.
     * * When the offset needs to do an "outside" turn, the first applicable construction is applied:
     *   * If the turn is larger than `options.minArcDegrees`, a circular arc is constructed.
     *   * if the turn is larger than `options.maxChamferDegrees`, the turn is constructed as a sequence of straight lines that are
     *      * outside the arc
     *      * have uniform turn angle less than `options.maxChamferDegrees`
     *      * each line segment (except first and last) touches the arc at its midpoint.
     *   * Otherwise the prior and successor curves are extended to simple intersection.
     * @param curves input curves
     * @param offsetDistanceOrOptions offset controls.
     */
    static constructCurveXYOffset(curves, options) {
        const wrap = curves instanceof Loop_1.Loop;
        if (options === undefined)
            return undefined;
        const simpleOffsets = [];
        // setup pass: get simple offsets of each primitive
        for (const c of curves.children) {
            const c1 = CurveChainWireOffsetContext.createSingleOffsetPrimitiveXY(c, options.leftOffsetDistance);
            if (c1 === undefined)
                return undefined;
            if (c1 instanceof CurvePrimitive_1.CurvePrimitive)
                simpleOffsets.push(c1);
            else if (Array.isArray(c1)) {
                for (const c2 of c1) {
                    if (c2 instanceof CurvePrimitive_1.CurvePrimitive)
                        simpleOffsets.push(c2);
                }
            }
        }
        let fragment0 = simpleOffsets[0];
        const joint0 = new Joint(undefined, fragment0, fragment0.fractionToPoint(0.0));
        let newJoint;
        let previousJoint = joint0;
        for (let i = 1; i < simpleOffsets.length; i++) {
            const fragment1 = simpleOffsets[i];
            newJoint = new Joint(fragment0, fragment1, fragment1.fractionToPoint(0.0));
            Joint.link(previousJoint, newJoint);
            previousJoint = newJoint;
            fragment0 = fragment1;
        }
        if (curves instanceof Loop_1.Loop)
            Joint.link(previousJoint, joint0);
        const numOffset = simpleOffsets.length;
        Joint.annotateChain(joint0, options, numOffset);
        const outputCurves = [];
        Joint.collectCurvesFromChain(joint0, outputCurves, numOffset);
        return RegionOps_1.RegionOps.createLoopPathOrBagOfCurves(outputCurves, wrap);
    }
}
exports.CurveChainWireOffsetContext = CurveChainWireOffsetContext;
CurveChainWireOffsetContext._unitAlong = Point3dVector3d_1.Vector3d.create();
CurveChainWireOffsetContext._unitPerp = Point3dVector3d_1.Vector3d.create();
CurveChainWireOffsetContext._offsetA = Point3dVector3d_1.Point3d.create();
CurveChainWireOffsetContext._offsetB = Point3dVector3d_1.Point3d.create();
//# sourceMappingURL=PolygonOffsetContext.js.map