"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("../geometry3d/Range");
const GeometryQuery_1 = require("./GeometryQuery");
/** A Coordinate is a persistable Point3d */
class CoordinateXYZ extends GeometryQuery_1.GeometryQuery {
    get point() { return this._xyz; }
    /**
     * @param xyz point to be CAPTURED.
     */
    constructor(xyz) {
        super();
        this._xyz = xyz;
    }
    static create(point) {
        return new CoordinateXYZ(point.clone());
    }
    /** return the range of the point */
    range() { return Range_1.Range3d.create(this._xyz); }
    extendRange(rangeToExtend, transform) {
        if (transform)
            rangeToExtend.extendTransformedXYZ(transform, this._xyz.x, this._xyz.y, this._xyz.z);
        else
            rangeToExtend.extend(this._xyz);
    }
    /** Apply transform to the Coordinate's point. */
    tryTransformInPlace(transform) {
        transform.multiplyPoint3d(this._xyz, this._xyz);
        return true;
    }
    /** return a transformed clone.
     */
    cloneTransformed(transform) {
        const result = new CoordinateXYZ(this._xyz.clone());
        result.tryTransformInPlace(transform);
        return result;
    }
    /** return a clone */
    clone() {
        return new CoordinateXYZ(this._xyz.clone());
    }
    /** return GeometryQuery children for recursive queries.
     *
     * * leaf classes do not need to implement.
     */
    /** test if (other instanceof Coordinate).  */
    isSameGeometryClass(other) {
        return other instanceof CoordinateXYZ;
    }
    /** test for exact structure and nearly identical geometry.
     *
     * *  Leaf classes must implement !!!
     * *  base class implementation recurses through children.
     * *  base implementation is complete for classes with children and no properties.
     * *  classes with both children and properties must implement for properties, call super for children.
     */
    isAlmostEqual(other) {
        return (other instanceof CoordinateXYZ) && this._xyz.isAlmostEqual(other._xyz);
    }
    dispatchToGeometryHandler(handler) {
        return handler.handleCoordinateXYZ(this);
    }
}
exports.CoordinateXYZ = CoordinateXYZ;
//# sourceMappingURL=CoordinateXYZ.js.map