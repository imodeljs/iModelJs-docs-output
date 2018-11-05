"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Solid */
const PointVector_1 = require("../PointVector");
const Transform_1 = require("../Transform");
const SolidPrimitive_1 = require("./SolidPrimitive");
const Geometry_1 = require("../Geometry");
const CurveChain_1 = require("../curve/CurveChain");
const LineString3d_1 = require("../curve/LineString3d");
/**
 */
class Box extends SolidPrimitive_1.SolidPrimitive {
    constructor(map, baseX, baseY, topX, topY, capped) {
        super(capped);
        this._localToWorld = map;
        this._baseX = baseX;
        this._baseY = baseY;
        this._topX = topX;
        this._topY = topY;
    }
    clone() {
        return new Box(this._localToWorld.clone(), this._baseX, this._baseY, this._topX, this._topY, this.capped);
    }
    /** Return a coordinate frame (right handed unit vectors)
     * * origin lower left of box
     * * x direction on base rectangle x edge
     * * y direction in base rectangle
     * * z direction perpenedicular
     */
    getConstructiveFrame() {
        return this._localToWorld.cloneRigid();
    }
    tryTransformInPlace(transform) {
        transform.multiplyTransformTransform(this._localToWorld, this._localToWorld);
        return true;
    }
    cloneTransformed(transform) {
        const result = this.clone();
        transform.multiplyTransformTransform(result._localToWorld, result._localToWorld);
        return result;
    }
    /**
     * @param baseOrigin Origin of base rectangle
     * @param vectorX  Direction for base rectangle
     * @param vectorY Direction for base rectangle
     * @param topOrigin origin of top rectangle
     * @param baseX size factor for base rectangle (multiplies vectorX)
     * @param baseY size factor for base rectangle (multiplies vectorY)
     * @param topX size factor for top rectangle (multiplies vectorX)
     * @param topY size factor for top rectangle (multiplies vectorY)
     * @param capped true to define top and bottom closure caps
     */
    static createDgnBox(baseOrigin, vectorX, vectorY, topOrigin, baseX, baseY, topX, topY, capped) {
        const vectorZ = baseOrigin.vectorTo(topOrigin);
        const localToWorld = Transform_1.Transform.createOriginAndMatrixColumns(baseOrigin, vectorX, vectorY, vectorZ);
        return new Box(localToWorld, baseX, baseY, topX, topY, capped);
    }
    /**
     * @param baseOrigin Origin of base rectangle
     * @param vectorX  Direction for base rectangle
     * @param vectorY Direction for base rectangle
     * @param topOrigin origin of top rectangle
     * @param baseX size factor for base rectangle (multiplies vectorX)
     * @param baseY size factor for base rectangle (multiplies vectorY)
     * @param topX size factor for top rectangle (multiplies vectorX)
     * @param topY size factor for top rectangle (multiplies vectorY)
     * @param capped true to define top and bottom closure caps
     */
    static createDgnBoxWithAxes(baseOrigin, axes, topOrigin, baseX, baseY, topX, topY, capped) {
        return Box.createDgnBox(baseOrigin, axes.columnX(), axes.columnY(), topOrigin, baseX, baseY, topX, topY, capped);
    }
    getBaseX() { return this._baseX; }
    getBaseY() { return this._baseY; }
    getTopX() { return this._topX; }
    getTopY() { return this._topY; }
    getBaseOrigin() { return this._localToWorld.multiplyXYZ(0, 0, 0); }
    getTopOrigin() { return this._localToWorld.multiplyXYZ(0, 0, 1); }
    getVectorX() { return this._localToWorld.matrix.columnX(); }
    getVectorY() { return this._localToWorld.matrix.columnY(); }
    getVectorZ() { return this._localToWorld.matrix.columnZ(); }
    isSameGeometryClass(other) { return other instanceof Box; }
    isAlmostEqual(other) {
        if (other instanceof Box) {
            if (this.capped !== other.capped)
                return false;
            if (!this._localToWorld.isAlmostEqual(other._localToWorld))
                return false;
            return Geometry_1.Geometry.isSameCoordinate(this._baseX, other._baseX)
                && Geometry_1.Geometry.isSameCoordinate(this._baseY, other._baseY)
                && Geometry_1.Geometry.isSameCoordinate(this._topX, other._topX)
                && Geometry_1.Geometry.isSameCoordinate(this._topY, other._topY);
        }
        return false;
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleBox(this);
    }
    strokeConstantVSection(zFraction) {
        const ax = Geometry_1.Geometry.interpolate(this._baseX, zFraction, this._topX);
        const ay = Geometry_1.Geometry.interpolate(this._baseY, zFraction, this._topY);
        const result = LineString3d_1.LineString3d.create();
        const transform = this._localToWorld;
        const workPoint = PointVector_1.Point3d.create();
        transform.multiplyXYZ(0, 0, zFraction, workPoint);
        result.addPoint(workPoint);
        transform.multiplyXYZ(ax, 0, zFraction, workPoint);
        result.addPoint(workPoint);
        transform.multiplyXYZ(ax, ay, zFraction, workPoint);
        result.addPoint(workPoint);
        transform.multiplyXYZ(0, ay, zFraction, workPoint);
        result.addPoint(workPoint);
        transform.multiplyXYZ(0, 0, zFraction, workPoint);
        result.addPoint(workPoint);
        return result;
    }
    constantVSection(zFraction) {
        const ls = this.strokeConstantVSection(zFraction);
        return CurveChain_1.Loop.create(ls);
    }
    extendRange(range, transform) {
        const boxTransform = this._localToWorld;
        const ax = this._baseX;
        const ay = this._baseY;
        const bx = this._topX;
        const by = this._topY;
        if (transform) {
            range.extendTransformTransformedXYZ(transform, boxTransform, 0, 0, 0);
            range.extendTransformTransformedXYZ(transform, boxTransform, ax, 0, 0);
            range.extendTransformTransformedXYZ(transform, boxTransform, 0, ay, 0);
            range.extendTransformTransformedXYZ(transform, boxTransform, ax, ay, 0);
            range.extendTransformTransformedXYZ(transform, boxTransform, 0, 0, 1);
            range.extendTransformTransformedXYZ(transform, boxTransform, bx, 0, 1);
            range.extendTransformTransformedXYZ(transform, boxTransform, 0, by, 1);
            range.extendTransformTransformedXYZ(transform, boxTransform, bx, by, 1);
        }
        else {
            range.extendTransformedXYZ(boxTransform, 0, 0, 0);
            range.extendTransformedXYZ(boxTransform, ax, 0, 0);
            range.extendTransformedXYZ(boxTransform, 0, ay, 0);
            range.extendTransformedXYZ(boxTransform, ax, ay, 0);
            range.extendTransformedXYZ(boxTransform, 0, 0, 1);
            range.extendTransformedXYZ(boxTransform, bx, 0, 1);
            range.extendTransformedXYZ(boxTransform, 0, by, 1);
            range.extendTransformedXYZ(boxTransform, bx, by, 1);
        }
    }
}
exports.Box = Box;
//# sourceMappingURL=Box.js.map