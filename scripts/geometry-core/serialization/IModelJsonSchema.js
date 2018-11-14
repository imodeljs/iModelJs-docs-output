"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Serialization */
// import { Geometry, Angle, AxisOrder, BSIJSONValues } from "../Geometry";
const Geometry_1 = require("../Geometry");
const AngleSweep_1 = require("../geometry3d/AngleSweep");
const Angle_1 = require("../geometry3d/Angle");
const Point2dVector2d_1 = require("../geometry3d/Point2dVector2d");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const Segment1d_1 = require("../geometry3d/Segment1d");
const YawPitchRollAngles_1 = require("../geometry3d/YawPitchRollAngles");
const Matrix3d_1 = require("../geometry3d/Matrix3d");
const GeometryQuery_1 = require("../curve/GeometryQuery");
const CoordinateXYZ_1 = require("../curve/CoordinateXYZ");
const TransitionSpiral_1 = require("../curve/TransitionSpiral");
const Transform_1 = require("../geometry3d/Transform");
const UnionRegion_1 = require("../curve/UnionRegion");
const CurveCollection_1 = require("../curve/CurveCollection");
const ParityRegion_1 = require("../curve/ParityRegion");
const Loop_1 = require("../curve/Loop");
const Path_1 = require("../curve/Path");
const Polyface_1 = require("../polyface/Polyface");
const BSplineCurve_1 = require("../bspline/BSplineCurve");
const BSplineSurface_1 = require("../bspline/BSplineSurface");
const Sphere_1 = require("../solid/Sphere");
const Cone_1 = require("../solid/Cone");
const Box_1 = require("../solid/Box");
const TorusPipe_1 = require("../solid/TorusPipe");
const LinearSweep_1 = require("../solid/LinearSweep");
const RotationalSweep_1 = require("../solid/RotationalSweep");
const RuledSweep_1 = require("../solid/RuledSweep");
const Ray3d_1 = require("../geometry3d/Ray3d");
const GeometryHandler_1 = require("../geometry3d/GeometryHandler");
const LineString3d_1 = require("../curve/LineString3d");
const PointString3d_1 = require("../curve/PointString3d");
const Arc3d_1 = require("../curve/Arc3d");
const LineSegment3d_1 = require("../curve/LineSegment3d");
const BSplineCurve3dH_1 = require("../bspline/BSplineCurve3dH");
const Point4d_1 = require("../geometry4d/Point4d");
const CurveCollection_2 = require("../curve/CurveCollection");
/* tslint:disable: object-literal-key-quotes no-console*/
var IModelJson;
(function (IModelJson) {
    /** parser servoces for "iModelJson" schema
     * * 1: create a reader with `new ImodelJsonReader`
     * * 2: parse json fragment to strongly typed geometry: `const g = reader.parse (fragment)`
     */
    class Reader {
        constructor() {
        }
        static parseVector3dProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Geometry_1.Geometry.isNumberArray(value, 3))
                    return Point3dVector3d_1.Vector3d.create(value[0], value[1], value[2]);
                if (Point3dVector3d_1.XYZ.isXAndY(value))
                    return Point3dVector3d_1.Vector3d.fromJSON(value);
            }
            return defaultValue;
        }
        static parsePoint3dProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Geometry_1.Geometry.isNumberArray(value, 3))
                    return Point3dVector3d_1.Point3d.create(value[0], value[1], value[2]);
                if (Point3dVector3d_1.XYZ.isXAndY(value))
                    return Point3dVector3d_1.Point3d.fromJSON(value);
            }
            return defaultValue;
        }
        static parseSegment1dProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Geometry_1.Geometry.isNumberArray(value, 2))
                    return Segment1d_1.Segment1d.create(value[0], value[1]);
            }
            return defaultValue;
        }
        static parseNumberProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Number.isFinite(value))
                    return value;
            }
            return defaultValue;
        }
        /* ==============
            private static parseNumberArrayProperty(json: any, propertyName: string, minValues: number, maxValues: number, defaultValue?: number[] | undefined): number[] | undefined {
              if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Array.isArray(value)
                  && value.length >= minValues && value.length <= maxValues) {
                  const result = [];
                  for (const a of value) {
                    result.push(a);
                  }
                  return result;
                }
              }
              return defaultValue;
            }
        */
        static parseAngleProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                return Angle_1.Angle.fromJSON(value);
            }
            return defaultValue;
        }
        /**
         * @param defaultFunction function to call if needed to produce a default value
         */
        static parseAngleSweepProps(json, propertyName, defaultFunction) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                return AngleSweep_1.AngleSweep.fromJSON(value);
            }
            if (defaultFunction === undefined)
                return undefined;
            return defaultFunction();
        }
        static parseBooleanProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (value === true)
                    return true;
                if (value === false)
                    return false;
            }
            return defaultValue;
        }
        static loadContourArray(json, propertyName) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (Array.isArray(value)) {
                    const result = [];
                    for (const contourData of value) {
                        const contour = Reader.parse(contourData);
                        if (contour instanceof CurveCollection_2.CurveCollection) {
                            result.push(contour);
                        }
                    }
                    if (result.length > 0)
                        return result;
                }
            }
            return undefined;
        }
        static parseYawPitchRollAngles(json) {
            const ypr = YawPitchRollAngles_1.YawPitchRollAngles.fromJSON(json);
            return ypr.toMatrix3d();
        }
        static parseStringProperty(json, propertyName, defaultValue) {
            if (json.hasOwnProperty(propertyName)) {
                const value = json[propertyName];
                if (value.type === "string")
                    return value;
            }
            return defaultValue;
        }
        static parseAxesFromVectors(json, axisOrder, createDefaultIdentity) {
            if (Array.isArray(json) && json.length === 2) {
                const xVector = Point3dVector3d_1.Vector3d.fromJSON(json[0]);
                const yVector = Point3dVector3d_1.Vector3d.fromJSON(json[1]);
                const matrix = Matrix3d_1.Matrix3d.createRigidFromColumns(xVector, yVector, axisOrder);
                if (matrix)
                    return matrix;
            }
            if (createDefaultIdentity)
                return Matrix3d_1.Matrix3d.createIdentity();
            return undefined;
        }
        /**
         * Look for orientation data and convert to Matrix3d.
         * * Search order is:
         * * * yawPitchRollAngles
         * * * xyVectors
         * * * zxVectors
         * @param json [in] json source data
         * @param createDefaultIdentity [in] If true and no orientation is present, return an identity matrix.  If false and no orientation is present, return undefined.
         */
        static parseOrientation(json, createDefaultIdentity) {
            if (json.yawPitchRollAngles) {
                return Reader.parseYawPitchRollAngles(json.yawPitchRollAngles);
            }
            else if (json.xyVectors) {
                return Reader.parseAxesFromVectors(json.xyVectors, 0 /* XYZ */, createDefaultIdentity);
            }
            else if (json.zxVectors) {
                return Reader.parseAxesFromVectors(json.zxVectors, 2 /* ZXY */, createDefaultIdentity);
            }
            if (createDefaultIdentity)
                return Matrix3d_1.Matrix3d.createIdentity();
            return undefined;
        }
        static parseArcByVectorProps(data) {
            if (data
                && data.center !== undefined
                && data.vectorX !== undefined
                && data.vectorY !== undefined
                && data.sweepStartEnd !== undefined) {
                return Arc3d_1.Arc3d.create(Point3dVector3d_1.Point3d.fromJSON(data.center), Point3dVector3d_1.Vector3d.fromJSON(data.vectorX), Point3dVector3d_1.Vector3d.fromJSON(data.vectorY), AngleSweep_1.AngleSweep.fromJSON(data.sweepStartEnd));
            }
            return undefined;
        }
        // remark: Returns LineString3d as last default when give points are colinear.
        static parseArcBy3Points(data) {
            if (Array.isArray(data) && data.length > 2) {
                const pointA = Point3dVector3d_1.Point3d.fromJSON(data[0]);
                const pointB = Point3dVector3d_1.Point3d.fromJSON(data[1]);
                const pointC = Point3dVector3d_1.Point3d.fromJSON(data[2]);
                return Arc3d_1.Arc3d.createCircularStartMiddleEnd(pointA, pointB, pointC);
            }
            return undefined;
        }
        static parseArcObject(data) {
            let arc = Reader.parseArcByVectorProps(data);
            if (arc)
                return arc;
            arc = Reader.parseArcBy3Points(data);
            return arc; // possibly undefined.
        }
        static parseCoordinate(data) {
            const point = Point3dVector3d_1.Point3d.fromJSON(data);
            if (point)
                return CoordinateXYZ_1.CoordinateXYZ.create(point);
            return undefined;
        }
        static parseTransitionSpiral(data) {
            const axes = Reader.parseOrientation(data, true);
            const origin = Reader.parsePoint3dProperty(data, "origin");
            // the create method will juggle any 4 out of these 5 inputs to define the other ..
            const startBearing = Reader.parseAngleProperty(data, "startBearing");
            const endBearing = Reader.parseAngleProperty(data, "endBearing");
            const startRadius = Reader.parseNumberProperty(data, "startRadius");
            const endRadius = Reader.parseNumberProperty(data, "endRadius");
            const length = Reader.parseNumberProperty(data, "curveLength", undefined);
            const interval = Reader.parseSegment1dProperty(data, "fractionInterval", undefined);
            const spiralType = Reader.parseStringProperty(data, "spiralType", "clothoid");
            if (origin)
                return TransitionSpiral_1.TransitionSpiral3d.create(spiralType, startRadius, endRadius, startBearing, endBearing, length, interval, Transform_1.Transform.createOriginAndMatrix(origin, axes));
            return undefined;
        }
        static parseBcurve(data) {
            if (Array.isArray(data.points) && Array.isArray(data.knots) && Number.isFinite(data.order) && data.closed !== undefined) {
                if (data.points[0].length === 4) {
                    const hPoles = [];
                    for (const p of data.points)
                        hPoles.push(Point4d_1.Point4d.fromJSON(p));
                    const knots = [];
                    for (const knot of data.knots)
                        knots.push(knot);
                    // TODO -- wrap poles and knots for closed case !!
                    if (data.closed) {
                        for (let i = 0; i + 1 < data.order; i++) {
                            hPoles.push(hPoles[i].clone());
                        }
                    }
                    const newCurve = BSplineCurve3dH_1.BSplineCurve3dH.create(hPoles, knots, data.order);
                    if (newCurve) {
                        if (data.closed === true)
                            newCurve.setWrappable(true);
                        return newCurve;
                    }
                }
                else if (data.points[0].length === 3 || data.points[0].length === 2) {
                    const poles = [];
                    for (const p of data.points)
                        poles.push(Point3dVector3d_1.Point3d.fromJSON(p));
                    const knots = [];
                    for (const knot of data.knots)
                        knots.push(knot);
                    // TODO -- wrap poles and knots for closed case !!
                    if (data.closed) {
                        for (let i = 0; i + 1 < data.order; i++) {
                            poles.push(poles[i].clone());
                        }
                    }
                    const newCurve = BSplineCurve_1.BSplineCurve3d.create(poles, knots, data.order);
                    if (newCurve) {
                        if (data.closed === true)
                            newCurve.setWrappable(true);
                        return newCurve;
                    }
                }
            }
            return undefined;
        }
        static parseArray(data) {
            if (Array.isArray(data)) {
                const myArray = [];
                let c;
                for (c of data) {
                    const g = Reader.parse(c);
                    if (g !== undefined)
                        myArray.push(g);
                }
                return myArray;
            }
            return undefined;
        }
        // For each nonzero index, Announce Math.abs (value) -1
        static addZeroBasedIndicesFromSignedOneBased(data, f) {
            if (data && Geometry_1.Geometry.isNumberArray(data)) {
                for (const value of data) {
                    if (value !== 0)
                        f(Math.abs(value) - 1);
                }
            }
        }
        static parsePolyfaceAuxData(data) {
            if (!Array.isArray(data.channels) || !Array.isArray(data.indices))
                return undefined;
            const outChannels = [];
            for (const inChannel of data.channels) {
                if (Array.isArray(inChannel.data) && inChannel.hasOwnProperty("dataType")) {
                    const outChannelData = [];
                    for (const inChannelData of inChannel.data) {
                        if (inChannelData.hasOwnProperty("input") && Array.isArray(inChannelData.values))
                            outChannelData.push(new Polyface_1.AuxChannelData(inChannelData.input, inChannelData.values));
                    }
                    outChannels.push(new Polyface_1.AuxChannel(outChannelData, inChannel.dataType, inChannel.name, inChannel.inputName));
                }
            }
            const auxData = new Polyface_1.PolyfaceAuxData(outChannels, []);
            Reader.addZeroBasedIndicesFromSignedOneBased(data.indices, (x) => { auxData.indices.push(x); });
            return auxData;
        }
        static parseIndexedMesh(data) {
            // {Coord:[[x,y,z],. . . ],   -- simple xyz for each ponit
            // CoordIndex[1,2,3,0]    -- zero-terminated, one based !!!
            if (data.hasOwnProperty("point") && Array.isArray(data.point)
                && data.hasOwnProperty("pointIndex") && Array.isArray(data.pointIndex)) {
                const polyface = Polyface_1.IndexedPolyface.create();
                if (data.hasOwnProperty("normal") && Array.isArray(data.normal)) {
                    for (const uvw of data.normal) {
                        if (Geometry_1.Geometry.isNumberArray(uvw, 3))
                            polyface.addNormal(Point3dVector3d_1.Vector3d.create(uvw[0], uvw[1], uvw[2]));
                    }
                }
                if (data.hasOwnProperty("param") && Array.isArray(data.param)) {
                    for (const uv of data.param) {
                        if (Geometry_1.Geometry.isNumberArray(uv, 2))
                            polyface.addParam(Point2dVector2d_1.Point2d.create(uv[0], uv[1]));
                    }
                }
                if (data.hasOwnProperty("color") && Array.isArray(data.color)) {
                    for (const c of data.color) {
                        polyface.addColor(c);
                    }
                }
                for (const p of data.point)
                    polyface.addPoint(Point3dVector3d_1.Point3d.fromJSON(p));
                for (const p of data.pointIndex) {
                    if (p === 0)
                        polyface.terminateFacet(false); // we are responsible for index checking !!!
                    else {
                        const p0 = Math.abs(p) - 1;
                        polyface.addPointIndex(p0, p > 0);
                    }
                }
                if (data.hasOwnProperty("normalIndex")) {
                    Reader.addZeroBasedIndicesFromSignedOneBased(data.normalIndex, (x) => { polyface.addNormalIndex(x); });
                }
                if (data.hasOwnProperty("paramIndex")) {
                    Reader.addZeroBasedIndicesFromSignedOneBased(data.paramIndex, (x) => { polyface.addParamIndex(x); });
                }
                if (data.hasOwnProperty("colorIndex")) {
                    Reader.addZeroBasedIndicesFromSignedOneBased(data.colorIndex, (x) => { polyface.addColorIndex(x); });
                }
                if (data.hasOwnProperty("auxData"))
                    polyface.data.auxData = Reader.parsePolyfaceAuxData(data.auxData);
                return polyface;
            }
            return undefined;
        }
        static parseCurveCollectionMembers(result, data) {
            if (data && Array.isArray(data)) {
                for (const c of data) {
                    const g = Reader.parse(c);
                    if (g !== undefined)
                        result.tryAddChild(g);
                }
                return result;
            }
            return undefined;
        }
        static parseBsurf(data) {
            if (data.hasOwnProperty("uKnots") && Array.isArray(data.uKnots)
                && data.hasOwnProperty("vKnots") && Array.isArray(data.vKnots)
                && data.hasOwnProperty("orderU") && Number.isFinite(data.orderU)
                && data.hasOwnProperty("orderV") && Number.isFinite(data.orderV)
                && data.hasOwnProperty("points") && Array.isArray(data.points)) {
                const orderU = data.orderU;
                const orderV = data.orderV;
                if (Array.isArray(data.points[0]) && Array.isArray(data.points[0][0])) {
                    const d = data.points[0][0].length;
                    /** xyz surface (no weights) */
                    if (d === 3) {
                        return BSplineSurface_1.BSplineSurface3d.createGrid(data.points, orderU, data.uKnots, orderV, data.vKnots);
                    }
                    /** xyzw surface (weights already applied) */
                    if (d === 4) {
                        return BSplineSurface_1.BSplineSurface3dH.createGrid(data.points, BSplineSurface_1.WeightStyle.WeightsAlreadyAppliedToCoordinates, orderU, data.uKnots, orderV, data.vKnots);
                    }
                }
            }
            return undefined;
        }
        /**
         * Create a cone with data from a `ConeByCCRRV`.
         */
        static parseConeProps(json) {
            const axes = Reader.parseOrientation(json, false);
            const start = Reader.parsePoint3dProperty(json, "start");
            const end = Reader.parsePoint3dProperty(json, "end");
            const startRadius = Reader.parseNumberProperty(json, "startRadius");
            const endRadius = Reader.parseNumberProperty(json, "endRadius", startRadius);
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            if (start
                && end
                && startRadius !== undefined
                && endRadius !== undefined) {
                if (axes === undefined) {
                    const axisVector = Point3dVector3d_1.Vector3d.createStartEnd(start, end);
                    const frame = Matrix3d_1.Matrix3d.createRigidHeadsUp(axisVector, 2 /* ZXY */);
                    const vectorX = frame.columnX();
                    const vectorY = frame.columnY();
                    return Cone_1.Cone.createBaseAndTarget(start, end, vectorX, vectorY, startRadius, endRadius, capped);
                }
                else {
                    return Cone_1.Cone.createBaseAndTarget(start, end, axes.columnX(), axes.columnY(), startRadius, endRadius, capped);
                }
            }
            return undefined;
        }
        /**
         * Create a cylinder.
         */
        static parseCylinderProps(json) {
            const start = Reader.parsePoint3dProperty(json, "start");
            const end = Reader.parsePoint3dProperty(json, "end");
            const radius = Reader.parseNumberProperty(json, "radius");
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            if (start
                && end
                && radius !== undefined) {
                return Cone_1.Cone.createAxisPoints(start, end, radius, radius, capped);
            }
            return undefined;
        }
        static parseLineSegmentProps(value) {
            if (Array.isArray(value) && value.length > 1)
                return LineSegment3d_1.LineSegment3d.create(Point3dVector3d_1.Point3d.fromJSON(value[0]), Point3dVector3d_1.Point3d.fromJSON(value[1]));
        }
        static parseLinearSweep(json) {
            const contour = Reader.parse(json.contour);
            const capped = Reader.parseBooleanProperty(json, "capped");
            const extrusionVector = Reader.parseVector3dProperty(json, "vector");
            if (contour
                && capped !== undefined
                && extrusionVector) {
                return LinearSweep_1.LinearSweep.create(contour, extrusionVector, capped);
            }
            return undefined;
        }
        static parseRotationalSweep(json) {
            const contour = Reader.parse(json.contour);
            const capped = Reader.parseBooleanProperty(json, "capped");
            const axisVector = Reader.parseVector3dProperty(json, "axis");
            const center = Reader.parsePoint3dProperty(json, "center");
            const sweepDegrees = Reader.parseNumberProperty(json, "sweepAngle");
            if (contour
                && sweepDegrees !== undefined
                && capped !== undefined
                && axisVector
                && center) {
                return RotationalSweep_1.RotationalSweep.create(contour, Ray3d_1.Ray3d.createCapture(center, axisVector), Angle_1.Angle.createDegrees(sweepDegrees), capped);
            }
            return undefined;
        }
        static parseBox(json) {
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            const baseOrigin = Reader.parsePoint3dProperty(json, "baseOrigin");
            const baseX = Reader.parseNumberProperty(json, "baseX");
            const baseY = Reader.parseNumberProperty(json, "baseY", baseX);
            let topOrigin = Reader.parsePoint3dProperty(json, "topOrigin");
            const topX = Reader.parseNumberProperty(json, "topX", baseX);
            const topY = Reader.parseNumberProperty(json, "topY", baseY);
            const height = Reader.parseNumberProperty(json, "height", baseX);
            const axes = Reader.parseOrientation(json, true);
            if (baseOrigin && !topOrigin)
                topOrigin = Matrix3d_1.Matrix3d.XYZMinusMatrixTimesXYZ(baseOrigin, axes, Point3dVector3d_1.Vector3d.create(0, 0, height));
            if (capped !== undefined
                && baseX !== undefined
                && baseY !== undefined
                && topY !== undefined
                && topX !== undefined
                && axes
                && baseOrigin
                && topOrigin) {
                return Box_1.Box.createDgnBoxWithAxes(baseOrigin, axes, topOrigin, baseX, baseY, topX, topY, capped);
            }
            return undefined;
        }
        static parseSphere(json) {
            const center = Reader.parsePoint3dProperty(json, "center");
            // optional unqualified radius . . .
            const radius = Reader.parseNumberProperty(json, "radius");
            // optional specific X
            const radiusX = Reader.parseNumberProperty(json, "radiusX", radius);
            // missing Y and Z both pick up radiusX  (which may have already been defaulted from unqualified radius)
            const radiusY = Reader.parseNumberProperty(json, "radiusX", radiusX);
            const radiusZ = Reader.parseNumberProperty(json, "radiusX", radiusX);
            const latitudeStartEnd = Reader.parseAngleSweepProps(json, "latitudeStartEnd"); // this may be undfined!!
            const axes = Reader.parseOrientation(json, true);
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            if (center !== undefined
                && radiusX !== undefined
                && radiusY !== undefined
                && radiusZ !== undefined
                && capped !== undefined) {
                return Sphere_1.Sphere.createFromAxesAndScales(center, axes, radiusX, radiusY, radiusZ, latitudeStartEnd, capped);
            }
            return undefined;
        }
        static parseRuledSweep(json) {
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            const contours = this.loadContourArray(json, "contour");
            if (contours !== undefined
                && capped !== undefined) {
                return RuledSweep_1.RuledSweep.create(contours, capped);
            }
            return undefined;
        }
        static parseTorusPipe(json) {
            const axes = Reader.parseOrientation(json, true);
            const center = Reader.parsePoint3dProperty(json, "center");
            const radiusA = Reader.parseNumberProperty(json, "majorRadius");
            const radiusB = Reader.parseNumberProperty(json, "minorRadius");
            const sweepAngle = Reader.parseAngleProperty(json, "sweepAngle", undefined);
            const capped = Reader.parseBooleanProperty(json, "capped", false);
            if (center
                && radiusA !== undefined
                && radiusB !== undefined) {
                return TorusPipe_1.TorusPipe.createDgnTorusPipe(center, axes.columnX(), axes.columnY(), radiusA, radiusB, sweepAngle ? sweepAngle : Angle_1.Angle.createDegrees(360), capped);
            }
            return undefined;
        }
        static parsePointArray(json) {
            const points = [];
            if (json && Array.isArray(json)) {
                for (const member of json) {
                    if (Point3dVector3d_1.XYZ.isXAndY(member)) {
                        points.push(Point3dVector3d_1.Point3d.fromJSON(member));
                    }
                    else if (Geometry_1.Geometry.isNumberArray(member, 2)) {
                        points.push(Point3dVector3d_1.Point3d.fromJSON(member));
                    }
                }
            }
            return points;
        }
        static parse(json) {
            if (json !== undefined && json) {
                if (json.lineSegment !== undefined) {
                    return Reader.parseLineSegmentProps(json.lineSegment);
                }
                else if (json.lineString !== undefined) {
                    return LineString3d_1.LineString3d.create(Reader.parsePointArray(json.lineString));
                }
                else if (json.arc !== undefined) {
                    return Reader.parseArcObject(json.arc);
                }
                else if (json.hasOwnProperty("point")) {
                    return Reader.parseCoordinate(json.point);
                }
                else if (json.hasOwnProperty("bcurve")) {
                    return Reader.parseBcurve(json.bcurve);
                }
                else if (json.hasOwnProperty("path")) {
                    return Reader.parseCurveCollectionMembers(new Path_1.Path(), json.path);
                }
                else if (json.hasOwnProperty("loop")) {
                    return Reader.parseCurveCollectionMembers(new Loop_1.Loop(), json.loop);
                }
                else if (json.hasOwnProperty("parityRegion")) {
                    return Reader.parseCurveCollectionMembers(new ParityRegion_1.ParityRegion(), json.parityRegion);
                }
                else if (json.hasOwnProperty("unionRegion")) {
                    return Reader.parseCurveCollectionMembers(new UnionRegion_1.UnionRegion(), json.unionRegion);
                }
                else if (json.hasOwnProperty("bagOfCurves")) {
                    return Reader.parseCurveCollectionMembers(new CurveCollection_1.BagOfCurves(), json.bagOfCurves);
                }
                else if (json.hasOwnProperty("indexedMesh")) {
                    return Reader.parseIndexedMesh(json.indexedMesh);
                }
                else if (json.hasOwnProperty("bsurf")) {
                    return Reader.parseBsurf(json.bsurf);
                }
                else if (json.hasOwnProperty("cone")) {
                    return Reader.parseConeProps(json.cone);
                }
                else if (json.hasOwnProperty("cylinder")) {
                    return Reader.parseCylinderProps(json.cylinder);
                }
                else if (json.hasOwnProperty("sphere")) {
                    return Reader.parseSphere(json.sphere);
                }
                else if (json.hasOwnProperty("linearSweep")) {
                    return Reader.parseLinearSweep(json.linearSweep);
                }
                else if (json.hasOwnProperty("box")) {
                    return Reader.parseBox(json.box);
                }
                else if (json.hasOwnProperty("rotationalSweep")) {
                    return Reader.parseRotationalSweep(json.rotationalSweep);
                }
                else if (json.hasOwnProperty("ruledSweep")) {
                    return Reader.parseRuledSweep(json.ruledSweep);
                }
                else if (json.hasOwnProperty("torusPipe")) {
                    return Reader.parseTorusPipe(json.torusPipe);
                }
                else if (json.hasOwnProperty("pointString")) {
                    return PointString3d_1.PointString3d.create(Reader.parsePointArray(json.pointString));
                }
                else if (json.hasOwnProperty("transitionSpiral")) {
                    return Reader.parseTransitionSpiral(json.transitionSpiral);
                }
                else if (Array.isArray(json))
                    return Reader.parseArray(json);
            }
            return undefined;
        }
    }
    IModelJson.Reader = Reader;
    // ISSUE: include 3d in names?
    // ISSUE: would like shorter term than lineSegment
    // ISSUE: is arc clear?
    // ISSUE: label center, vectorX, vector90 on arc?
    // ISSUE: sweep data on arc -- serialize as AngleSweep?
    class Writer extends GeometryHandler_1.GeometryHandler {
        handleLineSegment3d(data) {
            return { "lineSegment": [data.point0Ref.toJSON(), data.point1Ref.toJSON()] };
        }
        handleCoordinateXYZ(data) {
            return { "point": data.point.toJSON() };
        }
        handleArc3d(data) {
            return {
                "arc": {
                    "center": data.center.toJSON(),
                    "vectorX": data.vector0.toJSON(),
                    "vectorY": data.vector90.toJSON(),
                    "sweepStartEnd": [data.sweep.startDegrees, data.sweep.endDegrees],
                },
            };
        }
        /**
         * Insert orientation description to a data object.
         * @param matrix matrix with orientation
         * @param omitIfIdentity omit the axis data if the matrix is an identity.
         * @param data AxesProps object to be annotated.
         */
        static insertOrientationFromMatrix(data, matrix, omitIfIdentity) {
            if (omitIfIdentity) {
                if (matrix === undefined)
                    return;
                if (matrix.isIdentity)
                    return;
            }
            if (matrix)
                data.xyVectors = [matrix.columnX().toJSON(), matrix.columnY().toJSON()];
            else
                data.xyVectors = [[1, 0, 0], [0, 1, 0]];
        }
        static isIdentityXY(xVector, yVector) {
            return xVector.isAlmostEqualXYZ(1, 0, 0) && yVector.isAlmostEqualXYZ(0, 1, 0);
        }
        /**
         * Insert orientation description to a data object.
         * @param matrix matrix with orientation
         * @param omitIfIdentity omit the axis data if the matrix is an identity.
         * @param data AxesProps object to be annotated.
         */
        static insertOrientationFromXYVectors(data, vectorX, vectorY, omitIfIdentity) {
            if (omitIfIdentity && Writer.isIdentityXY(vectorX, vectorY))
                return;
            data.xyVectors = [vectorX.toJSON(), vectorY.toJSON()];
        }
        /**
         * Insert orientation description to a data object, with orientation defined by u and v direction
         * vectors.
         * @param vectorX u direction
         * @param vectorV v direction
         * @param omitIfIdentity omit the axis data if the vectorU and vectorV are global x and y vectors.
         * @param data AxesProps object to be annotated.
         */
        static insertXYOrientation(data, vectorU, vectorV, omitIfIdentity) {
            if (omitIfIdentity) {
                if (vectorU.isAlmostEqualXYZ(1, 0, 0) && vectorV.isAlmostEqualXYZ(0, 1, 0))
                    return;
            }
            data.xyVectors = [vectorU.toJSON(), vectorV.toJSON()];
        }
        handleTransitionSpiral(data) {
            // TODO: HANDLE NONRIGID TRANSFORM !!
            // the spiral may have indication of how it was defined.  If so, use defined/undefined state of the orignial data
            // as indication of what current data to use.  (Current data may have changed due to transforms.)
            const originalProperties = data.originalProperties;
            const value = {
                origin: data.localToWorld.origin.toJSON(),
                type: data.getSpiralType(),
            };
            Writer.insertOrientationFromMatrix(value, data.localToWorld.matrix, true);
            if (!data.activeFractionInterval.isExact01)
                value.fractionInterval = [data.activeFractionInterval.x0, data.activeFractionInterval.x1];
            // Object.defineProperty(value, "fractionInterval", { value: [data.activeFractionInterval.x0, data.activeFractionInterval.x1] });
            // if possible, do selective output of defining data (omit exactly one out of the 5, matching original definition)
            if (originalProperties !== undefined && originalProperties.numDefinedProperties() === 4) {
                if (originalProperties.radius0 !== undefined)
                    value.startRadius = data.radius01.x0;
                if (originalProperties.radius1 !== undefined)
                    value.endRadius = data.radius01.x1;
                if (originalProperties.bearing0 !== undefined)
                    value.startBearing = data.bearing01.startAngle.toJSON();
                if (originalProperties.bearing1 !== undefined)
                    value.endBearing = data.bearing01.endAngle.toJSON();
                if (originalProperties.curveLength !== undefined)
                    value.curveLength = data.curveLength();
            }
            else {
                // uh oh ... no original data, but the spiral itself knows all 5 values.  We don't know which to consider primary.
                // DECISION -- put everything out, let readers make sense if they can. (It should be consistent ?)
                value.startRadius = data.radius01.x0;
                value.endRadius = data.radius01.x1;
                value.startBearing = data.bearing01.startAngle.toJSON();
                value.endBearing = data.bearing01.endAngle.toJSON();
                value.curveLength = data.curveLength();
            }
            return { "transitionSpiral": value };
        }
        handleCone(data) {
            const radiusA = data.getRadiusA();
            const radiusB = data.getRadiusB();
            const centerA = data.getCenterA();
            const centerB = data.getCenterB();
            const vectorX = data.getVectorX();
            const vectorY = data.getVectorY();
            const axisVector = Point3dVector3d_1.Vector3d.createStartEnd(centerA, centerB);
            if (Geometry_1.Geometry.isSameCoordinate(radiusA, radiusB)
                && vectorX.isPerpendicularTo(axisVector)
                && vectorY.isPerpendicularTo(axisVector)
                && Geometry_1.Geometry.isSameCoordinate(vectorX.magnitude(), 1.0)
                && Geometry_1.Geometry.isSameCoordinate(vectorY.magnitude(), 1.0)) {
                return {
                    "cylinder": {
                        "capped": data.capped,
                        "start": data.getCenterA().toJSON(),
                        "end": data.getCenterB().toJSON(),
                        "radius": radiusA,
                    },
                };
            }
            else {
                const coneProps = {
                    "capped": data.capped,
                    "start": data.getCenterA().toJSON(),
                    "end": data.getCenterB().toJSON(),
                    "startRadius": data.getRadiusA(),
                    "endRadius": data.getRadiusB(),
                };
                Writer.insertOrientationFromXYVectors(coneProps, vectorX, vectorY, false);
                return { "cone": coneProps };
            }
        }
        handleSphere(data) {
            const xData = data.cloneVectorX().normalizeWithLength();
            const yData = data.cloneVectorY().normalizeWithLength();
            const zData = data.cloneVectorZ().normalizeWithLength();
            const latitudeSweep = data.cloneLatitudeSweep();
            const rX = xData.mag;
            const rY = yData.mag;
            const rZ = zData.mag;
            if (xData.v && zData.v) {
                const value = {
                    "center": data.cloneCenter().toJSON(),
                };
                if (!(data.getConstructiveFrame()).matrix.isIdentity)
                    value.zxVectors = [zData.v.toJSON(), xData.v.toJSON()];
                const fullSweep = latitudeSweep.isFullLatitudeSweep;
                if (data.capped && !fullSweep)
                    value.capped = data.capped;
                if (Geometry_1.Geometry.isSameCoordinate(rX, rY) && Geometry_1.Geometry.isSameCoordinate(rX, rZ))
                    value.radius = rX;
                else {
                    value.radiusX = rX;
                    value.radiusY = rY;
                    value.radiusZ = rZ;
                }
                if (!fullSweep)
                    value.latitudeStartEnd = latitudeSweep.toJSON();
                return { "sphere": value };
            }
            return undefined;
        }
        handleTorusPipe(data) {
            const vectorX = data.cloneVectorX();
            const vectorY = data.cloneVectorY();
            const radiusA = data.getMajorRadius();
            const radiusB = data.getMinorRadius();
            const sweep = data.getSweepAngle();
            if (data.getIsReversed()) {
                vectorY.scaleInPlace(-1.0);
                sweep.setRadians(-sweep.radians);
            }
            const value = {
                "center": data.cloneCenter().toJSON(),
                "majorRadius": radiusA,
                "minorRadius": radiusB,
                "xyVectors": [vectorX.toJSON(), vectorY.toJSON()],
            };
            if (!sweep.isFullCircle) {
                value.sweepAngle = sweep.degrees;
                value.capped = data.capped;
            }
            return { "torusPipe": value };
        }
        handleLineString3d(data) {
            const pointsA = data.points;
            const pointsB = [];
            if (pointsA)
                for (const p of pointsA)
                    pointsB.push(p.toJSON());
            return { "lineString": pointsB };
        }
        handlePointString3d(data) {
            const pointsA = data.points;
            const pointsB = [];
            if (pointsA)
                for (const p of pointsA)
                    pointsB.push(p.toJSON());
            return { "pointString": pointsB };
        }
        handlePath(data) {
            return { "path": this.collectChildren(data) };
        }
        handleLoop(data) {
            return { "loop": this.collectChildren(data) };
        }
        handleParityRegion(data) {
            return { "parityRegion": this.collectChildren(data) };
        }
        handleUnionRegion(data) {
            return { "unionRegion": this.collectChildren(data) };
        }
        handleBagOfCurves(data) {
            return { "bagOfCurves": this.collectChildren(data) };
        }
        collectChildren(data) {
            const children = [];
            if (data.children && Array.isArray(data.children)) {
                for (const child of data.children) {
                    const cdata = child.dispatchToGeometryHandler(this);
                    if (cdata)
                        children.push(cdata);
                }
            }
            return children;
        }
        handleLinearSweep(data) {
            const extrusionVector = data.cloneSweepVector();
            const curves = data.getCurvesRef();
            const capped = data.capped;
            if (extrusionVector
                && curves
                && capped !== undefined) {
                return {
                    "linearSweep": {
                        "contour": curves.dispatchToGeometryHandler(this),
                        "capped": capped,
                        "vector": extrusionVector.toJSON(),
                    },
                };
            }
            return undefined;
        }
        handleRuledSweep(data) {
            const contours = data.cloneContours();
            const capped = data.capped;
            if (contours
                && contours.length > 1
                && capped !== undefined) {
                const jsonContours = [];
                for (const c of contours) {
                    jsonContours.push(this.emit(c));
                }
                return {
                    "ruledSweep": {
                        "contour": jsonContours,
                        "capped": capped,
                    },
                };
            }
            return undefined;
        }
        handleRotationalSweep(data) {
            const axisRay = data.cloneAxisRay();
            const curves = data.getCurves();
            const capped = data.capped;
            const sweepAngle = data.getSweep();
            return {
                "rotationalSweep": {
                    "axis": axisRay.direction.toJSON(),
                    "contour": curves.dispatchToGeometryHandler(this),
                    "capped": capped,
                    "center": axisRay.origin.toJSON(),
                    "sweepAngle": sweepAngle.degrees,
                },
            };
        }
        handleBox(box) {
            const out = {
                "box": {
                    "baseOrigin": box.getBaseOrigin().toJSON(),
                    "baseX": box.getBaseX(),
                    "baseY": box.getBaseY(),
                    "capped": box.capped,
                    "topOrigin": box.getTopOrigin().toJSON(),
                },
            };
            Writer.insertXYOrientation(out.box, box.getVectorX(), box.getVectorY(), true);
            if (!Geometry_1.Geometry.isSameCoordinate(box.getTopX(), box.getBaseX()))
                out.box.topX = box.getTopX();
            if (!Geometry_1.Geometry.isSameCoordinate(box.getTopY(), box.getBaseY()))
                out.box.topY = box.getTopY();
            return out;
        }
        handlePolyfaceAuxData(auxData, pf) {
            const contents = {};
            contents.indices = [];
            const visitor = pf.createVisitor(0);
            if (!visitor.auxData)
                return;
            while (visitor.moveToNextFacet()) {
                for (let i = 0; i < visitor.indexCount; i++) {
                    contents.indices.push(visitor.auxData.indices[i] + 1);
                }
                contents.indices.push(0); // facet terminator.
            }
            contents.channels = [];
            for (const inChannel of auxData.channels) {
                const outChannel = {};
                outChannel.dataType = inChannel.dataType;
                outChannel.name = inChannel.name;
                outChannel.inputName = inChannel.inputName;
                outChannel.data = [];
                for (const inData of inChannel.data) {
                    const outData = {};
                    outData.input = inData.input;
                    outData.values = inData.values.slice(0);
                    outChannel.data.push(outData);
                }
                contents.channels.push(outChannel);
            }
            return contents;
        }
        handleIndexedPolyface(pf) {
            const points = [];
            const pointIndex = [];
            const normals = [];
            const params = [];
            const colors = [];
            const p = Point3dVector3d_1.Point3d.create();
            for (let i = 0; pf.data.point.atPoint3dIndex(i, p); i++)
                points.push(p.toJSON());
            if (pf.data.normal) {
                for (const value of pf.data.normal)
                    normals.push(value.toJSON());
            }
            if (pf.data.param) {
                for (const value of pf.data.param)
                    params.push(value.toJSON());
            }
            if (pf.data.color) {
                for (const value of pf.data.color)
                    colors.push(value);
            }
            const visitor = pf.createVisitor(0);
            let indexCounter = 0;
            const normalIndex = [];
            const paramIndex = [];
            const colorIndex = [];
            let n;
            while (visitor.moveToNextFacet()) {
                n = visitor.indexCount;
                // All meshes have point and point index ...
                for (let i = 0; i < n; i++) {
                    // Change sign of value to be pushed based on whether or not the edge was originally visible or not
                    const toPush = pf.data.edgeVisible[indexCounter + i] ? visitor.pointIndex[i] + 1 : -(visitor.clientPointIndex(i) + 1);
                    pointIndex.push(toPush);
                }
                pointIndex.push(0); // facet terminator.
                indexCounter += visitor.indexCount;
                if (visitor.normalIndex) {
                    for (let i = 0; i < n; i++)
                        normalIndex.push(1 + visitor.clientNormalIndex(i));
                    normalIndex.push(0);
                }
                if (visitor.paramIndex) {
                    for (let i = 0; i < n; i++)
                        paramIndex.push(1 + visitor.clientParamIndex(i));
                    paramIndex.push(0);
                }
                if (visitor.colorIndex) {
                    for (let i = 0; i < n; i++)
                        colorIndex.push(1 + visitor.clientColorIndex(i));
                    colorIndex.push(0);
                }
            }
            // assemble the contents in alphabetical order.
            const contents = {};
            if (pf.data.auxData)
                contents.auxData = this.handlePolyfaceAuxData(pf.data.auxData, pf);
            if (pf.data.color)
                contents.color = colors;
            if (pf.data.colorIndex)
                contents.colorIndex = colorIndex;
            if (pf.data.normal)
                contents.normal = normals;
            if (pf.data.normalIndex)
                contents.normalIndex = normalIndex;
            if (pf.data.param)
                contents.param = params;
            if (pf.data.paramIndex)
                contents.paramIndex = paramIndex;
            contents.point = points;
            contents.pointIndex = pointIndex;
            return { "indexedMesh": contents };
        }
        handleBSplineCurve3d(curve) {
            // ASSUME -- if the curve originated "closed" the knot and pole replication are unchanged,
            // so first and last knots can be re-assigned, and last (degree - 1) poles can be deleted.
            if (curve.isClosable) {
                const knots = curve.copyKnots(true);
                const poles = curve.copyPoints();
                const degree = curve.degree;
                for (let i = 0; i < degree; i++)
                    poles.pop();
                // knots have replicated first and last.  Change the values to be periodic.
                const leftIndex = degree;
                const rightIndex = knots.length - degree - 1;
                const knotPeriod = knots[rightIndex] - knots[leftIndex];
                knots[0] = knots[rightIndex - degree] - knotPeriod;
                knots[knots.length - 1] = knots[leftIndex + degree] + knotPeriod;
                return {
                    "bcurve": {
                        "points": poles,
                        "knots": knots,
                        "closed": true,
                        "order": curve.order,
                    },
                };
            }
            else {
                return {
                    "bcurve": {
                        "points": curve.copyPoints(),
                        "knots": curve.copyKnots(true),
                        "closed": false,
                        "order": curve.order,
                    },
                };
            }
        }
        handleBezierCurve3d(curve) {
            const knots = [];
            const order = curve.order;
            for (let i = 0; i < order; i++)
                knots.push(0.0);
            for (let i = 0; i < order; i++)
                knots.push(1.0);
            return {
                "bcurve": {
                    "points": curve.copyPolesAsJsonArray(),
                    "knots": knots,
                    "closed": false,
                    "order": curve.order,
                },
            };
        }
        handleBSplineCurve3dH(curve) {
            // ASSUME -- if the curve originated "closed" the knot and pole replication are unchanged,
            // so first and last knots can be re-assigned, and last (degree - 1) poles can be deleted.
            if (curve.isClosable) {
                const knots = curve.copyKnots(true);
                const poles = curve.copyPoints();
                const degree = curve.degree;
                for (let i = 0; i < degree; i++)
                    poles.pop();
                // knots have replicated first and last.  Change the values to be periodic.
                const leftIndex = degree;
                const rightIndex = knots.length - degree - 1;
                const knotPeriod = knots[rightIndex] - knots[leftIndex];
                knots[0] = knots[rightIndex - degree] - knotPeriod;
                knots[knots.length - 1] = knots[leftIndex + degree] + knotPeriod;
                return {
                    "bcurve": {
                        "points": poles,
                        "knots": knots,
                        "closed": true,
                        "order": curve.order,
                    },
                };
            }
            else {
                return {
                    "bcurve": {
                        "points": curve.copyPoints(),
                        "knots": curve.copyKnots(true),
                        "closed": false,
                        "order": curve.order,
                    },
                };
            }
        }
        handleBSplineSurface3d(surface) {
            // ASSUME -- if the curve originated "closed" the knot and pole replication are unchanged,
            // so first and last knots can be re-assigned, and last (degree - 1) poles can be deleted.
            if (surface.isClosable(0)
                || surface.isClosable(1)) {
                // TODO
            }
            else {
                return {
                    "bsurf": {
                        "points": surface.getPointArray(false),
                        "uKnots": surface.copyKnots(0, true),
                        "vKnots": surface.copyKnots(1, true),
                        "orderU": surface.orderUV(0),
                        "orderV": surface.orderUV(1),
                    },
                };
            }
        }
        handleBezierCurve3dH(curve) {
            const knots = [];
            const order = curve.order;
            for (let i = 0; i < order; i++)
                knots.push(0.0);
            for (let i = 0; i < order; i++)
                knots.push(1.0);
            return {
                "bcurve": {
                    "points": curve.copyPolesAsJsonArray(),
                    "knots": knots,
                    "closed": false,
                    "order": curve.order,
                },
            };
        }
        handleBSplineSurface3dH(surface) {
            const data = surface.getPointGridJSON();
            return {
                "bsurf": {
                    "points": data.points,
                    "uKnots": surface.copyKnots(0, true),
                    "vKnots": surface.copyKnots(1, true),
                    "orderU": surface.orderUV(0),
                    "orderV": surface.orderUV(1),
                },
            };
        }
        emitArray(data) {
            const members = [];
            for (const c of data) {
                const toPush = this.emit(c);
                members.push(toPush);
            }
            return members;
        }
        emit(data) {
            if (Array.isArray(data))
                return this.emitArray(data);
            if (data instanceof GeometryQuery_1.GeometryQuery) {
                return data.dispatchToGeometryHandler(this);
            }
            return undefined;
        }
        /** One-step static method to create a writer and emit a json object */
        static toIModelJson(data) {
            const writer = new Writer();
            return writer.emit(data);
        }
    }
    IModelJson.Writer = Writer;
})(IModelJson = exports.IModelJson || (exports.IModelJson = {}));
//# sourceMappingURL=IModelJsonSchema.js.map